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
  paperPlaneOutline,
  mailOutline,
  chevronForwardOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";

const ProfileSupportScreen: React.FC = () => {
  const history = useHistory();

  const telegramLink = import.meta.env.VITE_TELEGRAM_SUPPORT_LINK;
  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL;

  return (
    <IonPage>
      <IonHeader className="ion-no-border bg-white md:hidden pt-safe">
        <IonToolbar style={{ "--background": "white" }}>
          <div className="flex items-center px-2 relative h-full">
            <IonButton
              color="medium"
              fill="clear"
              onClick={() => history.goBack()}
              className="text-gray-800 z-10"
            >
              <IonIcon icon={chevronBackOutline} className="text-2xl" /> Назад
            </IonButton>
            <span className="absolute left-0 right-0 text-center font-bold text-gray-800 text-lg pointer-events-none">
              Підтримка
            </span>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="bg-gray-50 text-gray-900" fullscreen>
        <div className="container mx-auto px-4 py-6 md:py-12 md:mt-20 max-w-2xl animate-fade-in pb-32">
          <div className="flex items-center gap-4 mb-8 hidden md:flex">
            <button
              onClick={() => history.goBack()}
              className="text-gray-400 hover:text-orange-500 transition-colors"
            >
              <IonIcon icon={chevronBackOutline} className="text-3xl" />
            </button>
            <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
              Підтримка
            </h1>
          </div>

          <div className="mb-8">
            <p className="text-sm text-gray-500 pl-1 mb-6">
              Виникли питання чи проблеми? Ми завжди готові допомогти!
            </p>

            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 flex flex-col overflow-hidden">
              <button
                onClick={() => window.open(telegramLink, "_blank")}
                className="flex items-center justify-between p-4 md:p-5 hover:bg-gray-50 transition-colors active:bg-gray-100 border-b border-gray-50 first:rounded-t-[24px]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100 shrink-0">
                    <IonIcon icon={paperPlaneOutline} className="text-xl" />
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="font-bold text-gray-800 text-[15px]">
                      Написати в Telegram
                    </span>
                    <span className="text-sm text-gray-500 font-medium mt-0.5">
                      Швидкі відповіді у месенджері
                    </span>
                  </div>
                </div>
                <IonIcon
                  icon={chevronForwardOutline}
                  className="text-gray-300 text-xl"
                />
              </button>

              <button
                onClick={() =>
                  (window.location.href = `mailto:${supportEmail}`)
                }
                className="flex items-center justify-between p-4 md:p-5 hover:bg-gray-50 transition-colors active:bg-gray-100 last:rounded-b-[24px]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 border border-orange-100 shrink-0">
                    <IonIcon icon={mailOutline} className="text-xl" />
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="font-bold text-gray-800 text-[15px]">
                      Надіслати Email
                    </span>
                    <span className="text-sm text-gray-500 font-medium mt-0.5">
                      {supportEmail}
                    </span>
                  </div>
                </div>
                <IonIcon
                  icon={chevronForwardOutline}
                  className="text-gray-300 text-xl"
                />
              </button>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ProfileSupportScreen;
