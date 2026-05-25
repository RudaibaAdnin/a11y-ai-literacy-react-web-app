import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const biasClueAPI = `${API_URL}/bias-clue`;
const biasFollowupQuestionsAPI = `${API_URL}/bias-followup-questions`;
const biasFollowupReplyAPI = `${API_URL}/bias-followup-reply`;

export const getBiasClue = async ({ paragraph, biasCategory }) => {
  const response = await axios.post(
    biasClueAPI,
    { paragraph, biasCategory },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};

export const getBiasFollowupQuestions = async ({
  paragraph,
  biasCategory,
  clue,
}) => {
  const response = await axios.post(
    biasFollowupQuestionsAPI,
    { paragraph, biasCategory, clue },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};

export const getBiasFollowupReply = async ({
  paragraph,
  biasCategory,
  clue,
  followUpQuestion,
}) => {
  const response = await axios.post(
    biasFollowupReplyAPI,
    { paragraph, biasCategory, clue, followUpQuestion },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};
