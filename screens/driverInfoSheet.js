import React, { useRef, useMemo, useState, useContext } from "react";
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, Linking } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Entypo, SimpleLineIcons, Ionicons, Octicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import Ricksaw from '../assets/ricksaw.png';
import CancelReasonsModal from "./cancelModal";
import { AppContext } from "../context";

export default function DriverInfoSheet() {
  const {pickUpDetails, selectedDriver} = useContext(AppContext);

  const sheetRef = useRef(null);
  const snapPoints = useMemo(() => ["100%"], []);
  const [cancelReasonModal, setCancelReasonModal] = useState(false);

  const dialService = () => {
    let url = `tel:${selectedDriver?.mobile || '9876543210'}`;
    Linking.openURL(url);
  };

  return (
    <GestureHandlerRootView>
      <BottomSheet ref={sheetRef} snapPoints={snapPoints} index={0}>

      <Text style={{fontSize: 16, color: "#1e90ff", fontWeight: 500, textAlign: 'center', marginBottom: 8 }}> Captain on the Way! </Text>
          <View style={styles.rideContainer}>
            <View>
              <Text style={styles.rideText}>{selectedDriver?.vehicleNumber} </Text>
              <Text style={{ fontSize: 18, fontWeight: "500" }}> {selectedDriver?.name || "test1"} </Text>
              <Text style={{ fontWeight: "500", fontSize: 18 }}>
                OTP : 9867
              </Text>
              <Text>
                4.1
                <Entypo name="star" size={20} color="#FDDE55" />
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "flex-start" }}
            >
              <SimpleLineIcons name="user" size={42} color="black" />
              <Image source={Ricksaw} style={styles.imgAuto} />
            </View>
          </View>


          <View style={styles.contactContainer}>
            <TouchableOpacity onPress={dialService}> 
            <Ionicons
              name="call"
              size={20}
              color="black"
              style={{ borderWidth: 0.8, padding: 5, borderRadius: 16 }}
            />
            </TouchableOpacity>
            <View
              style={{
                borderWidth: 0.2,
                margin: 10,
                padding: 4,
                paddingHorizontal: 16,
                borderRadius: 12,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <TextInput style={{ fontSize: 14 }}>
                Message your driver..
              </TextInput>
              <Ionicons
                name="arrow-forward-circle"
                size={24}
                color="black"
                style={{ marginLeft: 5 }}
              />
            </View>
          </View>

          <Text style={{ fontSize: 14, textAlign: "center" }}>
            Pickup Point :
          </Text>
          <Text style={styles.pickUpText}> {pickUpDetails.slice(0, 50)}</Text>
          



          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.buttonCancel}
              onPress={()=>setCancelReasonModal(true)}
            >
              <Text style={styles.buttonText}> CANCEL </Text>
              <Entypo name="cross" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}> SUPPORT </Text>
              <MaterialIcons name="support-agent" size={24} color="black" />
            </TouchableOpacity>
          </View>
          {
            cancelReasonModal && <CancelReasonsModal />
          }
        
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // padding: 20,
    backgroundColor: "#f0f0f0",
  },
  rideText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  rideContainer: {
    flexDirection: "row",
    backgroundColor: "whitesmoke",
    justifyContent: "space-between",
    padding: 15,
    paddingVertical: 25,
    borderRadius: 12,
  },
  imgAuto: {
    height: 45,
    width: 45,
    marginBottom: 4,
    marginRight: 20,
    padding: 20
  },
  contactContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  pickUpText: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    borderBottomWidth: 0.6,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginHorizontal: 24,
    paddingBottom: 4,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
  },
  buttonCancel: {
    borderWidth: 0.3,
    padding: 6,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginVertical: 20,
    flexDirection: "row",
    backgroundColor: "whitesmoke",
  },
  button: {
    borderWidth: 0.3,
    padding: 6,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginVertical: 20,
    flexDirection: "row",
    backgroundColor: "#21D375",
  }

});
