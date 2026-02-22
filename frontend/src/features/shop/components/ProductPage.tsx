import React, { useRef, useEffect, useState } from "react";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonButton,
  IonIcon,
  isPlatform,
  useIonViewWillEnter,
  useIonViewWillLeave,
  IonSpinner,
} from "@ionic/react";
import {
  chevronBackOutline,
  basketOutline,
  chevronForwardOutline,
  addOutline,
  alertCircleOutline,
} from "ionicons/icons";
import { useHistory, useParams } from "react-router-dom";
import { useAuthStore } from "../../auth/auth.store";
import api from "../../../config/api";
import ProductCard from "./ProductCard";

const isAdminRoute = location.pathname.startsWith("/admin");
const basePath = isAdminRoute ? "/admin" : "/app";

interface Stock {
  id: number;
  productId: number;
  storeId: number;
  available: number;
}

interface Product {
  id: number;
  ukrskladId: number;
  name: string;
  lastSyncedName?: string;
  description?: string;
  categoryId: number | null;

  category?: {
    id: number;
    name: string;
    isActive: boolean;
  };

  price: number;
  pricePromo: number | null;
  unitsOfMeasurments: string;
  imagePath: string;
  isActive: boolean;
  isPromo: boolean;
  stocks: Stock[];
}

// MOCK DATA
const MOCK_ALIKE_PRODUCTS = [
  { id: "2", name: "Солодкий диня", price: 39, unit: "кг" },
  { id: "3", name: "Свіжі полуниці", price: 59, unit: "кг" },
  { id: "4", name: "Соковиті персики", price: 45, unit: "кг" },
  { id: "5", name: "Смачні абрикоси", price: 55, unit: "кг" },
  { id: "6", name: "Свіжі вишні", price: 65, unit: "кг" },
];

