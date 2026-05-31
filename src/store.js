import { configureStore } from "@reduxjs/toolkit";
import SpotTheLieReducer from "./SpotTheLie/SpotTheLieReducer";
import SpotTheBiasReducer from "./SpotTheBias/SpotTheBiasReducer";
import ImageBiasReducer from "./SpotTheBias/ImageBiasReducer";

const store = configureStore({
  reducer: {
    SpotTheLieReducer,
    SpotTheBiasReducer,
    ImageBiasReducer,
  },
});

export default store;
