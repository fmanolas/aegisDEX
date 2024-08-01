import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


interface UserState {
  balances: Balance[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Define an async thunk to fetch user balances
export const fetchUserBalances = createAsyncThunk(
  'user/fetchUserBalances',
  async (userAddress: string) => {
    const response = await fetch("http://localhost:8080/user/balances", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userAddress }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user balances");
    }

    const data = await response.json();
    return data;
  }
);

const initialState: UserState = {
  balances: [],
  status: 'idle',
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserBalances.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserBalances.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.balances = action.payload;
      })
      .addCase(fetchUserBalances.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch user balances';
      });
  },
});

export default userSlice.reducer;
