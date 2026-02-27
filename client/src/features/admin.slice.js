import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import *as adminAPI from "../services/admin.api.js"


export const adminLoginThunk = createAsyncThunk(
  "admin/login",
  async(data,ThunkAPI) =>{
    try {
    const response = await adminAPI.adminLogin(data)
    return response.data
    } catch (error) {
      return ThunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to admin login"
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
    error : null
  }
})