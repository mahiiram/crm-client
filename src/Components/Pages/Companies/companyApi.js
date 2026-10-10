import axios from "axios";

const endpoint = `${import.meta.env.VITE_API_URL}/api/companies`;
const config = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const listCompanies = async (token, { page = 1, limit = 25, query = "", orderBy = "createdAt", order = "desc" } = {}) => {
  const response = await axios.post(
    `${endpoint}/search`,
    {
      query,
      page,
      limit,
      sorts: [{ field: orderBy, direction: order }],
      filters: [],
    },
    config(token)
  );
  return response.data;
};

export const getCompanyById = (id, token) => axios.get(`${endpoint}/${id}`, config(token));
export const createCompany = (data, token) => axios.post(endpoint, data, config(token));
export const updateCompany = (id, data, token) => axios.put(`${endpoint}/${id}`, data, config(token));
export const deleteCompany = (id, token) => axios.delete(`${endpoint}/${id}`, config(token));

export const listUserOptions = async (token) => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, config(token));
  return response.data?.users || [];
};
