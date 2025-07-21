import { configureStore } from "@reduxjs/toolkit";
import MenuDropdownReducer from "../src/MenuDropdown";

export const store = configureStore({
  reducer: {
    menu: MenuDropdownReducer,
  },
});
