/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import {
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonPage,
  IonLabel,
  IonContent,
  IonToggle,
  useIonToast,
  isPlatform,
  IonModal,
  IonAlert,
  IonBadge,
} from "@ionic/react";
import { Route, Redirect, useLocation, useHistory } from "react-router-dom";
import {
  homeOutline,
  basketOutline,
  bagHandleOutline,
  personCircleOutline,
  storefrontOutline,
  chevronDownOutline,
  checkmarkOutline,
  clipboardOutline,
  syncOutline,
  closeOutline,
} from "ionicons/icons";
import ShopScreen from "./ShopScreen";
import { useAuthStore } from "../auth/auth.store";
import api from "../../config/api";
import { type Store } from "./components/StoreSelectorModal";
import ProductScreen from "./components/ProductPage";
import CartScreen from "../cart/CartScreen";
import { useCartStore } from "../cart/cart.store";
import ProfileScreen from "../profile/ProfileScreen";
import ProfileEditScreen from "../profile/ProfileEditScreen";
import ProfileSecurityScreen from "../profile/ProfileSecurityScreen";

const ShopLayout: React.FC = () => {
  const [presentToast] = useIonToast();
  const location = useLocation();
  const history = useHistory();
  const { user, setSelectedStore, token, logout, setUser } = useAuthStore();
  const { cartItemsCount, fetchCart } = useCartStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [stores, setStores] = useState<Store[]>([]);

  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [editAddress, setEditAddress] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);

  const isAdminOnDesktop = user?.isAdmin && isPlatform("desktop");
  const isAdminRoute = location.pathname.startsWith("/admin");
  const basePath = isAdminRoute ? "/admin" : "/app";

  useEffect(() => {
    const refreshUserProfile = async () => {
      if (!token) return;

      try {
        const { data: freshUser } = await api.get("/auth");
        if (setUser) {
          setUser(freshUser);
        }

        if (!freshUser.selectedStoreId) {
          presentToast({
            message: "Будь ласка, оберіть магазин для продовження",
            duration: 3000,
            color: "warning",
          });
          history.replace("/select-store");
        }
      } catch (error) {
        console.error("Failed to refresh user profile", error);
      }
    };

    refreshUserProfile();
  }, [token, history, setUser, presentToast]);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const showInactive = isAdminOnDesktop ? 1 : 0;

        const { data } = await api.get(
          `/store?limit=0&showInactive=${showInactive}&showDeleted=0`,
        );
        setStores(Array.isArray(data) ? data : data.data || []);
      } catch (e) {
        console.error("Layout: Failed to fetch stores", e);
      }
    };
    if (token) fetchStores();
  }, [token, isAdminOnDesktop]);

  const currentStore = stores.find((s) => s.id === user?.selectedStoreId) ||
    stores[0] || { address: "Неактивний магазин", id: 0 };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleStoreSelect = async (id: number) => {
    try {
      await api.post(`/auth/store/${id}`);
      setSelectedStore(id);
      setIsDropdownOpen(false);
      presentToast({
        message: "Магазин успішно змінено!",
        duration: 1500,
        color: "success",
      });
    } catch (error: any) {
      console.error("Failed to update store:", error);
      if (error.response && error.response.status === 401) {
        logout();
        history.replace("/login");
      } else {
        presentToast({
          message: "Не вдалося змінити магазин",
          duration: 2000,
          color: "danger",
        });
      }
    }
  };

  const handleOpenEdit = (store: Store) => {
    setEditingStore(store);
    setEditAddress(store.address);
    setEditIsActive(store.isActive);
    setIsDropdownOpen(false);
  };

  const handleCloseEdit = () => {
    setEditingStore(null);
    setEditAddress("");
    setEditIsActive(true);
  };

  const handleSaveStore = async () => {
    if (!editingStore) return;
    if (!editAddress.trim()) {
      presentToast({
        message: "Адреса не може бути порожньою",
        duration: 2000,
        color: "warning",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.patch(`/store/${editingStore.id}`, {
        address: editAddress,
        isActive: editIsActive,
      });

      setStores((prev) =>
        prev.map((s) =>
          s.id === editingStore.id
            ? { ...s, address: editAddress, isActive: editIsActive }
            : s,
        ),
      );

      presentToast({
        message: "Магазин успішно оновлено!",
        duration: 2000,
        color: "success",
      });

      handleCloseEdit();
    } catch (error) {
      console.error("Failed to update store:", error);
      presentToast({
        message: "Не вдалося оновити магазин",
        duration: 2000,
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const shouldHideTabBar =
    !isPlatform("desktop") &&
    (location.pathname.includes("/cart") ||
      location.pathname.includes("/product/") ||
      location.pathname.includes("/profile"));

  return (
    <>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path={`${basePath}/shop`} component={ShopScreen} />
          <Route
            exact
            path={`${basePath}/product/:id`}
            component={ProductScreen}
          />
          <Route exact path={`${basePath}/cart`} component={CartScreen} />
          <Route
            exact
            path={`${basePath}/purchases`}
            render={() => (
              <IonPage className="bg-white">
                <IonContent>
                  <div className="flex h-full items-center justify-center font-bold text-gray-300">
                    Мої Покупки
                  </div>
                </IonContent>
              </IonPage>
            )}
          />
          <Route exact path={`${basePath}/profile`} component={ProfileScreen} />
          <Route
            exact
            path={`${basePath}/profile/edit`}
            component={ProfileEditScreen}
          />
          <Route
            exact
            path={`${basePath}/profile/wallet`}
            render={() => (
              <IonPage>
                <IonContent>Гаманець</IonContent>
              </IonPage>
            )}
          />
          <Route
            exact
            path={`${basePath}/profile/security`}
            component={ProfileSecurityScreen}
          />
          <Route
            exact
            path={`${basePath}/profile/support`}
            render={() => (
              <IonPage>
                <IonContent>Підтримка</IonContent>
              </IonPage>
            )}
          />
          <Route
            exact
            path={`${basePath}/profile/policy`}
            render={() => (
              <IonPage>
                <IonContent>Політика</IonContent>
              </IonPage>
            )}
          />
          <Route
            exact
            path={`${basePath}/orders`}
            render={() => (
              <IonPage className="bg-white">
                <IonContent>
                  <div className="flex h-full items-center justify-center font-bold text-gray-300">
                    Замовлення (Admin)
                  </div>
                </IonContent>
              </IonPage>
            )}
          />
          <Route
            exact
            path={`${basePath}/sync`}
            render={() => (
              <IonPage className="bg-white">
                <IonContent>
                  <div className="flex h-full items-center justify-center font-bold text-gray-300">
                    Синхронізація (Admin)
                  </div>
                </IonContent>
              </IonPage>
            )}
          />
          <Route exact path={`${basePath}`}>
            <Redirect to={`${basePath}/shop`} />
          </Route>
        </IonRouterOutlet>

        <div className="hidden md:flex fixed top-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-md border-b border-gray-200 z-50 px-8 items-center justify-between">
          <div className="flex items-center gap-12">
            <div
              onClick={() => history.push(`${basePath}/shop`)}
              className="flex flex-col items-start cursor-pointer group"
            >
              <h1 className="text-3xl font-black text-orange-600 tracking-tighter leading-none transition-transform group-hover:scale-105">
                ВІКТЕ
              </h1>
              {isAdminOnDesktop && (
                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em] leading-none mt-1 ml-0.5">
                  Admin
                </span>
              )}
            </div>
            <nav className="flex gap-2">
              <NavButton
                label="Головна"
                icon={homeOutline}
                active={location.pathname.includes("shop")}
                href={`${basePath}/shop`}
              />
              <NavButton
                label="Кошик"
                icon={basketOutline}
                active={location.pathname.includes("cart")}
                href={`${basePath}/cart`}
                badgeCount={cartItemsCount}
              />
              <NavButton
                label="Покупки"
                icon={bagHandleOutline}
                active={location.pathname.includes("purchases")}
                href={`${basePath}/purchases`}
              />
              {isAdminOnDesktop && (
                <>
                  <NavButton
                    label="Замовлення"
                    icon={clipboardOutline}
                    active={location.pathname.includes("orders")}
                    href={`${basePath}/orders`}
                    className="text-orange-600 hover:bg-gray-50"
                  />
                  <NavButton
                    label="Синхронізація"
                    icon={syncOutline}
                    active={location.pathname.includes("sync")}
                    href={`${basePath}/sync`}
                    className="text-orange-600 hover:bg-gray-50"
                  />
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl transition-all
                  ${isDropdownOpen ? "bg-orange-50 text-orange-800" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
                `}
              >
                <IonIcon
                  icon={storefrontOutline}
                  className={
                    isDropdownOpen ? "text-orange-500" : "text-gray-500"
                  }
                />
                <span className="text-sm font-bold truncate max-w-[200px]">
                  {currentStore.address}
                </span>
                <IonIcon
                  icon={chevronDownOutline}
                  className={`text-xs transition-transform duration-200 ${isDropdownOpen ? "rotate-180 text-orange-500" : "text-gray-400"}`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-[450px] bg-white rounded-2xl shadow-xl border border-gray-100 p-2 overflow-hidden z-50 animate-fade-in-down">
                  <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Оберіть магазин
                  </div>
                  <div className="max-h-[400px] overflow-y-auto overflow-x-hidden pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {stores.map((store) => {
                      const isSelected = user?.selectedStoreId === store.id;
                      return (
                        <div
                          key={store.id}
                          className={`
                            w-full flex items-center justify-between px-3 py-3 rounded-xl transition-colors mb-1 border border-transparent
                            ${isSelected ? "bg-orange-50 border-orange-100" : "hover:bg-gray-50"}
                          `}
                        >
                          <div className="flex-1 pr-4">
                            <p
                              className={`text-sm font-bold truncate ${isSelected ? "text-gray-900" : "text-gray-700"}`}
                            >
                              {store.address.length <= 25
                                ? store.address
                                : `${store.address.substring(0, 25)}...`}
                            </p>
                            <p
                              className={`text-[10px] ${store.isActive ? "text-green-500" : "text-red-400"}`}
                            >
                              {store.isActive
                                ? "Магазин доступний"
                                : "Магазин недоступний"}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            {isAdminOnDesktop && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEdit(store);
                                }}
                                className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors px-2 py-1 active:scale-95 bg-white shadow-sm border border-orange-100 rounded-md"
                              >
                                Редагувати
                              </button>
                            )}

                            {isSelected ? (
                              <div className="flex items-center gap-2 text-orange-600 px-3 py-1.5 bg-white rounded-lg border border-orange-100 shadow-sm">
                                <span className="text-xs font-bold">
                                  Обрано
                                </span>
                                <IonIcon icon={checkmarkOutline} />
                              </div>
                            ) : (
                              <button
                                onClick={() => handleStoreSelect(store.id)}
                                className="px-4 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-colors shadow-sm active:scale-95"
                              >
                                Обрати
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <a
              href={`${basePath}/profile`}
              className="flex items-center gap-3 hover:bg-gray-50 px-3 py-2 rounded-xl transition-colors"
            >
              <IonIcon
                icon={personCircleOutline}
                className="text-3xl text-gray-400"
              />
            </a>
          </div>
        </div>

        <IonTabBar
          slot="bottom"
          className={`md:hidden border-t border-gray-100 shadow-lg h-[70px] pb-2 bg-white ${shouldHideTabBar ? "force-hide-tab-bar" : ""}`}
        >
          <IonTabButton
            tab="shop"
            href={`${basePath}/shop`}
            className="bg-white"
          >
            <IonIcon
              icon={homeOutline}
              className={
                location.pathname.includes("shop")
                  ? "text-orange-600"
                  : "text-gray-400"
              }
            />
            <IonLabel
              className={`text-[10px] font-medium mt-1 ${location.pathname.includes("shop") ? "text-orange-600" : "text-gray-400"}`}
            >
              Головна
            </IonLabel>
          </IonTabButton>

          <IonTabButton tab="cart" href={`${basePath}/cart`}>
            <IonIcon
              icon={basketOutline}
              className={
                location.pathname.includes("cart")
                  ? "text-orange-600"
                  : "text-gray-400"
              }
            />
            <IonLabel
              className={`text-[10px] font-medium mt-1 ${location.pathname.includes("cart") ? "text-orange-600" : "text-gray-400"}`}
            >
              Кошик
            </IonLabel>
            {cartItemsCount > 0 && (
              <IonBadge color="danger" className="text-[10px] px-1.5 py-1">
                {cartItemsCount > 99 ? "99+" : cartItemsCount}
              </IonBadge>
            )}
          </IonTabButton>

          <IonTabButton
            tab="purchases"
            href={`${basePath}/purchases`}
            className="bg-white"
          >
            <IonIcon
              icon={bagHandleOutline}
              className={
                location.pathname.includes("purchases")
                  ? "text-orange-600"
                  : "text-gray-400"
              }
            />
            <IonLabel
              className={`text-[10px] font-medium mt-1 ${location.pathname.includes("purchases") ? "text-orange-600" : "text-gray-400"}`}
            >
              Покупки
            </IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>

      <IonModal
        isOpen={!!editingStore}
        onDidDismiss={handleCloseEdit}
        style={{
          "--width": "400px",
          "--height": "auto",
          "--border-radius": "24px",
        }}
      >
        <div className="bg-white flex flex-col w-full h-full">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-black text-lg text-gray-800">
              Редагувати магазин
            </h3>
            <button
              onClick={handleCloseEdit}
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
            >
              <IonIcon icon={closeOutline} className="text-2xl" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Адреса
              </label>
              <input
                type="text"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:border-orange-500 focus:bg-white transition-all"
                placeholder="Введіть адресу магазину"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-800">
                  Статус магазину
                </span>
                <span className="text-[10px] text-gray-500">
                  {editIsActive ? "Активний" : "Неактивний"}
                </span>
              </div>
              <IonToggle
                color="medium"
                checked={editIsActive}
                onIonChange={(e) => setEditIsActive(e.detail.checked)}
              />
            </div>
          </div>

          <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex gap-3">
            <button
              onClick={handleCloseEdit}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors"
            >
              Скасувати
            </button>
            <button
              onClick={() => setShowConfirmAlert(true)}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold text-sm hover:bg-orange-700 active:scale-95 transition-all shadow-md shadow-orange-200 disabled:opacity-50 disabled:active:scale-100"
            >
              {isSubmitting ? "Збереження..." : "Зберегти"}
            </button>
          </div>
        </div>
      </IonModal>

      <IonAlert
        isOpen={showConfirmAlert}
        onDidDismiss={() => setShowConfirmAlert(false)}
        header="Підтвердження"
        message="Ви впевнені, що хочете зберегти зміни для цього магазину?"
        buttons={[
          {
            text: "Скасувати",
            role: "cancel",
            handler: () => {
              setShowConfirmAlert(false);
            },
          },
          {
            text: "Так, зберегти",
            role: "confirm",
            handler: () => {
              handleSaveStore();
            },
          },
        ]}
      />
    </>
  );
};

interface NavButtonProps {
  label: string;
  icon: string;
  active: boolean;
  href: string;
  className?: string;
  badgeCount?: number;
}

const NavButton = ({
  label,
  icon,
  active,
  href,
  className = "",
  badgeCount = 0,
}: NavButtonProps) => (
  <a
    href={href}
    className={`
      flex items-center px-4 py-2 rounded-full transition-all duration-200 text-sm font-bold relative
      ${active ? "bg-orange-50 text-orange-600" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}
      ${className} 
    `}
  >
    <IonIcon icon={icon} className="mr-2 text-xl" />
    {label}

    {badgeCount > 0 && (
      <IonBadge
        color="danger"
        className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full"
      >
        {badgeCount > 99 ? "99+" : badgeCount}
      </IonBadge>
    )}
  </a>
);

export default ShopLayout;
