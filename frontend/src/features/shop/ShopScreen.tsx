/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonButton,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  isPlatform,
  useIonViewWillEnter,
  useIonViewWillLeave,
} from "@ionic/react";
import {
  searchOutline,
  personCircleOutline,
  filterOutline,
  chevronBackOutline,
  chevronForwardOutline,
  storefrontOutline,
  chevronDownOutline,
  closeCircleOutline,
  basketOutline,
} from "ionicons/icons";
import { useHistory, useLocation } from "react-router-dom";
import CategoryCard from "./components/CategoryCard";
import ProductCard from "./components/ProductCard";
import { useAuthStore } from "../auth/auth.store";
import StoreSelectorModal, {
  type Store,
} from "./components/StoreSelectorModal";
import api from "../../config/api";
import SearchProductCard from "./components/SearchProductCard";

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
  const location = useLocation();
  const { user, token } = useAuthStore();
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);

  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isAdminRoute = location.pathname.startsWith("/admin");
  const basePath = isAdminRoute ? "/admin" : "/app";

  const categoriesRef = useRef<HTMLDivElement>(null);

  const fetchStores = useCallback(async () => {
    try {
      const isAdminOnDesktop =
        (user?.isAdmin || isAdminRoute) && isPlatform("desktop");
      const showInactive = isAdminOnDesktop ? 1 : 0;

      const { data } = await api.get(
        `/store?limit=0&showInactive=${showInactive}&showDeleted=0`,
      );
      setStores(Array.isArray(data) ? data : data.data || []);
    } catch (e) {
      console.error("Failed to fetch stores", e);
    }
  }, [user, isAdminRoute]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.get(
        "/categories?limit=0&showInactive=0&showDeleted=0",
      );
      setCategories(data.data || []);
    } catch (e) {
      console.error("Failed to fetch categories", e);
    }
  }, []);

  const fetchProducts = useCallback(
    async (storeId: number, pageNum: number, isLoadMore: boolean = false) => {
      try {
        const { data } = await api.get(
          `/products?limit=24&page=${pageNum}&showAll=0&showDeleted=0&showInactive=0&storeId=${storeId}`,
        );

        const newProducts = data.data || [];

        if (isLoadMore) {
          setProducts((prev) => [...prev, ...newProducts]);
        } else {
          setProducts(newProducts);
        }

        setHasMore(newProducts.length >= 24);
      } catch (e) {
        console.error("Failed to fetch products", e);
        setHasMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (token) {
      fetchStores();
      fetchCategories();
    }
  }, [token, fetchStores, fetchCategories]);

  useEffect(() => {
    if (user?.selectedStoreId && token) {
      fetchProducts(user.selectedStoreId, 1, false);
    }
  }, [user?.selectedStoreId, token, fetchProducts]);

  useEffect(() => {
    if (isPlatform("desktop")) return;

    const tabBar = document.querySelector("ion-tab-bar");
    if (tabBar) {
      tabBar.style.display = isSearchActive ? "none" : "";
    }

    return () => {
      if (tabBar && !isPlatform("desktop")) {
        tabBar.style.display = "";
      }
    };
  }, [isSearchActive]);

  useIonViewWillLeave(() => {
    if (!isPlatform("desktop")) {
      const tabBar = document.querySelector("ion-tab-bar");
      if (tabBar) tabBar.style.display = "";
    }
  });

  useIonViewWillEnter(() => {
    if (!isPlatform("desktop") && isSearchActive) {
      const tabBar = document.querySelector("ion-tab-bar");
      if (tabBar) tabBar.style.display = "none";
    }
  });

  const handleRefresh = async (e: CustomEvent) => {
    setPage(1);
    setHasMore(true);

    const promises = [fetchStores(), fetchCategories()];

    if (user?.selectedStoreId) {
      promises.push(fetchProducts(user.selectedStoreId, 1, false));
    }

    await Promise.all(promises);
    e.detail.complete();
  };

  const handleInfinite = async (ev: CustomEvent<void>) => {
    if (!user?.selectedStoreId) {
      (ev.target as HTMLIonInfiniteScrollElement).complete();
      return;
    }

    const nextPage = page + 1;
    await fetchProducts(user.selectedStoreId, nextPage, true);
    setPage(nextPage);

    (ev.target as HTMLIonInfiniteScrollElement).complete();
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

  const handleExitSearch = () => {
    setIsSearchActive(false);
    setSearchQuery("");
  };

  // --- MOCK SEARCH DATA ---
  const mockSearchResults = [
    {
      id: 991,
      ukrskladId: 1,
      name: "Молоко 2.5%",
      price: 35,
      categoryId: 1,
      unitsOfMeasurments: "шт",
      imagePath: "",
      isActive: true,
      isPromo: false,
      pricePromo: null,
    },
    {
      id: 992,
      ukrskladId: 2,
      name: "Хліб білий",
      price: 20,
      categoryId: 1,
      unitsOfMeasurments: "шт",
      imagePath: "",
      isActive: true,
      isPromo: false,
      pricePromo: null,
    },
    {
      id: 993,
      ukrskladId: 3,
      name: "Сир твердий",
      price: 150,
      categoryId: 2,
      unitsOfMeasurments: "кг",
      imagePath: "",
      isActive: true,
      isPromo: true,
      pricePromo: 120,
    },
  ];

  return (
    <IonPage>
      <StoreSelectorModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        stores={stores}
      />

      <IonHeader className="ion-no-border shadow-sm z-40 bg-white md:hidden transition-all duration-300">
        <IonToolbar
          className="bg-white"
          style={{ "--background": "white", "--min-height": "auto" }}
        >
          <div className="flex flex-col pb-3 pt-2 px-4 gap-3">
            {!isSearchActive && (
              <div className="flex items-center justify-between animate-fade-in-down">
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
                  onClick={() => history.push(`${basePath}/profile`)}
                  className="m-0 h-8"
                >
                  <IonIcon
                    icon={personCircleOutline}
                    className="text-3xl text-gray-600"
                  />
                </IonButton>
              </div>
            )}

            <div className="flex items-center gap-2">
              {isSearchActive && (
                <button
                  onClick={handleExitSearch}
                  className="text-gray-600 p-1 -ml-2 animate-fade-in"
                >
                  <IonIcon icon={chevronBackOutline} className="text-3xl" />
                </button>
              )}
              <div className="bg-gray-100/80 rounded-xl p-2.5 flex items-center h-10 w-full transition-all duration-300">
                <IonIcon
                  icon={searchOutline}
                  className="text-lg text-gray-400 mr-2 ml-1"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setIsSearchActive(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Пошук товарів..."
                  className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
                />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-gray-400 active:text-orange-500"
                  >
                    <IonIcon icon={closeCircleOutline} className="text-xl" />
                  </button>
                ) : (
                  <button className="text-gray-400 active:text-orange-500">
                    <IonIcon icon={filterOutline} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="bg-gray-50" fullscreen>
        {!isSearchActive && (
          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent />
          </IonRefresher>
        )}

        <div className="pb-24 pt-4 md:pt-28 container mx-auto md:px-8">
          <div className="hidden md:flex mb-8 items-center justify-center">
            <div
              className={`transition-all duration-300 flex items-center gap-4 ${isSearchActive ? "w-full max-w-4xl" : "w-full max-w-xl"}`}
            >
              {isSearchActive && (
                <button
                  onClick={handleExitSearch}
                  className="text-gray-500 hover:text-orange-600 flex items-center gap-1 font-bold animate-fade-in-left"
                >
                  <IonIcon icon={chevronBackOutline} className="text-xl" />
                  Назад
                </button>
              )}

              <div className="bg-gray-100/80 rounded-xl px-4 py-2.5 w-full flex items-center h-12">
                <IonIcon
                  icon={searchOutline}
                  className="text-xl text-gray-400 mr-3"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setIsSearchActive(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Пошук товарів..."
                  className="w-full bg-transparent outline-none text-gray-700 text-base placeholder:text-gray-400"
                />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-gray-400 hover:text-orange-500 transition-colors mr-2"
                  >
                    <IonIcon icon={closeCircleOutline} className="text-xl" />
                  </button>
                ) : null}
                <button className="text-gray-400 hover:text-orange-500 transition-colors">
                  <IonIcon icon={filterOutline} className="text-xl" />
                </button>
              </div>
            </div>
          </div>

          {!isSearchActive ? (
            <div className="animate-fade-in">
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
                        isAdminOnDesktop={isAdminRoute && isPlatform("desktop")}
                        onEdit={() => {}} // PLACEHOLDER
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
                      price={
                        product.isPromo ? product.pricePromo! : product.price
                      }
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
              <IonInfiniteScroll
                onIonInfinite={handleInfinite}
                threshold="100px"
                disabled={!hasMore}
              >
                <IonInfiniteScrollContent
                  loadingSpinner="bubbles"
                  loadingText="Завантаження товарів..."
                />
              </IonInfiniteScroll>
            </div>
          ) : (
            <div className="px-3 md:px-0 animate-fade-in-up">
              {searchQuery.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-24 md:py-32">
                  <IonIcon
                    icon={searchOutline}
                    className="text-6xl text-gray-200 mb-4"
                  />
                  <h3 className="text-lg font-bold text-gray-700 mb-1">
                    Що будемо шукати?
                  </h3>
                  <p className="text-sm text-gray-400">
                    Почніть вводити назву товару
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6 pl-1 border-b border-gray-200 pb-3">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800">
                      Результати:{" "}
                      <span className="text-orange-600 font-medium ml-1">
                        "{searchQuery}"
                      </span>
                    </h2>
                    <span className="text-xs font-bold text-gray-400 bg-gray-200/50 px-2 py-1 rounded-md">
                      {mockSearchResults.length} знайдено
                    </span>
                  </div>

                  <div className="md:grid md:grid-cols-4 md:gap-6 flex flex-col">
                    {mockSearchResults.map((product) =>
                      isPlatform("desktop") ? (
                        <ProductCard
                          key={product.id}
                          name={product.name}
                          price={
                            product.isPromo
                              ? product.pricePromo!
                              : product.price
                          }
                          oldPrice={product.isPromo ? product.price : undefined}
                          unit={product.unitsOfMeasurments}
                          image={product.imagePath}
                        />
                      ) : (
                        <SearchProductCard
                          key={product.id}
                          name={product.name}
                          price={
                            product.isPromo
                              ? product.pricePromo!
                              : product.price
                          }
                          oldPrice={product.isPromo ? product.price : undefined}
                          unit={product.unitsOfMeasurments}
                          image={product.imagePath}
                        />
                      ),
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {isSearchActive && !isPlatform("desktop") && (
          <div
            slot="fixed"
            className="bottom-6 right-6 z-50 animate-fade-in-up"
          >
            <button
              onClick={() => {
                history.push(`${basePath}/cart`);
                setTimeout(() => {
                  setIsSearchActive(false);
                  setSearchQuery("");
                }, 400);
              }}
              className="w-14 h-14 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-2xl border-4 border-gray-50 active:bg-orange-600 active:scale-95 transition-all"
            >
              <IonIcon icon={basketOutline} className="text-2xl" />
            </button>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ShopScreen;
