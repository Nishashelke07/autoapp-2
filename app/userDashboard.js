import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import InputLocation from "./inputLocation";
import * as Location from "expo-location";
import React, { useState, useEffect, useContext, useRef } from "react";
import {
  checkRideStatus,
  filterAndSortLocations,
  getCurrentDrivesOnline,
  getDriversInArea,
  handleRideRequest,
  sendRideRequest,
} from "../services/getDrivesOnline";
import AutoMarker from "../assets/ricksaw.png";
import { AppContext } from "../context";
import ShowDirections from "../screens/showDirections";
import { FontAwesome5 } from "@expo/vector-icons";
import WaitingBottomSheet from "../screens/waitingBottomSheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Foundation from "@expo/vector-icons/Foundation";
import { calculateDistance } from "../services/calculateDistance";
import { getAuth, signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import PollingComponent from "./components/shared/pollingComponent";
import { router } from "expo-router";

export default function UserDashboard(props) {
  const {
    authInfo,
    setPickUpDetails,
    setDestination,
    destination,
    setCurrentLocation,
    currentLocation,
    setSelectedDriver,
    selectedDriver,
  } = useContext(AppContext);

  const { user } = props;
  const navigation = useNavigation();

  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [driverLocations, setDriverLocations] = useState([]);
  const [placeName, setPlaceName] = useState(null);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [waitStart, setWaitStart] = useState(false);
  const [bounds, setBounds] = useState(null);
  const [rideInProgress, setRideInProgress] = useState(false);
  const [visible, setVisible] = useState(true);
  const [rideResponse, setRideResponse] = useState(null);
  const [stopCondition, setStopCondition] = useState(false);
  const [fakeRidesNearUser, setFakeRidesNearUser] = useState([]);
  const [initialRegion, setInitialRegion] = useState(null);

  const closeModal = () => setVisible(false);
  const intervalRef = useRef(null);
  const mapRef = useRef(null);

  const [drivesNearBy, setDriversNearBy] = useState([]);

  const PUNE_CENTER = { lat: 18.5204, lng: 73.8567 };
  const NAGPUR_CENTER = { lat: 21.1458, lng: 79.0882 };
  const RADIUS = 20000;

  const setBoundsBasedOnLocation = (lat, lng) => {
    const distanceToPune = calculateDistance(
      lat,
      lng,
      PUNE_CENTER.lat,
      PUNE_CENTER.lng
    );
    const distanceToNagpur = calculateDistance(
      lat,
      lng,
      NAGPUR_CENTER.lat,
      NAGPUR_CENTER.lng
    );

    if (distanceToPune < distanceToNagpur) {
      setBounds({
        lat: PUNE_CENTER.lat,
        lng: PUNE_CENTER.lng,
        radius: RADIUS,
      });
    } else {
      setBounds({
        lat: NAGPUR_CENTER.lat,
        lng: NAGPUR_CENTER.lng,
        radius: RADIUS,
      });
    }
  };

  //request and get current user location
  useEffect(() => {
    const fetchAndSetCurrentLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Permission to access location was denied");
          setLoading(false);
          return;
        }
        let location = await Location.getCurrentPositionAsync({});
        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.002,
          longitudeDelta: 0.008
        };
        setInitialRegion(newRegion);

        let geocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        if (geocode.length > 0) {
          setPlaceName(geocode[0].formattedAddress);
          setPickUpDetails(geocode[0].formattedAddress);
        } else {
          setPlaceName("Unknown");
        }

        const { latitude, longitude } = location.coords;
        setCurrentLocation({ latitude, longitude });
        setBoundsBasedOnLocation(latitude, longitude);
        setLoading(false);
        const nearByFakeRides = [
          { id: 1, latitude: latitude + 0.001, longitude: longitude + 0.001, title: 'Ride 1' },
          { id: 2, latitude: latitude - 0.001, longitude: longitude - 0.001, title: 'Ride 2' },
          { id: 3, latitude: latitude + 0.002, longitude: longitude - 0.002, title: 'Ride 3' },
          { id: 4, latitude: latitude - 0.002, longitude: longitude + 0.002, title: 'Ride 4' },
        ];
        setFakeRidesNearUser(nearByFakeRides);

      } catch (err) {
        setError("Failed to fetch data 123");
        setLoading(false);
      }
    };
    fetchAndSetCurrentLocation();
  }, []);

  // Function to randomly move rides
  const moveRides = () => {
    setFakeRidesNearUser((prevRides) =>
      prevRides.map((ride) => ({
        ...ride,
        latitude: ride.latitude + (Math.random() - 0.5) * 0.001, // Small random movement
        longitude: ride.longitude + (Math.random() - 0.5) * 0.001,
      }))
    );
  };

  useEffect(() => {
    if (mapRef?.current && destination) {
      // Fit the map to cover both locations
      mapRef.current.fitToCoordinates(
        [currentLocation, destination], // Array of coordinates
        {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 }, // Padding around the markers
          animated: true, // Smooth animation
        }
      );
    }
  }, [destination]);

  useEffect(() => {
    // Start moving rides every 5 seconds
    intervalRef.current = setInterval(moveRides, 15000);
    return () => clearInterval(intervalRef.current);
  }, []);

  //get drivers in the vicinity
  useEffect(() => {
    currentLocation && getDriversInArea(currentLocation, setDriversNearBy);
  }, [destination]);

  // useEffect(() => {
  //   if (currentLocation && driverLocations.length > 0) {
  //     const driverArray = Object.values(driverLocations);
  //     const filteredDrivers = filterAndSortLocations(currentLocation, driverArray, maxDistance = 40000);

  //     setNearbyDrivers(filteredDrivers);
  //   }
  // }, [currentLocation, driverLocations]);

  // useEffect(() => {
  //   let interval;
  //   if (bottomSheetVisible) {
  //     interval = setInterval(() => {
  //       setProgress((prevProgress) => {
  //         if (prevProgress >= 1) {
  //           clearInterval(interval);
  //           setBottomSheetVisible(false);
  //           return prevProgress;
  //         }
  //         return prevProgress + 0.01;
  //       });
  //     }, 100);
  //   }
  //   return () => clearInterval(interval);
  // }, [bottomSheetVisible]);

  const handleRequestRide = async (driver) => {
    setSelectedDriver(driver);
    setRideInProgress(true);
    setWaitStart(true);

    try {
      await sendRideRequest(driver, currentLocation, destination);
    } catch (error) {
      console.log(error, "error");
    }
  };

  const handleTimeout = () => {
    Alert.alert("Request Timeout", "The ride request has timed out.");
    setSelectedDriver(null);
    setRideInProgress(false);
    setWaitStart(false);
  };

  const handleCancelRide = () => {
    Alert.alert("Ride Canceled", "You have canceled the ride request.");
    setSelectedDriver(null);
    setRideInProgress(false);
    setWaitStart(false);
  };

  // useEffect(() => {
  //   let timer;
  //   if (rideInProgress) {
  //     timer = setTimeout(() => {
  //       handleTimeout();
  //     }, 120000);
  //   }

  //   return () => clearTimeout(timer);
  // }, [rideInProgress]);

  if (!initialRegion) {
      return (
        <View style={styles.loaderFullScreen}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Getthing things ready...</Text>
        </View>
      );
    }

  if (error) {
    return (
      <View style={styles.loaderFullScreen}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  const handlePollResult = (data) => {
    setRideResponse(data);
    if(data.data.status === 'accepted'){
      setStopCondition(true);
      router.push('/ridePage');
    }
    else if (data.data.status === 'rejected') {
      setStopCondition(true); // Stop polling when condition is met
    }
  };

  return (
    <View style={{ height: "100%" }}>
      <MapView
        style={waitStart ? styles.cutMap : styles.fullMap}
        region={initialRegion}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        ref={mapRef}
      >
        {destination &&
          drivesNearBy &&
          drivesNearBy
            .filter(
              (driver) =>
                !selectedDriver || driver.driver_id === selectedDriver.driver_id
            )
            .map((driver) => (
              <Marker
                key={driver.driver_id}
                coordinate={{
                  latitude: parseFloat(driver.latitude),
                  longitude: parseFloat(driver.longitude),
                }}
                onPress={() => handleRequestRide(driver)}
              >
                {/* Use Marker callout or children directly */}
                <>
                  <View
                    style={{ justifyContent: "center", flexDirection: "row" }}
                  >
                    <Foundation
                      name="pricetag-multiple"
                      size={25}
                      color="green"
                    />
                    <Text>{driver?.discount || 0}%</Text>
                  </View>
                  <Image
                    source={AutoMarker}
                    style={{ height: 28, width: 28 }}
                  />
                </>
              </Marker>
            ))}

        {destination && (
          <ShowDirections pickup={currentLocation} destination={destination} />
        )}

        {/* show destination marker  */}
        {destination && (
          <Marker coordinate={destination} title="You are here">
            <FontAwesome5 name="map-marker-alt" size={24} color="red" />
          </Marker>
        )}

        {/* show animated rides near user location before entering destination */}
        {!destination && fakeRidesNearUser.map((ride) => (
          <Marker
            key={ride.id}
            coordinate={{
              latitude: ride.latitude,
              longitude: ride.longitude,
            }}
            title={ride.title}
            description="Moving Ride"
          >
            <Image
                    source={AutoMarker}
                    style={{ height: 24, width: 24 }}
                  />
          </Marker>
        ))}
      </MapView>

      {/* Show no driver message if no drivers nearby */}
      {destination && !drivesNearBy && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={visible}
          onRequestClose={closeModal}
        >
          <TouchableWithoutFeedback onPress={closeModal}>
            <View style={styles.modalContainer}>
              <TouchableWithoutFeedback>
                <View style={styles.alertBox}>
                  <Text style={styles.alertText}>No Drivers available at the moment! Please try after some time.</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

      {waitStart && (
        <GestureHandlerRootView>
          <WaitingBottomSheet progress={progress} />
        </GestureHandlerRootView>
      )}

      <View style={styles.inputsearchbar}>
        <InputLocation setDestination={setDestination} bounds={bounds} />
      </View>

      {/* {rideInProgress && (
        <TouchableOpacity
          onPress={handleCancelRide}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelButtonText}>Cancel Ride</Text>
        </TouchableOpacity>
      )} */}

      <PollingComponent 
        visibility={rideInProgress}
        pollFunction={checkRideStatus} 
        stopCondition={stopCondition}
        onPollResult={handlePollResult}    
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fullMap: {
    width: "100%",
    height: "100%",
  },
  cutMap: {
    width: "100%",
    height: "75%",
  },
  inputsearchbar: {
    position: "absolute",
    top: 55,
    left: 40,
    width: "80%",
  },
  loaderFullScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
  },
  cancelButton: {
    position: "absolute",
    bottom: 50,
    left: "50%",
    transform: [{ translateX: -50 }],
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertBox: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  alertText: {
    fontSize: 18,
    textAlign: "center",
  },
});
