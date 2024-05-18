import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
  BrowserRouter as Router,
} from "react-router-dom";
import { Provider } from "react-redux";
import {store, persistor} from "./Store";
import { PersistGate } from 'redux-persist/integration/react'
import ReactGA from 'react-ga';
import { RelayEnvironmentProvider } from 'react-relay/hooks';
import { environment } from './Store';
const { Suspense } = React;

ReactGA.initialize('UA-204475926-1', {
  debug: false
});

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <RelayEnvironmentProvider environment={environment}>
          <Suspense fallback={<div style={{display: 'flex', justifyContent: 'center', width: '100%'}}></div>}>
              <Router>
                <PersistGate loading={null} persistor={persistor}>
                  <App/>
                </PersistGate>
              </Router>
        </Suspense>
      </RelayEnvironmentProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
  
);

reportWebVitals();
