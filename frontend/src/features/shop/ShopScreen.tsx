/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useRef, useEffect } from "react";
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
import { useAuthStore } from "../auth/auth.store";
import StoreSelectorModal, {
  type Store,
} from "./components/StoreSelectorModal";
import api from "../../config/api";

interface Product {
  id: number;
  ukrskladId: number;
  name: string;
  description?: string;
  categoryId: number;
  price: number;
  pricePromo: number | null;
  unitsOfMeasurments: string;
  imagePath: string;
  isActive: boolean;
  isPromo: boolean;
}

interface Category {
  id: number;
  name: string;
  iconPath: string;
}

const ShopScreen: React.FC = () => {
  const history = useHistory();
  const { user, token } = useAuthStore();
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);

  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const categoriesRef = useRef<HTMLDivElement>(null);

  const fetchStores = async () => {
    try {
      const { data } = await api.get(
        "/store?limit=0&showInactive=0&showDeleted=0",
      );
      setStores(Array.isArray(data) ? data : data.data || []);
    } catch (e) {
      console.error("Failed to fetch stores", e);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get(
        "/categories?limit=0&showInactive=0&showDeleted=0",
      );
      setCategories(data.data || []);
    } catch (e) {
      console.error("Failed to fetch categories", e);
    }
  };

  const fetchProducts = async (storeId: number) => {
    try {
      const { data } = await api.get(
        `/products?limit=24&showAll=0&showDeleted=0&showInactive=0&storeId=${storeId}`,
      );
      setProducts(data.data || []);
    } catch (e) {
      console.error("Failed to fetch products", e);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStores();
      fetchCategories();
    }
  }, [token]);

  useEffect(() => {
    if (user?.selectedStoreId && token) {
      fetchProducts(user.selectedStoreId);
    }
  }, [user?.selectedStoreId, token]);

  const handleRefresh = async (e: CustomEvent) => {
    const promises = [fetchStores(), fetchCategories()];
    if (user?.selectedStoreId) {
      promises.push(fetchProducts(user.selectedStoreId));
    }
    await Promise.all(promises);
    e.detail.complete();
  };

  const currentStore = stores.find((s) => s.id === user?.selectedStoreId) || {
    address: "Неактивний магазин",
  };

  const scrollCategories = (direction: "left" | "right") => {
    if (categoriesRef.current) {
      const scrollAmount = 300;
      categoriesRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <IonPage>
      <StoreSelectorModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        stores={stores}
      />

      <IonHeader className="ion-no-border shadow-sm z-40 bg-white md:hidden">
        <IonToolbar
          className="bg-white"
          style={{ "--background": "white", "--min-height": "auto" }}
        >
          <div className="flex flex-col pb-3 pt-2 px-4 gap-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsStoreModalOpen(true)}
                className="flex items-center gap-2 active:opacity-70 group"
              >
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 group-active:scale-90 transition-transform">
                  <IonIcon icon={storefrontOutline} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-0.5">
                    Магазин
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-black text-gray-800 leading-none truncate max-w-[180px]">
                      {currentStore.address.split(",")[0]}
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
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
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

            <div className="relative">
              <div className="absolute left-0 top-0 bottom-4 z-10 w-8 bg-gradient-to-r from-gray-50 to-transparent md:hidden flex items-center justify-start pointer-events-none opacity-50">
                <IonIcon
                  icon={chevronBackOutline}
                  className="text-gray-400 text-lg"
                />
              </div>

              <div
                ref={categoriesRef}
                className="flex overflow-x-auto pb-4 hide-scrollbar pr-4 gap-3 md:gap-5 scroll-smooth py-2 relative z-0"
              >
                {categories.map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    name={cat.name}
                    image={cat.iconPath}
                  />
                ))}
              </div>

              <div className="absolute right-0 top-0 bottom-4 z-10 w-12 bg-gradient-to-l from-gray-50 via-gray-50/80 to-transparent md:hidden flex items-center justify-end pr-1 pointer-events-none">
                <IonIcon
                  icon={chevronForwardOutline}
                  className="text-orange-400 text-2xl animate-pulse drop-shadow-sm"
                />
              </div>
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
                  image={product.imagePath}
                />
              ))}
              {products.length === 0 && (
                <div className="col-span-full text-center py-10 text-gray-400">
                  Товарів не знайдено
                </div>
              )}
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ShopScreen;
