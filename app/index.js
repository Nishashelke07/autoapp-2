import React from "react";
import { StyleSheet, View } from "react-native";
import LoginForm from "./LoginForm";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from "expo-status-bar";
import DriverDashboard from "./driverDashboard";
import UserDashboard from "./userDashboard";

export default function App() {
  return (
    <View style={styles.container}>
      <GestureHandlerRootView> 
        <LoginForm />
        {/* <DriverDashboard /> */}
        {/* <UserDashboard /> */}
      </GestureHandlerRootView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight
  }
});
