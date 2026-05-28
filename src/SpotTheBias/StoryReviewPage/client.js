import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const explainBiasTypeAPI = `${API_URL}/story-review-explain-bias-type`;
const explainAnythingWrongAPI = `${API_URL}/story-review-explain-if-anything-wrong`;
const explainPromptHelpsAPI = `${API_URL}/story-review-how-prompt-helps-rephrase`;
const explainQuestionHelpsAPI = `${API_URL}/story-review-how-question-helps-detect`;

export const explainBiasType = async ({ paragraph, biasCategory }) => {
  const response = await axios.post(
    explainBiasTypeAPI,
    { paragraph, biasCategory },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};

export const explainIfAnythingWrong = async ({ paragraph }) => {
  const response = await axios.post(
    explainAnythingWrongAPI,
    { paragraph },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};

export const explainHowFillowUpQuestionHelpsDetect = async ({
  followUpQuestion,
}) => {
  const response = await axios.post(
    explainQuestionHelpsAPI,
    { followUpQuestion },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};

export const explainPromptHelpsRephrase = async ({ rephrasePrompt }) => {
  const response = await axios.post(
    explainPromptHelpsAPI,
    { rephrasePrompt },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};
