import {configureStore} from "@reduxjs/toolkit"
import userReducer  from "../features/user.slice.js"

export const store = configureStore({
  reducer : {
    user : userReducer
  }
})

