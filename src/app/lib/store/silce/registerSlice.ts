// src/app/lib/store/silce/registerSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/app/lib/store/store';

export interface RegisterFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterState {
  formData: RegisterFormData;
  error: string | null;
  isLoading: boolean;
  userId?: string;
}

const initialState: RegisterState = {
  formData: {
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  },
  error: null,
  isLoading: false,
  userId: undefined,
};

// Thunk para registrar usuario (primer y único paso)
export const registerUser = createAsyncThunk<
  { userId: string },
  void,
  { state: RootState; rejectValue: string }
>('register/registerUser', async (_, { getState, rejectWithValue }) => {
  const state = getState().register;
  const { email, username, password } = state.formData;

  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return rejectWithValue(data?.error || 'No se pudo crear la cuenta.');
    }

    if (!data?.userId) {
      return rejectWithValue('Respuesta inválida del servidor: falta userId.');
    }

    return { userId: data.userId as string };
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Error de red durante el registro.');
  }
});

const registerSlice = createSlice({
  name: 'register',
  initialState,
  reducers: {
    setField(
      state,
      action: PayloadAction<{ name: keyof RegisterFormData; value: any }>
    ) {
      state.formData[action.payload.name] = action.payload.value as any;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    resetRegister() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userId = action.payload.userId;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) || 'Error durante el registro.';
      });
  },
});

export const { setField, setError, resetRegister } = registerSlice.actions;

export default registerSlice.reducer;

export const selectRegister = (state: RootState) => state.register;
export const selectRegisterFormData = (state: RootState) =>
  state.register.formData;
