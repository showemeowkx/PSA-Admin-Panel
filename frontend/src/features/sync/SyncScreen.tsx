import React, { useState } from "react";
import {
  IonPage,
  IonContent,
  IonToggle,
  IonIcon,
  isPlatform,
} from "@ionic/react";
import { syncOutline, timeOutline, alertCircleOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { useAuthStore } from "../auth/auth.store";

const SyncScreen: React.FC = () => {
  const history = useHistory();
  const { user } = useAuthStore();

  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(true);
  const [syncInterval, setSyncInterval] = useState("1");
  const [isSyncing, setIsSyncing] = useState(false);

  const isAdminOnDesktop = user?.isAdmin && isPlatform("desktop");

  if (!isAdminOnDesktop) {
    return (
      <IonPage>
        <IonContent className="bg-gray-50">
          <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
            <IonIcon
              icon={alertCircleOutline}
              className="text-6xl text-gray-300"
            />
            <h2 className="text-xl font-bold text-gray-700">
              Доступ заборонено
            </h2>
            <p className="text-sm">
              Ця сторінка доступна лише для адміністраторів з ПК.
            </p>
            <button
              onClick={() => history.goBack()}
              className="mt-4 px-6 py-2 bg-black text-white rounded-xl font-bold active:scale-95 transition-all"
            >
              Повернутися
            </button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent className="bg-gray-50 text-gray-900" fullscreen>
        <div className="container mx-auto px-8 py-12 max-w-4xl mt-8">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-800 tracking-tight mb-2">
              Управління синхронізацією
            </h1>
            <p className="text-gray-500 font-medium">
              Налаштування обміну даними між базою додатку та УкрСклад
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                      <IonIcon icon={syncOutline} className="text-xl" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Ручна синхронізація
                    </h2>
                  </div>
                  <p className="text-sm text-gray-500 max-w-md mt-4 leading-relaxed">
                    Примусово завантажити останні залишки, ціни та нові товари з
                    УкрСкладу. Цей процес може зайняти від кількох секунд до
                    хвилини.
                  </p>
                </div>

                <button
                  onClick={() => setIsSyncing(!isSyncing)}
                  disabled={isSyncing}
                  className={`shrink-0 px-8 py-4 rounded-2xl font-bold text-sm shadow-md flex items-center gap-2 transition-all ${
                    isSyncing
                      ? "bg-gray-100 text-gray-400 shadow-none cursor-wait"
                      : "bg-black text-white hover:bg-gray-800 active:scale-95 shadow-gray-200"
                  }`}
                >
                  <IonIcon
                    icon={syncOutline}
                    className={`text-lg ${isSyncing ? "animate-spin" : ""}`}
                  />
                  {isSyncing ? "Синхронізація..." : "Запустити зараз"}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                  <IonIcon icon={timeOutline} className="text-xl" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Автоматична синхронізація
                </h2>
              </div>

              <div className="space-y-6">
                <div className="flex gap-12 px-1">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-medium mb-1">
                      Минулий запуск
                    </span>
                    <span className="font-bold text-gray-800 text-sm">
                      Сьогодні, 14:00
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-medium mb-1">
                      Наступний запуск
                    </span>
                    <span className="font-bold text-gray-800 text-sm">
                      Сьогодні, 15:00
                    </span>
                  </div>
                </div>

                {/* Тогл активації */}
                <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800 text-base">
                      Статус фонової синхронізації
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      Якщо увімкнено, сервер буде самостійно оновлювати дані за
                      розкладом.
                    </span>
                  </div>
                  <IonToggle
                    color="medium"
                    checked={isAutoSyncEnabled}
                    onIonChange={(e) => setIsAutoSyncEnabled(e.detail.checked)}
                    style={{ transform: "scale(1.1)" }}
                  />
                </div>

                <div
                  className={`transition-opacity duration-300 ${
                    !isAutoSyncEnabled
                      ? "opacity-50 pointer-events-none"
                      : "opacity-100"
                  }`}
                >
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Інтервал оновлення (Розклад)
                  </label>
                  <div className="flex gap-4">
                    <select
                      value={syncInterval}
                      onChange={(e) => setSyncInterval(e.target.value)}
                      disabled={!isAutoSyncEnabled}
                      className="bg-gray-50 border border-gray-200 text-gray-800 font-bold text-sm rounded-xl px-4 py-3 outline-none focus:border-black focus:bg-white transition-all w-64 cursor-pointer"
                    >
                      <option value="1">Кожну годину</option>
                      <option value="3">Кожні 3 години</option>
                      <option value="6">Кожні 6 годин</option>
                      <option value="12">Двічі на день (12 год)</option>
                      <option value="24">Один раз на день (Вночі)</option>
                    </select>
                    <button
                      disabled={!isAutoSyncEnabled}
                      className="shrink-0 px-8 py-4 rounded-2xl font-bold text-sm shadow-md flex items-center gap-2 transition-all bg-black text-white hover:bg-gray-800 active:scale-95 shadow-gray-200"
                    >
                      Зберегти розклад
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SyncScreen;
