// actions.ts
export const SET_USER_BALANCES = 'SET_USER_BALANCES';

export interface Balance {
  symbol: string;
  name: string;
  icon: string;
  balance: string;
}

interface SetUserBalancesAction {
  type: typeof SET_USER_BALANCES;
  payload: Balance[];
}

export type UserActionTypes = SetUserBalancesAction;

export const setUserBalances = (balances: Balance[]): UserActionTypes => ({
  type: SET_USER_BALANCES,
  payload: balances,
});
