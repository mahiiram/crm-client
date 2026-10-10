import axios from "axios";

const baseUrl = import.meta.env.VITE_API_URL;
const endpoint = `${baseUrl}/api/products`;
const config = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const listProducts = async (token, params = {}) => {
  const response = await axios.get(endpoint, { ...config(token), params });
  return response.data;
};
export const getProductById = (id, token) => axios.get(`${endpoint}/${id}`, config(token));
export const createProduct = (data, token) => axios.post(endpoint, data, config(token));
export const updateProduct = (id, data, token) => axios.put(`${endpoint}/${id}`, data, config(token));
export const deleteProduct = (id, token) => axios.delete(`${endpoint}/${id}`, config(token));

export const listUserOptions = async (token) => {
  const response = await axios.get(`${baseUrl}/api/users`, config(token));
  return response.data?.users || [];
};
export const listOpportunityOptions = async (token) => {
  const response = await axios.get(`${baseUrl}/api/opportunities`, { ...config(token), params: { page: 1, limit: 200 } });
  return response.data?.opportunities || [];
};
