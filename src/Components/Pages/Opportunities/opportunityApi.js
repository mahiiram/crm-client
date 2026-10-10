import axios from "axios";

const baseUrl = import.meta.env.VITE_API_URL;
const endpoint = `${baseUrl}/api/opportunities`;
const config = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const listOpportunities = async (token, { page = 1, limit = 25 } = {}) => {
  const response = await axios.get(endpoint, {
    ...config(token),
    params: { page, limit },
  });
  return response.data;
};

export const getOpportunityById = (id, token) => axios.get(`${endpoint}/${id}`, config(token));
export const createOpportunity = (data, token) => axios.post(endpoint, data, config(token));
export const updateOpportunity = (id, data, token) => axios.put(`${endpoint}/${id}`, data, config(token));
export const deleteOpportunity = (id, token) => axios.delete(`${endpoint}/${id}`, config(token));

export const listCompanyOptions = async (token) => {
  const response = await axios.get(`${baseUrl}/api/companies`, {
    ...config(token),
    params: { page: 1, limit: 200 },
  });
  return response.data?.companies || [];
};

export const listContactOptions = async (token) => {
  const response = await axios.get(`${baseUrl}/api/contacts`, {
    ...config(token),
    params: { page: 1, limit: 200 },
  });
  return response.data?.contacts || [];
};

export const listUserOptions = async (token) => {
  const response = await axios.get(`${baseUrl}/api/users`, config(token));
  return response.data?.users || [];
};
