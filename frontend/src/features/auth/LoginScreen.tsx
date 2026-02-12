/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonLoading,
  useIonToast,
  IonItem,
  IonLabel,
  IonList,
} from "@ionic/react";
import { useAuthStore } from "./auth.store";
import { useHistory } from "react-router-dom";
import api from "../../config/api";

const LoginScreen: React.FC = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const setAuth = useAuthStore((state) => state.setAuth);
  const history = useHistory();
  const [presentToast] = useIonToast();

  const handleLogin = async () => {
    if (!phone || !password) {
      presentToast({
        message: "Enter login and password",
        duration: 2000,
        color: "warning",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/auth/signin", {
        login: phone,
        password: password,
      });

      const { accessToken } = response.data;

      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      const profileResponse = await api.get("/auth");
      const user = profileResponse.data;

      setAuth(user, accessToken);

      presentToast({ message: "Welcome!", duration: 1000, color: "success" });

      if (user.isAdmin) {
        history.replace("/admin");
      } else {
        history.replace("/app");
      }
    } catch (error: any) {
      presentToast({
        message: error.response?.data?.message || "Check your credentials",
        duration: 3000,
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div className="flex flex-col h-full justify-center max-w-md mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-orange-500">PSA Panel</h1>
            <p className="text-gray-500">Enter your credentials</p>
          </div>

          <IonList className="bg-transparent">
            <IonItem mode="md" className="mb-4">
              <IonLabel position="floating">Phone Number</IonLabel>
              <IonInput
                type="tel"
                placeholder="380..."
                value={phone}
                onIonInput={(e) => setPhone(e.detail.value!)}
              />
            </IonItem>

            <IonItem mode="md" className="mb-6">
              <IonLabel position="floating">Password</IonLabel>
              <IonInput
                type="password"
                value={password}
                onIonInput={(e) => setPassword(e.detail.value!)}
              />
            </IonItem>
          </IonList>

          <IonButton expand="block" onClick={handleLogin} className="h-12 mt-4">
            Sign In
          </IonButton>

          <IonLoading isOpen={isLoading} message="Checking credentials..." />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginScreen;
