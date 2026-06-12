import {createSlice , createAsyncThunk} from "@reduxjs/toolkit"
import *as userAPI from "../services/user.api.js"

export const registerUserThunk = createAsyncThunk(
  "user/register",
  async (data,thunkAPI) => {
    try {
      const response =  await userAPI.registerUser(data)
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Register failed";
      return thunkAPI.rejectWithValue(typeof errorMessage === 'string' ? errorMessage : "Register failed");
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
        const errorMessage = error.response?.data?.message || "OTP Verification Failed";
        return thunkAPI.rejectWithValue(typeof errorMessage === 'string' ? errorMessage : "OTP Verification Failed");
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
      const errorMessage = error.response?.data?.message || "Failed To Login";
      return thunkAPI.rejectWithValue(typeof errorMessage === 'string' ? errorMessage : "Failed To Login");
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
      return thunkAPI.rejectWithValue("Logout Failed")
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
    loading : false,
    error : null,
    success : false,
    unverified: false,
    tempEmail: null
  },

  reducers : {
    logoutUserState : (state) =>{
      state.user = null
      state.success = false
      state.error = null
      state.unverified = false
      state.userId = null
      state.tempEmail = null
    },
    clearMessages : (state) =>{
      state.error = null
      state.success= false  
      state.unverified = false
    },
    setGoogleAuthData : (state,action) =>{
      state.user = action.payload.user;
      state.success = true;
      state.error = null;
      state.unverified = false;
    },
    updateUserData : (state, action) => {
      state.user = action.payload;
    }
  },
  extraReducers : (builder) => {
    builder
      .addCase(registerUserThunk.pending,(state)=>{
        state.loading = true
        state.error = null
        state.success = false
        state.unverified = false
      })
      .addCase(registerUserThunk.fulfilled, (state,action) =>{
        state.loading = false
        state.success = true
        state.userId = action.payload.userId
        state.tempEmail = action.payload.email
      })
      .addCase(registerUserThunk.rejected,(state,action) =>{
        state.loading = false
        state.success = false
        state.error = action.payload
      })

      .addCase(verifyOTPThunk.pending,(state)=>{
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(verifyOTPThunk.fulfilled,(state,action) =>{
        state.loading = false;
        state.success = true;
        state.user = action.payload.user;
        state.error = null;
        state.unverified = false;
      })
      .addCase(verifyOTPThunk.rejected,(state,action)=> {
        state.loading = false,
        state.error = action.payload 
      })

      .addCase(loginUserThunk.pending,(state)=>{
        state.loading = true;
        state.success = false;
        state.error = null;
        state.unverified = false;
      })
      .addCase(loginUserThunk.fulfilled,(state,action)=>{
        state.loading = false;
        state.success = true;
        if (action.payload.unverified) {
          state.unverified = true;
          state.userId = action.payload.userId;
          state.tempEmail = action.payload.email;
        } else {
          state.user = action.payload.user;
          state.unverified = false;
        }
        state.error = null;
      })
      .addCase(loginUserThunk.rejected,(state,action)=>{
        state.loading = false
        state.error = action.payload
        state.unverified = false
      })

      .addCase(logoutUserThunk.fulfilled, (state) => {
        state.user = null;
        state.userId = null;
        state.success = false;
        state.error = null;
      })


      .addCase(refreshUserToken.fulfilled,(state,action)=>{
        state.error = null;
      })
      .addCase(refreshUserToken.rejected,(state,action)=>{
        state.user = null
      })
      
  }
})


export const { logoutUserState, clearMessages, setGoogleAuthData, updateUserData } = userSlice.actions
export default userSlice.reducer;