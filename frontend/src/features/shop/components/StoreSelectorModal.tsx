import React, { useState, useMemo } from "react";
import { IonModal, IonContent, IonIcon, IonButton } from "@ionic/react";
import {
  closeOutline,
  locationOutline,
  checkmarkCircle,
  searchOutline,
} from "ionicons/icons";
import { useAuthStore } from "../../auth/auth.store";

export interface Store {
  id: number;
  address: string;
  isActive: boolean;
}

interface StoreSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  stores: Store[];
}

const StoreSelectorModal: React.FC<StoreSelectorModalProps> = ({
  isOpen,
  onClose,
  stores,
}) => {
  const { user, setSelectedStore } = useAuthStore();
  const [searchText, setSearchText] = useState("");

  const filteredStores = useMemo(() => {
    return stores.filter((store) =>
      store.address.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [stores, searchText]);

  const handleSelect = (id: number) => {
    setSelectedStore(id);
    onClose();
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      initialBreakpoint={0.75}
      breakpoints={[0, 0.5, 0.75, 1]}
      className="rounded-t-[20px]"
    >
      <IonContent className="ion-padding bg-gray-50">
        <div className="flex flex-col h-full bg-gray-50">
          <div className="flex items-center justify-between mb-6 pt-2">
            <h2 className="text-xl font-black text-gray-800">
              Оберіть магазин
            </h2>
            <IonButton fill="clear" onClick={onClose} className="-mr-3">
              <IonIcon icon={closeOutline} className="text-2xl text-gray-400" />
            </IonButton>
          </div>

          <div className="bg-white rounded-2xl p-2 flex items-center shadow-sm border border-gray-100 mb-6">
            <IonIcon
              icon={searchOutline}
              className="text-xl text-gray-400 ml-2"
            />
            <input
              type="text"
              placeholder="Пошук за адресою..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full h-10 px-3 bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-col gap-3 pb-10 overflow-y-auto">
            {filteredStores.map((store) => {
              const isSelected = user?.selectedStoreId === store.id;

              return (
                <div
                  key={store.id}
                  onClick={() => handleSelect(store.id)}
                  className={`
                    relative p-4 rounded-[24px] border transition-all duration-200 cursor-pointer flex items-center gap-4
                    ${
                      isSelected
                        ? "bg-white border-orange-500 shadow-md shadow-orange-100"
                        : "bg-white border-gray-100 hover:border-orange-200"
                    }
                  `}
                >
                  <div
                    className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center font-black text-[10px] tracking-tighter
                    ${isSelected ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500"}
                  `}
                  >
                    ВІКТЕ
                  </div>

                  <div className="flex-1">
                    <h3
                      className={`font-bold text-sm ${isSelected ? "text-gray-900" : "text-gray-700"}`}
                    >
                      {store.address}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <IonIcon
                        icon={locationOutline}
                        className="text-[10px] text-gray-400"
                      />
                      <span
                        className={`text-[10px] font-medium ${store.isActive ? "text-green-500" : "text-red-400"}`}
                      >
                        {store.isActive ? "Відчинено" : "Тимчасово зачинено"}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <IonIcon
                      icon={checkmarkCircle}
                      className="text-2xl text-orange-500"
                    />
                  )}
                </div>
              );
            })}

            {filteredStores.length === 0 && (
              <div className="text-center py-10 text-gray-400 text-sm">
                Магазинів за цією адресою не знайдено
              </div>
            )}
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default StoreSelectorModal;
