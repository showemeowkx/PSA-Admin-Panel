import React from "react";
import { Redirect, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";

import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

import "./index.css";

import { useAuthStore } from "./features/auth/auth.store";
import LoginScreen from "./features/auth/LoginScreen";

const AdminLayout: React.FC = () => (
  <div className="p-10">
    <h1>Admin Panel</h1>
  </div>
);
const MobileLayout: React.FC = () => (
  <div className="p-10">
    <h1>Client App</h1>
  </div>
);

setupIonicReact();

const App: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/login">
            {isAuthenticated ? <Redirect to="/" /> : <LoginScreen />}
          </Route>

          <Route path="/admin">
            {isAuthenticated && user?.isAdmin ? (
              <AdminLayout />
            ) : (
              <Redirect to="/login" />
            )}
          </Route>

          <Route path="/app">
            {isAuthenticated ? (
              user?.isAdmin ? (
                <Redirect to="/admin" />
              ) : (
                <MobileLayout />
              )
            ) : (
              <Redirect to="/login" />
            )}
          </Route>

          <Route exact path="/">
            {isAuthenticated ? (
              user?.isAdmin ? (
                <Redirect to="/admin" />
              ) : (
                <Redirect to="/app" />
              )
            ) : (
              <Redirect to="/login" />
            )}
          </Route>

          <Route render={() => <Redirect to="/" />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
