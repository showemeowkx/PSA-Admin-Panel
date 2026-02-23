import React, { useRef } from "react";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonButton,
  IonIcon,
  isPlatform,
} from "@ionic/react";
import {
  chevronBackOutline,
  trashOutline,
  searchOutline,
  chevronForwardOutline,
  bagCheckOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import SearchProductCard from "./components/SearchProductCard";
import ProductCard from "./components/ProductCard";

// MOCK DATA
const MOCK_CART_ITEMS = [
  {
    id: 1,
    name: "Соковитий банан",
    price: 25,
    unit: "шт",
    image:
      "https://fruit-time.ua/images/cache/products/5a/banan-imp-500x500.jpeg",
  },
  {
    id: 2,
    name: "Свіжа полуниця",
    price: 120,
    unit: "кг",
    image:
      "https://fruit-time.ua/images/cache/products/55/polunicya-imp-500x500.jpeg",
  },
];

const MOCK_RECOMMENDED = [
  {
    id: 3,
    name: "Соковитий апельсин",
    price: 45,
    unit: "шт",
  },
  {
    id: 4,
    name: "Свіжа полуниця",
    price: 120,
    unit: "кг",
  },
  {
    id: 5,
    name: "Соковитий банан",
    price: 35,
    unit: "шт",
  },
];

const CartScreen: React.FC = () => {
  const history = useHistory();
  const recommendedSliderRef = useRef<HTMLDivElement>(null);

  const isAdminRoute = location.pathname.startsWith("/admin");
  const basePath = isAdminRoute ? "/admin" : "/app";

  const scrollRecommended = (direction: "left" | "right") => {
    if (recommendedSliderRef.current) {
      const scrollAmount = 300;
      recommendedSliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const totalAmount = MOCK_CART_ITEMS.reduce(
    (acc, item) => acc + item.price,
    0,
  );

  const minPurchaseAmount =
    Number(import.meta.env.VITE_MIN_PURCHASE_AMOUNT) || 0;

  const remainingAmount =
    minPurchaseAmount > totalAmount ? minPurchaseAmount - totalAmount : 0;

  const isSubmitDisabled = MOCK_CART_ITEMS.length === 0 || remainingAmount > 0;

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
        <div className="container mx-auto px-4 md:px-8 py-6 md:py-12 max-w-6xl md:mt-16 pb-40 md:pb-12">
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

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 flex flex-col gap-8">
              <div>
                <h1 className="text-2xl font-black text-gray-800 mb-4 hidden md:block">
                  Ваш кошик
                </h1>

                <div className="md:hidden flex items-center justify-between mb-3 pl-1 mt-2">
                  <h2 className="text-lg font-bold text-gray-800">
                    Ваше замовлення
                  </h2>
                  <span className="text-xs font-bold text-gray-400 bg-gray-200/50 px-2 py-1 rounded-md">
                    {MOCK_CART_ITEMS.length} товари
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {MOCK_CART_ITEMS.map((item) => (
                    <SearchProductCard
                      key={item.id}
                      name={item.name}
                      price={item.price}
                      unit={item.unit}
                      image={item.image}
                      isActive={true}
                      isCartItem={true}
                      initialQuantity={1}
                      onClick={() =>
                        history.push(`${basePath}/product/${item.id}`)
                      }
                    />
                  ))}
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
                    <span className="text-xs text-gray-400">
                      Відкрити каталог без фільтрів
                    </span>
                  </div>
                </div>
                <IonIcon
                  icon={chevronForwardOutline}
                  className="text-gray-400 text-xl"
                />
              </button>

              <div className="mt-2">
                <div className="flex items-center justify-between mb-4 pl-1">
                  <h2 className="text-lg md:text-xl font-bold text-gray-800">
                    Рекомендуємо
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

                <div
                  ref={recommendedSliderRef}
                  className="flex overflow-x-auto pb-6 hide-scrollbar gap-4 snap-x md:snap-none"
                >
                  {MOCK_RECOMMENDED.map((product) => (
                    <div
                      key={product.id}
                      className="w-[160px] min-w-[160px] md:w-[200px] md:min-w-[200px] flex-none snap-start"
                    >
                      <ProductCard
                        name={product.name}
                        price={product.price}
                        unit={product.unit}
                        isActive={true}
                        onClick={() =>
                          history.push(`${basePath}/product/${product.id}`)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden lg:block w-[380px]">
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 sticky top-24">
                <h3 className="text-xl font-black text-gray-800 mb-6">
                  Підсумок
                </h3>

                <div className="flex justify-between items-center mb-4 text-gray-600">
                  <span>Товари ({MOCK_CART_ITEMS.length})</span>
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
                    <span className="font-bold">{remainingAmount} ₴</span>
                  </div>
                )}

                <button
                  disabled={isSubmitDisabled}
                  className={`w-full font-bold text-lg py-4 rounded-2xl flex items-center justify-center gap-2 transition-all ${
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

        {!isPlatform("desktop") && (
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
            {remainingAmount > 0 && (
              <div className="bg-orange-50 text-orange-600 px-4 py-2 text-xs font-medium text-center border-b border-orange-100">
                Додайте товарів ще на{" "}
                <span className="font-bold">{remainingAmount} ₴</span> для
                оформлення
              </div>
            )}

            <div className="p-4 flex items-center justify-between">
              <div className="flex flex-col pl-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  Всього ({MOCK_CART_ITEMS.length})
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
        )}
      </IonContent>
    </IonPage>
  );
};

export default CartScreen;
