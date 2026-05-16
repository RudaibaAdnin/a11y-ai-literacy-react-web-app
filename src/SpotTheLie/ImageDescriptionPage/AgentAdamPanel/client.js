import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const adamDescriptionAPI = `${API_URL}/adam-description`;
const adamSummaryDifferencesAPI = `${API_URL}/adam-summary-differences`;

export const generateAdamDescription = async (
  imageDescription,
  imageHallucination,
) => {
  const response = await axios.post(
    adamDescriptionAPI,
    { imageDescription, imageHallucination },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};

export const generateSummaryDifferences = async (saraText, adamText) => {
  const response = await axios.post(
    adamSummaryDifferencesAPI,
    { saraText, adamText },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};