const ProductScreen: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const alikeSliderRef = useRef<HTMLDivElement>(null);

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useIonViewWillEnter(() => {
    if (!isPlatform("desktop")) {
      const tabBar = document.querySelector("ion-tab-bar");
      if (tabBar) tabBar.style.display = "none";
    }
  });

  useIonViewWillLeave(() => {
    if (!isPlatform("desktop")) {
      const tabBar = document.querySelector("ion-tab-bar");
      if (tabBar) tabBar.style.display = "";
    }
  });

  const scrollAlike = (direction: "left" | "right") => {
    if (alikeSliderRef.current) {
      const scrollAmount = 300;
      alikeSliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return (
      <IonPage>
        <IonContent className="bg-gray-50">
          <div className="flex h-full items-center justify-center">
            <IonSpinner color="primary" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!product) {
    return (
      <IonPage>
        <IonContent className="bg-gray-50">
          <div className="flex flex-col h-full items-center justify-center gap-4 text-gray-400">
            <IonIcon icon={alertCircleOutline} className="text-6xl" />
            <h2 className="text-xl font-bold text-gray-700">
              Товар не знайдено
            </h2>
            <button
              onClick={() => history.goBack()}
              className="text-orange-500 font-bold"
            >
              Повернутися назад
            </button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const displayPrice = product.isPromo ? product.pricePromo! : product.price;
  const oldPrice = product.isPromo ? product.price : undefined;

  const currentStock = user?.selectedStoreId
    ? product.stocks?.find((s) => s.storeId === user.selectedStoreId)
        ?.available || 0
    : 0;

  const isCategoryActive = product.category ? product.category.isActive : true;

  const isUnavailable =
    !product.isActive || currentStock <= 0 || !isCategoryActive;

  return (
    <IonPage>
      <IonHeader className="ion-no-border bg-white md:hidden">
        <IonToolbar style={{ "--background": "white" }}>
          <div className="flex items-center justify-between px-2">
            <IonButton
              color="medium"
              fill="clear"
              onClick={() => history.goBack()}
              className="text-gray-800"
            >
              <IonIcon icon={chevronBackOutline} className="text-2xl" /> Назад
            </IonButton>
            <div className="w-12"></div>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="bg-white md:bg-gray-50 text-gray-900" fullscreen>
        <div className="hidden md:block container mx-auto px-8 py-12 max-w-6xl mt-16">
          <button
            onClick={() => history.goBack()}
            className="mb-8 text-gray-500 hover:text-orange-600 flex items-center gap-1 font-bold transition-colors"
          >
            <IonIcon icon={chevronBackOutline} className="text-xl" />
            Назад
          </button>

          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 flex gap-12">
            <div className="w-1/2 bg-gray-50 rounded-[24px] flex items-center justify-center p-8 min-h-[500px] relative overflow-hidden">
              {product.imagePath ? (
                <img
                  src={product.imagePath}
                  alt={product.name}
                  className={`max-w-full max-h-[400px] object-contain mix-blend-multiply ${isUnavailable ? "opacity-50 grayscale" : ""}`}
                />
              ) : (
                <span className="text-6xl opacity-10">📷</span>
              )}
            </div>

            <div className="w-1/2 flex flex-col pt-4">
              <h1 className="text-3xl font-black text-gray-800 mb-4 leading-tight">
                {product.name}
              </h1>

              <div className="mb-6 flex flex-wrap items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${isUnavailable ? "bg-red-500" : "bg-green-500"}`}
                ></div>
                <span
                  className={`text-sm font-bold ${isUnavailable ? "text-red-500" : "text-green-600"}`}
                >
                  {currentStock <= 0
                    ? "Немає в наявності"
                    : `В наявності: ${currentStock} ${product.unitsOfMeasurments}`}
                </span>

                {!product.isActive && (
                  <span className="ml-1 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded font-bold">
                    Неактивний
                  </span>
                )}
                {!isCategoryActive && (
                  <span className="ml-1 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded font-bold">
                    Категорія неактивна
                  </span>
                )}
              </div>

              <div className="prose prose-sm text-gray-500 mb-8 leading-relaxed">
                <p>{product.description || "Опис відсутній."}</p>
              </div>

              <div className="mt-auto border-t border-gray-100 pt-8 flex items-center justify-between">
                <div className="flex flex-col">
                  {oldPrice && (
                    <span className="text-sm text-gray-400 line-through decoration-red-400/50 mb-1">
                      {oldPrice} ₴
                    </span>
                  )}
                  <span className="text-sm font-bold text-gray-400 mb-1">
                    Ціна за {product.unitsOfMeasurments}
                  </span>
                  <span
                    className={`text-4xl font-black ${oldPrice ? "text-red-500" : "text-gray-900"} ${isUnavailable ? "text-gray-400" : ""}`}
                  >
                    {displayPrice}{" "}
                    <span className="text-xl font-medium text-gray-400">₴</span>
                  </span>
                </div>

                <button
                  disabled={isUnavailable}
                  className={`px-10 py-4 rounded-2xl font-bold text-lg shadow-md flex items-center gap-2 transition-all
                    ${
                      isUnavailable
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                        : "bg-orange-500 hover:bg-orange-600 active:scale-95 text-white shadow-orange-200"
                    }`}
                >
                  <IonIcon icon={addOutline} className="text-2xl" />
                  Додати у кошик
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="md:hidden flex flex-col">
          <div className="w-full aspect-square bg-gray-50 flex items-center justify-center p-8 relative">
            {product.imagePath ? (
              <img
                src={product.imagePath}
                alt={product.name}
                className={`w-full h-full object-contain mix-blend-multiply ${isUnavailable ? "opacity-50 grayscale" : ""}`}
              />
            ) : (
              <span className="text-5xl opacity-20">📷</span>
            )}
          </div>

          <div className="px-5 pt-6 bg-white rounded-t-3xl -mt-6 relative z-10">
            <h1 className="text-2xl font-black text-gray-800 leading-tight mb-3">
              {product.name}
            </h1>

            <div className="mb-4 flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${isUnavailable ? "bg-red-500" : "bg-green-500"}`}
              ></div>
              <span
                className={`text-xs font-bold ${isUnavailable ? "text-red-500" : "text-green-600"}`}
              >
                {isUnavailable
                  ? "Немає в наявності"
                  : `В наявності: ${currentStock} ${product.unitsOfMeasurments}`}
              </span>
            </div>

            <h3 className="font-bold text-lg text-gray-800 mb-2 mt-4">
              Опис товару
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              {product.description || "Опис відсутній."}
            </p>
          </div>
        </div>

        <div className="px-5 md:px-0 md:container md:mx-auto md:max-w-6xl mt-2 pb-32 md:pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 pl-1 md:pl-0">
              Схожі товари
            </h2>

            <div className="hidden md:flex gap-2">
              <button
                onClick={() => scrollAlike("left")}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:text-orange-500 active:scale-95 transition-all"
              >
                <IonIcon icon={chevronBackOutline} />
              </button>
              <button
                onClick={() => scrollAlike("right")}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:text-orange-500 active:scale-95 transition-all"
              >
                <IonIcon icon={chevronForwardOutline} />
              </button>
            </div>
          </div>

          <div
            ref={alikeSliderRef}
            className="flex overflow-x-auto pb-6 hide-scrollbar gap-4 snap-x md:snap-none"
          >
            {MOCK_ALIKE_PRODUCTS.map((dummy) => (
              <div
                key={dummy.id}
                className="min-w-[160px] md:min-w-[220px] snap-start"
              >
                <ProductCard
                  name={dummy.name}
                  price={dummy.price}
                  unit={dummy.unit}
                  isActive={true}
                />
              </div>
            ))}
          </div>
        </div>

        {!isPlatform("desktop") && (
          <>
            <div className="fixed bottom-32 right-5 z-50 animate-fade-in-up">
              <button
                onClick={() => history.push(`${basePath}/cart`)}
                className="w-14 h-14 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-2xl border border-gray-100 active:scale-95 transition-all"
              >
                <IonIcon icon={basketOutline} className="text-2xl" />
              </button>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-safe flex items-center justify-between z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
              <div className="flex flex-col pl-2">
                {oldPrice && (
                  <span className="text-[10px] text-gray-400 line-through decoration-red-400/50 mb-0.5">
                    {oldPrice} ₴
                  </span>
                )}
                <span
                  className={`text-2xl font-black leading-none mb-1 ${oldPrice ? "text-red-500" : "text-gray-900"} ${isUnavailable ? "text-gray-400" : ""}`}
                >
                  {displayPrice}{" "}
                  <span className="text-sm font-normal text-gray-400">₴</span>
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  Ціна за {product.unitsOfMeasurments}
                </span>
              </div>

              <button
                disabled={isUnavailable}
                className={`px-8 py-3.5 rounded-2xl font-bold shadow-md flex items-center gap-2 transition-all
                  ${
                    isUnavailable
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                      : "bg-orange-500 active:bg-orange-600 active:scale-95 text-white shadow-orange-200"
                  }`}
              >
                <IonIcon icon={addOutline} className="text-xl" />
                Додати у кошик
              </button>
            </div>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ProductScreen;
