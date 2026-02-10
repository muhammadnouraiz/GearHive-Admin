/* src/store/store.js */
import { configureStore } from '@reduxjs/toolkit';
// ✅ FIX: Changed './authSlice' to './authslice' to match your filename
import authSlice from './authslice'; 

const store = configureStore({
    reducer: {
        auth: authSlice,
    }
});

export default store;