import axios from "axios";

export const getDashboardMetrics = async (token) => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/metrics`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
