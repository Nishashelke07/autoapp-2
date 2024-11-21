import React, { useContext } from "react";
import { View, StyleSheet } from "react-native";
import DriverInfoSheet from "../screens/driverInfoSheet";
import MapView, { Marker } from "react-native-maps";
import { AppContext } from "../context";
import { FontAwesome5 } from "@expo/vector-icons";
import MapViewDirections from "react-native-maps-directions";

export default function RidePage(props) {
  const {destination, currentLocation} = useContext(AppContext);
  const key= "AIzaSyDo1tnDHs2gmgdo9fPsig6KBaoz0zIz9zc";


  return (
    <View style={styles.container}>
      <MapView
        style={styles.fullMap}
        region={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
      > 
      <MapViewDirections
              origin={currentLocation}
              destination={destination}
              apikey={key}
              strokeWidth={3}
              strokeColor="#1E90FF"
            />

              <Marker coordinate={destination} title="You are here">
                <FontAwesome5 name="map-marker-alt" size={24} color="red" />
              </Marker>
      </MapView>
      <DriverInfoSheet />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    // height: "100%",
  },
  fullMap: {
    width: "100%",
    height: "50%",
  },
});
