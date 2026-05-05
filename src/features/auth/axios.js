import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL_LOCAL, // your backend URL
  withCredentials: true, // ⭐ send cookies automatically
});

export default api;
