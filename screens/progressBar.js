import React, { useState, useRef, useEffect, useContext } from "react";
import { View, Text, Animated, StyleSheet, Button } from "react-native";
import { AppContext } from "../context";
import magnifierImage from "../assets/magnifier.png";
import { db } from "../firebaseConfig";
import { ref, onValue } from "firebase/database";
import CustomNotification from "./customNotification";
import { router } from "expo-router";

const ProgressBar = () => {
  const [barWidth, setBarWidth] = useState(0);
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const magnifierPosition = useRef(
    new Animated.ValueXY({ x: 0, y: 0 })
  ).current;
  const {
    setIsCompleted,
    setRideAccept,
    selectedDriver,
    rideAccept
  } = useContext(AppContext);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [rideAccepted, setRideAccepted] = useState(false);
  const rideAcceptedRef = useRef(rideAccepted);

  const showNotification = () => {
    setNotificationVisible(true);
    setTimeout(() => {
      setNotificationVisible(false);
    }, 3000);
  };

  useEffect(() => {
    if (!selectedDriver) return;

    const dataRef = ref(db, `locations/drivers/${selectedDriver.id}/newRequest/status`);
    rideAcceptedRef.current = rideAccepted;
    const delayTimer = setTimeout(() => {
      const unsubscribe = onValue(dataRef, (snapshot) => {
        const newData = snapshot.val();
        setRideAccept(newData);

        if (newData === 'accepted') {
          
          setRideAccepted(true);
          setTimeout(()=> {
            router.push('/ridePage');
          }, 3000);
          
        } else if (newData === 'rejected') {
          setTimeout(()=> {
            router.push('/userDashboard');
          }, 1000);
          
        }
        showNotification();
      }, (error) => {
        console.error("Firebase listener error:", error);
      });

      const timeoutTimer = setTimeout(() => {
        if (!rideAcceptedRef.current) {
          router.push('/userDashboard');
        }
        unsubscribe();
      }, 90000);

      return () => {
        clearTimeout(delayTimer);
        clearTimeout(timeoutTimer);
        unsubscribe();
      };
    }, 1000);

    return () => {
      clearTimeout(delayTimer);
    };
  }, [selectedDriver, rideAccepted, db]);

  useEffect(() => {
    if (barWidth > 0) {
      Animated.timing(animatedWidth, {
        toValue: barWidth,
        duration: 15000,
        useNativeDriver: false,
      }).start(() => {
        setIsCompleted(true);
      });
    }
  }, [barWidth, animatedWidth, setIsCompleted]);

  useEffect(() => {
    const moveMagnitude = 10;
    Animated.loop(
      Animated.sequence([
        Animated.timing(magnifierPosition.x, {
          toValue: moveMagnitude,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(magnifierPosition.y, {
          toValue: moveMagnitude,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(magnifierPosition.x, {
          toValue: -moveMagnitude,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(magnifierPosition.y, {
          toValue: -moveMagnitude,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(magnifierPosition.x, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(magnifierPosition.y, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [magnifierPosition]);

  console.log(rideAccept, 'rideAccept');

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Finding Nearest ride ...</Text>
      <View
        style={styles.barContainer}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          if (width > 0 && width !== barWidth) {
            setBarWidth(width);
          }
        }}
      >
        <Animated.View style={[styles.filledBar, { width: animatedWidth }]} />
      </View>
      {rideAccepted && 
        <CustomNotification
        message={`Your ride request has been ${rideAccept}`}
        visible={notificationVisible}
        onClose={() => setNotificationVisible(false)}
      />
      }
      
      <View style={styles.magnifierContainer}>
        <Animated.Image
          source={magnifierImage}
          style={[
            styles.magnifier,
            {
              transform: [
                { translateX: magnifierPosition.x },
                { translateY: magnifierPosition.y },
              ],
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    color: "#333",
  },
  container: {
    width: "100%",
    paddingHorizontal: 20,
    marginVertical: 10,
    alignItems: "center",
  },
  barContainer: {
    height: 20,
    borderRadius: 10,
    backgroundColor: "#e0e0e0",
    overflow: "hidden",
    marginTop: 10,
    width: "100%",
  },
  filledBar: {
    height: "100%",
    backgroundColor: "#21D375",
    borderRadius: 10,
  },
  magnifierContainer: {
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  magnifier: {
    width: 50,
    height: 50,
  },
});

export default ProgressBar;
