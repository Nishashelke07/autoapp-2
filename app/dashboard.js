import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import UserDashboard from "./userDashboard";
import DriverDashboard from "./driverDashboard";
import { getDatabase, ref, child, get } from "firebase/database";
import { AppContext } from "../context";

const Dashboard = () => {
  const { authInfo } = useContext(AppContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authInfo?.uid) {
      console.log(
        "No authInfo UID found, defaulting to login or user selection screen."
      );
      setLoading(false);
      return;
    }

    const dbRef = ref(getDatabase());
    get(child(dbRef, `users/${authInfo.uid}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          console.log("Fetched user data:", userData);
          setUser(userData);
        } else {
          console.log("No user data available for UID:", authInfo.uid);
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [authInfo.uid]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!user) {
    return <Text>No user data available or not logged in.</Text>;
  }

  if (user.type === "customer") {
    return <UserDashboard user={user} />;
  } else if (user.type === "driver") {
    return <DriverDashboard />;
  } else {
    return <Text>User type not defined properly.</Text>;
  }
};

export default Dashboard;
