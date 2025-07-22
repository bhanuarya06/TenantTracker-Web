import { configureStore } from "@reduxjs/toolkit";
import MenuReducer from "../utils/Slices/MenuSlice";
import UserReducer from "../utils/Slices/UserSlice";

export const store = configureStore({
  reducer: {
    menu: MenuReducer,
    user: UserReducer
  },
});
