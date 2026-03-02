import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import *as vendorAPI from "../services/vendor.api.js"


export const vendorApplicationThunk = createAsyncThunk(
  "vendor/application",
  async(data,thunkAPI) =>{
    try {
      const response = await vendorAPI.vendorApplication(data)
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to submit vendor application"
      )
    }
  }
)


const vendorSlice = createSlice({
  name : "vendor",
  initialState :{
    vendor : null,
    success : false,
    loading : false,
    error : false
  },
  reducers :{
    vendorClearMessages : (state)=>{
      state.error = null
      state.success = false
    }
  },
  extraReducers : (builder) =>{
    builder
      .addCase(vendorApplicationThunk.pending,(state) =>{
        state.success = false
        state.error = null
        state.loading = true
      })
      .addCase(vendorApplicationThunk.fulfilled,(state,action)=>{
        state.success = true
        state.loading = false
        state.vendor = action.payload.data
      })
      .addCase(vendorApplicationThunk.rejected,(state,action)=>{
        state.success = false
        state.loading = false
        state.error = action.payload
      })
  } 
})

export const {vendorClearMessages} = vendorSlice.actions
export default vendorSlice.reducer