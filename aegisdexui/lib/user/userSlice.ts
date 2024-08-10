import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { Address } from "wagmi";

interface Token {
    name: string;
    address: Address;
    symbol: string;
    decimals: number;
    chainId: number;
    icon: string;
  }
interface UserState {
  balances: Token[];
  status: 'idle' | 'loading' | 'failed';
}

const initialState: UserState = {
  balances: [],
  status: 'idle',
};

export const fetchUserBalances = createAsyncThunk(
  'user/fetchUserBalances',
  async (userAddress: string) => {
    const response = await axios.post('http://localhost:8080/user/balances', { userAddress });
    return response.data;
  }
);

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
        state.status = 'idle';
        state.balances = action.payload;
      })
      .addCase(fetchUserBalances.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export default userSlice.reducer;
