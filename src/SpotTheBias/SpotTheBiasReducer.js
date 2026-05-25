import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  storyTopic: "",
  storyTopicType: "",
  storyQuestionsAndAnswers: [],
  storyParagraphs: [],
  selectedBiasCategories: [],
  biasedParagraphIndices: [],
  biasedParagraphCount: 0,
  biasCount: 0,
  selectedCheckingParagraph: { index: null, paragraph: "" },
  detectedStoryBias: { count: 0, storyBiasItems: [] },
  flaggedStoryParagraph: { count: 0, flaggedStoryParagraphItems: [] },
  currentFocusedPanel: "",
};

const SpotTheBiasSlice = createSlice({
  name: "spotTheBias",
  initialState,
  reducers: {
    setCurrentFocusedPanel: (state, action) => {
      state.currentFocusedPanel = action.payload;
    },

    setStoryTopic: (state, action) => {
      state.storyTopic = action.payload.storyTopic;
      state.storyTopicType = action.payload.storyTopicType;

      state.storyParagraphs = [];
      state.selectedBiasCategories = [];
      state.biasedParagraphIndices = [];
      state.biasedParagraphPlan = [];
      state.biasedParagraphCount = 0;
      state.biasCount = 0;

      state.selectedCheckingParagraph = { index: null, paragraph: "" };
      state.detectedStoryBias = { count: 0, storyBiasItems: [] };
      state.flaggedStoryParagraph = {
        count: 0,
        flaggedStoryParagraphItems: [],
      };
      state.currentFocusedPanel = "";
    },
    setStoryQuestion: (state, action) => {
      state.storyQuestionsAndAnswers = action.payload;
    },

    setStoryReading: (state, action) => {
      state.storyParagraphs = action.payload.storyParagraphs;
      state.biasedParagraphIndices = action.payload.biasedParagraphIndices;
      state.biasedParagraphCount = action.payload.biasedParagraphCount;
      state.selectedBiasCategories = action.payload.selectedBiasCategories;
      state.biasCount = action.payload.biasCount;
      state.selectedCheckingParagraph = { index: null, paragraph: "" };
      state.detectedStoryBias = { count: 0, storyBiasItems: [] };
      state.flaggedStoryParagraph = {
        count: 0,
        flaggedStoryParagraphItems: [],
      };
      state.currentFocusedPanel = "";
    },

    setSelectedCheckingParagraph: (state, action) => {
      state.selectedCheckingParagraph = action.payload;
    },

    addDetectedStoryBias: (state, action) => {
      state.detectedStoryBias.storyBiasItems.push(action.payload);
      state.detectedStoryBias.count += 1;
    },

    addFlaggedStoryParagraph: (state, action) => {
      state.flaggedStoryParagraph.flaggedStoryParagraphItems.push(
        action.payload,
      );
      state.flaggedStoryParagraph.count += 1;
    },
  },
});

export const {
  setStoryTopic,
  setStoryQuestion,
  setStoryReading,
  setCurrentFocusedPanel,
  setSelectedCheckingParagraph,
  addDetectedStoryBias,
  addFlaggedStoryParagraph,
} = SpotTheBiasSlice.actions;

export default SpotTheBiasSlice.reducer;
