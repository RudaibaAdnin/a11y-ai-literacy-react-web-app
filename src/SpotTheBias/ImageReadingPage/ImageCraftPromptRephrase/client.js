import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const imagePromptSuggestionsAPI = `${API_URL}/rephrase-image-prompt-suggestions`;

export const getImageCraftPromptSuggestions = async ({
  originalPrompt,
  biasedOriginalParagraph,
  selectedImageBiasCategories,
}) => {
  const response = await axios.post(
    imagePromptSuggestionsAPI,
    {
      originalPrompt,
      biasedOriginalParagraph,
      selectedImageBiasCategories,
    },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};
