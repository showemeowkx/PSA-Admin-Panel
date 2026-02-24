/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButton,
  IonIcon,
  IonContent,
  useIonToast,
  IonSpinner,
  IonModal,
  IonInput,
  IonItem,
  IonLabel,
} from "@ionic/react";
import {
  chevronBackOutline,
  cameraOutline,
  callOutline,
  mailOutline,
  chevronForwardOutline,
  trashOutline,
  phonePortraitOutline,
  keypadOutline,
  eyeOutline,
  eyeOffOutline,
  closeOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { useAuthStore } from "../auth/auth.store";
import api from "../../config/api";
import Cropper from "react-easy-crop";

const DEFAULT_USER_PFP = import.meta.env.VITE_DEFAULT_USER_PFP;

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return null;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/jpeg");
  });
}

const ProfileEditScreen: React.FC = () => {
  const history = useHistory();
  const { user, setUser } = useAuthStore();
  const [presentToast] = useIonToast();

  const [name, setName] = useState(user?.name || "");
  const [surname, setSurname] = useState(user?.surname || "");
  const [isSaving, setIsSaving] = useState(false);

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [phoneStep, setPhoneStep] = useState<1 | 2>(1);
  const [newPhone, setNewPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPhoneUpdating, setIsPhoneUpdating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [isEmailUpdating, setIsEmailUpdating] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const getInitials = () => {
    if (name && surname) return `${name[0]}${surname[0]}`.toUpperCase();
    if (name) return name[0].toUpperCase();
    if (surname) return surname[0].toUpperCase();
    return "👤";
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result?.toString() || null);
        setIsCropperOpen(true);
      });
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onCropComplete = useCallback(
    (
      _croppedArea: { x: number; y: number; width: number; height: number },
      croppedAreaPixels: {
        x: number;
        y: number;
        width: number;
        height: number;
      },
    ) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const handleUploadPhoto = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setIsUploadingPhoto(true);
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

      if (!croppedImageBlob) throw new Error("Помилка обрізки");

      const formData = new FormData();
      formData.append("pfp", croppedImageBlob, "avatar.jpg");

      const { data } = await api.patch("/auth", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (setUser && user) {
        setUser({ ...user, ...data });
      }

      presentToast({
        message: "Фото успішно оновлено",
        duration: 2000,
        color: "success",
        position: "bottom",
        mode: "ios",
      });
      setIsCropperOpen(false);
    } catch (error) {
      console.error(error);
      presentToast({
        message: "Не вдалося оновити фото",
        duration: 2000,
        color: "danger",
        position: "bottom",
        mode: "ios",
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleResetPhoto = async () => {
    try {
      setIsUploadingPhoto(true);

      const payload = { imagePath: null };
      const { data } = await api.patch("/auth", payload);

      if (setUser && user) {
        setUser({ ...user, ...data });
      }

      presentToast({
        message: "Фото видалено",
        duration: 2000,
        color: "success",
        position: "bottom",
        mode: "ios",
      });
    } catch (error) {
      console.error(error);
      presentToast({
        message: "Не вдалося видалити фото",
        duration: 2000,
        color: "danger",
        position: "bottom",
        mode: "ios",
      });
    } finally {
      setIsUploadingPhoto(false);
    }
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

  const handleRequestPhoneCode = async () => {
    if (!newPhone || newPhone.length < 10) {
      presentToast({
        message: "Введіть коректний номер телефону",
        duration: 2000,
        color: "warning",
        mode: "ios",
      });
      return;
    }

    try {
      setIsPhoneUpdating(true);
      await api.post("/auth/send-code", { phone: newPhone });
      setPhoneStep(2);
      setTimeLeft(30);
      presentToast({
        message: "Код відправлено на новий номер",
        duration: 2000,
        color: "success",
        mode: "ios",
      });
    } catch (error: any) {
      console.error(error);
      presentToast({
        message: error.response?.data?.message || "Помилка при відправці коду",
        duration: 3000,
        color: "danger",
        mode: "ios",
      });
    } finally {
      setIsPhoneUpdating(false);
    }
  };

  const handleConfirmPhoneChange = async () => {
    if (verificationCode.length !== 6) {
      presentToast({
        message: "Введіть 6-значний код",
        duration: 2000,
        color: "warning",
        mode: "ios",
      });
      return;
    }
    if (!currentPassword) {
      presentToast({
        message: "Введіть ваш поточний пароль",
        duration: 2000,
        color: "warning",
        mode: "ios",
      });
      return;
    }

    try {
      setIsPhoneUpdating(true);

      const payload = {
        phone: newPhone,
        currentPassword: currentPassword,
        code: verificationCode,
      };

      const { data } = await api.patch("/auth", payload);

      if (setUser && user) {
        setUser({ ...user, ...data });
      }

      presentToast({
        message: "Номер телефону успішно змінено!",
        duration: 2000,
        color: "success",
        mode: "ios",
      });
      resetPhoneModal();
    } catch (error: any) {
      console.error(error);
      presentToast({
        message: error.response?.data?.message || "Невірний код або пароль",
        duration: 3000,
        color: "danger",
        mode: "ios",
      });
    } finally {
      setIsPhoneUpdating(false);
    }
  };

  const resetPhoneModal = () => {
    setIsPhoneModalOpen(false);
    setTimeout(() => {
      setPhoneStep(1);
      setNewPhone("");
      setVerificationCode("");
      setCurrentPassword("");
      setShowPassword(false);
      setTimeLeft(0);
    }, 300);
  };

  const handleConfirmEmailChange = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newEmail || !emailRegex.test(newEmail)) {
      presentToast({
        message: "Введіть коректну електронну пошту",
        duration: 2000,
        color: "warning",
        mode: "ios",
      });
      return;
    }

    if (user?.email && !emailPassword) {
      presentToast({
        message: "Введіть ваш поточний пароль",
        duration: 2000,
        color: "warning",
        mode: "ios",
      });
      return;
    }

    try {
      setIsEmailUpdating(true);

      const payload: any = { email: newEmail };
      if (user?.email) {
        payload.currentPassword = emailPassword;
      }

      const { data } = await api.patch("/auth", payload);

      if (setUser && user) {
        setUser({ ...user, ...data });
      }

      presentToast({
        message: user?.email
          ? "Електронну пошту успішно змінено!"
          : "Електронну пошту успішно додано!",
        duration: 2000,
        color: "success",
        mode: "ios",
      });
      resetEmailModal();
    } catch (error: any) {
      console.error(error);
      presentToast({
        message:
          error.response?.data?.message ||
          "Не вдалося зберегти електронну пошту",
        duration: 3000,
        color: "danger",
        mode: "ios",
      });
    } finally {
      setIsEmailUpdating(false);
    }
  };

  const resetEmailModal = () => {
    setIsEmailModalOpen(false);
    setTimeout(() => {
      setNewEmail("");
      setEmailPassword("");
      setShowEmailPassword(false);
    }, 300);
  };

  const renderPhoneModalContent = () => (
    <IonContent className="bg-white">
      <div className={`p-6 ${isDesktop ? "pt-4" : "pt-8"}`}>
        {!isDesktop && (
          <h2 className="text-2xl font-black text-gray-800 mb-6 text-center">
            {phoneStep === 1 ? "Зміна телефону" : "Підтвердження"}
          </h2>
        )}

        {phoneStep === 1 ? (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <IonIcon
                  icon={phonePortraitOutline}
                  className="text-3xl text-orange-500"
                />
              </div>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">
                Введіть новий номер телефону для отримання коду підтвердження
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
                    className="text-orange-600 font-bold ml-1 mb-1"
                  >
                    Новий номер телефону
                  </IonLabel>
                  <IonInput
                    type="tel"
                    inputmode="tel"
                    value={newPhone}
                    onIonInput={(e) => {
                      const val = e.detail.value!;
                      const filtered = val.replace(/[^0-9+]/g, "");
                      setNewPhone(filtered);
                      if (val !== filtered) e.target.value = filtered;
                    }}
                    className="font-medium text-gray-800"
                    placeholder="+380..."
                    maxlength={13}
                  />
                </div>
              </IonItem>
            </div>

            <IonButton
              expand="block"
              onClick={handleRequestPhoneCode}
              disabled={isPhoneUpdating || newPhone.length < 10}
              className="h-14 mt-4 font-black text-lg"
              style={{
                "--border-radius": "30px",
                "--box-shadow": "0 12px 24px -6px rgba(60, 60, 60, 0.4)",
              }}
              color="primary"
            >
              {isPhoneUpdating ? (
                <IonSpinner name="crescent" className="w-5 h-5" />
              ) : (
                "ОТРИМАТИ КОД"
              )}
            </IonButton>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-2">
              <p className="text-gray-500 text-sm font-medium">
                Код відправлено на <br />
                <span className="font-bold text-gray-800 text-base">
                  {newPhone}
                </span>
              </p>
            </div>

            <div className="bg-gray-100/50 rounded-[30px] px-4 py-1 border border-gray-200/30 shadow-inner mb-4">
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
                    СМС Код
                  </IonLabel>
                  <div className="flex items-center">
                    <IonInput
                      type="tel"
                      inputmode="numeric"
                      pattern="[0-9]*"
                      value={verificationCode}
                      onIonInput={(e) => {
                        const val = e.detail.value!;
                        const numeric = val.replace(/\D/g, "");
                        setVerificationCode(numeric);
                        if (val !== numeric) {
                          e.target.value = numeric;
                        }
                      }}
                      className="font-medium text-gray-800"
                      placeholder="6-значний код"
                      maxlength={6}
                    />
                    <IonIcon
                      icon={keypadOutline}
                      className="text-gray-400 text-xl ml-2"
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
                    className="text-orange-600 font-bold ml-1 mb-1"
                  >
                    Поточний пароль
                  </IonLabel>
                  <div className="flex items-center">
                    <IonInput
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onIonInput={(e) => setCurrentPassword(e.detail.value!)}
                      className="font-medium text-gray-800"
                      placeholder="Ваш пароль"
                    />
                    <IonIcon
                      icon={showPassword ? eyeOffOutline : eyeOutline}
                      className="text-gray-400 text-xl ml-2 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </div>
                </div>
              </IonItem>
            </div>

            <IonButton
              expand="block"
              onClick={handleConfirmPhoneChange}
              disabled={
                isPhoneUpdating ||
                verificationCode.length !== 6 ||
                currentPassword.length < 1
              }
              className="h-14 mt-4 font-black text-lg"
              style={{
                "--border-radius": "30px",
                "--box-shadow": "0 12px 24px -6px rgba(60, 60, 60, 0.4)",
              }}
              color="primary"
            >
              {isPhoneUpdating ? (
                <IonSpinner name="crescent" className="w-5 h-5" />
              ) : (
                "ЗМІНИТИ НОМЕР"
              )}
            </IonButton>

            <div className="text-center pt-2">
              <IonButton
                fill="clear"
                disabled={timeLeft > 0 || isPhoneUpdating}
                onClick={handleRequestPhoneCode}
                color="medium"
                className="text-xs normal-case opacity-80"
              >
                {timeLeft > 0
                  ? `Надіслати код знову через ${formatTime(timeLeft)}`
                  : "Надіслати код ще раз"}
              </IonButton>
            </div>

            <div className="text-center">
              <IonButton
                fill="clear"
                onClick={() => setPhoneStep(1)}
                disabled={isPhoneUpdating}
                color="medium"
                className="text-xs normal-case opacity-80"
              >
                Повернутися назад
              </IonButton>
            </div>
          </div>
        )}
      </div>
    </IonContent>
  );

  const renderEmailModalContent = () => (
    <IonContent className="bg-white">
      <div className={`p-6 ${isDesktop ? "pt-4" : "pt-8"}`}>
        {!isDesktop && (
          <h2 className="text-2xl font-black text-gray-800 mb-6 text-center">
            {user?.email ? "Зміна пошти" : "Додавання пошти"}
          </h2>
        )}

        <div className="space-y-6 animate-fade-in">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <IonIcon icon={mailOutline} className="text-3xl text-blue-500" />
            </div>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">
              {user?.email
                ? "Введіть нову електронну пошту та поточний пароль для підтвердження"
                : "Введіть вашу електронну пошту"}
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
                  className="text-blue-600 font-bold ml-1 mb-1"
                >
                  Електронна пошта
                </IonLabel>
                <IonInput
                  type="email"
                  inputmode="email"
                  value={newEmail}
                  onIonInput={(e) => setNewEmail(e.detail.value!)}
                  className="font-medium text-gray-800"
                  placeholder="example@mail.com"
                />
              </div>
            </IonItem>
          </div>

          {user?.email && (
            <div className="bg-gray-100/50 rounded-[30px] px-4 py-1 border border-gray-200/30 shadow-inner">
              <IonItem
                lines="none"
                className="bg-transparent"
                style={{ "--background": "transparent" }}
              >
                <div className="w-full">
                  <IonLabel
                    position="stacked"
                    className="text-blue-600 font-bold ml-1 mb-1"
                  >
                    Поточний пароль
                  </IonLabel>
                  <div className="flex items-center">
                    <IonInput
                      type={showEmailPassword ? "text" : "password"}
                      value={emailPassword}
                      onIonInput={(e) => setEmailPassword(e.detail.value!)}
                      className="font-medium text-gray-800"
                      placeholder="Ваш пароль"
                    />
                    <IonIcon
                      icon={showEmailPassword ? eyeOffOutline : eyeOutline}
                      className="text-gray-400 text-xl ml-2 cursor-pointer"
                      onClick={() => setShowEmailPassword(!showEmailPassword)}
                    />
                  </div>
                </div>
              </IonItem>
            </div>
          )}

          <IonButton
            expand="block"
            onClick={handleConfirmEmailChange}
            disabled={
              isEmailUpdating || !newEmail || (!!user?.email && !emailPassword)
            }
            className="h-14 mt-4 font-black text-lg"
            style={{
              "--border-radius": "30px",
              "--box-shadow": "0 12px 24px -6px rgba(60, 60, 60, 0.4)",
            }}
            color="primary"
          >
            {isEmailUpdating ? (
              <IonSpinner name="crescent" className="w-5 h-5" />
            ) : user?.email ? (
              "ЗМІНИТИ ПОШТУ"
            ) : (
              "ЗБЕРЕГТИ ПОШТУ"
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

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center text-gray-600 hover:text-orange-600 active:scale-95 transition-all disabled:opacity-0"
                >
                  <IonIcon icon={cameraOutline} className="text-xl" />
                </button>

                <button
                  onClick={handleResetPhoto}
                  disabled={
                    isUploadingPhoto ||
                    !user?.imagePath ||
                    user?.imagePath === DEFAULT_USER_PFP
                  }
                  className="absolute bottom-0 left-0 w-10 h-10 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center text-red-500 hover:text-red-600 active:scale-95 transition-all disabled:opacity-0"
                >
                  <IonIcon icon={trashOutline} className="text-xl" />
                </button>

                <input
                  type="file"
                  accept="image/*"
                  hidden
                  ref={fileInputRef}
                  onChange={onFileChange}
                />
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
              Для зміни номеру телефону або електронної пошти необхідно
              підтвердження.
            </p>

            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 flex flex-col overflow-hidden">
              <button
                onClick={() => setIsPhoneModalOpen(true)}
                className="flex items-center justify-between p-4 md:p-5 hover:bg-gray-50 transition-colors active:bg-gray-100 border-b border-gray-50 first:rounded-t-[24px] last:rounded-b-[24px]"
              >
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

              <button
                onClick={() => setIsEmailModalOpen(true)}
                className="flex items-center justify-between p-4 md:p-5 hover:bg-gray-50 transition-colors active:bg-gray-100 first:rounded-t-[24px] last:rounded-b-[24px]"
              >
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

      <IonModal
        isOpen={isCropperOpen}
        onDidDismiss={() => setIsCropperOpen(false)}
      >
        <IonHeader className="ion-no-border bg-white">
          <IonToolbar style={{ "--background": "white" }}>
            <div className="flex items-center justify-between px-4 py-3">
              <button
                onClick={() => setIsCropperOpen(false)}
                disabled={isUploadingPhoto}
                className="text-gray-500 font-bold active:scale-95 transition-all"
              >
                Скасувати
              </button>
              <span className="font-bold text-gray-800 text-lg">
                Обрізка фото
              </span>
              <button
                onClick={handleUploadPhoto}
                disabled={isUploadingPhoto}
                className="text-orange-600 font-bold flex items-center gap-1 active:scale-95 transition-all"
              >
                {isUploadingPhoto ? (
                  <IonSpinner name="crescent" className="w-5 h-5" />
                ) : (
                  "Зберегти"
                )}
              </button>
            </div>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="relative w-full h-full bg-black">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            )}
          </div>
        </IonContent>
      </IonModal>

      {isDesktop ? (
        <IonModal
          isOpen={isPhoneModalOpen}
          onDidDismiss={resetPhoneModal}
          style={{
            "--width": "450px",
            "--height": "560px",
            "--border-radius": "24px",
          }}
        >
          <IonHeader className="ion-no-border bg-white rounded-t-[24px]">
            <IonToolbar className="bg-white px-2 rounded-t-[24px]">
              <h2 className="text-xl font-black text-gray-800 ml-2">
                Зміна телефону
              </h2>
              <IonButton
                slot="end"
                fill="clear"
                color="medium"
                onClick={resetPhoneModal}
              >
                <IonIcon icon={closeOutline} className="text-2xl" />
              </IonButton>
            </IonToolbar>
          </IonHeader>
          {renderPhoneModalContent()}
        </IonModal>
      ) : (
        <IonModal
          isOpen={isPhoneModalOpen}
          onDidDismiss={resetPhoneModal}
          breakpoints={[0, 0.75, 0.9]}
          initialBreakpoint={0.75}
        >
          {renderPhoneModalContent()}
        </IonModal>
      )}

      {isDesktop ? (
        <IonModal
          isOpen={isEmailModalOpen}
          onDidDismiss={resetEmailModal}
          style={{
            "--width": "450px",
            "--height": "560px",
            "--border-radius": "24px",
          }}
        >
          <IonHeader className="ion-no-border bg-white rounded-t-[24px]">
            <IonToolbar className="bg-white px-2 rounded-t-[24px]">
              <h2 className="text-xl font-black text-gray-800 ml-2">
                {user?.email ? "Зміна пошти" : "Додавання пошти"}
              </h2>
              <IonButton
                slot="end"
                fill="clear"
                color="medium"
                onClick={resetEmailModal}
              >
                <IonIcon icon={closeOutline} className="text-2xl" />
              </IonButton>
            </IonToolbar>
          </IonHeader>
          {renderEmailModalContent()}
        </IonModal>
      ) : (
        <IonModal
          isOpen={isEmailModalOpen}
          onDidDismiss={resetEmailModal}
          breakpoints={[0, 0.75, 0.9]}
          initialBreakpoint={0.75}
        >
          {renderEmailModalContent()}
        </IonModal>
      )}
    </IonPage>
  );
};

export default ProfileEditScreen;
