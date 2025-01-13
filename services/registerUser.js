import axios from 'axios';
import { Alert } from 'react-native';
import Config from "react-native-config";
import Constants from 'expo-constants';

export const registerUser = async (userData, router) => {
  const api_url = `${Constants.expoConfig.extra.apiUrl}/register.php`;
  try {
    const payload = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone,
      role: userData.role,
    };

    if (userData.role === 'driver') {
      payload.vehicle_number = userData.vehicle_number;
      payload.license_photo = userData.license_photo || '';
    }

    const response = await axios.post(api_url, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
        Alert.alert(
            "Account created",
            "Your account has been successfully created!"
          );
        router.push("/LoginForm");
    } else {
      Alert.alert('Registration Failed', 'There was an issue with your registration. Please try again.');
    }

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    Alert.alert('Error', 'Something went wrong. Please try again later.');
  }
};