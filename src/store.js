import { configureStore } from "@reduxjs/toolkit";
import SpotTheLieReducer from "./SpotTheLie/SpotTheLieReducer";

const store = configureStore({
  reducer: {
    SpotTheLieReducer,
  },
});

export default store;
