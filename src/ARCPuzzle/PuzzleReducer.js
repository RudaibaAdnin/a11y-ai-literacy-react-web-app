import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentPuzzleKey: "",
  currentPuzzle: null,
  yourTurnGrid: [],
  aliceHistory: [],
  currentFocusedPanel: "puzzleGuideSection",
};

const PuzzleSlice = createSlice({
  name: "puzzle",
  initialState,

  reducers: {
    setCurrentPuzzle: (state, action) => {
      const { puzzleKey, puzzle } = action.payload;

      state.currentPuzzleKey = puzzleKey;
      state.currentPuzzle = puzzle;
      state.yourTurnGrid = puzzle.test.before.map((row) => row.map(() => 0));
      state.aliceHistory = [];
      state.currentFocusedPanel = "puzzleGuideSection";
    },

    setCurrentFocusedPanel: (state, action) => {
      state.currentFocusedPanel = action.payload;
    },

    updateYourTurnCell: (state, action) => {
      const { row, column, value } = action.payload;
      state.yourTurnGrid[row][column] = value;
    },

    copyBeforeGrid: (state) => {
      state.yourTurnGrid = state.currentPuzzle.test.before.map((row) => [
        ...row,
      ]);
    },

    clearYourTurnGrid: (state) => {
      state.yourTurnGrid = state.currentPuzzle.test.before.map((row) =>
        row.map(() => 0),
      );
    },

    addAliceMessage: (state, action) => {
      state.aliceHistory.push(action.payload);
    },

    clearAliceHistory: (state) => {
      state.aliceHistory = [];
    },
  },
});

export const {
  setCurrentPuzzle,
  setCurrentFocusedPanel,
  updateYourTurnCell,
  copyBeforeGrid,
  clearYourTurnGrid,
  addAliceMessage,
  clearAliceHistory,
} = PuzzleSlice.actions;

export default PuzzleSlice.reducer;
