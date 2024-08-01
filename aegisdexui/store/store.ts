"use client"
import { configureStore } from '@reduxjs/toolkit';
import networkReducer from './network/slice';
import walletReducer from './wallet/slice';
import userReducer from './user/reducer';

const store = configureStore({
  reducer: {
    network: networkReducer,
    wallet: walletReducer,
    userReducer:userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;