import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const storyReadingAPI = `${API_URL}/story-reading`;

export const getStoryReading = async (
  storyTopic,
  storyTopicType,
  storyQuestionsAndAnswers,
  biasCategories,
) => {
  const response = await axios.post(
    storyReadingAPI,
    {
      storyTopic,
      storyTopicType,
      storyQuestionsAndAnswers,
      biasCategories,
    },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};
