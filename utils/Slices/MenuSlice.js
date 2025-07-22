import { createSlice } from "@reduxjs/toolkit";

const MenuSlice = createSlice({
  name: "menu",
  initialState: {
    showMenu: false,
    loginUser: "owner",
  },
  reducers: {
    toggleMenu: (state) => {
      state.showMenu = !state.showMenu;
    },
    whoIsUser: (state,action) => {
      state.loginUser = action.payload;
    },
  },
});

export const { toggleMenu, whoIsUser } = MenuSlice.actions;
export default MenuSlice.reducer;
