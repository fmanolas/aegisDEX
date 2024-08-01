import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WalletState {
  address: string | null;
}

const initialState: WalletState = {
  address: null, // Initial state can be null
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setAddress: (state, action: PayloadAction<string | null>) => {
      state.address = action.payload;
    },
  },
});

export const { setAddress } = walletSlice.actions;
export default walletSlice.reducer;
