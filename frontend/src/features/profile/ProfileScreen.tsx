import React from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButton,
  IonIcon,
  IonContent,
} from "@ionic/react";
import {
  chevronBackOutline,
  personOutline,
  walletOutline,
  lockClosedOutline,
  chatbubblesOutline,
  documentTextOutline,
  logOutOutline,
  chevronForwardOutline,
} from "ionicons/icons";
import { useHistory, useLocation } from "react-router-dom";

const ProfileScreen: React.FC = () => {
  const history = useHistory();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");
  const basePath = isAdminRoute ? "/admin" : "/app";

  const menuItems = [
    {
      title: "Редагувати профіль",
      icon: personOutline,
      path: `${basePath}/profile/edit`,
    },
    {
      title: "Гаманець",
      icon: walletOutline,
      path: `${basePath}/profile/wallet`,
    },
    {
      title: "Безпека",
      icon: lockClosedOutline,
      path: `${basePath}/profile/security`,
    },
    {
      title: "Підтримка",
      icon: chatbubblesOutline,
      path: `${basePath}/profile/support`,
    },
    {
      title: "Політика конфіденційності",
      icon: documentTextOutline,
      path: `${basePath}/profile/policy`,
    },
  ];

  return (
    <IonPage>
      <IonHeader className="ion-no-border bg-white md:hidden pt-safe">
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
            <span className="font-bold text-gray-800 text-lg">Кабінет</span>
            <div className="w-[80px]"></div>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="bg-gray-50 text-gray-900" fullscreen>
        <div className="container mx-auto px-4 py-6 md:py-12 md:mt-20 max-w-3xl animate-fade-in pb-32">
          <h1 className="hidden md:block text-3xl font-black text-gray-800 mb-8">
            Особистий кабінет
          </h1>

          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex items-center gap-5 mb-6">
            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-3xl shrink-0">
              ІП
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-gray-900">Ім'я Прізвище</h2>
              <p className="text-gray-500 font-medium mt-1">
                +380 99 999 99 99
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden mb-6 flex flex-col">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => history.push(item.path)}
                className={`flex items-center justify-between p-4 md:p-5 hover:bg-gray-50 transition-colors active:bg-gray-100 first:rounded-t-[24px] last:rounded-b-[24px] ${
                  index !== menuItems.length - 1
                    ? "border-b border-gray-50"
                    : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 border border-gray-100">
                    <IonIcon icon={item.icon} className="text-xl" />
                  </div>
                  <span className="font-bold text-gray-800 text-[15px]">
                    {item.title}
                  </span>
                </div>
                <IonIcon
                  icon={chevronForwardOutline}
                  className="text-gray-300 text-xl"
                />
              </button>
            ))}
          </div>

          <button
            onClick={() => console.log("Виклик логіки виходу")}
            className="w-full bg-white rounded-[24px] p-4 md:p-5 shadow-sm border border-gray-100 flex items-center justify-between hover:bg-red-50 transition-colors active:bg-red-100 text-red-500 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-100 transition-colors border border-red-100">
                <IonIcon icon={logOutOutline} className="text-xl pl-1" />
              </div>
              <span className="font-bold text-[15px]">Вийти з акаунту</span>
            </div>
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ProfileScreen;
