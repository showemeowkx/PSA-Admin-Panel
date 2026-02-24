import React, { useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButton,
  IonIcon,
  IonContent,
  useIonToast,
  IonSpinner,
} from "@ionic/react";
import {
  chevronBackOutline,
  cameraOutline,
  callOutline,
  mailOutline,
  chevronForwardOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { useAuthStore } from "../auth/auth.store";
import api from "../../config/api";

const ProfileEditScreen: React.FC = () => {
  const history = useHistory();
  const { user, setUser } = useAuthStore();
  const [presentToast] = useIonToast();

  const [name, setName] = useState(user?.name || "");
  const [surname, setSurname] = useState(user?.surname || "");
  const [isSaving, setIsSaving] = useState(false);

  const getInitials = () => {
    if (name && surname) return `${name[0]}${surname[0]}`.toUpperCase();
    if (name) return name[0].toUpperCase();
    if (surname) return surname[0].toUpperCase();
    return "👤";
  };

  const handleSavePersonalData = async () => {
    const trimmedName = name.trim();
    const trimmedSurname = surname.trim();

    if (trimmedName && trimmedName.length < 2) {
      presentToast({
        message: "Ім'я повинно містити щонайменше 2 символи",
        duration: 2000,
        color: "warning",
        mode: "ios",
      });
      return;
    }
    if (trimmedSurname && trimmedSurname.length < 2) {
      presentToast({
        message: "Прізвище повинно містити щонайменше 2 символи",
        duration: 2000,
        color: "warning",
        mode: "ios",
      });
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        name: trimmedName || null,
        surname: trimmedSurname || null,
      };

      const { data } = await api.patch("/auth", payload);

      if (setUser && user) {
        setUser({ ...user, ...data });
      }

      presentToast({
        message: "Дані успішно оновлено",
        duration: 2000,
        color: "success",
        position: "bottom",
        mode: "ios",
      });
    } catch (error) {
      console.error(error);
      presentToast({
        message: "Не вдалося оновити дані",
        duration: 2000,
        color: "danger",
        position: "bottom",
        mode: "ios",
      });
    } finally {
      setIsSaving(false);
    }
  };

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
            <span className="font-bold text-gray-800 text-lg">Редагування</span>
            <div className="w-[80px]"></div>
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
            <h1 className="text-3xl font-black text-gray-800">
              Редагувати профіль
            </h1>
          </div>

          <div className="mb-10">
            <h2 className="text-lg font-black text-gray-800 mb-5 pl-1">
              Особисті дані
            </h2>

            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-4xl overflow-hidden shadow-sm border-4 border-white">
                  {user?.imagePath ? (
                    <img
                      src={user.imagePath}
                      alt="Аватар"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials()
                  )}
                </div>
                <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center text-gray-600 hover:text-orange-600 active:scale-95 transition-all">
                  <IonIcon icon={cameraOutline} className="text-xl" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 space-y-5 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 pl-1">
                  Ім'я
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value.replace(/[^a-zA-Zа-яА-ЯіІїЇєЄґҐ'’-]/g, ""),
                    )
                  }
                  placeholder="Введіть ваше ім'я"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-800 outline-none focus:border-orange-500 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 pl-1">
                  Прізвище
                </label>
                <input
                  type="text"
                  value={surname}
                  onChange={(e) =>
                    setSurname(
                      e.target.value.replace(/[^a-zA-Zа-яА-ЯіІїЇєЄґҐ'’-]/g, ""),
                    )
                  }
                  placeholder="Введіть ваше прізвище"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-800 outline-none focus:border-orange-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              onClick={handleSavePersonalData}
              disabled={isSaving}
              className={`w-full py-4 bg-orange-500 text-white rounded-2xl font-bold text-base hover:bg-orange-600 active:scale-95 shadow-md shadow-orange-200 transition-all flex justify-center items-center gap-2 ${isSaving ? "opacity-75 cursor-not-allowed" : ""}`}
            >
              {isSaving ? (
                <IonSpinner name="crescent" className="w-5 h-5" />
              ) : (
                "Зберегти зміни"
              )}
            </button>
          </div>

          <div className="border-t border-gray-200/60 w-full mb-10"></div>

          <div>
            <h2 className="text-lg font-black text-gray-800 mb-2 pl-1">
              Дані для входу
            </h2>
            <p className="text-sm text-gray-500 mb-5 pl-1">
              Для зміни номеру телефону або електронної необхідно ввести пароль.
            </p>

            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 flex flex-col overflow-hidden">
              <button className="flex items-center justify-between p-4 md:p-5 hover:bg-gray-50 transition-colors active:bg-gray-100 border-b border-gray-50 first:rounded-t-[24px] last:rounded-b-[24px]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 border border-orange-100 shrink-0">
                    <IonIcon icon={callOutline} className="text-xl" />
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="font-bold text-gray-800 text-[15px]">
                      Номер телефону
                    </span>
                    <span className="text-sm text-gray-500 font-medium mt-0.5">
                      {user?.phone || "Не вказано"}
                    </span>
                  </div>
                </div>
                <IonIcon
                  icon={chevronForwardOutline}
                  className="text-gray-300 text-xl"
                />
              </button>

              <button className="flex items-center justify-between p-4 md:p-5 hover:bg-gray-50 transition-colors active:bg-gray-100 first:rounded-t-[24px] last:rounded-b-[24px]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100 shrink-0">
                    <IonIcon icon={mailOutline} className="text-xl" />
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="font-bold text-gray-800 text-[15px]">
                      Електронна пошта
                    </span>
                    <span className="text-sm text-gray-500 font-medium mt-0.5">
                      {user?.email || "Не вказано"}
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

export default ProfileEditScreen;
