// store/useAuthStore.js
import { create } from 'zustand';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants'
import { router } from 'expo-router';

const BASE_URL = Constants.expoConfig.extra.API_URL;

export const useAuthStore = create((set, get) => ({
  // State
  mobileNumber: '',
  otp: '',
  loading: false,
  error: null,
  isOtpSent: false,
  isAuthenticated: false,
  customerId: null,
  user: null,
  token: null,

  // Setters
  setMobileNumber: (number) => set({ mobileNumber: number }),
  setOtp: (otp) => set({ otp }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Save all auth data from API response
  setAuthData: async (responseData) => {
    const { customerId, mobileNumber, token, ...userData } = responseData;
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('userData', JSON.stringify({
      customerId,
      mobileNumber,
      ...userData
    }));
    
    set({ 
      isAuthenticated: true,
      customerId,
      mobileNumber,
      token,
      user: {
        customerId,
        mobileNumber,
        ...userData
      },
      error: null 
    });
  },

  clearAuthData: async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
    set({ 
      isAuthenticated: false, 
      customerId: null,
      user: null, 
      token: null,
      mobileNumber: '',
      otp: '',
      isOtpSent: false 
    });
  },

  // Auth operations
  sendOtp: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${BASE_URL}/customer/login`, {
        mobileNumber: get().mobileNumber,
      });
      set({ isOtpSent: true });
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.data?.message || 'Failed to send OTP';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  verifyOtp: async () => {
    set({ loading: true, error: null });
    try {
      const { mobileNumber, otp } = get();
      const response = await axios.post(`${BASE_URL}/customer/verify`, { 
        mobileNumber, 
        otp 
      });
      
      if (!response.data.token) {
        throw new Error('No token received');
      }
      
      await get().setAuthData(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.data?.message || 'Failed to verify OTP';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  verifyToken: async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userDataString = await AsyncStorage.getItem('userData');
      
      if (!token || !userDataString) return false;

      const userData = JSON.parse(userDataString);
      
      set({ 
        isAuthenticated: true,
        customerId: userData.customerId,
        mobileNumber: userData.mobileNumber,
        token,
        user: userData
      });
      
      return true;
    } catch (err) {
      console.error('Token verification failed:', err);
      await get().clearAuthData();
      return false;
    }
  },

  logout: async () => {
    try {
      // Optional: Add backend logout call if needed
      // await axios.post(`${BASE_URL}/logout`, { token: get().token });
      await get().clearAuthData();
      router.push('/(login)')
    } catch (err) {
      console.error('Logout failed:', err);
    }
  },

  // Initialize auth state from storage
  initializeAuth: async () => {
    try {
      return await get().verifyToken();
    } catch (err) {
      console.error('Auth initialization failed:', err);
      return false;
    }
  }
}));

export default useAuthStore;