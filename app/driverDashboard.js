import React, { useState, useRef, useEffect, useContext } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  StatusBar,
  Modal,
  Alert,
} from "react-native";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import { FontAwesome5 } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getDatabase, ref, onValue, update } from "firebase/database";
import { AppContext } from "../context";
import ShowDirections from "../screens/showDirections";

const auth = getAuth();
const database = getDatabase();

const DriverDashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [initialRegion, setInitialRegion] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [rideRequest, setRideRequest] = useState(null);
  const [countdown, setCountdown] = useState(120);
  const [fare, setFare] = useState(330);
  const [discount, setDiscount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [driverLocation, setDriverLocation] = useState(null);

  const { pickUpDetails } = useContext(AppContext);
  const navigation = useNavigation();
  const mapRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserInfo({
          id: user.uid,
          email: user.email,
          phone: user.phoneNumber,
          vehicleNumber: user.vehicleNumber,
        });
      } else {
        setUserInfo(null);
        navigation.navigate("LoginForm");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let timer;
    if (rideRequest) {
      setCountdown(120);
      timer = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown <= 1) {
            handleTimeout();
            return 0;
          }
          return prevCountdown - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [rideRequest]);

  useEffect(() => {
    if (userInfo && userInfo.id) {
      subscribeToRideRequests(userInfo.id);
    }
  }, [userInfo]);

  useEffect(() => {
    const getCurrentLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setInitialRegion(newRegion);
      setDriverLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    };

    getCurrentLocation();
  }, []);

  const handleTimeout = () => {
    if (userInfo && rideRequest) {
      Alert.alert("Request Timeout", "The ride request has timed out.");
      setRideRequest(null);
    }
  };

  const subscribeToRideRequests = (driverId) => {
    const requestsRef = ref(
      database,
      `/locations/drivers/${driverId}/newRequest`
    );
    onValue(requestsRef, (snapshot) => {
      if (snapshot.exists()) {
        const requestData = snapshot.val();
        const requestKeys = Object.keys(requestData);
        if (requestKeys.length > 0) {
          const firstRequestKey = requestKeys[0];
          const requestDetails = requestData[firstRequestKey];
          requestDetails.id = firstRequestKey;
          console.log("Ride request data:", requestDetails);
          setRideRequest(requestDetails);
          setFare(330);
        } else {
          setRideRequest(null);
        }
      } else {
        setRideRequest(null);
      }
    });
  };

  const updateDriverLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.error("Permission to access location was denied");
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    const newRegion = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };
    setInitialRegion(newRegion);
    setDriverLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    mapRef.current?.animateToRegion(newRegion, 1000);

    if (userInfo && userInfo.id) {
      const driverRef = ref(database, `/locations/drivers/${userInfo.id}`);
      await update(driverRef, {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        visible: isVisible,
      });
    }
  };

  const toggleVisibility = async () => {
    const newVisibility = !isVisible;
    setIsVisible(newVisibility);

    if (newVisibility) {
      setModalVisible(true);
      await updateDriverLocation();
    }
  };

  const handleDiscountSelection = (percentage) => {
    setDiscount(percentage);
    updateDiscountInDatabase(percentage);
    setModalVisible(false);
  };

  const updateDiscountInDatabase = (percentage) => {
    if (userInfo && userInfo.id) {
      const driverRef = ref(database, `/locations/drivers/${userInfo.id}`);
      update(driverRef, { discount: percentage })
        .then(() => {
          console.log("Discount updated in database:", percentage);
        })
        .catch((error) => {
          console.error("Error updating discount:", error);
        });
    }
  };

  const handleAcceptRide = () => {
    if (userInfo && rideRequest) {
      const requestRef = ref(
        database,
        `/locations/drivers/${userInfo.id}/newRequest`
      );
      update(requestRef, { status: "accepted" })
        .then(() => {
          Alert.alert("Ride Accepted", "You have accepted the ride request.");
          startRideToPickup();
        })
        .catch((error) => {
          console.error("Error accepting the ride:", error);
        });
    }
  };

  const startRideToPickup = async () => {
    try {
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setDriverLocation({
        latitude,
        longitude,
      });

      const updateInterval = setInterval(async () => {
        location = await Location.getCurrentPositionAsync({});
        const { latitude: newLatitude, longitude: newLongitude } =
          location.coords;
        updateDriverLocationInDatabase(newLatitude, newLongitude);
        setDriverLocation({
          latitude: newLatitude,
          longitude: newLongitude,
        });

        if (
          rideRequest &&
          rideRequest.pickUp &&
          getDistance(
            newLatitude,
            newLongitude,
            rideRequest.pickUp.latitude,
            rideRequest.pickUp.longitude
          ) < 1
        ) {
          clearInterval(updateInterval);
          Alert.alert(
            "Pickup Reached",
            "You have reached the pickup location."
          );
        }
      }, 10000); // Update every 10 seconds
    } catch (error) {
      console.error("Error starting the ride:", error);
    }
  };

  const updateDriverLocationInDatabase = async (latitude, longitude) => {
    if (userInfo && userInfo.id) {
      const driverRef = ref(database, `/locations/drivers/${userInfo.id}`);
      await update(driverRef, {
        latitude: latitude,
        longitude: longitude,
        visible: isVisible,
      });
    }
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371e3; // Radius of the Earth in meters
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // in meters
    return distance;
  };

  const handleLogout = () => {
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
  const handleRejectRide = () => {
    if (userInfo && rideRequest) {
      const requestRef = ref(
        database,
        `/locations/drivers/${userInfo.id}/newRequest`
      );
      update(requestRef, { status: "rejected" });
      Alert.alert("Ride Rejected", "You have rejected the ride request.");
    }
  };

  if (!userInfo || !initialRegion) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Setting up dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#4caf50" barStyle="light-content" />
      <LinearGradient
        colors={["#4c669f", "#3b5998", "#192f6a"]}
        style={styles.dashContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate("Profile")}
          style={styles.profileContainer}
        >
          <FontAwesome5 name="user" size={24} color="white" />
          <Text style={styles.userName}>{userInfo.email}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={toggleVisibility}
          style={styles.visibilityButton}
        >
          <Text style={styles.visibilityButtonText}>
            {isVisible ? "Visibility Off" : "Visibility On"}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
      <View style={styles.logoutButtonContainer}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={initialRegion}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        {driverLocation && (
          <Marker coordinate={driverLocation}>
            <Callout style={styles.calloutStyle}>
              <Text style={styles.calloutText}>Driver: {userInfo.email}</Text>
              <Text style={styles.calloutText}>Phone: {userInfo.phone}</Text>
              <Text style={styles.calloutText}>
                Vehicle No: {userInfo.vehicleNumber}
              </Text>
            </Callout>
          </Marker>
        )}

        {rideRequest &&
          rideRequest.pickUp &&
          rideRequest.pickUp.latitude &&
          rideRequest.pickUp.longitude && (
            <Marker
              coordinate={{
                latitude: rideRequest.pickUp.latitude,
                longitude: rideRequest.pickUp.longitude,
              }}
              pinColor="blue"
            >
              <Callout>
                <Text>Pickup Location: {rideRequest.pickUp.name}</Text>
              </Callout>
            </Marker>
          )}

        {driverLocation && rideRequest && rideRequest.pickUp && (
          <ShowDirections
            pickup={driverLocation}
            destination={{
              latitude: rideRequest.pickUp.latitude,
              longitude: rideRequest.pickUp.longitude,
            }}
          />
        )}
      </MapView>

      {isVisible && rideRequest && (
        <View style={styles.notificationContainer}>
          <Text style={styles.notificationText}>
            Customer: {rideRequest.customer}
          </Text>
          <Text style={styles.notificationText}>
            Ride Request from: {rideRequest?.pickUp?.name}
          </Text>
          <Text style={styles.notificationText}>
            Destination: {rideRequest?.drop?.name}
          </Text>
          <Text style={styles.notificationText}>Current Fare: ₹{fare}</Text>
          <Text style={styles.notificationText}>
            Today's Discount: {discount}%
          </Text>
          <Text style={styles.notificationText}>
            Time remaining: {Math.floor(countdown / 60)}:
            {countdown % 60 < 10 ? `0${countdown % 60}` : countdown % 60}
          </Text>
          <TouchableOpacity
            onPress={handleAcceptRide}
            style={styles.acceptButton}
          >
            <Text style={styles.acceptButtonText}>Accept Ride</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleRejectRide}
            style={styles.rejectButton}
          >
            <Text style={styles.rejectButtonText}>Reject Ride</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Today's Discount</Text>
            {[
              { label: "0% Discount", percentage: 0 },
              { label: "5% Discount", percentage: 5 },
              { label: "10% Discount", percentage: 10 },
              { label: "20% Discount", percentage: 20 },
            ].map((option) => (
              <TouchableOpacity
                key={option.percentage}
                onPress={() => handleDiscountSelection(option.percentage)}
                style={styles.optionButton}
              >
                <LinearGradient
                  colors={["#4c669f", "#3b5998", "#192f6a"]}
                  style={styles.gradientButton}
                >
                  <Text style={styles.optionButtonText}>{option.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dashContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    padding: 10,
    borderRadius: 30,
    elevation: 3,
    zIndex: 999,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    color: "white",
    marginLeft: 5,
    fontWeight: "bold",
  },
  visibilityButton: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    padding: 10,
    borderRadius: 20,
  },
  visibilityButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  calloutStyle: {
    width: 220,
    paddingHorizontal: 10,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  calloutText: {
    fontSize: 14,
    color: "black",
  },
  notificationContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    padding: 15,
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius: 10,
    alignItems: "center",
  },
  notificationText: {
    color: "white",
    fontSize: 16,
    marginBottom: 5,
  },
  acceptButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  acceptButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  rejectButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  rejectButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 300,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  optionButton: {
    width: "100%",
    marginBottom: 10,
  },
  gradientButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  optionButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  logoutButtonContainer: {
    position: "absolute",
    bottom: 35,
    right: 30, 
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

export default DriverDashboard;
