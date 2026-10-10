import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const imageBiasCheckOptionsAPI = `${API_URL}/image-bias-check-options`;

const checkImageBiasAnswerAPI = `${API_URL}/check-image-bias-answer`;

export const getImageBiasCheckOptions = async ({ paragraph }) => {
  const response = await axios.post(
    imageBiasCheckOptionsAPI,
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

export const checkImageBiasAnswer = async ({
  paragraph,
  biasCategory,
  selectedCategories,
  selectedStatements,
  typedAnswer,
}) => {
  const response = await axios.post(
    checkImageBiasAnswerAPI,
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
