import { configureStore } from "@reduxjs/toolkit";
import SpotTheLieReducer from "./SpotTheLie/SpotTheLieReducer";
import SpotTheBiasReducer from "./SpotTheBias/SpotTheBiasReducer";
import ImageBiasReducer from "./SpotTheBias/ImageBiasReducer";
import PuzzleReducer from "./ARCPuzzle/PuzzleReducer";

const store = configureStore({
  reducer: {
    SpotTheLieReducer,
    SpotTheBiasReducer,
    ImageBiasReducer,
    PuzzleReducer,
  },
});

export default store;
