import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/user.slice.js";
import adminReducer from "../features/admin.slice.js";
import vendorReducer from "../features/vendorSlice.js";

import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import { combineReducers } from "redux";

const rootReducer = combineReducers({
  user: userReducer,
  admin: adminReducer,
  vendor: vendorReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user", "admin", "vendor"], 
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);