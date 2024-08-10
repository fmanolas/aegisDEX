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
interface NetworkState {
  coins: Token[]; 
  status: 'idle' | 'loading' | 'failed';
}

const initialState: NetworkState = {
  coins: [],
  status: 'idle',
};

export const fetchNetworkCoins = createAsyncThunk(
  'network/fetchNetworkCoins',
  async (network: string) => {
    const response = await axios.post('http://localhost:8080/network/coins', { network });
    return response.data;
  }
);

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNetworkCoins.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNetworkCoins.fulfilled, (state, action) => {
        state.status = 'idle';
        state.coins = action.payload;
      })
      .addCase(fetchNetworkCoins.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export default networkSlice.reducer;
