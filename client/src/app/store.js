import {configureStore} from "@reduxjs/toolkit"
import userReducer  from "../features/user.slice.js"
import adminReducer from "../features/admin.slice.js"
import vendorReducer from "../features/vendorSlice.js"

export const store = configureStore({
  reducer : {
    user : userReducer,
    admin : adminReducer,
    vendor : vendorReducer
  }
})

