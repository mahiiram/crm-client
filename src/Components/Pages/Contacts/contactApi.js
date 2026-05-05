import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL_PRODUCTION;
const COMPANY_ENDPOINTS = ["/api/companies", "/api/company"];
const OPPORTUNITY_ENDPOINTS = ["/api/opportunities", "/api/opportunity"];

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

const requestWithFallback = async (method, endpoints, token, config = {}) => {
  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const response = await axios({
        method,
        url: `${BASE_URL}${endpoint}`,
        headers: authHeaders(token),
        ...config,
      });
      return response;
    } catch (error) {
      const status = error?.response?.status;
      if (status === 404 || status === 405) {
        lastError = error;
        continue;
      }
      throw error;
    }
  }

  throw lastError || new Error("No matching endpoint available");
};

const extractList = (payload, keys) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key];
  }

  if (Array.isArray(payload.data)) return payload.data;
  return [];
};

const searchCompaniesApi = async (token, query = "", page = 1, limit = 10) => {
  const response = await axios.post(
    `${BASE_URL}/api/companies/search`,
    {
      query,
      page,
      limit,
      sorts: [{ field: "createdAt", direction: "desc" }],
      filters: [{ field: "status", operator: "eq", value: "Active" }],
    },
    {
      headers: authHeaders(token),
    }
  );

  return extractList(response.data, ["companies", "results", "items"]);
};

// ⭐ Get single contact
export const getContactById = (id, token) => {
  return axios.get(`${BASE_URL}/api/contacts/${id}`, {
    headers: authHeaders(token),
  });
};

// ⭐ Delete contact
export const deleteContact = (id, token) => {
  return axios.delete(`${BASE_URL}/api/contacts/${id}`, {
    headers: authHeaders(token),
  });
};

// ⭐ Update contact
export const updateContact = (id, data, token) => {
  return axios.put(`${BASE_URL}/api/contacts/${id}`, data, {
    headers: authHeaders(token),
  });
};

// ⭐ Fetch companies for dropdown
export const listCompanies = async (token, query = "") => {
  try {
    return await searchCompaniesApi(token, query, 1, 10);
  } catch (error) {
    const response = await requestWithFallback("get", COMPANY_ENDPOINTS, token, {
      params: query ? { search: query } : undefined,
    });
    return extractList(response.data, ["companies", "company", "results", "items"]);
  }
};

// ⭐ Create a company from typed label
export const createCompany = async (token, name) => {
  const response = await axios.post(
    `${BASE_URL}/api/companies/`,
    {
      name,
      industry: "",
      website: "",
      domain: "",
      phone: "",
      email: "",
      address: {
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "",
      },
      status: "Active",
    },
    {
      headers: authHeaders(token),
    }
  );
  return response.data?.company || response.data?.data || response.data;
};

// ⭐ Fetch opportunities for dropdown
export const listOpportunities = async (token, query = "") => {
  const response = await requestWithFallback("get", OPPORTUNITY_ENDPOINTS, token, {
    params: query ? { search: query } : undefined,
  });
  return extractList(response.data, ["opportunities", "opportunity", "results", "items"]);
};
