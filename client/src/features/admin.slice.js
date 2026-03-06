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

const adminSlice = createSlice({
  name :"admin",
  initialState : {
    admin : null,
    accessToken : null,
    loading : false,
    success : false,
    error : null,
    vendors : [],
    count : 0
  },
  reducers :{
    logoutAdminState : (state) =>{
      state.admin = null
      state.accessToken = null
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
        state.accessToken = action.payload.accessToken
        state.loading = false
        state.error = null
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
  }
})

export const {logoutAdminState,adminClearMessages} = adminSlice.actions
export default adminSlice.reducer