import React, { useContext } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import UserDashboard from "./userDashboard";
import DriverDashboard from "./driverDashboard";
import { AppContext } from "../context";

const Dashboard = () => {
  const { role } = useContext(AppContext);

  if (role === "customer") {
    return <UserDashboard />;
  } else if (role === "driver") {
    return <DriverDashboard />;
  } else {
    return <Text>User type not defined properly.</Text>;
  }
};

export default Dashboard;
