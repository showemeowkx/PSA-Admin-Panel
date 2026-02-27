import React from "react";
import { IonPage, IonContent, IonHeader, IonToolbar } from "@ionic/react";
import OrderCard from "./components/OrderCard";

// MOCK DATA
const MOCK_ORDERS = [
  {
    id: 1,
    orderNumber: "20260228-1001",
    date: "Сьогодні, 14:30",
    amount: 1250.5,
    status: "COMPLETED",
  },
  {
    id: 2,
    orderNumber: "20260228-1002",
    date: "Сьогодні, 11:15",
    amount: 450.0,
    status: "READY",
  },
  {
    id: 3,
    orderNumber: "20260227-1003",
    date: "Вчора, 18:40",
    amount: 3200.0,
    status: "IN PROCESS",
  },
  {
    id: 4,
    orderNumber: "20260227-1004",
    date: "Вчора, 09:20",
    amount: 150.0,
    status: "CANCELLED",
  },
  {
    id: 5,
    orderNumber: "20260225-1005",
    date: "25.02.2026",
    amount: 890.0,
    status: "COMPLETED",
  },
  {
    id: 6,
    orderNumber: "20260220-1006",
    date: "20.02.2026",
    amount: 2400.0,
    status: "COMPLETED",
  },
  {
    id: 7,
    orderNumber: "20260215-1007",
    date: "15.02.2026",
    amount: 560.0,
    status: "CANCELLED",
  },
  {
    id: 8,
    orderNumber: "20260210-1008",
    date: "10.02.2026",
    amount: 1850.0,
    status: "COMPLETED",
  },
  {
    id: 9,
    orderNumber: "20260205-1009",
    date: "05.02.2026",
    amount: 340.0,
    status: "COMPLETED",
  },
  {
    id: 10,
    orderNumber: "20260128-1010",
    date: "28.01.2026",
    amount: 999.99,
    status: "COMPLETED",
  },
];

const PurchasesScreen: React.FC = () => {
  return (
    <IonPage>
      <IonHeader className="ion-no-border bg-white hidden md:block pt-safe">
        <IonToolbar style={{ "--background": "white" }}>
          <div className="flex items-center px-2 relative h-full">
            <span className="absolute left-0 right-0 text-center font-bold text-gray-800 text-lg pointer-events-none">
              Історія покупок
            </span>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="bg-gray-50 text-gray-900" fullscreen>
        <div className="container mx-auto px-4 md:px-8 py-6 md:py-12 max-w-3xl md:mt-8 pb-32 animate-fade-in">
          <div className="flex items-center gap-4 mb-6 md:hidden">
            <h1 className="text-3xl font-black text-gray-800 pl-1">
              Історія покупок
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-4 mb-8">
            <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
              Історія покупок
            </h1>
          </div>

          <div className="flex flex-col">
            {MOCK_ORDERS.map((order) => (
              <OrderCard
                key={order.id}
                status={order.status}
                orderNumber={order.orderNumber}
                date={order.date}
                amount={order.amount}
                onClick={() => {}} // PLACEHOLDER
              />
            ))}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PurchasesScreen;
