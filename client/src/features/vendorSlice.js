import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import *as vendorAPI from "../services/vendor.api.js"
import { data } from "react-router-dom"


export const vendorApplicationThunk = createAsyncThunk(
  "vendor/application",
  async (data, thunkAPI) => {
    try {
      const response = await vendorAPI.vendorApplication(data)
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to submit vendor application";

      return thunkAPI.rejectWithValue(typeof errorMessage === 'string' ? errorMessage : "Failed to submit vendor application");
    }
  }
)


export const vendorLoginThunk = createAsyncThunk(
  "vendor/login",
  async (data, thunkAPI) => {
    try {
      const response = await vendorAPI.vendorLogin(data)
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed To Login";
      return thunkAPI.rejectWithValue(typeof errorMessage === 'string' ? errorMessage : "Failed To Login");
    }
  }
)

export const vendorLogoutThunk = createAsyncThunk(
  "vendor/logout",
  async (_, thunkApi) => {
    try {
      await vendorAPI.vendorLogout()
      return true
    } catch (error) {
      return thunkApi.rejectWithValue("logged out Failed")
    }
  }
)

export const refreshVendorToken = createAsyncThunk(
  "vendor/refresh-token",
  async (_, thunkAPI) => {
    try {
      const { refreshUser } = await import("../services/user.api.js")
      const response = await refreshUser()
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue("Session expired")
    }
  }
)

const vendorSlice = createSlice({
  name: "vendor",
  initialState: {
    vendor: null,
    success: false,
    loading: false,
    error: false,
    unverified: false
  },
  reducers: {
    vendorLogoutState: (state) => {
      state.vendor = null
      state.error = null
      state.success = false
      state.unverified = false
    },
    vendorClearMessages: (state) => {
      state.error = null
      state.success = false
      state.unverified = false
    },
    setVendorData: (state, action) => {
      state.vendor = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(vendorApplicationThunk.pending, (state) => {
        state.success = false
        state.error = null
        state.loading = true
      })
      .addCase(vendorApplicationThunk.fulfilled, (state, action) => {
        state.success = true
        state.loading = false
        state.error = null
        state.vendor = null
      })
      .addCase(vendorApplicationThunk.rejected, (state, action) => {
        state.success = false
        state.loading = false
        state.error = action.payload
      })


      .addCase(vendorLoginThunk.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })

      .addCase(vendorLoginThunk.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        if (action.payload.unverified) {
          state.unverified = true
          state.vendor = null
        } else {
          state.vendor = action.payload.vendor
          state.unverified = false
        }
        state.error = null
      })
      .addCase(vendorLoginThunk.rejected, (state, action) => {
        state.loading = false
        state.success = false
        state.error = action.payload
      })
      .addCase(refreshVendorToken.fulfilled, (state, action) => {
        state.error = null
      })
      .addCase(refreshVendorToken.rejected, (state) => {
        state.vendor = null
      })
  }
})

export const { vendorClearMessages, vendorLogoutState, setVendorData } = vendorSlice.actions
export default vendorSlice.reducer