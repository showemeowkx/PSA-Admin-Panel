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
} from "@ionic/react";
import { Route, Redirect, useLocation } from "react-router-dom";
import {
  homeOutline,
  basketOutline,
  bagHandleOutline,
  personCircleOutline,
  storefrontOutline,
  chevronDownOutline,
  checkmarkOutline,
} from "ionicons/icons";
import ShopScreen from "./ShopScreen";
import { useAuthStore } from "../auth/auth.store";
import { MOCK_STORES } from "./shop.data";

const ShopLayout: React.FC = () => {
  const location = useLocation();
  const { user, setChosenStore } = useAuthStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentStore =
    MOCK_STORES.find((s) => s.id === user?.chosenStoreId) || MOCK_STORES[0];

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

  const handleStoreSelect = (id: number) => {
    setChosenStore(id);
    setIsDropdownOpen(false);
  };

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/app/shop" component={ShopScreen} />

        <Route
          exact
          path="/app/cart"
          render={() => (
            <IonPage className="bg-white">
              <IonContent>
                <div className="flex h-full items-center justify-center font-bold text-gray-300">
                  Кошик
                </div>
              </IonContent>
            </IonPage>
          )}
        />

        <Route
          exact
          path="/app/purchases"
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

        <Route
          exact
          path="/app/profile"
          render={() => (
            <IonPage className="bg-white">
              <IonContent>
                <div className="flex h-full items-center justify-center font-bold text-gray-300">
                  Мій Кабінет
                </div>
              </IonContent>
            </IonPage>
          )}
        />

        <Route exact path="/app">
          <Redirect to="/app/shop" />
        </Route>
      </IonRouterOutlet>

      <div className="hidden md:flex fixed top-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-md border-b border-gray-200 z-50 px-8 items-center justify-between">
        <div className="flex items-center gap-12">
          <h1 className="text-3xl font-black text-orange-600 tracking-tighter cursor-pointer">
            ВІКТЕ
          </h1>
          <nav className="flex gap-2">
            <NavButton
              label="Головна"
              icon={homeOutline}
              active={location.pathname.includes("shop")}
              href="/app/shop"
            />
            <NavButton
              label="Кошик"
              icon={basketOutline}
              active={location.pathname.includes("cart")}
              href="/app/cart"
            />
            <NavButton
              label="Покупки"
              icon={bagHandleOutline}
              active={location.pathname.includes("purchases")}
              href="/app/purchases"
            />
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
                className={isDropdownOpen ? "text-orange-500" : "text-gray-500"}
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
              <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 overflow-hidden z-50 animate-fade-in-down">
                <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Оберіть магазин
                </div>
                <div className="max-h-[400px] overflow-y-auto pr-1">
                  {MOCK_STORES.map((store) => {
                    const isSelected = user?.chosenStoreId === store.id;
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
                            {store.address}
                          </p>
                          <p
                            className={`text-[10px] ${store.isActive ? "text-green-500" : "text-red-400"}`}
                          >
                            {store.isActive ? "Відчинено" : "Зачинено"}
                          </p>
                        </div>

                        {isSelected ? (
                          <div className="flex items-center gap-2 text-orange-600 px-3 py-1.5 bg-white rounded-lg border border-orange-100 shadow-sm">
                            <span className="text-xs font-bold">Обрано</span>
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
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <a
            href="/app/profile"
            className="flex items-center gap-3 hover:bg-gray-50 px-3 py-2 rounded-xl transition-colors"
          >
            <div className="text-right hidden lg:block">
              <p className="text-sm font-bold text-gray-800">Мій Кабінет</p>
            </div>
            <IonIcon
              icon={personCircleOutline}
              className="text-3xl text-gray-400"
            />
          </a>
        </div>
      </div>

      <IonTabBar
        slot="bottom"
        className="md:hidden border-t border-gray-100 shadow-lg h-[70px] pb-2 bg-white"
      >
        <IonTabButton tab="shop" href="/app/shop" className="bg-white">
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

        <IonTabButton tab="cart" href="/app/cart" className="bg-white">
          <div className="relative flex justify-center items-center">
            <IonIcon
              icon={basketOutline}
              className={`text-2xl ${location.pathname.includes("cart") ? "text-orange-600" : "text-gray-400"}`}
            />
          </div>
          <IonLabel
            className={`text-[10px] font-medium mt-1 ${location.pathname.includes("cart") ? "text-orange-600" : "text-gray-400"}`}
          >
            Кошик
          </IonLabel>
        </IonTabButton>

        <IonTabButton
          tab="purchases"
          href="/app/purchases"
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
  );
};

interface NavButtonProps {
  label: string;
  icon: string;
  active: boolean;
  href: string;
}

const NavButton = ({ label, icon, active, href }: NavButtonProps) => (
  <a
    href={href}
    className={`
      flex items-center px-4 py-2 rounded-full transition-all duration-200 text-sm font-bold
      ${active ? "bg-orange-50 text-orange-600" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}
    `}
  >
    <IonIcon icon={icon} className="mr-2 text-xl" />
    {label}
  </a>
);

export default ShopLayout;
