import { configureStore } from "@reduxjs/toolkit";
import SpotTheLieReducer from "./SpotTheLie/SpotTheLieReducer";
import SpotTheBiasReducer from "./SpotTheBias/SpotTheBiasReducer";

const store = configureStore({
  reducer: {
    SpotTheLieReducer,
    SpotTheBiasReducer,
  },
});

export default store;
