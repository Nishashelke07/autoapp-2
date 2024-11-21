import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import InputLocation from "./inputLocation";
import * as Location from "expo-location";
import React, { useState, useEffect, useContext } from "react";
import { ref, set } from "firebase/database";
import { db } from "../firebaseConfig";
import {
  filterAndSortLocations,
  getCurrentDrivesOnline,
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

  useEffect(() => {
    const fetchLocationAndDrivers = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Permission to access location was denied");
          setLoading(false);
          return;
        }
        let location = await Location.getCurrentPositionAsync({});

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
        getCurrentDrivesOnline((response) => {
          setDriverLocations(response);
          setLoading(false);
        });
      } catch (err) {
        setError("Failed to fetch data");
        setLoading(false);
      }
    };
    fetchLocationAndDrivers();
  }, []);

  useEffect(() => {
    if (currentLocation && driverLocations.length > 0) {
      const driverArray = Object.values(driverLocations);
      const filteredDrivers = filterAndSortLocations(currentLocation, driverArray, maxDistance = 40000);
  
      console.log("Filtered Drivers:", filteredDrivers);
      setNearbyDrivers(filteredDrivers);
    }
  }, [currentLocation, driverLocations]);
  

  useEffect(() => {
    let interval;
    if (bottomSheetVisible) {
      interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 1) {
            clearInterval(interval);
            setBottomSheetVisible(false);
            return prevProgress;
          }
          return prevProgress + 0.01;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [bottomSheetVisible]);

  const handleRequestRide = (driver) => {
    setSelectedDriver(driver);
    setRideInProgress(true);
    setWaitStart(true);

    const userRef = ref(
      db,
      "locations/" +
        "drivers/" +
        `${driver.id}/` +
        "newRequest/" +
        `${authInfo.uid}/`
    );
    try {
      set(userRef, {
        pickUp: { currentLocation, name: placeName },
        drop: destination,
        customer: user?.name,
      });
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

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        Alert.alert("Logged Out", "You have been successfully logged out.");
        navigation.navigate("LoginForm");
      })
      .catch((error) => {
        console.error("Error logging out:", error);
        Alert.alert("Error", "Failed to log out. Please try again.");
      });
  };

  useEffect(() => {
    let timer;
    if (rideInProgress) {
      timer = setTimeout(() => {
        handleTimeout();
      }, 120000);
    }

    return () => clearTimeout(timer);
  }, [rideInProgress]);

  if (loading) {
    return (
      <View style={styles.text}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Setting up things...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.text}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={{ height: "100%" }}>
      <MapView
        style={waitStart ? styles.cutMap : styles.fullMap}
        region={{
          latitude: currentLocation.latitude || 37.78825,
          longitude: currentLocation.longitude || -122.4324,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
      >
        {destination ? (
          nearbyDrivers.length > 0 ? (
            <View>
              {nearbyDrivers
                .filter(
                  (driver) => !selectedDriver || driver.id === selectedDriver.id
                )
                .map((driver) => (
                  <Marker
                    key={driver.id}
                    coordinate={{
                      latitude: driver.latitude,
                      longitude: driver.longitude,
                    }}
                    title={driver?.name || ""}
                    onPress={() => handleRequestRide(driver)}
                    style={{
                      justifyContent: "center",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Text>{driver.name}</Text>

                    <View
                      style={{ justifyContent: "center", flexDirection: "row" }}
                    >
                      <Foundation
                        name="pricetag-multiple"
                        size={25}
                        color="green"
                      />
                      <Text>{driver.discount || 0}% </Text>
                    </View>
                    <Image
                      source={AutoMarker}
                      style={{ height: 28, width: 28 }}
                    />
                  </Marker>
                ))}

              {selectedDriver && (
                <ShowDirections
                  pickup={currentLocation}
                  destination={destination}
                />
              )}

              <Marker coordinate={destination} title="You are here">
                <FontAwesome5 name="map-marker-alt" size={24} color="red" />
              </Marker>
            </View>
          ) : (
            <Text>No drivers found within 1km.</Text>
          )
        ) : (
          ""
        )}
      </MapView>

      {waitStart && (
        <GestureHandlerRootView>
          <WaitingBottomSheet progress={progress} />
        </GestureHandlerRootView>
      )}

      <View style={styles.inputsearchbar}>
        <InputLocation setDestination={setDestination} bounds={bounds} />
      </View>

      {rideInProgress && (
        <TouchableOpacity
          onPress={handleCancelRide}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelButtonText}>Cancel Ride</Text>
        </TouchableOpacity>
      )}
      <View style={styles.logoutButtonContainer}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
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
  text: {
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
  logoutButtonContainer: {
    position: "absolute",
    bottom: 35, // Align with dashContainer
    right: 30, // Position beside the visibility button
    zIndex: 1000,
  },
  logoutButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 20,
  },
  logoutButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
