import { createSlice } from "@reduxjs/toolkit";

const emptySelectedImageDescriptionParagraph = {
  index: null,
  originalImageDescriptionParagraph: "",
  newFlag: false,
  newImageDescriptionParagraph: "",
};

const makeImageDescriptionParagraphs = (paragraphs = []) =>
  paragraphs.map((paragraph, index) => ({
    index,
    originalImageDescriptionParagraph: paragraph,
    newFlag: false,
    newImageDescriptionParagraph: paragraph,
  }));

const initialState = {
  imageUrl: "",
  imageQuestionsAndAnswers: [],
  imageDescriptionParagraphs: [],
  selectedImageBiasCategories: [],
  biasedImageDescriptionParagraphPlan: [],
  biasedImageDescriptionParagraphIndices: [],
  biasedImageDescriptionParagraphCount: 0,
  biasImageDescriptionCount: 0,
  selectedCheckingImageDescriptionParagraph:
    emptySelectedImageDescriptionParagraph,
  detectedImageDescriptionBiasParagraph: {
    count: 0,
    imageDescriptionBiasItems: [],
  },
  flaggedImageDescriptionParagraph: {
    count: 0,
    flaggedImageDescriptionParagraphItems: [],
  },
  currentFocusedImagePanel: "",
};

const ImageBiasSlice = createSlice({
  name: "imageBias",
  initialState,
  reducers: {
    setCurrentFocusedImagePanel: (state, action) => {
      state.currentFocusedImagePanel = action.payload;
    },

    setImageDescriptionReading: (state, action) => {
      state.imageUrl = action.payload.imageUrl || "";
      const plan = action.payload.biasedImageDescriptionParagraphPlan || [];

      state.imageQuestionsAndAnswers =
        action.payload.imageQuestionsAndAnswers || [];

      state.imageDescriptionParagraphs = makeImageDescriptionParagraphs(
        action.payload.imageDescriptionParagraphs || [],
      );

      state.biasedImageDescriptionParagraphPlan = plan;

      state.biasedImageDescriptionParagraphIndices =
        action.payload.biasedImageDescriptionParagraphIndices ||
        plan.map((item) => item.imageDescriptionParagraphIndex);

      state.biasedImageDescriptionParagraphCount =
        action.payload.biasedImageDescriptionParagraphCount || plan.length;

      state.selectedImageBiasCategories =
        action.payload.selectedImageBiasCategories || [];

      state.biasImageDescriptionCount =
        action.payload.biasImageDescriptionCount || plan.length;

      state.selectedCheckingImageDescriptionParagraph =
        emptySelectedImageDescriptionParagraph;

      state.detectedImageDescriptionBiasParagraph = {
        count: 0,
        imageDescriptionBiasItems: [],
      };
      state.flaggedImageDescriptionParagraph = {
        count: 0,
        flaggedImageDescriptionParagraphItems: [],
      };
      state.currentFocusedImagePanel = "";
    },

    setSelectedCheckingImageDescriptionParagraph: (state, action) => {
      state.selectedCheckingImageDescriptionParagraph =
        action.payload || emptySelectedImageDescriptionParagraph;
    },

    addDetectedImageDescriptionBiasParagraph: (state, action) => {
      state.detectedImageDescriptionBiasParagraph.imageDescriptionBiasItems.push(
        action.payload,
      );
      state.detectedImageDescriptionBiasParagraph.count += 1;
    },

    addFlaggedImageDescriptionParagraph: (state, action) => {
      state.flaggedImageDescriptionParagraph.flaggedImageDescriptionParagraphItems.push(
        action.payload,
      );
      state.flaggedImageDescriptionParagraph.count += 1;
    },

    updateNewImageDescriptionParagraph: (state, action) => {
      const paragraph = state.imageDescriptionParagraphs.find(
        (item) => item.index === action.payload.index,
      );

      if (paragraph) {
        paragraph.newFlag = true;
        paragraph.newImageDescriptionParagraph =
          action.payload.newImageDescriptionParagraph;
      }
    },
  },
});

export const {
  setCurrentFocusedImagePanel,
  setImageDescriptionReading,
  setSelectedCheckingImageDescriptionParagraph,
  addDetectedImageDescriptionBiasParagraph,
  addFlaggedImageDescriptionParagraph,
  updateNewImageDescriptionParagraph,
} = ImageBiasSlice.actions;

export default ImageBiasSlice.reducer;
