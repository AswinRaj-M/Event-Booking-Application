import {createSlice , createAsyncThunk} from "@reduxjs/toolkit"
import *as userAPI from "../services/user.api.js"

export const registerUserThunk = createAsyncThunk(
  "user/register",
  async (data,thunkAPI) => {
    try {
      const response =  await userAPI.registerUser(data)
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Register failed"
      )
    }
  }
)

export const verifyOTPThunk = createAsyncThunk(
  "users/verify-otp",
  async (data,thunkAPI) =>{
    try {
      const response = await userAPI.verifyOTP(data)
      return response.data
    } catch (error) {
        return thunkAPI.rejectWithValue(
          error.response?.data?.message || "OTP Verification Failed"
        )
    }
  }

)


export const loginUserThunk = createAsyncThunk(
  "users/login",
  async(data,thunkAPI) =>{
    try {
      const response = await userAPI.loginUser(data)
      return response.data

    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed To Login"
      )      
    }
  }
)

export const logoutUserThunk = createAsyncThunk(
  "users/logout",
  async(_,thunkAPI) =>{
    try {
      await userAPI.logoutUser()
      return true
    } catch (error) {
      thunkAPI.rejectWithValue("Logout Failed")
    }
  }
)

export const refreshUserToken = createAsyncThunk(
  "users/refresh-token",
  async(_,thunkAPI) =>{
    try {
      const response = await userAPI.refreshUser()
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue("session expired")
    }
  }
)


const userSlice = createSlice({
  name :"user",
  initialState : {
    user : null,
    userId : null,
    accessToken : null,
    loading : false,
    error : null,
    success : false
  },

  reducers : {
    logoutUserState : (state) =>{
      state.user = null
      state.accessToken = null
      state.success = false
      state.error = null
    },
    clearMessages : (state) =>{
      state.error = null
      state.success= false  
    }
  },
  extraReducers : (builder) => {
    builder
      .addCase(registerUserThunk.pending,(state)=>{
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(registerUserThunk.fulfilled, (state,action) =>{
        state.loading = false
        state.success = true
        state.userId = action.payload.userId
      })
      .addCase(registerUserThunk.rejected,(state,action) =>{
        state.loading = false
        state.success = false
        state.error = action.payload
      })

      .addCase(verifyOTPThunk.pending,(state)=>{
        state.loading = true,
        state.success = false
      })
      .addCase(verifyOTPThunk.fulfilled,(state,action) =>{
        state.loading = false,
        state.success = true,
        state.user = action.payload,
        state.accessToken = action.payload.accessToken
      })
      .addCase(verifyOTPThunk.rejected,(state,action)=> {
        state.loading = false,
        state.error = action.payload 
      })

      .addCase(loginUserThunk.pending,(state)=>{
        state.loading = true,
        state.success = false
      })
      .addCase(loginUserThunk.fulfilled,(state,action)=>{
        state.loading = false,
        state.success = true,
        state.accessToken = action.payload.accessToken
      })
      .addCase(loginUserThunk.rejected,(state,action)=>{
        state.loading = false
        state.error = action.payload
      })


      .addCase(refreshUserToken.fulfilled,(state,action)=>{
        state.accessToken = action.payload.accessToken
      })
      .addCase(refreshUserToken.rejected,(state,action)=>{
        state.user = null
        state.accessToken = null
      })
      
  }
})


export const { logoutUserState, clearMessages} =userSlice.actions
export default userSlice.reducer;