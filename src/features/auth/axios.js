import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // your backend URL
  withCredentials: true, // ⭐ send cookies automatically
});

export default api;
