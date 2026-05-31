import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const imageBiasClueAPI = `${API_URL}/image-bias-clue`;
const imageBiasFollowupQuestionsAPI = `${API_URL}/image-bias-followup-questions`;
const imageBiasFollowupReplyAPI = `${API_URL}/image-bias-followup-reply`;

export const getImageBiasClue = async ({
  imageDescriptionParagraph,
  biasCategoryImage,
}) => {
  const response = await axios.post(
    imageBiasClueAPI,
    {
      imageDescriptionParagraph,
      biasCategoryImage,
    },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};

export const getImageBiasFollowupQuestions = async ({
  imageDescriptionParagraph,
  biasCategoryImage,
  clueImage,
}) => {
  const response = await axios.post(
    imageBiasFollowupQuestionsAPI,
    {
      imageDescriptionParagraph,
      biasCategoryImage,
      clueImage,
    },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};

export const getImageBiasFollowupReply = async ({
  imageDescriptionParagraph,
  biasCategoryImage,
  clueImage,
  followUpQuestionImage,
}) => {
  const response = await axios.post(
    imageBiasFollowupReplyAPI,
    {
      imageDescriptionParagraph,
      biasCategoryImage,
      clueImage,
      followUpQuestionImage,
    },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};
