import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import LoginForm from "./LoginForm";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import { Alert, Linking } from "react-native";

export default function App() {

const getLocationPermission = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status === "granted") {
    return true;
  } else if (status === "denied") {
    Alert.alert(
      "Location Permission Required",
      "Please enable location services to use this app",
      [{ text: "Go to Settings", onPress: () => Linking.openSettings() }]
    );
    return false;
  }
};

useEffect(() => {
  getLocationPermission();
}, []);



  return (
    <View style={styles.container}>
      <GestureHandlerRootView>
        <LoginForm />
      </GestureHandlerRootView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight,
  },
});
