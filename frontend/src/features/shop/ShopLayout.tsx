import React from "react";
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
} from "ionicons/icons";
import ShopScreen from "./ShopScreen";

const ShopLayout: React.FC = () => {
  const location = useLocation();

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
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
            <IonIcon icon={storefrontOutline} className="text-gray-500" />
            <span className="text-sm font-bold text-gray-700">
              Магазин на Хрещатику
            </span>
            <IonIcon
              icon={chevronDownOutline}
              className="text-gray-400 text-xs"
            />
          </button>

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
