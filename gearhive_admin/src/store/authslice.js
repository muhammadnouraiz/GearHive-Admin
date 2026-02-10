/* src/store/authslice.js */
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    status: false,
    userData: null
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        // These are the actions we are trying to export
        login: (state, action) => {
            state.status = true;
            state.userData = action.payload;
        },
        logout: (state) => {
            state.status = false;
            state.userData = null;
        }
    }
})

// Explicitly export the actions
export const { login, logout } = authSlice.actions;

// Export the reducer as default
export default authSlice.reducer;