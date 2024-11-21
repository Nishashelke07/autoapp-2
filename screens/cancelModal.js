import {
    StyleSheet,
    View,
    Text,
    Modal,
    TextInput,
    TouchableOpacity,
    FlatList,
  } from "react-native";
  import React, { useState } from "react";
  import { RadioButton } from "react-native-paper";
import RideCancel from "./rideCancel";
  
  export default function CancelReasonsModal(props) {
    const [checked, setChecked] = useState();
    const [rideCancelModal, setrideCancelModal] = useState(false);
    
      const closeRideCancelModal = () => {
        setrideCancelModal(false);
      };

        const handleRadioChange = (value) => {
            setChecked(value);
        };
  
    return (
      <Modal
        animationType="slide"
        transparent={true}
        //   visible={modalVisible}
        //   onRequestClose={closeModal}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.switchText}>Choose a reason</Text>
            <RadioButton.Group onValueChange={handleRadioChange} value={checked}>
            <RadioButton.Item
              style={{ borderBottomWidth: 0.2 }}
              label="Accepted by accident"
              value="Accepted by accident"
            />
            <RadioButton.Item
              style={{ borderBottomWidth: 0.2 }}
              label="Problem with Pick up route"
              value="Problem with Pick up route"
            />
            <RadioButton.Item
              style={{ borderBottomWidth: 0.2 }}
              label="Too many riders"
              value="Too many riders"
            />
            <RadioButton.Item
              style={{ borderBottomWidth: 0.2 }}
              label="Wrong address chosen"
              value="Wrong address chosen"
            />
            <RadioButton.Item
              style={{ borderBottomWidth: 0.2 }}
              label="Waiting time too long"
              value="Waiting time too long"
            />
            <RadioButton.Item
              style={{ borderBottomWidth: 0.2 }}
              label="Change of Destination"
              value="Change of Destination"
            />
          </RadioButton.Group>
          {rideCancelModal == true && (
            <RideCancel
              closeRideCancelModal={closeRideCancelModal}
            />
          )}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.buttonCancel}
            //   onPress={()=>setrideCancelModal(true)}
            >
              <Text style={styles.buttonText}> Cancel </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={()=>setrideCancelModal(true)}>
              <Text style={styles.buttonText}> Next </Text>
            </TouchableOpacity>
          </View>
            
          </View>
        </View>
      </Modal>
    );
  }
  const styles = StyleSheet.create({
    modal: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0, 0, 0, 0.2)",
    },
    modalContent: {
      // backgroundColor: "#ffffff",
      // padding: 60,
      paddingHorizontal: 40,
      paddingVertical: 20,
      borderRadius: 8,
      // justifyContent: "center",
      backgroundColor: "#ffffff",
      width: "100%",
    //   height: "95%",
      bottom: 0,
      gap: 10,
    },
    switchText: {
      fontWeight: "bold",
      fontSize: 28,
      textAlign: "center",
    },
    textBold: {
      fontWeight: "bold",
      textAlign: "center",
      fontSize: 16,
    },
    buttons: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 15,
      },
      buttonText: {
        fontSize: 16,
        fontWeight: "500",
      },
      button: {
        borderWidth: 0.3,
        padding: 6,
        paddingHorizontal: 24,
        borderRadius: 16,
        marginVertical: 20,
        backgroundColor: "#21D375",
        width: 100,
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
  });
  