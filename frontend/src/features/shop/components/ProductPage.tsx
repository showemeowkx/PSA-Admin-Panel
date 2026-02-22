import React, { useRef } from "react";
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
} from "@ionic/react";
import {
  chevronBackOutline,
  basketOutline,
  chevronForwardOutline,
  addOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import ProductCard from "./ProductCard";

const isAdminRoute = location.pathname.startsWith("/admin");
const basePath = isAdminRoute ? "/admin" : "/app";

// MOCK DATA
const MOCK_PRODUCT = {
  id: "1",
  name: "Соковитий кавун",
  description:
    "Соковитий кавун з найкращих полів України. Ідеально підходить для літніх днів та освіжаючих напоїв.",
  price: 49,
  unit: "кг",
  image:
    "https://fruit-time.ua/images/cache/products/5a/kavun-imp-500x500.jpeg",
};

const MOCK_ALIKE_PRODUCTS = [
  { id: "2", name: "Солодкий диня", price: 39, unit: "кг" },
  { id: "3", name: "Свіжі полуниці", price: 59, unit: "кг" },
  { id: "4", name: "Соковиті персики", price: 45, unit: "кг" },
  { id: "5", name: "Смачні абрикоси", price: 55, unit: "кг" },
  { id: "6", name: "Свіжі вишні", price: 65, unit: "кг" },
];

const ProductScreen: React.FC = () => {
  const history = useHistory();
  const alikeSliderRef = useRef<HTMLDivElement>(null);

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
            <div className="w-1/2 bg-gray-50 rounded-[24px] flex items-center justify-center p-8 min-h-[500px]">
              <img
                src={MOCK_PRODUCT.image}
                alt={MOCK_PRODUCT.name}
                className="max-w-full max-h-[400px] object-contain mix-blend-multiply"
              />
            </div>

            <div className="w-1/2 flex flex-col pt-4">
              <h1 className="text-3xl font-black text-gray-800 mb-6 leading-tight">
                {MOCK_PRODUCT.name}
              </h1>

              <div className="prose prose-sm text-gray-500 mb-8 leading-relaxed">
                <p>{MOCK_PRODUCT.description}</p>
              </div>

              <div className="mt-auto border-t border-gray-100 pt-8 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-400 mb-1">
                    Ціна за {MOCK_PRODUCT.unit}
                  </span>
                  <span className="text-4xl font-black text-gray-900">
                    {MOCK_PRODUCT.price}{" "}
                    <span className="text-xl font-medium text-gray-400">₴</span>
                  </span>
                </div>

                <button className="bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-md shadow-orange-200 flex items-center gap-2">
                  <IonIcon icon={addOutline} className="text-2xl" />
                  Додати у кошик
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="md:hidden flex flex-col">
          <div className="w-full aspect-square bg-gray-50 flex items-center justify-center p-8">
            <img
              src={MOCK_PRODUCT.image}
              alt={MOCK_PRODUCT.name}
              className="w-full h-full object-contain mix-blend-multiply"
            />
          </div>

          <div className="px-5 pt-6 bg-white rounded-t-3xl -mt-6 relative z-10">
            <h1 className="text-2xl font-black text-gray-800 leading-tight mb-4">
              {MOCK_PRODUCT.name}
            </h1>

            <h3 className="font-bold text-lg text-gray-800 mb-2 mt-6">
              Опис товару
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              {MOCK_PRODUCT.description}
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
            {MOCK_ALIKE_PRODUCTS.map((product) => (
              <div
                key={product.id}
                className="min-w-[160px] md:min-w-[220px] snap-start"
              >
                <ProductCard
                  name={product.name}
                  price={product.price}
                  unit={product.unit}
                  isActive={true}
                />
              </div>
            ))}
          </div>
        </div>

        {!isPlatform("desktop") && (
          <>
            <div className="fixed bottom-24 right-5 z-50 animate-fade-in-up">
              <button
                onClick={() => history.push(`${basePath}/cart`)}
                className="w-14 h-14 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-2xl border border-gray-100 active:scale-95 transition-all"
              >
                <IonIcon icon={basketOutline} className="text-2xl" />
              </button>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-safe flex items-center justify-between z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
              <div className="flex flex-col pl-2">
                <span className="text-2xl font-black text-gray-900 leading-none mb-1">
                  {MOCK_PRODUCT.price}{" "}
                  <span className="text-sm font-normal text-gray-400">₴</span>
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  Ціна за {MOCK_PRODUCT.unit}
                </span>
              </div>

              <button className="bg-orange-500 text-white px-8 py-3.5 rounded-2xl font-bold shadow-md shadow-orange-200 active:bg-orange-600 active:scale-95 transition-all flex items-center gap-2">
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
