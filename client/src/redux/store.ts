import { configureStore, combineReducers } from "@reduxjs/toolkit";
import cartReducer from "./cartRedux";
import userReducer from "./userRedux"; // Asegúrate de importar desde la ruta correcta
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  PersistConfig,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

// Configuración del almacenamiento persistente
const persistConfig: PersistConfig<ReturnType<typeof rootReducer>> = {
  key: "root",
  version: 1,
  storage,
};

const rootReducer = combineReducers({
  user: userReducer,
  cart: cartReducer,
});

// Define RootState para incluir manualmente la propiedad _persist
export type RootState = ReturnType<typeof rootReducer> & {
  _persist: {
    version: number;
    rehydrated: boolean;
  };
};

const persistedReducer = persistReducer<ReturnType<typeof rootReducer>>(
  persistConfig,
  rootReducer
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Tipos para el dispatch
export type AppDispatch = typeof store.dispatch;

export let persistor = persistStore(store);
