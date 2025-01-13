import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import SwipeButton from 'rn-swipe-button';
import * as Location from 'expo-location';
import { AppContext } from '../context';
import { getDistance, updateDriverLocation } from '../services/getDrivesOnline';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const RidePageDriver = () => {
  const {
    customerPickUpLocation, 
    customerDropLocation
  } = useContext(AppContext);

  const [driverLocation, setDriverLocation] = useState(null);
  const [rideStage, setRideStage] = useState(1); // 1: Tracking to pickup, 2: OTP screen, 3: Ride to destination
  const [otp, setOtp] = useState('');
  const [region, setRegion] = useState({
    latitude: customerPickUpLocation.latitude,
    longitude: customerPickUpLocation.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const GOOGLE_MAPS_APIKEY = 'AIzaSyDo1tnDHs2gmgdo9fPsig6KBaoz0zIz9zc';

  // Fetch driver's location and send to database every 10 seconds
  useEffect(() => {
    const startLocationUpdates = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required to track your position.');
          return;
        }

        const updateLocation = async () => {
          const location = await Location.getCurrentPositionAsync({});
          const { latitude, longitude } = location.coords;
          setDriverLocation({ latitude, longitude });

          // Use the service function to update location
          await updateDriverLocation(latitude, longitude);
        };

        // Fetch initial location and start periodic updates
        updateLocation();
        const interval = setInterval(updateLocation, 20000);

        return () => clearInterval(interval); // Clear interval on unmount
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    };

    if (rideStage === 1) {
      startLocationUpdates();
    }
  }, [rideStage]); // No need for apiEndpoint dependency

  console.log(rideStage, 'rideStage');

  // Update map region to focus on the driver's location
  useEffect(() => {
    if (driverLocation) {
      setRegion((prev) => ({
        ...prev,
        latitude: driverLocation.latitude,
        longitude: driverLocation.longitude,
      }));

      // Check if the driver has reached the pickup location
      const distanceToPickup = getDistance(
        // driverLocation.latitude,
        // driverLocation.longitude,
        18.5575,
        73.7726,
        customerPickUpLocation.latitude,
        customerPickUpLocation.longitude
      );
      if (distanceToPickup < 30) {
        console.log(distanceToPickup, "dist");
        setRideStage(2); // Move to OTP screen if within 50 meters
      }
    }
  }, [driverLocation]);

  // OTP Validation
  const handleOtpSubmit = () => {
    if (otp === '1234') {
      setRideStage(3); // Move to ride stage
    } else {
      Alert.alert('Invalid OTP', 'Please enter the correct OTP.');
    }
  };

  // Ride Start Confirmation
  const handleRideStart = () => {
    Alert.alert('Ride Started', 'You are now en route to the destination.');
  };

  return (
    <View style={styles.container}>
      {rideStage === 1 && driverLocation && (
        <MapView style={styles.map} region={region}>
          {/* Driver's Location Marker */}
          <Marker coordinate={driverLocation} title="Driver's Location" >
            <FontAwesome5 name="caravan" size={24} color="green" />
          </Marker>

          {/* Customer Pickup Marker */}
          <Marker coordinate={{
            latitude: parseFloat(customerPickUpLocation.latitude),
            longitude: parseFloat(customerPickUpLocation.longitude)
          }} title="Pickup Location">
            <FontAwesome name="map-pin" size={24} color="black" />
          </Marker>

          {/* Directions to Pickup */}
          <MapViewDirections
            origin={driverLocation}
            destination={{
              latitude: parseFloat(customerPickUpLocation.latitude),
              longitude: parseFloat(customerPickUpLocation.longitude)
            }}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={4}
            strokeColor="hotpink"
          />
        </MapView>
      )}

      {rideStage === 2 && (
        <View style={styles.otpContainer}>
          <Text style={styles.title}>Enter OTP</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
          />
          <Button title="Submit" onPress={handleOtpSubmit} />
          {/* <DriverInfoSheet /> */}
        </View>
      )}

      {rideStage === 3 && (
        <View style={styles.rideContainer}>
          <MapView style={styles.map} region={region}>
            {/* Pickup Marker */}
            <Marker coordinate={{
              latitude: parseFloat(customerPickUpLocation.latitude),
              longitude: parseFloat(customerPickUpLocation.longitude)
            }} title="Pickup Location" pinColor="green" />

            {/* Destination Marker */}
            <Marker coordinate={{
              latitude: parseFloat(customerDropLocation.latitude),
              longitude: parseFloat(customerDropLocation.longitude)
            }} title="Destination" pinColor="red" />

            {/* Directions to Destination */}
            <MapViewDirections
              origin={{
                latitude: parseFloat(customerPickUpLocation.latitude),
                longitude: parseFloat(customerPickUpLocation.longitude)
              }}
              destination={{
                latitude: parseFloat(customerDropLocation.latitude),
                longitude: parseFloat(customerDropLocation.longitude)
              }}
              apikey={GOOGLE_MAPS_APIKEY}
              strokeWidth={4}
              strokeColor="blue"
            />
          </MapView>

          <SwipeButton
            swipeSuccessThreshold={70}
            height={60}
            title="Swipe to Start Ride"
            onSwipeSuccess={handleRideStart}
          />
        </View>
      )}
    </View>
  );
};

export default RidePageDriver;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  otpContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  rideContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
});
