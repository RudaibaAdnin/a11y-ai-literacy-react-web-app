import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  storyTopic: "",
  storyTopicType: "",
  storyQuestionsAndAnswers: [],
  storyParagraphs: [],
  selectedBiasCategories: [],
  biasedParagraphPlan: [],
  biasedParagraphIndices: [],
  biasedParagraphCount: 0,
  biasCount: 0,
  selectedCheckingParagraph: { index: null, paragraph: "" },
  detectedStoryBias: { count: 0, storyBiasItems: [] },
  flaggedStoryParagraph: { count: 0, flaggedStoryParagraphItems: [] },
  followUpsHistoryAlice: [],
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
      state.biasedParagraphPlan = [];
      state.biasedParagraphIndices = [];
      state.biasedParagraphCount = 0;
      state.biasCount = 0;
      state.selectedCheckingParagraph = { index: null, paragraph: "" };
      state.detectedStoryBias = { count: 0, storyBiasItems: [] };
      state.flaggedStoryParagraph = {
        count: 0,
        flaggedStoryParagraphItems: [],
      };
      state.followUpsHistoryAlice = [];
      state.currentFocusedPanel = "";
    },

    setStoryQuestion: (state, action) => {
      state.storyQuestionsAndAnswers = action.payload;
    },

    setStoryReading: (state, action) => {
      const plan = action.payload.biasedParagraphPlan || [];

      state.storyParagraphs = action.payload.storyParagraphs || [];
      state.biasedParagraphPlan = plan;
      state.biasedParagraphIndices =
        action.payload.biasedParagraphIndices ||
        plan.map((item) => item.paragraphIndex);
      state.biasedParagraphCount =
        action.payload.biasedParagraphCount || plan.length;
      state.selectedBiasCategories =
        action.payload.selectedBiasCategories || [];
      state.biasCount = action.payload.biasCount || plan.length;
      state.selectedCheckingParagraph = { index: null, paragraph: "" };
      state.detectedStoryBias = { count: 0, storyBiasItems: [] };
      state.flaggedStoryParagraph = {
        count: 0,
        flaggedStoryParagraphItems: [],
      };
      state.followUpsHistoryAlice = [];
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

    addFollowUpsHistoryAlice: (state, action) => {
      if (state.followUpsHistoryAlice.length >= 3) return;

      state.followUpsHistoryAlice.push({
        followUpQuestion: action.payload.followUpQuestion,
        followUpQuestionCategory: action.payload.followUpQuestionCategory,
        followUpReply: action.payload.followUpReply,
      });
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
  addFollowUpsHistoryAlice,
} = SpotTheBiasSlice.actions;

export default SpotTheBiasSlice.reducer;
