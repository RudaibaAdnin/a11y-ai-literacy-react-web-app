import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const imagePromptAPI = `${API_URL}/generate-image-prompt`;
const imageDescriptionAPI = `${API_URL}/generate-image-description`;

export const getImageGenerationPrompt = async (
  storyParagraphs,
  selectedImageBiasCategories,
) => {
  const response = await axios.post(
    imagePromptAPI,
    {
      storyParagraphs,
      selectedImageBiasCategories,
    },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};

export const getImageDescription = async (
  originalPrompt,
  selectedImageBiasCategories,
) => {
  const response = await axios.post(
    imageDescriptionAPI,
    {
      originalPrompt,
      selectedImageBiasCategories,
    },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};
