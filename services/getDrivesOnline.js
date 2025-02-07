import { getAccessToken } from "./authService";
import axios from "axios";
import Constants from "expo-constants";

export const getDriversInArea = async (currentLocation, setDriversNearBy) => {
  const token = await getAccessToken();
  const API_URL = `${Constants.expoConfig.extra.apiUrl}/get-drivers.php`;
  let response;

  try {
    response = await axios.post(API_URL, currentLocation, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    setDriversNearBy(response.data.data);
  } catch (e) {
    console.log(e, "error");
  }
};

export const updateAutoLocation = async (
  driverLocation,
  discount,
  isVisible
) => {
  const token = await getAccessToken();
  const API_URL = `${Constants.expoConfig.extra.apiUrl}/update-driver-location.php`;

  const payload = {
    latitude: driverLocation.latitude,
    longitude: driverLocation.longitude,
    is_available: isVisible,
    discount: discount,
  };

  try {
    response = await axios.post(API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (e) {
    console.log(e, "error");
  }
};

export const sendRideRequest = async (driver, pickUp, destination) => {
  const token = await getAccessToken();
  const API_URL = `${Constants.expoConfig.extra.apiUrl}/send-ride-request.php`;

  const payload = {
    driver_id: driver.driver_id,
    pickup_latitude: pickUp.latitude,
    pickup_longitude: pickUp.longitude,
    drop_latitude: destination.latitude,
    drop_longitude: destination.longitude,
  };

  try {
    await axios.post(API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (e) {
    console.log(e, "error");
  }
};

export const pollForRides = async () => {
  const token = await getAccessToken();
  if (!token) {
    console.error('Failed to retrieve access token');
    return { error: true, message: 'Authorization failed' };
  }

  const API_URL = `${Constants.expoConfig.extra.apiUrl}/poll-ride-requests.php`;

  try {
    const response = await axios.post(API_URL, {}, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response?.data) {
      return response.data; // return the data as is
    } else {
      console.warn('Unexpected response format:', response);
      return { error: true, message: 'Unexpected response format' };
    }
  } catch (e) {
    console.error(e, "error");
    return { error: true, message: e.message || 'Polling failed' };
  }
};

// Driver -> Accept / Reject ride request from User
export const handleRideRequest = async (status) => {
  const token = await getAccessToken();
  if (!token) {
    console.error('Failed to retrieve access token');
    return { error: true, message: 'Authorization failed' };
  }

  const API_URL = `${Constants.expoConfig.extra.apiUrl}/update-ride-request.php`;
  try {
    const response = await axios.post(API_URL, status, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response?.data || null; // Return data or null if undefined
  } catch (e) {
    console.error(e, "error");
    return { error: true, message: e.message || 'request failed' };
  }
};

export const checkRideStatus = async () => {
  const token = await getAccessToken();
  if (!token) {
    console.error('Failed to retrieve access token');
    return { error: true, message: 'Authorization failed' };
  }

  const API_URL = `${Constants.expoConfig.extra.apiUrl}/poll-ride-status.php`;
  try {
    const response = await axios.post(API_URL, {}, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response?.data || null; // Return data or null if undefined
  } catch (e) {
    console.error(e, "error");
    return { error: true, message: e.message || 'request failed' };
  }
};

export const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const rad = (deg) => (deg * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};


export const updateDriverLocation = async (latitude, longitude) => {
  // console.log(latitude, longitude, "latitude, longitude");
};

