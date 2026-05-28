import { createSlice } from "@reduxjs/toolkit";

const emptySelectedParagraph = {
  index: null,
  originalStoryParagraph: "",
  rephrasedFlag: false,
  rephrasedStoryParagraph: "",
};

const makeStoryParagraphs = (paragraphs = []) =>
  paragraphs.map((paragraph, index) => ({
    index,
    originalStoryParagraph: paragraph,
    rephrasedFlag: false,
    rephrasedStoryParagraph: paragraph,
  }));

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
  selectedCheckingParagraph: emptySelectedParagraph,
  detectedStoryBias: { count: 0, storyBiasItems: [] },
  flaggedStoryParagraph: { count: 0, flaggedStoryParagraphItems: [] },
  followUpsHistoryAlice: [],
  rephrasedParagraphHistory: [],
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
      state.selectedCheckingParagraph = emptySelectedParagraph;
      state.detectedStoryBias = { count: 0, storyBiasItems: [] };
      state.flaggedStoryParagraph = {
        count: 0,
        flaggedStoryParagraphItems: [],
      };
      state.followUpsHistoryAlice = [];
      state.rephrasedParagraphHistory = [];
      state.currentFocusedPanel = "";
    },

    setStoryQuestion: (state, action) => {
      state.storyQuestionsAndAnswers = action.payload;
    },

    setStoryReading: (state, action) => {
      const plan = action.payload.biasedParagraphPlan || [];

      state.storyParagraphs = makeStoryParagraphs(
        action.payload.storyParagraphs || [],
      );
      state.biasedParagraphPlan = plan;
      state.biasedParagraphIndices =
        action.payload.biasedParagraphIndices ||
        plan.map((item) => item.paragraphIndex);
      state.biasedParagraphCount =
        action.payload.biasedParagraphCount || plan.length;
      state.selectedBiasCategories =
        action.payload.selectedBiasCategories || [];
      state.biasCount = action.payload.biasCount || plan.length;
      state.selectedCheckingParagraph = emptySelectedParagraph;
      state.detectedStoryBias = { count: 0, storyBiasItems: [] };
      state.flaggedStoryParagraph = {
        count: 0,
        flaggedStoryParagraphItems: [],
      };
      state.followUpsHistoryAlice = [];
      state.rephrasedParagraphHistory = [];
      state.currentFocusedPanel = "";
    },

    setSelectedCheckingParagraph: (state, action) => {
      state.selectedCheckingParagraph =
        action.payload || emptySelectedParagraph;
    },

    addRephrasedParagraph: (state, action) => {
      const { paragraphIndex, rephrasedStoryParagraph } = action.payload;
      const paragraph = state.storyParagraphs[paragraphIndex];

      if (!paragraph || !rephrasedStoryParagraph) return;

      paragraph.rephrasedFlag = true;
      paragraph.rephrasedStoryParagraph = rephrasedStoryParagraph;

      if (state.selectedCheckingParagraph.index === paragraphIndex) {
        state.selectedCheckingParagraph = paragraph;
      }
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
      if (state.followUpsHistoryAlice.length >= 2) return;

      state.followUpsHistoryAlice.push({
        followUpQuestion: action.payload.followUpQuestion,
        followUpQuestionCategory: action.payload.followUpQuestionCategory,
        followUpReply: action.payload.followUpReply,
      });
    },

    addRephrasedParagraphHistory: (state, action) => {
      if (state.rephrasedParagraphHistory.length >= 2) return;

      state.rephrasedParagraphHistory.push({
        promptUsedForRephrase: action.payload.promptUsedForRephrase,
        rephrasedParagraph: action.payload.rephrasedParagraph,
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
  addRephrasedParagraph,
  addDetectedStoryBias,
  addFlaggedStoryParagraph,
  addFollowUpsHistoryAlice,
  addRephrasedParagraphHistory,
} = SpotTheBiasSlice.actions;

export default SpotTheBiasSlice.reducer;
