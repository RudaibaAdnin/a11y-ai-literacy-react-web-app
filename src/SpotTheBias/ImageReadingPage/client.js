import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;
const imageReadingAPI = `${API_URL}/image-reading`;

export const getImageReading = async ({
  storyParagraphs,
  selectedImageBiasCategory,
}) => {
  const response = await axios.post(
    imageReadingAPI,
    { storyParagraphs, selectedImageBiasCategory },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};
