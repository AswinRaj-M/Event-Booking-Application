import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as userAPI from "../services/user.api.js";

export const registerUserThunk = createAsyncThunk(
  "user/register",
  async (data, thunkAPI) => {
    try {
      const response = await userAPI.registerUser(data);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Register failed";
      return thunkAPI.rejectWithValue(typeof errorMessage === 'string' ? errorMessage : "Register failed");
    }
  }
);

export const verifyOTPThunk = createAsyncThunk(
  "users/verify-otp",
  async (data, thunkAPI) => {
    try {
      const response = await userAPI.verifyOTP(data);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "OTP Verification Failed";
      return thunkAPI.rejectWithValue(typeof errorMessage === 'string' ? errorMessage : "OTP Verification Failed");
    }
  }
);

export const loginUserThunk = createAsyncThunk(
  "users/login",
  async (data, thunkAPI) => {
    try {
      const response = await userAPI.loginUser(data);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed To Login";
      return thunkAPI.rejectWithValue(typeof errorMessage === 'string' ? errorMessage : "Failed To Login");
    }
  }
);

export const logoutUserThunk = createAsyncThunk(
  "users/logout",
  async (_, thunkAPI) => {
    try {
      await userAPI.logoutUser();
      return true;
    } catch (error) {
      return thunkAPI.rejectWithValue("Logout Failed");
    }
  }
);

export const refreshUserToken = createAsyncThunk(
  "users/refresh-token",
  async (_, thunkAPI) => {
    try {
      const response = await userAPI.refreshUser();
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("session expired");
    }
  }
);

export const getUserTicketsThunk = createAsyncThunk(
  "users/get-tickets",
  async (_, thunkAPI) => {
    try {
      const response = await userAPI.getUserTickets();
      return response.data.bookings;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch tickets";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const checkRefundEligibilityThunk = createAsyncThunk(
  "users/check-refund-eligibility",
  async (bookingId, thunkAPI) => {
    try {
      const response = await userAPI.checkRefundEligibility(bookingId);
      return response.data.eligibility;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Booking is not eligible for refund";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const requestRefundThunk = createAsyncThunk(
  "users/request-refund",
  async ({ bookingId, reason }, thunkAPI) => {
    try {
      const response = await userAPI.requestRefund({ bookingId, reason });
      return response.data.refund;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to submit refund request";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const getUserRefundsThunk = createAsyncThunk(
  "users/get-user-refunds",
  async (_, thunkAPI) => {
    try {
      const response = await userAPI.getUserRefunds();
      return response.data.refunds;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch refund requests";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    userId: null,
    loading: false,
    error: null,
    success: false,
    unverified: false,
    tempEmail: null,
    tickets: [],
    ticketsLoading: false,
    ticketsError: null,
    refunds: [],
    refundLoading: false,
    refundError: null,
    refundSuccess: false,
    eligibility: null,
    eligibilityLoading: false,
    eligibilityError: null,
  },

  reducers: {
    logoutUserState: (state) => {
      state.user = null;
      state.success = false;
      state.error = null;
      state.unverified = false;
      state.userId = null;
      state.tempEmail = null;
      state.tickets = [];
      state.ticketsLoading = false;
      state.ticketsError = null;
      state.refunds = [];
      state.refundLoading = false;
      state.refundError = null;
      state.refundSuccess = false;
      state.eligibility = null;
      state.eligibilityLoading = false;
      state.eligibilityError = null;
    },
    clearMessages: (state) => {
      state.error = null;
      state.success = false;
      state.unverified = false;
      state.ticketsError = null;
      state.refundError = null;
      state.refundSuccess = false;
      state.eligibilityError = null;
    },
    setGoogleAuthData: (state, action) => {
      state.user = action.payload.user;
      state.success = true;
      state.error = null;
      state.unverified = false;
    },
    updateUserData: (state, action) => {
      state.user = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.unverified = false;
      })
      .addCase(registerUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.userId = action.payload.userId;
        state.tempEmail = action.payload.email;
      })
      .addCase(registerUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })

      .addCase(verifyOTPThunk.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(verifyOTPThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.user = action.payload.user;
        state.error = null;
        state.unverified = false;
      })
      .addCase(verifyOTPThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(loginUserThunk.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.unverified = false;
      })
      .addCase(loginUserThunk.fulfilled, (state, action) => {
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
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.unverified = false;
      })

      .addCase(logoutUserThunk.fulfilled, (state) => {
        state.user = null;
        state.userId = null;
        state.success = false;
        state.error = null;
        state.tickets = [];
      })

      .addCase(refreshUserToken.fulfilled, (state, action) => {
        state.error = null;
      })
      .addCase(refreshUserToken.rejected, (state, action) => {
        state.user = null;
      })

      .addCase(getUserTicketsThunk.pending, (state) => {
        state.ticketsLoading = true;
        state.ticketsError = null;
      })
      .addCase(getUserTicketsThunk.fulfilled, (state, action) => {
        state.ticketsLoading = false;
        state.tickets = action.payload;
        state.ticketsError = null;
      })
      .addCase(getUserTicketsThunk.rejected, (state, action) => {
        state.ticketsLoading = false;
        state.ticketsError = action.payload;
      })

      // Refund cases
      .addCase(checkRefundEligibilityThunk.pending, (state) => {
        state.eligibilityLoading = true;
        state.eligibilityError = null;
        state.eligibility = null;
      })
      .addCase(checkRefundEligibilityThunk.fulfilled, (state, action) => {
        state.eligibilityLoading = false;
        state.eligibility = action.payload;
        state.eligibilityError = null;
      })
      .addCase(checkRefundEligibilityThunk.rejected, (state, action) => {
        state.eligibilityLoading = false;
        state.eligibilityError = action.payload;
      })

      .addCase(requestRefundThunk.pending, (state) => {
        state.refundLoading = true;
        state.refundError = null;
        state.refundSuccess = false;
      })
      .addCase(requestRefundThunk.fulfilled, (state, action) => {
        state.refundLoading = false;
        state.refundSuccess = true;
        state.refundError = null;
        state.refunds.unshift(action.payload);
      })
      .addCase(requestRefundThunk.rejected, (state, action) => {
        state.refundLoading = false;
        state.refundSuccess = false;
        state.refundError = action.payload;
      })

      .addCase(getUserRefundsThunk.fulfilled, (state, action) => {
        state.refunds = action.payload;
      });
  }
});

export const { logoutUserState, clearMessages, setGoogleAuthData, updateUserData } = userSlice.actions;
export default userSlice.reducer;