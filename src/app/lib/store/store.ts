// src/lib/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import registerReducer from '@/app/lib/store/silce/registerSlice';

export const store = configureStore({
  reducer: {
    register: registerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
