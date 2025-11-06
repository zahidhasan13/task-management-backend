import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import teamReducer from "./slices/teamSlice";
// import taskReducer from "./slices/taskSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    team: teamReducer,
    // task: taskReducer,
  },
});

export default store;
