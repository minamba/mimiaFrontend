import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './lib/stores/store';
import App from './App';
import { installerVerrouDefilement } from './lib/storage/verrouDefilement';
import './index.css';

// Une seule fois pour tout le site : la page se fige derrière n'importe quelle
// fenêtre ouverte (voir verrouDefilement.js).
installerVerrouDefilement();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
