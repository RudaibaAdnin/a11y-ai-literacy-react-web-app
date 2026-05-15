import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const currentLineFollowupQuestionsAPI = `${API_URL}/sara-followup-current-line`;
const entireDescriptionFollowupQuestionsAPI = `${API_URL}/sara-followup-entire-description`;
const followupReplyAPI = `${API_URL}/sara-followup-reply`;
const clueFollowupQuestionsAPI = `${API_URL}/sara-followup-clue`;
const clueAPI = `${API_URL}/sara-clue`;

export const getFollowupQuestionsForCurrentLine = async (
  currentImageDescriptionLine,
  imageDescription,
) => {
  const response = await axios.post(
    currentLineFollowupQuestionsAPI,
    { currentImageDescriptionLine, imageDescription },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};

export const getFollowupQuestionsForEntireDescription = async (
  imageDescription,
) => {
  const response = await axios.post(
    entireDescriptionFollowupQuestionsAPI,
    { imageDescription },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};

export const getFollowUpReply = async (imageDescription, followUpQuestion) => {
  const response = await axios.post(
    followupReplyAPI,
    {
      imageDescription,
      followUpQuestion,
    },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};

export const getFollowupQuestionsForClue = async (
  imageDescription,
  imageHallucinationLine,
  clue = "",
) => {
  const response = await axios.post(
    clueFollowupQuestionsAPI,
    {
      imageDescription,
      imageHallucinationLine,
      clue,
    },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};

export const getClue = async (imageDescription, imageHallucinationLine) => {
  const response = await axios.post(
    clueAPI,
    {
      imageDescription,
      imageHallucinationLine,
    },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};
