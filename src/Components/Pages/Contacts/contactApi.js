import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

// ⭐ Get single contact
export const getContactById = (id, token) => {
  return axios.get(`${BASE_URL}/api/contacts/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ⭐ Delete contact
export const deleteContact = (id, token) => {
  return axios.delete(`${BASE_URL}/api/contacts/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ⭐ Update contact
export const updateContact = (id, data, token) => {
  return axios.put(`${BASE_URL}/api/contacts/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
