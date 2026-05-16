import { createSlice } from "@reduxjs/toolkit";

//const saradescriptionpanelname = "saraImageDescriptionPanel";
const pageInstructionsSectionName = "pageInstructionsSection";

const initialState = {
  selectedImageName: "",
  selectedImageDescription: [],
  selectedImageHallucinations: [],
  selectedCheckingLine: "",
  currentImageDescriptionLineIndex: 0,
  currentImageDescriptionLine: "",

  currentFocusedPanel: pageInstructionsSectionName,

  detectedImageHallucination: {
    count: 0,
    imageHallucinationItems: [],
  },

  followUpsHistorySara: [],
};

const SpotTheLieSlice = createSlice({
  name: "spotTheLie",
  initialState,
  reducers: {
    //need to save current focused panel
    //need variables that will save current focus panel, currentselectedCheckingLine (so that focus can get back to that exact line)
    //currentFocusPanel=imagedescriptionpanel, LeaderBoardPanel, SaraPanel, AdamPanel
    //currentselectedCheckingLine
    setSelectedImage: (state, action) => {
      state.selectedImageName = action.payload.imageName;
      state.selectedImageDescription = action.payload.imageDescription;
      state.selectedImageHallucinations = action.payload.imageHallucinations;
      state.selectedCheckingLine = "";

      state.currentFocusedPanel = pageInstructionsSectionName;
      state.currentImageDescriptionLineIndex = 0;
      state.currentImageDescriptionLine =
        action.payload.imageDescription?.[0] || "";
      state.detectedImageHallucination = {
        count: 0,
        imageHallucinationItems: [],
      };

      state.followUpsHistorySara = [];
    },

    setCurrentFocusedPanel: (state, action) => {
      state.currentFocusedPanel = action.payload;
    },

    setCurrentImageDescriptionLine: (state, action) => {
      state.currentFocusedPanel = pageInstructionsSectionName;
      state.currentImageDescriptionLineIndex = action.payload.index;
      state.currentImageDescriptionLine = action.payload.line;
    },

    setSelectedCheckingLine: (state, action) => {
      state.selectedCheckingLine = action.payload;
      state.currentFocusedPanel = action.payload
        ? "hallucinationCheckingPanel"
        : pageInstructionsSectionName;
    },

    addDetectedImageHallucination: (state, action) => {
      const alreadyDetected =
        state.detectedImageHallucination.imageHallucinationItems.some(
          (item) => item.hallucinatedLine === action.payload.hallucinatedLine,
        );

      if (!alreadyDetected) {
        state.detectedImageHallucination.imageHallucinationItems.push(
          action.payload,
        );

        state.detectedImageHallucination.count =
          state.detectedImageHallucination.imageHallucinationItems.length;
      }
    },
    addFollowUpsHistorySara: (state, action) => {
      if (state.followUpsHistorySara.length >= 3) {
        return;
      }

      //this saves most recent 5 questions and replies
      // if (state.followUpsHistorySara.length >= 5) {
      //   state.followUpsHistorySara.shift();
      // }
      state.followUpsHistorySara.push({
        followUpQuestion: action.payload.followUpQuestion,
        followUpQuestionType: action.payload.followUpQuestionType,
        followUpQuestionCategory: action.payload.followUpQuestionCategory,
        followUpReply: action.payload.followUpReply,
        followUpReplyType: action.payload.followUpReplyType,
      });
    },
  },
});

export const {
  setSelectedImage,
  setSelectedCheckingLine,
  setCurrentFocusedPanel,
  setCurrentImageDescriptionLine,
  addDetectedImageHallucination,
  addFollowUpsHistorySara,
} = SpotTheLieSlice.actions;
export default SpotTheLieSlice.reducer;
