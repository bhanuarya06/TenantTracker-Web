import { configureStore } from "@reduxjs/toolkit";
import MenuReducer from "../utils/Slices/MenuSlice";

export const store = configureStore({
  reducer: {
    menu: MenuReducer,
  },
});
