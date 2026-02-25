/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButton,
  IonIcon,
  IonContent,
  useIonToast,
  useIonAlert,
  IonSpinner,
  IonInput,
  IonItem,
  IonLabel,
} from "@ionic/react";
import {
  chevronBackOutline,
  trashOutline,
  eyeOutline,
  eyeOffOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import api from "../../config/api";
import { useAuthStore } from "../auth/auth.store";

const ProfileSecurityScreen: React.FC = () => {
  const history = useHistory();
  const [presentToast] = useIonToast();
  const [presentAlert] = useIonAlert();
  const { logout } = useAuthStore();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isUpdating, setIsUpdating] = useState(false);

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      presentToast({
        message: "Будь ласка, заповніть всі поля",
        duration: 2000,
        color: "warning",
        mode: "ios",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      presentToast({
        message: "Нові паролі не співпадають",
        duration: 2000,
        color: "warning",
        mode: "ios",
      });
      return;
    }

    if (newPassword.length < 6) {
      presentToast({
        message: "Новий пароль занадто короткий (мінімум 6 символів)",
        duration: 2000,
        color: "warning",
        mode: "ios",
      });
      return;
    }

    try {
      setIsUpdating(true);

      const payload = {
        currentPassword: currentPassword,
        password: newPassword,
      };

      await api.patch("/auth", payload);

      presentToast({
        message: "Пароль успішно змінено!",
        duration: 2000,
        color: "success",
        mode: "ios",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error: any) {
      console.error(error);
      presentToast({
        message: error.response?.data?.message || "Не вдалося змінити пароль",
        duration: 3000,
        color: "danger",
        mode: "ios",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = () => {
    presentAlert({
      header: "Видалення акаунта",
      message:
        "Ви впевнені, що хочете видалити свій акаунт? Цю дію неможливо буде скасувати.",
      buttons: [
        {
          text: "Скасувати",
          role: "cancel",
          cssClass: "text-gray-500 font-medium",
        },
        {
          text: "Видалити",
          role: "destructive",
          cssClass: "text-red-500 font-bold",
          handler: async () => {
            try {
              setIsUpdating(true);
              await api.delete("/auth");

              if (logout) {
                logout();
              }

              history.replace("/login");

              presentToast({
                message: "Акаунт успішно видалено",
                duration: 2000,
                color: "success",
                mode: "ios",
              });
            } catch (error: any) {
              console.error(error);
              presentToast({
                message:
                  error.response?.data?.message || "Не вдалося видалити акаунт",
                duration: 3000,
                color: "danger",
                mode: "ios",
              });
            } finally {
              setIsUpdating(false);
            }
          },
        },
      ],
    });
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
            <span className="font-bold text-gray-800 text-lg">Безпека</span>
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
            <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
              Безпека
            </h1>
          </div>

          <div className="mb-10">
            <h2 className="text-lg font-black text-gray-800 mb-2 pl-1">
              Зміна пароля
            </h2>
            <p className="text-sm text-gray-500 mb-5 pl-1">
              Регулярна зміна пароля допомагає зберегти Ваш акаунт у безпеці.
            </p>

            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 space-y-5 mb-6">
              <div className="bg-gray-100/50 rounded-[20px] px-4 py-1 border border-gray-200/30 shadow-inner">
                <IonItem
                  lines="none"
                  className="bg-transparent"
                  style={{ "--background": "transparent" }}
                >
                  <div className="w-full">
                    <IonLabel
                      position="stacked"
                      className="text-gray-500 font-bold ml-1 mb-1"
                    >
                      Поточний пароль
                    </IonLabel>
                    <div className="flex items-center">
                      <IonInput
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onIonInput={(e) => setCurrentPassword(e.detail.value!)}
                        className="font-medium text-gray-800"
                        placeholder="Введіть поточний пароль"
                      />
                      <IonIcon
                        icon={showCurrentPassword ? eyeOffOutline : eyeOutline}
                        className="text-gray-400 text-xl ml-2 cursor-pointer hover:text-orange-500 transition-colors"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                      />
                    </div>
                  </div>
                </IonItem>
              </div>

              <div className="bg-gray-100/50 rounded-[20px] px-4 py-1 border border-gray-200/30 shadow-inner">
                <IonItem
                  lines="none"
                  className="bg-transparent"
                  style={{ "--background": "transparent" }}
                >
                  <div className="w-full">
                    <IonLabel
                      position="stacked"
                      className="text-orange-600 font-bold ml-1 mb-1"
                    >
                      Новий пароль
                    </IonLabel>
                    <div className="flex items-center">
                      <IonInput
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onIonInput={(e) => setNewPassword(e.detail.value!)}
                        className="font-medium text-gray-800"
                        placeholder="Введіть новий пароль"
                      />
                      <IonIcon
                        icon={showNewPassword ? eyeOffOutline : eyeOutline}
                        className="text-gray-400 text-xl ml-2 cursor-pointer hover:text-orange-500 transition-colors"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      />
                    </div>
                  </div>
                </IonItem>
              </div>

              <div className="bg-gray-100/50 rounded-[20px] px-4 py-1 border border-gray-200/30 shadow-inner">
                <IonItem
                  lines="none"
                  className="bg-transparent"
                  style={{ "--background": "transparent" }}
                >
                  <div className="w-full">
                    <IonLabel
                      position="stacked"
                      className="text-orange-600 font-bold ml-1 mb-1"
                    >
                      Підтвердження пароля
                    </IonLabel>
                    <div className="flex items-center">
                      <IonInput
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onIonInput={(e) => setConfirmPassword(e.detail.value!)}
                        className="font-medium text-gray-800"
                        placeholder="Повторіть новий пароль"
                      />
                      <IonIcon
                        icon={showConfirmPassword ? eyeOffOutline : eyeOutline}
                        className="text-gray-400 text-xl ml-2 cursor-pointer hover:text-orange-500 transition-colors"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      />
                    </div>
                  </div>
                </IonItem>
              </div>
            </div>

            <button
              onClick={handlePasswordChange}
              disabled={
                isUpdating ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
              className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold text-base hover:bg-orange-600 active:scale-95 shadow-md shadow-orange-200 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:shadow-none"
            >
              {isUpdating ? (
                <IonSpinner name="crescent" className="w-5 h-5" />
              ) : (
                <>ЗМІНИТИ ПАРОЛЬ</>
              )}
            </button>
          </div>

          <div className="border-t border-gray-200/60 w-full mb-10"></div>

          <div>
            <h2 className="text-lg font-black text-red-500 mb-2 pl-1">
              Небезпечна зона
            </h2>
            <p className="text-sm text-gray-500 mb-5 pl-1">
              Видалення акаунта призведе до безповоротної втрати всіх Ваших
              даних.
            </p>

            <button
              onClick={handleDeleteAccount}
              className="w-full bg-red-50 rounded-[24px] p-4 md:p-5 shadow-sm border border-red-100 flex items-center justify-between hover:bg-red-100 transition-colors active:bg-red-100 text-red-500 group overflow-hidden"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center text-red-500 group-hover:bg-red-50 transition-colors border border-red-100">
                  <IonIcon icon={trashOutline} className="text-xl pl-0.5" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="font-bold text-[15px]">Видалити акаунт</span>
                  <span className="text-xs text-red-400 font-medium mt-0.5">
                    Цю дію неможливо скасувати
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ProfileSecurityScreen;
