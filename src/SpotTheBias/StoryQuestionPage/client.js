import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const storyQuestionAPI = `${API_URL}/story-question`;

export const getStoryQuestions = async (storyTopic, storyTopicType) => {
  const response = await axios.post(
    storyQuestionAPI,
    {
      storyTopic,
      storyTopicType,
    },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};
