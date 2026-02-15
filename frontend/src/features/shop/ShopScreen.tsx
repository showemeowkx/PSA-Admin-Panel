import React, { useRef } from "react";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonButton,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
} from "@ionic/react";
import {
  searchOutline,
  personCircleOutline,
  filterOutline,
  chevronBackOutline,
  chevronForwardOutline,
  storefrontOutline,
  chevronDownOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import CategoryCard from "./components/CategoryCard";
import ProductCard from "./components/ProductCard";

const ShopScreen: React.FC = () => {
  const history = useHistory();
  const categoriesRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: "left" | "right") => {
    if (categoriesRef.current) {
      const scrollAmount = 300;
      categoriesRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // MOCK DATA
  const categories = [
    { id: 1, name: "Продукти" },
    { id: 2, name: "Напої" },
    { id: 3, name: "Солодощі" },
    { id: 4, name: "Косметика" },
    { id: 5, name: "Побутова хімія" },
    { id: 6, name: "Товари для дому" },
    { id: 7, name: "Електроніка" },
    { id: 8, name: "Одяг" },
    { id: 9, name: "Взуття" },
    { id: 10, name: "Іграшки" },
    { id: 11, name: "Спорт" },
    { id: 12, name: "Автотовари" },
    { id: 13, name: "Книги" },
    { id: 14, name: "Меблі" },
    { id: 15, name: "Сад та город" },
    { id: 16, name: "Товари для тварин" },
  ];

  const products = [
    {
      id: 1,
      name: "Кава в зернах Lavazza Qualita Oro, 1 кг",
      price: 450,
      pricePromo: 350,
      unitsOfMeasurments: "кг",
      isPromo: true,
    },
    {
      id: 2,
      name: "Молоко 1л",
      price: 25,
      pricePromo: 20,
      unitsOfMeasurments: "л",
      isPromo: true,
    },
    {
      id: 3,
      name: "Сир 1 кг",
      price: 120,
      pricePromo: 100,
      unitsOfMeasurments: "кг",
      isPromo: true,
    },
    {
      id: 4,
      name: "Хліб 500г",
      price: 20,
      unitsOfMeasurments: "шт",
      isPromo: false,
    },
    {
      id: 5,
      name: "Яйця 10 шт",
      price: 40,
      unitsOfMeasurments: "шт",
      isPromo: false,
    },
    {
      id: 6,
      name: "Масло вершкове 200г",
      price: 35,
      pricePromo: 25,
      unitsOfMeasurments: "шт",
      isPromo: true,
    },
    {
      id: 7,
      name: "Сік апельсиновий 1л",
      price: 30,
      unitsOfMeasurments: "л",
      isPromo: false,
    },
    {
      id: 8,
      name: "Печиво 200г",
      price: 15,
      unitsOfMeasurments: "шт",
      isPromo: false,
    },
    {
      id: 9,
      name: "Шоколад 100г",
      price: 20,
      unitsOfMeasurments: "шт",
      isPromo: false,
    },
    {
      id: 10,
      name: "Кава розчинна Nescafe Classic, 200г",
      price: 150,
      pricePromo: 120,
      unitsOfMeasurments: "шт",
      isPromo: true,
    },
    {
      id: 11,
      name: "Молоко 2л",
      price: 45,
      unitsOfMeasurments: "шт",
      isPromo: false,
    },
    {
      id: 12,
      name: "Сир 500г",
      price: 120,
      pricePromo: 100,
      unitsOfMeasurments: "шт",
      isPromo: true,
    },
  ];

  return (
    <IonPage>
      <IonHeader className="ion-no-border shadow-sm z-40 bg-white md:hidden">
        <IonToolbar
          className="bg-white"
          style={{ "--background": "white", "--min-height": "auto" }}
        >
          <div className="flex flex-col pb-3 pt-2 px-4 gap-3">
            <div className="flex items-center justify-between">
              <button className="flex items-center gap-2 active:opacity-70">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                  <IonIcon icon={storefrontOutline} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-0.5">
                    Магазин
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-black text-gray-800 leading-none">
                      Хрещатик, 1
                    </span>
                    <IonIcon
                      icon={chevronDownOutline}
                      className="text-orange-500 text-[10px]"
                    />
                  </div>
                </div>
              </button>

              <IonButton
                fill="clear"
                onClick={() => history.push("/app/profile")}
                className="m-0 h-8"
              >
                <IonIcon
                  icon={personCircleOutline}
                  className="text-3xl text-gray-600"
                />
              </IonButton>
            </div>

            <div className="bg-gray-100/80 rounded-xl p-2.5 flex items-center h-10">
              <IonIcon
                icon={searchOutline}
                className="text-lg text-gray-400 mr-2 ml-1"
              />
              <input
                type="text"
                placeholder="Пошук товарів..."
                className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
              />
              <button className="text-gray-400 active:text-orange-500">
                <IonIcon icon={filterOutline} />
              </button>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="bg-gray-50" fullscreen>
        <IonRefresher
          slot="fixed"
          onIonRefresh={(e) => setTimeout(() => e.detail.complete(), 1000)}
        >
          <IonRefresherContent />
        </IonRefresher>

        <div className="pb-24 pt-4 md:pt-28 container mx-auto md:px-8">
          <div className="hidden md:flex mb-8 items-center justify-center">
            <div className="bg-gray-100/80 rounded-xl px-4 py-2.5 w-full max-w-xl flex items-center h-12">
              <IonIcon
                icon={searchOutline}
                className="text-xl text-gray-400 mr-3"
              />
              <input
                type="text"
                placeholder="Пошук товарів..."
                className="w-full bg-transparent outline-none text-gray-700 text-base placeholder:text-gray-400"
              />
              <button className="text-gray-400 hover:text-orange-500 transition-colors">
                <IonIcon icon={filterOutline} className="text-xl" />
              </button>
            </div>
          </div>

          <div className="pl-4 md:pl-0 mb-8 relative group">
            <div className="flex items-center justify-between pr-4 mb-4">
              <h2 className="text-lg md:text-xl font-bold text-gray-800">
                Категорії
              </h2>

              <div className="hidden md:flex gap-2">
                <button
                  onClick={() => scrollCategories("left")}
                  className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-orange-500 active:scale-95 transition-all"
                >
                  <IonIcon icon={chevronBackOutline} />
                </button>
                <button
                  onClick={() => scrollCategories("right")}
                  className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-orange-500 active:scale-95 transition-all"
                >
                  <IonIcon icon={chevronForwardOutline} />
                </button>
              </div>
            </div>

            <div
              ref={categoriesRef}
              className="flex overflow-x-auto pb-4 hide-scrollbar pr-4 gap-3 md:gap-5 scroll-smooth py-2"
            >
              {categories.map((cat) => (
                <CategoryCard key={cat.id} name={cat.name} />
              ))}
            </div>
          </div>

          <div className="px-3 md:px-0">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 pl-1">
              Товари
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  name={product.name}
                  price={product.isPromo ? product.pricePromo! : product.price}
                  oldPrice={product.isPromo ? product.price : undefined}
                  unit={product.unitsOfMeasurments}
                />
              ))}
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ShopScreen;
