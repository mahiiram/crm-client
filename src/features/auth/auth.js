// src/api/auth.js
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/users`;

/** Register user */
export async function registerApi(credentials) {
  const { data } = await axios.post(`${API_BASE_URL}/signup`, {
    firstname: credentials.firstname,
    lastname: credentials.lastname,
    countryCode: credentials.countryCode,
    phone: credentials.phone,
    email: credentials.email,
    password: credentials.password,
  });
  return {
    user: data.user,
    token: data.token,
    portal: data.portal,
  };
}

/** Login user */
export async function loginApi(credentials) {
  console.log("credentials", credentials);
  const { data } = await axios.post(`${API_BASE_URL}/login`, {
    email: credentials.email,
    password: credentials.password,
  });
  //console.log(data);
  return {
    user: data.user,
    token: data.token,
    portal: data.portal,
  };
}
