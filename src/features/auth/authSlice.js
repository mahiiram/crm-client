// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { checkResetSessionApi, loginApi, registerApi } from "../auth/auth.js";

// Login Thunk
export const login = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const res = await loginApi(credentials);
    return res;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || e.message);
  }
});

// Register Thunk
export const register = createAsyncThunk("auth/register", async (credentials, { rejectWithValue }) => {
  try {
    console.log(credentials);
    const res = await registerApi(credentials);

    return res;
  } catch (e) {
    console.log(e);
    return rejectWithValue(e.response?.data?.message || e.response?.statusText || "Registration failed");
  }
});

// Logout Thunk
export const logout = createAsyncThunk("auth/logout", async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return true;
});
// Reset session Thunk

export const checkResetSession = createAsyncThunk("auth/checkResetSession", async (_, { rejectWithValue }) => {
  try {
    const data = await checkResetSessionApi();
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.message || "Session expired!");
  }
});

// Load state from session storage if exists
const savedAuth = JSON.parse(sessionStorage.getItem("authState")) || null;

const initialState = savedAuth || {
  user: null,
  portal: null,
  token: null,
  status: "idle",
  error: null,
  resetSession: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.portal = action.payload.portal;
        state.token = action.payload.token;
        sessionStorage.setItem(
          "authState",
          JSON.stringify({
            user: state.user,
            portal: state.portal,
            token: state.token,
            status: state.status,
          })
        );
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Register
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.portal = action.payload.portal;
        sessionStorage.setItem(
          "authState",
          JSON.stringify({
            user: state.user,
            portal: state.portal,
            token: state.token,
            status: state.status,
          })
        );
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        (state.portal = null), (state.token = null);
        state.status = "idle";
        state.error = null;
        sessionStorage.removeItem("authState");
      })
      // Reset Session
      .addCase(checkResetSession.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(checkResetSession.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.resetSession = action.payload.flag; // store backend flag
      })
      .addCase(checkResetSession.rejected, (state, action) => {
        state.status = "failed";
        state.resetSession = null;
        state.error = action.payload;
      });
  },
});

export default authSlice.reducer;
