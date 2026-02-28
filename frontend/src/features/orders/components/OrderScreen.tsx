/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonButton,
  IonIcon,
  IonAlert,
  useIonToast,
} from "@ionic/react";
import {
  chevronBackOutline,
  personOutline,
  callOutline,
  receiptOutline,
  closeCircleOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";

// MOCK DATA
const MOCK_ADMIN_ORDER = {
  id: 1,
  orderNumber: "20260228-1001",
  totalAmount: 1250.5,
  status: "IN PROCESS",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  transactionId: "TXN-9876543210ABC",
  store: {
    id: 1,
    address: "вул. Хрещатик, 1",
  },
  user: {
    id: 845,
    firstName: "Іван",
    lastName: "Петренко",
    phone: "+380 50 123 45 67",
  },
  items: [
    {
      id: 101,
      productImagePath: "https://via.placeholder.com/150",
      productName: "Корм Royal Canin для кошенят",
      productCode: "RC-101-KITTEN",
      priceAtPurchase: 450.0,
      quantity: 2,
      product: {
        id: 123,
      },
    },
    {
      id: 102,
      productImagePath: "https://via.placeholder.com/150",
      productName: "Іграшка 'Мишка' інтерактивна",
      productCode: "TOY-55-MOUSE",
      priceAtPurchase: 350.5,
      quantity: 1,
    },
  ],
};

const AdminOrderItemCard = ({
  item,
  onClick,
}: {
  item: any;
  onClick?: () => void;
}) => (
  <div
    onClick={() => {
      onClick?.();
    }}
    className="flex items-center gap-4 bg-white border border-gray-100 p-3 rounded-2xl relative hover:border-gray-200 transition-colors"
  >
    <div className="absolute top-2 left-2 z-10 pointer-events-none">
      <span className="bg-black/80 backdrop-blur-md text-white text-[11px] font-black px-2 py-1 rounded-lg shadow-sm">
        x{item.quantity}
      </span>
    </div>
    <div className="w-20 h-20 rounded-xl bg-gray-50 p-2 shrink-0 flex items-center justify-center">
      <img
        src={item.productImagePath}
        alt={item.productName}
        className="w-full h-full object-contain mix-blend-multiply"
      />
    </div>
    <div className="flex flex-col flex-1 py-1 pr-2">
      <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-100 w-fit px-1.5 py-0.5 rounded mb-1">
        {item.productCode}
      </span>
      <h3 className="text-sm font-bold text-gray-800 leading-tight mb-auto line-clamp-2">
        {item.productName}
      </h3>

      {(!item.product || !item.product.id) && (
        <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded mt-1.5 w-fit">
          Недоступний (видалений) товар
        </span>
      )}

      <div className="mt-2 flex items-end justify-between">
        <span className="text-sm font-black text-gray-900">
          {Number(item.priceAtPurchase) * item.quantity}{" "}
          <span className="text-xs font-normal text-gray-400">₴</span>
        </span>
      </div>
    </div>
  </div>
);

const OrderScreen: React.FC = () => {
  const history = useHistory();
  const order = MOCK_ADMIN_ORDER;
  const [presentToast] = useIonToast();

  const [showUpdateAlert, setShowUpdateAlert] = useState(false);
  const [showCancelAlert, setShowCancelAlert] = useState(false);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const dateString = date.toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const timeString = date.toLocaleTimeString("uk-UA", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dateString}, ${timeString}`;
  };

  const getStatusColor = (currentStatus: string) => {
    switch (currentStatus.toUpperCase()) {
      case "COMPLETED":
      case "READY":
        return "text-green-600 bg-green-50 border-green-100";
      case "IN PROCESS":
        return "text-blue-600 bg-blue-50 border-blue-100";
      case "CANCELLED":
        return "text-red-600 bg-red-50 border-red-100";
      default:
        return "text-gray-600 bg-gray-50 border-gray-100";
    }
  };

  const translateStatus = (currentStatus: string) => {
    switch (currentStatus.toUpperCase()) {
      case "COMPLETED":
        return "Виконано";
      case "READY":
        return "Готово";
      case "IN PROCESS":
        return "В обробці";
      case "CANCELLED":
        return "Відмінено";
      default:
        return currentStatus;
    }
  };

  const getUpdateAlertMessage = () => {
    if (order.status === "IN PROCESS") {
      return "Переконайтеся, що створили заявку в системі обліку УкрСклад перед продовженням. Ви впевнені, що хочете оновити статус?";
    } else if (order.status === "READY") {
      return "Переконайтеся, що клієнт отримав замовлення перед продовженням. Ви впевнені, що хочете оновити статус?";
    }
    return "Ви впевнені, що хочете оновити статус цього замовлення?";
  };

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
              Замовлення #{order.orderNumber}
            </span>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="bg-gray-50 text-gray-900" fullscreen>
        <div className="container mx-auto px-4 md:px-8 py-6 md:py-12 max-w-3xl md:mt-8 pb-32 animate-fade-in">
          <div className="hidden md:flex items-center gap-4 mb-8">
            <button
              onClick={() => history.goBack()}
              className="text-gray-400 hover:text-black transition-colors"
            >
              <IonIcon icon={chevronBackOutline} className="text-3xl" />
            </button>
            <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
              Замовлення #{order.orderNumber}
            </h1>
          </div>

          <div className="flex flex-col gap-6">
            <div className="text-center w-full -mb-3 mt-2 md:mt-0">
              <div className="text-center w-full -mb-3 mt-0 md:-mt-4">
                <span className="text-[12px] text-gray-400 tracking-widest">
                  Останнє оновлення: {formatDate(order.updatedAt)}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex flex-col gap-2">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border w-fit leading-none ${getStatusColor(
                    order.status,
                  )}`}
                >
                  {translateStatus(order.status)}
                </span>
                <div className="flex flex-col mt-2">
                  <span className="text-sm font-bold text-gray-800">
                    {order.store?.address}
                  </span>
                  <span className="text-sm font-medium text-gray-500 mt-0.5">
                    Створено: {formatDate(order.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-start md:items-end w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Сума замовлення
                </span>
                <span className="text-3xl font-black text-gray-900 leading-none">
                  {Number(order.totalAmount)}{" "}
                  <span className="text-lg font-normal text-gray-400">₴</span>
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <IonIcon
                  icon={personOutline}
                  className="text-black text-3xl pr-3"
                />
                Дані клієнта
                {order.user?.id && (
                  <span className="text-sm font-mono font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md ml-auto">
                    ID: {order.user.id}
                  </span>
                )}
              </h2>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                  <span className="text-sm font-medium text-gray-500">
                    ПІБ Клієнта
                  </span>
                  <span className="text-sm font-bold text-gray-800 text-right">
                    {order.user?.firstName || order.user?.lastName
                      ? `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.trim()
                      : "Не вказано"}
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                  <span className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                    <IonIcon icon={callOutline} /> Телефон
                  </span>
                  <span className="text-sm font-bold text-gray-800 text-right">
                    {order.user?.phone || "Не вказано"}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                    <IonIcon icon={receiptOutline} /> ID Транзакції
                  </span>
                  <span className="text-xs font-mono font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                    {order.transactionId || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 pt-1 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4 pl-1">
                Товари у замовленні
              </h2>
              <div className="flex flex-col gap-3">
                {order.items.map((item) => (
                  <AdminOrderItemCard
                    key={item.id}
                    item={item}
                    onClick={() => {
                      if (item.product?.id) {
                        history.push(`/admin/product/${item.product.id}`);
                      }
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-5">
              <h2 className="text-lg font-bold text-gray-800 mb-1">
                Управління замовленням
              </h2>

              {order.status === "IN PROCESS" && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3 items-start">
                  <IonIcon
                    icon={alertCircleOutline}
                    className="text-red-500 text-xl shrink-0 mt-0.5"
                  />
                  <p className="text-sm font-medium text-red-800 leading-tight">
                    ВАЖЛИВО: Переконайтеся, що створили заявку в системі обліку
                    УкрСклад перед оновленням статусу. Недотримання інструкцій
                    може призвести до поломки додатку.
                  </p>
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-3 items-end">
                <div className="flex-1 w-full flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
                    Поточний статус
                  </span>
                  <div className="w-full flex items-center px-4 h-[52px] rounded-xl border border-gray-200 bg-gray-50">
                    <span className="text-sm font-bold text-gray-800 truncate">
                      {translateStatus(order.status)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowUpdateAlert(true)}
                  disabled={
                    order.status === "COMPLETED" || order.status === "CANCELLED"
                  }
                  className="bg-black text-white px-8 h-[52px] w-full md:w-auto rounded-xl font-bold text-[16px] hover:bg-gray-800 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md shadow-gray-200 disabled:opacity-50 disabled:active:scale-100"
                >
                  <IonIcon icon={checkmarkCircleOutline} className="text-lg" />
                  Оновити статус
                </button>
              </div>

              <div className="w-full h-px bg-gray-100 my-1"></div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setShowCancelAlert(true)}
                  disabled={
                    order.status === "COMPLETED" || order.status === "CANCELLED"
                  }
                  className="w-full h-[52px] rounded-xl border-2 border-red-100 text-red-500 font-bold text-sm hover:bg-red-50 hover:border-red-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100 disabled:hover:bg-transparent"
                >
                  <IonIcon icon={closeCircleOutline} className="text-lg" />
                  Скасувати замовлення
                </button>
                <p className="text-xs text-center text-gray-400 font-medium px-2">
                  * обов'язково зв'яжіться з клієнтом при скасуванні замовлення
                </p>
              </div>
            </div>
          </div>
        </div>
      </IonContent>

      <IonAlert
        isOpen={showUpdateAlert}
        onDidDismiss={() => setShowUpdateAlert(false)}
        header="Оновлення статусу"
        message={getUpdateAlertMessage()}
        buttons={[
          {
            text: "Скасувати",
            role: "cancel",
            handler: () => setShowUpdateAlert(false),
          },
          {
            text: "Так, оновити",
            role: "confirm",
            handler: () => {
              presentToast({
                message: "Статус успішно оновлено",
                duration: 2000,
                color: "success",
              });
            },
          },
        ]}
      />

      <IonAlert
        isOpen={showCancelAlert}
        onDidDismiss={() => setShowCancelAlert(false)}
        header="Скасування замовлення"
        message="Ви впевнені, що хочете скасувати це замовлення?"
        buttons={[
          {
            text: "Ні",
            role: "cancel",
            handler: () => setShowCancelAlert(false),
          },
          {
            text: "Так, скасувати",
            role: "confirm",
            handler: () => {
              presentToast({
                message: "Замовлення було скасовано",
                duration: 2000,
                color: "danger",
              });
            },
          },
        ]}
      />
    </IonPage>
  );
};

export default OrderScreen;
