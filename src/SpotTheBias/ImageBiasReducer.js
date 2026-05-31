import { createSlice } from "@reduxjs/toolkit";

const emptyImagePrompt = {
  displayedPrompt: "",
  originalPrompt: "",
  rephrasedPrompt: "",
  isRephrased: false,
};

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
  imagePrompt: emptyImagePrompt,
  imageQuestionsAndAnswers: [],
  imageDescriptionParagraphs: [],
  selectedImageBiasCategories: [],
  biasedImageDescriptionParagraphPlan: [],
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
      const plan = action.payload?.biasedImageDescriptionParagraphPlan || [];

      state.imageUrl = action.payload?.imageUrl || "";
      state.imagePrompt = action.payload?.imagePrompt || emptyImagePrompt;
      state.imageQuestionsAndAnswers =
        action.payload?.imageQuestionsAndAnswers || [];
      state.imageDescriptionParagraphs = makeImageDescriptionParagraphs(
        action.payload?.imageDescriptionParagraphs || [],
      );
      state.selectedImageBiasCategories =
        action.payload?.selectedImageBiasCategories || [];
      state.biasedImageDescriptionParagraphPlan = plan;
      state.biasImageDescriptionCount =
        action.payload?.biasImageDescriptionCount || plan.length;
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

      if (!paragraph) return;

      paragraph.newFlag = true;
      paragraph.newImageDescriptionParagraph =
        action.payload.newImageDescriptionParagraph;

      if (
        state.selectedCheckingImageDescriptionParagraph.index ===
        action.payload.index
      ) {
        state.selectedCheckingImageDescriptionParagraph = paragraph;
      }
    },

    updateImagePrompt: (state, action) => {
      state.imagePrompt = {
        ...state.imagePrompt,
        ...action.payload,
      };
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
  updateImagePrompt,
} = ImageBiasSlice.actions;

export default ImageBiasSlice.reducer;
