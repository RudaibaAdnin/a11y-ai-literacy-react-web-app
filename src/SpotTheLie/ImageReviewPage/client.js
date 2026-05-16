import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const explainHallucinationTypeAPI = `${API_URL}/review-explain-hallucination-type`;
const whyQuestionHelpsAPI = `${API_URL}/review-why-question-helps`;
const improveFollowupQuestionAPI = `${API_URL}/review-improve-followup-question`;
const explainReplyTypeAPI = `${API_URL}/review-explain-reply-type`;

export const explainHallucinationType = async (
  hallucinationType,
  hallucinatedLine,
  accurateLine,
) => {
  const response = await axios.post(
    explainHallucinationTypeAPI,
    {
      hallucinationType,
      hallucinatedLine,
      accurateLine,
    },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};

export const whyQuestionHelps = async (
  followUpQuestionType,
  followUpQuestionCategory,
  followUpQuestion,
) => {
  const response = await axios.post(
    whyQuestionHelpsAPI,
    {
      followUpQuestionType,
      followUpQuestionCategory,
      followUpQuestion,
    },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};

export const improveFollowupQuestion = async (followUpQuestion) => {
  const response = await axios.post(
    improveFollowupQuestionAPI,
    { followUpQuestion },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};

export const explainReplyType = async (
  replyType,
  replyText,
  imageDescription,
) => {
  const response = await axios.post(
    explainReplyTypeAPI,
    {
      replyType,
      replyText,
      imageDescription,
    },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};
