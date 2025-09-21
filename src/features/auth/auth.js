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

export async function generateOTP(email) {
  try {
    const {
      data: { code },
    } = await axios.post(`${API_BASE_URL}/generateOTP`, { email });

    return code; // no need for Promise.resolve
  } catch (error) {
    throw error.response?.data?.error || error.response?.data?.message || error.message || "Failed to generate OTP";
  }
}

/** verify OTP */
export async function verifyOTP({ code }) {
  try {
    const { data, status } = await axios.get(`${API_BASE_URL}/verifyOTP`, {
      params: { code },
    });
    return { data, status };
  } catch (error) {
    throw error.response?.data?.error || error.response?.data?.message || error.message || "Failed to generate OTP";
  }
}
export const checkResetSessionApi = async () => {
  const res = await axios.get(`${API_BASE_URL}/createResetSession`, {
    withCredentials: true, // send cookies if backend uses sessions
  });
  return res.data; // returns { flag: true }
};
export async function resetPassword({ email, password }) {
  try {
    const { data, status } = await axios.put(`${API_BASE_URL}/resetPassword`, {
      email,
      password,
    });
    return { data, status };
  } catch (error) {
    throw error.response?.data?.error || error.response?.data?.message || error.message || "Failed to generate OTP";
  }
}
