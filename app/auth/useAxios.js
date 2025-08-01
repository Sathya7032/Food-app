// utils/useAxios.js
import axios from 'axios';
import { useAuthStore } from './useAuthStore';
import Constants from 'expo-constants';

const BASE_URL = 'http://ec2-35-154-226-76.ap-south-1.compute.amazonaws.com:8080'; // Same backend URL

const useAxios = () => {
  const { token } = useAuthStore.getState();

  const axiosInstance = axios.create({
    baseURL: BASE_URL,
  });

  // Attach token to headers
  axiosInstance.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  return axiosInstance;
};

export default useAxios;
