/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
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
  IonModal,
} from "@ionic/react";
import {
  chevronBackOutline,
  trashOutline,
  eyeOutline,
  eyeOffOutline,
  lockClosedOutline,
  chevronForwardOutline,
  closeOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import api from "../../config/api";
import { useAuthStore } from "../auth/auth.store";

const ProfileSecurityScreen: React.FC = () => {
  const history = useHistory();
  const [presentToast] = useIonToast();
  const [presentAlert] = useIonAlert();
  const { logout } = useAuthStore();

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
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

      resetPasswordModal();
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

  const resetPasswordModal = () => {
    setIsPasswordModalOpen(false);
    setTimeout(() => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }, 300);
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

  const renderPasswordModalContent = () => (
    <IonContent className="bg-white hide-scrollbar">
      <div className={`p-6 ${isDesktop ? "pt-4 pb-8" : "pt-8"}`}>
        {!isDesktop && (
          <h2 className="text-2xl font-black text-gray-800 mb-6 text-center">
            Зміна пароля
          </h2>
        )}

        <div className="space-y-6 animate-fade-in">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex border-[1px] border-gray-300 items-center justify-center mx-auto mb-4">
              <IonIcon
                icon={lockClosedOutline}
                className="text-3xl text-gray-500"
              />
            </div>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">
              Введіть Ваш поточний пароль та придумайте новий
            </p>
          </div>

          <div className="bg-gray-100/50 rounded-[30px] px-4 py-1 border border-gray-200/30 shadow-inner">
            <IonItem
              lines="none"
              className="bg-transparent"
              style={{ "--background": "transparent" }}
            >
              <div className="w-full">
                <IonLabel
                  position="stacked"
                  className="text-purple-600 font-bold ml-1 mb-1"
                >
                  Поточний пароль
                </IonLabel>
                <div className="flex items-center">
                  <IonInput
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    color="medium"
                    onIonInput={(e) => setCurrentPassword(e.detail.value!)}
                    className="font-medium text-gray-800"
                    placeholder="Введіть поточний пароль"
                  />
                  <IonIcon
                    icon={showCurrentPassword ? eyeOffOutline : eyeOutline}
                    className="text-gray-400 text-xl ml-2 cursor-pointer hover:text-gray-500 transition-colors"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  />
                </div>
              </div>
            </IonItem>
          </div>

          <div className="bg-gray-100/50 rounded-[30px] px-4 py-1 border border-gray-200/30 shadow-inner">
            <IonItem
              lines="none"
              className="bg-transparent"
              style={{ "--background": "transparent" }}
            >
              <div className="w-full">
                <IonLabel
                  position="stacked"
                  className="text-purple-600 font-bold ml-1 mb-1"
                >
                  Новий пароль
                </IonLabel>
                <div className="flex items-center">
                  <IonInput
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    color="medium"
                    onIonInput={(e) => setNewPassword(e.detail.value!)}
                    className="font-medium text-gray-800"
                    placeholder="Придумайте новий пароль"
                  />
                  <IonIcon
                    icon={showNewPassword ? eyeOffOutline : eyeOutline}
                    className="text-gray-400 text-xl ml-2 cursor-pointer hover:text-gray-500 transition-colors"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  />
                </div>
              </div>
            </IonItem>
          </div>

          <div className="bg-gray-100/50 rounded-[30px] px-4 py-1 border border-gray-200/30 shadow-inner">
            <IonItem
              lines="none"
              className="bg-transparent"
              style={{ "--background": "transparent" }}
            >
              <div className="w-full">
                <IonLabel
                  position="stacked"
                  className="text-purple-600 font-bold ml-1 mb-1"
                >
                  Підтвердження пароля
                </IonLabel>
                <div className="flex items-center">
                  <IonInput
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    color="medium"
                    onIonInput={(e) => setConfirmPassword(e.detail.value!)}
                    className="font-medium text-gray-800"
                    placeholder="Повторіть новий пароль"
                  />
                  <IonIcon
                    icon={showConfirmPassword ? eyeOffOutline : eyeOutline}
                    className="text-gray-400 text-xl ml-2 cursor-pointer hover:text-gray-500 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                </div>
              </div>
            </IonItem>
          </div>

          <IonButton
            expand="block"
            onClick={handlePasswordChange}
            disabled={
              isUpdating || !currentPassword || !newPassword || !confirmPassword
            }
            className="h-14 mt-4 font-black text-lg"
            style={{
              "--border-radius": "30px",
              "--box-shadow": "0 12px 24px -6px rgba(60, 60, 60, 0.4)",
            }}
            color="dark"
          >
            {isUpdating ? (
              <IonSpinner name="crescent" className="w-5 h-5" />
            ) : (
              "ЗМІНИТИ ПАРОЛЬ"
            )}
          </IonButton>
        </div>
      </div>
    </IonContent>
  );

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
              Безпека
            </span>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="bg-gray-50 text-gray-900" fullscreen>
        <div className="container mx-auto px-4 py-6 md:py-12 md:mt-20 max-w-2xl animate-fade-in pb-32">
          <div className="flex items-center gap-4 mb-8 hidden md:flex">
            <button
              onClick={() => history.goBack()}
              className="text-gray-400 hover:text-black transition-colors"
            >
              <IonIcon icon={chevronBackOutline} className="text-3xl" />
            </button>
            <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
              Безпека
            </h1>
          </div>

          <div className="mb-10">
            <h2 className="text-lg font-black text-gray-800 mb-2 pl-1">
              Управління доступом
            </h2>
            <p className="text-sm text-gray-500 mb-5 pl-1">
              Регулярна зміна пароля допомагає зберегти Ваш акаунт у безпеці.
            </p>

            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 flex flex-col overflow-hidden">
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="flex items-center justify-between p-4 md:p-5 hover:bg-gray-50 transition-colors active:bg-gray-100 first:rounded-t-[24px] last:rounded-b-[24px]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 border border-purple-100 shrink-0">
                    <IonIcon icon={lockClosedOutline} className="text-xl" />
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="font-bold text-gray-800 text-[15px]">
                      Змінити пароль
                    </span>
                    <span className="text-sm text-gray-500 font-medium mt-0.5">
                      Створити новий пароль для входу
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
              disabled={isUpdating}
              className="w-full bg-red-50 rounded-[24px] p-4 md:p-5 border border-red-100 flex items-center justify-between hover:bg-red-100 transition-all active:scale-[0.98] text-red-500 group overflow-hidden disabled:opacity-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center text-red-500 transition-colors shrink-0">
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

      <IonModal
        isOpen={isPasswordModalOpen}
        onDidDismiss={resetPasswordModal}
        breakpoints={isDesktop ? undefined : [0, 0.75, 0.9]}
        initialBreakpoint={isDesktop ? undefined : 0.75}
        style={
          isDesktop
            ? {
                "--width": "500px",
                "--height": "600px",
                "--border-radius": "24px",
              }
            : undefined
        }
      >
        {isDesktop && (
          <IonHeader className="ion-no-border bg-white rounded-t-[24px]">
            <IonToolbar className="bg-white px-2 rounded-t-[24px]">
              <h2 className="text-xl font-black text-gray-800 ml-2">
                Зміна пароля
              </h2>
              <IonButton
                slot="end"
                fill="clear"
                color="medium"
                onClick={resetPasswordModal}
              >
                <IonIcon icon={closeOutline} className="text-2xl" />
              </IonButton>
            </IonToolbar>
          </IonHeader>
        )}
        {renderPasswordModalContent()}
      </IonModal>
    </IonPage>
  );
};

export default ProfileSecurityScreen;
