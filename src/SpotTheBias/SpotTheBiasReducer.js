import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  storyTopic: "",
  storyTopicType: "",
};

const SpotTheBiasSlice = createSlice({
  name: "spotTheBias",
  initialState,
  reducers: {
    setStoryTopic: (state, action) => {
      state.storyTopic = action.payload.storyTopic;
      state.storyTopicType = action.payload.storyTopicType;
    },
  },
});

export const { setStoryTopic } = SpotTheBiasSlice.actions;
export default SpotTheBiasSlice.reducer;
