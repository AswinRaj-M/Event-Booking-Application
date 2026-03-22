import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import *as adminAPI from "../services/admin.api.js"


export const adminLoginThunk = createAsyncThunk(
  "admin/login",
  async(data,thunkAPI) =>{
    try {
    const response = await adminAPI.adminLogin(data)
    return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to admin login"
      )
    }
  }
)

export const getAllVendorsThunk = createAsyncThunk(
  "admin/vendorManagement",
  async(data,thunkAPI) =>{
    try {
      const response = await adminAPI.getAllVendors(data)
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "failed to fetch vendors"
      )
    }
  }
)


export  const getVendorByIdThunk =createAsyncThunk(
  "admin/vendor-application",
  async(id,thunkAPI) =>{
    try {
      const response = await adminAPI.getVendorById(id)
      return response.data.data
    } catch (error) {
      thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to get vendor by id"
      )
    }
  }
)

export const checkAdminAuthThunk = createAsyncThunk(
  "admin/checkAuth",
  async (_, thunkAPI) => {
    try {
      const response = await adminAPI.getAdminMe()
      return response.data.admin
    } catch (error) {
      return thunkAPI.rejectWithValue("Not Authenticated")
    }
  }
)

export const logoutAdminThunk = createAsyncThunk(
  "admin/logout",
  async (_, thunkAPI) => {
    try {
      await adminAPI.logoutAdmin()
      return true
    } catch (error) {
      return thunkAPI.rejectWithValue("Logout Failed")
    }
  }
)

const adminSlice = createSlice({
  name :"admin",
  initialState : {
    admin : null,
    loading : false,
    success : false,
    error : null,
    vendors : [],
    vendorDetails: null,
    count : 0,
    authChecked: false
  },
  reducers :{
    logoutAdminState : (state) =>{
      state.admin = null
      state.success = false
      state.error = null
    },
    adminClearMessages : (state) =>{
      state.error = null
      state.success = false
    }
  },
  extraReducers : (builder)=>{
    builder
      .addCase(adminLoginThunk.pending,(state)=>{
        state.success = false
        state.error = null
        state.loading = true
      })
      .addCase(adminLoginThunk.fulfilled,(state,action)=>{
        state.success = true
        state.admin =action.payload.admin 
        state.loading = false
        state.error = null
        state.authChecked = true
      })
      .addCase(adminLoginThunk.rejected,(state,action)=>{
        state.success = false
        state.loading = false
        state.error = action.payload
      })

      .addCase(getAllVendorsThunk.pending,(state)=>{
        state.success = false
        state.loading = true
        state.error = null
      })

      .addCase(getAllVendorsThunk.fulfilled,(state,action) =>{
        state.success = true
        state.loading = false
        state.vendors = action.payload.data
        state.count = action.payload.count
        state.error = null
      })

      .addCase(getAllVendorsThunk.rejected,(state,action) =>{
        state.success = false
        state.loading = false
        state.error = action.payload
      })

      .addCase(getVendorByIdThunk.pending,(state,action) =>{
        state.success = false
        state.loading = true
      })

      .addCase(getVendorByIdThunk.fulfilled,(state,action) =>{
        state.success = true
        state.loading = false
        state.error = null
        state.vendorDetails = action.payload
      })

      .addCase(getVendorByIdThunk.rejected,(state,action)=>{
        state.success = false
        state.loading = false
        state.error = action.payload
      })

      .addCase(checkAdminAuthThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAdminAuthThunk.fulfilled, (state, action) => {
        state.admin = action.payload;
        state.success = true;
        state.loading = false;
        state.authChecked = true;
      })
      .addCase(checkAdminAuthThunk.rejected, (state) => {
        state.admin = null;
        state.loading = false;
        state.authChecked = true;
      })
      .addCase(logoutAdminThunk.fulfilled, (state) => {
        state.admin = null;
        state.success = false;
        state.error = null;
        state.authChecked = true;
      })
  }
})

export const {logoutAdminState,adminClearMessages} = adminSlice.actions
export default adminSlice.reducer