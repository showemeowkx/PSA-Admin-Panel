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
  cardOutline,
  syncOutline,
  trashOutline,
  addOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";

const ProfileWalletScreen: React.FC = () => {
  const history = useHistory();

  // MOCK DATA
  const hasWallet = true;
  const maskedCard = "**** **** **** 1234";

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
              Гаманець
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
              Гаманець
            </h1>
          </div>

          <div className="mb-10">
            <h2 className="text-lg font-black text-gray-800 mb-2 pl-1">
              Спосіб оплати
            </h2>
            <p className="text-sm text-gray-500 mb-5 pl-1">
              Ваша збережена картка для оплати.
            </p>

            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
              {hasWallet ? (
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-[24px] min-h-[220px] md:min-h-[200px] w-full md:w-[340px] shrink-0 flex flex-col justify-between p-6 shadow-lg shadow-gray-300/50 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/5 blur-2xl pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-white/5 blur-xl pointer-events-none"></div>

                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                      <IonIcon
                        icon={cardOutline}
                        className="text-2xl text-white"
                      />
                    </div>
                  </div>

                  <div className="relative z-10">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
                      Номер рахунку
                    </p>
                    <p className="text-xl font-black tracking-widest text-gray-100">
                      {maskedCard}
                    </p>
                  </div>
                </div>
              ) : (
                <button className="flex flex-col items-center justify-center min-h-[220px] md:min-h-[200px] w-full md:w-[340px] shrink-0 rounded-[24px] border-2 border-dashed border-orange-400 bg-orange-50/50 hover:bg-orange-100 text-orange-500 transition-colors active:scale-[0.98]">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-orange-500">
                    <IonIcon icon={addOutline} className="text-3xl" />
                  </div>
                  <span className="font-bold text-lg">Додати гаманець</span>
                </button>
              )}

              {hasWallet && (
                <div className="flex flex-col gap-3 w-full md:justify-center pt-2 md:pt-0">
                  <button className="flex items-center justify-center gap-2 bg-gray-100 border border-gray-200 text-gray-700 font-bold py-4 px-6 rounded-2xl hover:bg-gray-50 active:scale-95 transition-all shadow-sm">
                    <IonIcon
                      icon={syncOutline}
                      className="text-xl text-black"
                    />
                    Змінити гаманець
                  </button>

                  <button className="flex items-center justify-center gap-2 bg-red-50 border border-red-100 text-red-500 font-bold py-4 px-6 rounded-2xl hover:bg-red-100 active:scale-95 transition-all shadow-sm">
                    <IonIcon icon={trashOutline} className="text-xl" />
                    Видалити гаманець
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ProfileWalletScreen;
