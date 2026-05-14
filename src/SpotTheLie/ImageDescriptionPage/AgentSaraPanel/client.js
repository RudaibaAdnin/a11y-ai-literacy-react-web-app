import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const currentLineFollowupQuestionsAPI = `${API_URL}/sara-followup-current-line`;
const entireDescriptionFollowupQuestionsAPI = `${API_URL}/sara-followup-entire-description`;
const followupReplyAPI = `${API_URL}/sara-followup-reply`;

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
