import { configureStore } from '@reduxjs/toolkit';
import userReducer from './user/userSlice';
import networkReducer from './network/networkSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    network: networkReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;