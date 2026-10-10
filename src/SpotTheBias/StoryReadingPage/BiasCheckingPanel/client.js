import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const biasCheckOptionsAPI = `${API_URL}/bias-check-options`;
const checkBiasAnswerAPI = `${API_URL}/check-bias-answer`;

export const getBiasCheckOptions = async ({ paragraph }) => {
  const response = await axios.post(
    biasCheckOptionsAPI,
    {
      paragraph,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
};

export const checkBiasAnswer = async ({
  paragraph,
  biasCategory,
  selectedCategories,
  selectedStatements,
  typedAnswer,
}) => {
  const response = await axios.post(
    checkBiasAnswerAPI,
    {
      paragraph,
      biasCategory,
      selectedCategories,
      selectedStatements,
      typedAnswer,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
};
