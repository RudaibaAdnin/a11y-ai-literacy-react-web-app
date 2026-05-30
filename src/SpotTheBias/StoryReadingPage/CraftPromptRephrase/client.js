import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const craftPromptSuggestionsAPI = `${API_URL}/craft-prompt-suggestions`;
const rephraseParagraphAPI = `${API_URL}/rephrase-paragraph`;

export const getCraftPromptSuggestions = async ({ paragraph }) => {
  const response = await axios.post(
    craftPromptSuggestionsAPI,
    { paragraph },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};

export const getRephrasedParagraph = async ({
  paragraph,
  prompt,
  category,
}) => {
  const response = await axios.post(
    rephraseParagraphAPI,
    { paragraph, prompt, category },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};
