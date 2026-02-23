import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonButton,
  IonIcon,
  IonSpinner,
  useIonToast,
} from "@ionic/react";
import {
  chevronBackOutline,
  trashOutline,
  searchOutline,
  chevronForwardOutline,
  bagCheckOutline,
  basketOutline,
  chevronDownOutline,
} from "ionicons/icons";
import { useHistory, useLocation } from "react-router-dom";
import SmallProductCard from "../shop/components/SmallProductCard";
import ProductCard from "../shop/components/ProductCard";
import { getDefaultAddQuantity, useCartStore } from "./cart.store";
import { useAuthStore } from "../auth/auth.store";
import api from "../../config/api";
import { isAxiosError } from "axios";

interface Stock {
  storeId: number;
  available: string | number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  pricePromo?: number | null;
  isPromo?: boolean;
  isActive: boolean;
  imagePath?: string;
  unitsOfMeasurments?: string;
  stocks?: Stock[];
  categoryId?: number;
}

const CartScreen: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { user } = useAuthStore();

  const { items, fetchCart, addToCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(true);
  const [presentToast] = useIonToast();

  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [recommendedPage, setRecommendedPage] = useState(1);
  const [hasMoreRecommended, setHasMoreRecommended] = useState(true);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(false);

  const recommendedSliderRef = useRef<HTMLDivElement>(null);

  const isAdminRoute = location.pathname.startsWith("/admin");
  const basePath = isAdminRoute ? "/admin" : "/app";

  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);
      await fetchCart();
      setIsLoading(false);
    };
    loadCart();
  }, [fetchCart]);

  const fetchRecommended = useCallback(
    async (pageNum: number) => {
      if (!user?.selectedStoreId || isLoadingRecommended || items.length === 0)
        return;

      try {
        setIsLoadingRecommended(true);

        const catIds = Array.from(
          new Set(
            items
              .map((item) => (item.product as Product).categoryId)
              .filter(Boolean),
          ),
        ).join(",");

        if (!catIds) {
          setIsLoadingRecommended(false);
          return;
        }

        const { data: prodData } = await api.get(
          `/products?limit=12&page=${pageNum}&showAll=0&showInactive=0&showDeleted=0&storeId=${user.selectedStoreId}&categoryIds=${catIds}`,
        );

        const fetchedProducts = prodData?.data || [];
        const cartProductIds = items.map((item) => item.product.id);

        const filteredProducts = fetchedProducts.filter(
          (p: Product) => !cartProductIds.includes(p.id),
        );

        const uniqueProducts = Array.from(
          new Map(filteredProducts.map((p: Product) => [p.id, p])).values(),
        ) as Product[];

        if (pageNum === 1) {
          setRecommendedProducts(uniqueProducts);
        } else {
          setRecommendedProducts((prev) => {
            const combined = [...prev, ...uniqueProducts];
            return Array.from(
              new Map(combined.map((p: Product) => [p.id, p])).values(),
            ) as Product[];
          });
        }

        setRecommendedPage(pageNum);
        setHasMoreRecommended(fetchedProducts.length >= 12);
      } catch (error) {
        console.error("Failed to fetch recommended products:", error);
      } finally {
        setIsLoadingRecommended(false);
      }
    },
    [user?.selectedStoreId, isLoadingRecommended, items],
  );

  useEffect(() => {
    if (
      !isLoading &&
      user?.selectedStoreId &&
      recommendedProducts.length === 0 &&
      items.length > 0
    ) {
      fetchRecommended(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, user?.selectedStoreId, items.length]);

  const handleRecommendedScroll = () => {
    if (!recommendedSliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } =
      recommendedSliderRef.current;

    if (scrollLeft + clientWidth >= scrollWidth - 100) {
      if (hasMoreRecommended && !isLoadingRecommended) {
        fetchRecommended(recommendedPage + 1);
      }
    }
  };

  const scrollRecommended = (direction: "left" | "right") => {
    if (recommendedSliderRef.current) {
      const scrollAmount = 300;
      recommendedSliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleAddToCart = async (productId: number, quantity: number) => {
    try {
      await addToCart(productId, quantity);
      presentToast({
        message: "Товар додано до кошика",
        duration: 1500,
        color: "success",
        position: "bottom",
        mode: "ios",
      });
    } catch (error: unknown) {
      let errorMessage = "Не вдалося додати товар до кошика";
      if (isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      }
      presentToast({
        message: errorMessage,
        duration: 2000,
        color: "danger",
        position: "bottom",
        mode: "ios",
      });
    }
  };

  const onAddToCartClick = (targetProduct: Product) => {
    if (!targetProduct || !user?.selectedStoreId) return;

    const amount = getDefaultAddQuantity(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      targetProduct as any,
      user.selectedStoreId,
    );

    if (amount > 0) {
      handleAddToCart(targetProduct.id, amount);
    } else {
      presentToast({
        message: "Ви вже додали весь доступний залишок",
        duration: 2000,
        color: "warning",
        position: "bottom",
        mode: "ios",
      });
    }
  };

  const rawTotalAmount = items.reduce((acc, item) => {
    const product = item.product;
    if (!product) return acc;

    const price =
      product.isPromo && product.pricePromo !== null
        ? product.pricePromo
        : product.price;

    return acc + price * Number(item.quantity);
  }, 0);

  const totalAmount = Number(rawTotalAmount.toFixed(2));

  const minPurchaseAmount =
    Number(import.meta.env.VITE_MIN_PURCHASE_AMOUNT) || 0;

  const remainingAmount =
    minPurchaseAmount > totalAmount ? minPurchaseAmount - totalAmount : 0;
  const remainingFormatted = Number(remainingAmount.toFixed(2));

  const isSubmitDisabled = items.length === 0 || remainingAmount > 0;

  if (isLoading) {
    return (
      <IonPage>
        <IonHeader className="ion-no-border bg-white md:hidden pt-safe">
          <IonToolbar style={{ "--background": "white" }}>
            <div className="flex items-center justify-between px-2">
              <IonButton
                color="medium"
                fill="clear"
                onClick={() => history.push(`${basePath}/shop`)}
                className="text-gray-800"
              >
                <IonIcon icon={chevronBackOutline} className="text-2xl" /> Назад
              </IonButton>
              <span className="font-bold text-gray-800 text-lg">Кошик</span>
              <div className="w-[60px]"></div>
            </div>
          </IonToolbar>
        </IonHeader>
        <IonContent className="bg-gray-50 text-gray-900" fullscreen>
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <IonSpinner name="crescent" className="text-orange-500" />
            <p className="text-gray-400 font-bold text-sm">
              Завантаження кошика...
            </p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <IonPage>
        <IonHeader className="ion-no-border bg-white md:hidden pt-safe">
          <IonToolbar style={{ "--background": "white" }}>
            <div className="flex items-center justify-between px-2">
              <IonButton
                color="medium"
                fill="clear"
                onClick={() => history.push(`${basePath}/shop`)}
                className="text-gray-800"
              >
                <IonIcon icon={chevronBackOutline} className="text-2xl" /> Назад
              </IonButton>
              <span className="font-bold text-gray-800 text-lg">Кошик</span>
              <div className="w-[60px]"></div>
            </div>
          </IonToolbar>
        </IonHeader>

        <IonContent className="bg-gray-50 text-gray-900" fullscreen>
          <div className="flex flex-col items-center justify-center h-full px-6 text-center pb-32 animate-fade-in-up">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-6">
              <IonIcon
                icon={basketOutline}
                className="text-6xl text-gray-300"
              />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-3">
              Кошик порожній
            </h2>
            <p className="text-gray-500 mb-10 max-w-[280px]">
              Схоже, ви ще не додали жодного товару. Перейдіть до каталогу та
              оберіть щось смачненьке!
            </p>
            <button
              onClick={() => history.push(`${basePath}/shop`)}
              className="bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-md shadow-orange-200 flex items-center gap-2"
            >
              <IonIcon icon={searchOutline} className="text-xl" />
              Перейти до покупок
            </button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border bg-white md:hidden pt-safe">
        <IonToolbar style={{ "--background": "white" }}>
          <div className="flex items-center justify-between px-2">
            <IonButton
              color="medium"
              fill="clear"
              onClick={() => history.push(`${basePath}/shop`)}
              className="text-gray-800"
            >
              <IonIcon icon={chevronBackOutline} className="text-2xl" /> Назад
            </IonButton>
            <span className="font-bold text-gray-800 text-lg">Кошик</span>
            <IonButton color="danger" fill="clear">
              <IonIcon icon={trashOutline} className="text-xl" />
            </IonButton>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="bg-gray-50 text-gray-900" fullscreen>
        <div className="container mx-auto px-4 md:px-8 py-6 md:py-12 max-w-6xl md:mt-16 pb-40 md:pb-12 animate-fade-in">
          <div className="hidden md:flex justify-between items-center mb-8">
            <button
              onClick={() => history.push(`${basePath}/shop`)}
              className="text-gray-500 hover:text-orange-600 flex items-center gap-1 font-bold transition-colors"
            >
              <IonIcon icon={chevronBackOutline} className="text-xl" />
              Назад до покупок
            </button>
            <button className="flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl transition-all font-bold">
              <IonIcon icon={trashOutline} className="text-lg" />
              Очистити кошик
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 min-w-0 flex flex-col gap-8">
              <div>
                <h1 className="text-2xl font-black text-gray-800 mb-4 hidden md:block">
                  Ваше замовлення:
                </h1>

                <div className="md:hidden flex items-center justify-between mb-3 pl-1 mt-2">
                  <h2 className="text-lg font-bold text-gray-800">
                    Ваше замовлення:
                  </h2>
                  <span className="text-xs font-bold text-gray-400 bg-gray-200/50 px-2 py-1 rounded-md">
                    {items.length} товари
                  </span>
                </div>

                <div className="relative">
                  <div className="flex flex-col gap-3 max-h-[380px] md:max-h-[480px] overflow-y-auto overscroll-y-contain pr-2 pb-6 pt-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {items.map((item) => {
                      const product = item.product;
                      if (!product) return null;

                      const storeStock = product.stocks?.find(
                        (s: Stock) => s.storeId === user?.selectedStoreId,
                      );
                      const availableStock = storeStock
                        ? Number(storeStock.available)
                        : 0;

                      return (
                        <SmallProductCard
                          key={item.id}
                          name={product.name}
                          price={
                            product.isPromo && product.pricePromo !== null
                              ? product.pricePromo
                              : product.price
                          }
                          oldPrice={product.isPromo ? product.price : undefined}
                          unit={product.unitsOfMeasurments}
                          image={product.imagePath}
                          isActive={product.isActive}
                          isCartItem={true}
                          initialQuantity={Number(item.quantity)}
                          availableStock={availableStock}
                          onClick={() =>
                            history.push(`${basePath}/product/${product.id}`)
                          }
                        />
                      );
                    })}
                  </div>

                  {items.length >= 4 && (
                    <div className="absolute bottom-0 left-0 right-2 h-16 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent flex items-end justify-center pb-1 pointer-events-none z-10">
                      <IonIcon
                        icon={chevronDownOutline}
                        className="text-black text-2xl animate-pulse drop-shadow-sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => history.push(`${basePath}/shop`)}
                className="w-full bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between text-gray-700 hover:border-orange-500 hover:text-orange-500 transition-colors shadow-sm active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                    <IonIcon icon={searchOutline} className="text-2xl" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-base">
                      Шукати ще товари
                    </span>
                  </div>
                </div>
                <IonIcon
                  icon={chevronForwardOutline}
                  className="text-gray-400 text-xl"
                />
              </button>

              {recommendedProducts.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-4 pl-1">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800">
                      Рекомендовані товари
                    </h2>
                    <div className="hidden md:flex gap-2">
                      <button
                        onClick={() => scrollRecommended("left")}
                        className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:text-orange-500 active:scale-95 transition-all"
                      >
                        <IonIcon icon={chevronBackOutline} />
                      </button>
                      <button
                        onClick={() => scrollRecommended("right")}
                        className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:text-orange-500 active:scale-95 transition-all"
                      >
                        <IonIcon icon={chevronForwardOutline} />
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <div
                      ref={recommendedSliderRef}
                      onScroll={handleRecommendedScroll}
                      className="flex overflow-x-auto pb-6 hide-scrollbar gap-4 snap-x md:snap-none relative z-0"
                    >
                      {recommendedProducts.map((product) => {
                        const storeStock = product.stocks?.find(
                          (s: Stock) => s.storeId === user?.selectedStoreId,
                        );
                        const availableStock = storeStock
                          ? Number(storeStock.available)
                          : 0;
                        const isOutOfStock = availableStock <= 0;

                        return (
                          <div
                            key={product.id}
                            className="w-[160px] min-w-[160px] md:w-[200px] md:min-w-[200px] flex-none snap-start"
                          >
                            <ProductCard
                              name={product.name}
                              price={
                                product.isPromo &&
                                product.pricePromo !== null &&
                                product.pricePromo !== undefined
                                  ? product.pricePromo
                                  : product.price
                              }
                              oldPrice={
                                product.isPromo ? product.price : undefined
                              }
                              unit={product.unitsOfMeasurments || ""}
                              image={product.imagePath}
                              isActive={product.isActive}
                              isOutOfStock={isOutOfStock}
                              onClick={() =>
                                history.push(
                                  `${basePath}/product/${product.id}`,
                                )
                              }
                              onAddToCart={() => onAddToCartClick(product)}
                            />
                          </div>
                        );
                      })}

                      {isLoadingRecommended && recommendedPage > 0 && (
                        <div className="w-[100px] flex-none flex items-center justify-center h-[200px]">
                          <IonSpinner
                            name="crescent"
                            className="text-orange-500"
                          />
                        </div>
                      )}
                    </div>

                    <div className="hidden md:block absolute right-0 top-0 bottom-6 z-10 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden md:block w-[300px] lg:w-[380px]">
              <div className="bg-white rounded-[32px] p-6 lg:p-8 shadow-sm border border-gray-100 sticky top-24">
                <h3 className="text-xl font-black text-gray-800 mb-6">
                  Підсумок
                </h3>

                <div className="flex justify-between items-center mb-4 text-gray-600">
                  <span>Товари ({items.length})</span>
                  <span className="font-bold">{totalAmount} ₴</span>
                </div>

                <div className="border-t border-gray-100 my-6"></div>

                <div className="flex justify-between items-end mb-6">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                    Разом
                  </span>
                  <span className="text-3xl font-black text-gray-900 leading-none">
                    {totalAmount}{" "}
                    <span className="text-xl font-normal text-gray-400">₴</span>
                  </span>
                </div>

                {remainingAmount > 0 && (
                  <div className="bg-orange-50 text-orange-600 p-3 rounded-xl text-sm font-medium mb-4 text-center border border-orange-100">
                    Додайте товарів ще на{" "}
                    <span className="font-bold">{remainingFormatted} ₴</span>
                  </div>
                )}

                <button
                  disabled={isSubmitDisabled}
                  className={`w-full font-bold text-base py-4 rounded-2xl flex items-center justify-center gap-2 transition-all ${
                    isSubmitDisabled
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                      : "bg-orange-500 hover:bg-orange-600 active:scale-95 text-white shadow-md shadow-orange-200"
                  }`}
                >
                  <IonIcon icon={bagCheckOutline} className="text-xl" />
                  Оформити замовлення
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
          {remainingAmount > 0 && (
            <div className="bg-orange-50 text-orange-600 px-4 py-2 text-xs font-medium text-center border-b border-orange-100">
              Додайте товарів ще на{" "}
              <span className="font-bold">{remainingFormatted} ₴</span> для
              оформлення
            </div>
          )}

          <div className="p-4 flex items-center justify-between">
            <div className="flex flex-col pl-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                Всього ({items.length})
              </span>
              <span className="text-2xl font-black text-gray-900 leading-none">
                {totalAmount}{" "}
                <span className="text-sm font-normal text-gray-400">₴</span>
              </span>
            </div>

            <button
              disabled={isSubmitDisabled}
              className={`px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 transition-all ${
                isSubmitDisabled
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-orange-500 text-white shadow-md shadow-orange-200 active:bg-orange-600 active:scale-95"
              }`}
            >
              <IonIcon icon={bagCheckOutline} className="text-xl" />
              Замовити
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CartScreen;
