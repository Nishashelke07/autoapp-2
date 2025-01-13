import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra.apiUrl;

export const login = async (payload) => {
  try {
    const response = await axios.post(`${API_URL}/login.php`, payload);
    const { status, token, refresh_token } = response.data;

    // await SecureStore.setItemAsync('refresh_token', refresh_token);
    return {status, token}; // Return the access token for immediate use
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const saveAccessToken = async (token) => {
  await SecureStore.setItemAsync('access_token', token);
};

export const getRefreshToken = async () => {
  return await SecureStore.getItemAsync('refresh_token');
};

export const getAccessToken = async () => {
  return await SecureStore.getItemAsync('access_token');
};

export const logout = async () => {
  await SecureStore.deleteItemAsync('refresh_token');
  await SecureStore.deleteItemAsync('access_token');
};
