import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { REHYDRATE } from "redux-persist"
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
  async({status,page,limit,search,category},thunkAPI) =>{
    console.log("thunk is working")
    try {
      const response = await adminAPI.getAllVendors({status, page, limit, search, category})
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

export const refreshAdminToken = createAsyncThunk(
  "admin/refresh-token",
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
export const logoutAdminThunk = createAsyncThunk(
  "admin/logout",
  async (_, thunkAPI) => {
    try {
      await adminAPI.logoutAdmin()
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to logout admin"
      )
    }
  }
)

const adminSlice = createSlice({
  name :"admin",
  initialState : {
    admin : null,
    loginLoading: false,
    loginSuccess: false,
    loginError: null,
    vendorsLoading: false,
    vendorsSuccess: false,
    vendorsError: null,
    vendorDetailsLoading: false,
    vendorDetailsSuccess: false,
    vendorDetailsError: null,
    vendors : [],
    total : 0,
    currentPage : 1,
    totalPages : 1,
    vendorDetails: null,
    vendorStats: {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0
    }
  },
  reducers :{
    logoutAdminState : (state) => {
      state.admin = null
      state.loginSuccess = false
      state.loginError = null
      state.vendorsSuccess = false
      state.vendorsError = null
      state.vendorDetailsSuccess = false
      state.vendorDetailsError = null
    },
    adminClearMessages : (state) => {
      state.loginSuccess = false
      state.loginError = null
      state.vendorsSuccess = false
      state.vendorsError = null
      state.vendorDetailsSuccess = false
      state.vendorDetailsError = null
    }
  },
  extraReducers : (builder)=>{
    builder
      .addCase(adminLoginThunk.pending,(state)=>{
        state.loginSuccess = false
        state.loginError = null
        state.loginLoading = true
      })
      .addCase(adminLoginThunk.fulfilled,(state,action)=>{
        state.loginSuccess = true
        state.admin =action.payload.admin 
        state.loginLoading = false
        state.loginError = null
      })
      .addCase(adminLoginThunk.rejected,(state,action)=>{
        state.loginSuccess = false
        state.loginLoading = false
        state.loginError = action.payload
      })

      .addCase(getAllVendorsThunk.pending,(state)=>{
        state.vendorsSuccess = false
        state.vendorsLoading = true
        state.vendorsError = null
        state.vendors = [] // prevent old data flicker
      })

      .addCase(getAllVendorsThunk.fulfilled,(state,action) =>{
        state.vendorsSuccess = true
        state.vendorsLoading = false
        state.vendors = action.payload.data
        state.total = action.payload.total
        state.vendorStats = action.payload.stats
        state.currentPage = action.payload.currentPage
        state.totalPages =  action.payload.totalPages
        state.vendorsError = null
      })

      .addCase(getAllVendorsThunk.rejected,(state,action) =>{
        state.vendorsSuccess = false
        state.vendorsLoading = false
        state.vendorsError = action.payload
      })

      .addCase(getVendorByIdThunk.pending,(state,action) =>{
        state.vendorDetailsSuccess = false
        state.vendorDetailsLoading = true
        state.vendorDetailsError = null
      })

      .addCase(getVendorByIdThunk.fulfilled,(state,action) =>{
        state.vendorDetailsSuccess = true
        state.vendorDetailsLoading = false
        state.vendorDetailsError = null
        state.vendorDetails = action.payload
      })

      .addCase(getVendorByIdThunk.rejected,(state,action)=>{
        state.vendorDetailsSuccess = false
        state.vendorDetailsLoading = false
        state.vendorDetailsError = action.payload
      })
      .addCase(refreshAdminToken.fulfilled, (state, action) => {
        state.loginError = null
      })
      .addCase(refreshAdminToken.rejected, (state) => {
        state.admin = null
      })
      .addCase(logoutAdminThunk.fulfilled, (state) => {
        state.admin = null
        state.loginSuccess = false
        state.loginError = null
        state.vendorsSuccess = false
        state.vendorsError = null
        state.vendorDetailsSuccess = false
        state.vendorDetailsError = null
      })
      .addCase(logoutAdminThunk.rejected, (state) => {
        state.admin = null
        state.loginSuccess = false
        state.loginError = null
        state.vendorsSuccess = false
        state.vendorsError = null
        state.vendorDetailsSuccess = false
        state.vendorDetailsError = null
      })
      .addCase(REHYDRATE, (state) => {
        // Reset transient loading/success/error states on app startup/hydration
        state.loginLoading = false
        state.loginSuccess = false
        state.loginError = null
        state.vendorsLoading = false
        state.vendorsSuccess = false
        state.vendorsError = null
        state.vendorDetailsLoading = false
        state.vendorDetailsSuccess = false
        state.vendorDetailsError = null
      })
  }
})

export const {logoutAdminState,adminClearMessages} = adminSlice.actions
export default adminSlice.reducer