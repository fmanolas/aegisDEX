import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


// Define an async thunk to fetch coins based on the selected network
export const fetchCoins = createAsyncThunk(
  'network/fetchCoins',
  async (network: string) => {
    const response = await fetch("http://localhost:8080/network/coins", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ network }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch coins");
    }

    const data = await response.json();
    return data;
  }
);

const networkSlice = createSlice({
  name: 'network',
  initialState: {
    selectedNetwork: 'Ethereum',
    coins: [] as Balance[],
    status: 'idle',
    error: null as string | null,
  },
  reducers: {
    setSelectedNetwork: (state, action) => {
      state.selectedNetwork = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoins.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCoins.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.coins = action.payload;
      })
      .addCase(fetchCoins.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch coins';
      });
  },
});

export const { setSelectedNetwork } = networkSlice.actions;

export default networkSlice.reducer;
