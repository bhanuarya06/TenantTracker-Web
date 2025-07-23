import { createSlice } from "@reduxjs/toolkit";

const MenuSlice = createSlice({
  name: "menu",
  initialState: {
    showMenu: false,
    loginUser: "owner",
    newUser: false
  },
  reducers: {
    toggleMenu: (state) => {
      state.showMenu = !state.showMenu;
    },
    whoIsUser: (state,action) => {
      state.loginUser = action.payload;
    },
    addUser:(state)=>{
      state.newUser = !state.newUser
    }
  },
});

export const { toggleMenu, whoIsUser, addUser } = MenuSlice.actions;
export default MenuSlice.reducer;
