import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const explainImageBiasTypeAPI = `${API_URL}/image-review-explain-bias-type`;
const explainImageAnythingWrongAPI = `${API_URL}/image-review-explain-if-anything-wrong`;
const explainImagePromptHelpsAPI = `${API_URL}/image-review-how-prompt-helps-rephrase`;
const explainImageQuestionHelpsAPI = `${API_URL}/image-review-how-question-helps-detect`;

export const explainImageBiasType = async ({
  imageDescriptionParagraph,
  biasCategoryImage,
}) => {
  const response = await axios.post(
    explainImageBiasTypeAPI,
    { imageDescriptionParagraph, biasCategoryImage },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};

export const explainIfAnythingWrongImage = async ({
  imageDescriptionParagraph,
}) => {
  const response = await axios.post(
    explainImageAnythingWrongAPI,
    { imageDescriptionParagraph },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};

export const explainHowFollowUpQuestionHelpsDetectImage = async ({
  followUpQuestionImage,
}) => {
  const response = await axios.post(
    explainImageQuestionHelpsAPI,
    { followUpQuestionImage },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};

export const explainSuggestionsHelpsRephrasePromptImage = async ({
  rephrasedPromptImage,
}) => {
  const response = await axios.post(
    explainImagePromptHelpsAPI,
    { rephrasedPromptImage },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};
