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

export const checkVendorAuthThunk = createAsyncThunk(
  "vendor/checkAuth",
  async (_, thunkAPI) => {
    try {
      const response = await vendorAPI.getVendorMe()
      return response.data.vendor
    } catch (error) {
      return thunkAPI.rejectWithValue("Not Authenticated")
    }
  }
)

const vendorSlice = createSlice({
  name: "vendor",
  initialState: {
    vendor: null,
    success: false,
    loading: false,
    error: false
  },
  reducers: {
    vendorLogoutState: (state) => {
      state.vendor = null
      state.error = null
      state.success = false
    },
    vendorClearMessages: (state) => {
      state.error = null
      state.success = false
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
        state.vendor = action.payload.data
        state.error = null
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
        state.vendor = action.payload.vendor
        state.error = null
      })

      .addCase(vendorLoginThunk.rejected, (state, action) => {
        state.loading = false
        state.success = false
        state.error = action.payload
      })

      .addCase(checkVendorAuthThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkVendorAuthThunk.fulfilled, (state, action) => {
        state.vendor = action.payload;
        state.success = true;
        state.loading = false;
      })
      .addCase(checkVendorAuthThunk.rejected, (state) => {
        state.vendor = null;
        state.loading = false;
      })
  }
})

export const { vendorClearMessages, vendorLogoutState } = vendorSlice.actions
export default vendorSlice.reducer