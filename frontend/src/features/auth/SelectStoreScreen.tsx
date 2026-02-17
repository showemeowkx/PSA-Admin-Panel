/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonSpinner,
  useIonToast,
} from "@ionic/react";
import {
  storefrontOutline,
  checkmarkCircle,
  logOutOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import api from "../../config/api";
import { useAuthStore } from "./auth.store";

interface Store {
  id: number;
  address: string;
  isActive: boolean;
}

const SelectStoreScreen: React.FC = () => {
  const history = useHistory();
  const { setSelectedStore, logout } = useAuthStore();
  const [presentToast] = useIonToast();

  const [stores, setStores] = useState<Store[]>([]);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get(
        "/store?limit=0&showInactive=0&showDeleted=0",
      );
      const storesList = Array.isArray(data) ? data : data.data || [];
      setStores(storesList);
    } catch (error) {
      console.error("Failed to fetch stores", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectStore = async (storeId: number) => {
    setIsSubmitting(true);
    try {
      await api.post(`/auth/store/${storeId}`);

      if (setSelectedStore) {
        setSelectedStore(storeId);
      }

      presentToast({
        message: "Магазин успішно обрано!",
        duration: 1500,
        color: "success",
      });

      history.replace("/app/shop");
    } catch (error: any) {
      console.error("Error selecting store:", error);
      presentToast({
        message: "Не вдалося зберегти вибір магазину",
        duration: 2000,
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    history.replace("/login");
  };

  const filteredStores = stores.filter((s) =>
    s.address.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <IonPage>
      <IonContent className="ion-padding custom-login-bg">
        <div className="flex flex-col h-full justify-center items-center px-6 py-6">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
              <IonIcon
                icon={storefrontOutline}
                className="text-4xl text-orange-500"
              />
            </div>
            <h1 className="text-2xl font-black text-gray-800">
              Оберіть Ваш магазин
            </h1>
            <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
              Вкажіть магазин, у якому ви плануєте робити покупки
            </p>
          </div>

          <div className="w-full max-w-md bg-white/95 rounded-[45px] p-6 shadow-2xl border border-white flex flex-col max-h-[60vh]">
            <div className="bg-gray-100/50 rounded-[24px] p-2 border border-gray-200/30 mb-4 shadow-inner">
              <IonSearchbar
                value={searchText}
                onIonInput={(e) => setSearchText(e.detail.value!)}
                placeholder="Пошук адреси..."
                className="custom-searchbar bg-transparent"
              />
            </div>

            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <IonSpinner color="primary" />
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredStores.map((store) => (
                    <div
                      key={store.id}
                      onClick={() =>
                        !isSubmitting && handleSelectStore(store.id)
                      }
                      className="bg-white rounded-[20px] p-4 border border-gray-100 shadow-sm active:scale-95 transition-all flex items-center gap-4 cursor-pointer hover:border-orange-300 hover:shadow-md"
                    >
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-sm leading-tight">
                          {store.address}
                        </h3>
                      </div>
                      <IonIcon
                        icon={checkmarkCircle}
                        className="text-gray-200 text-2xl group-hover:text-orange-400"
                      />
                    </div>
                  ))}
                  {filteredStores.length === 0 && !isLoading && (
                    <p className="text-center text-gray-400 text-xs py-4">
                      Магазинів не знайдено
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 text-center">
            <IonButton
              fill="clear"
              color="medium"
              onClick={handleLogout}
              size="small"
              className="text-gray-500 font-medium hover:text-orange-600"
            >
              <IonIcon icon={logOutOutline} slot="start" />
              Вийти з акаунту
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SelectStoreScreen;
