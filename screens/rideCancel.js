import {
    StyleSheet,
    View,
    Text,
    Modal,
    TouchableOpacity,
    ActivityIndicator
  } from "react-native";
  import React, { useState } from "react";
import { router } from "expo-router";
  
  export default function RideCancel(props) {
    const { closeRideCancelModal } = props;
    const [loading, setLoading] = useState(false);
  
    const handleCancelRide = () => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      router.push('/userDashboard');

      }, 2500);
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
            {loading ? (
              <View  style={{height: 300, justifyContent: 'center'}}> 
              <ActivityIndicator size="large" color="#0000ff" />
              </View>
            ) : (
              <>
                <Text style={{ fontSize: 18, fontWeight: "500" }}>
                  SURE YOU WANT TO CANCEL THE RIDE?
                </Text>
                <Text style={{ fontSize: 16, margin: 10, marginTop: 0 }}>
                  You may be charged ₹50 as cancellation fee. Since, your driver is on the
                  way!
                </Text>
  
                <View
                  style={{ flexDirection: "row", justifyContent: "space-around" }}
                >
                  <TouchableOpacity
                    style={styles.yesButton}
                    onPress={closeRideCancelModal}
                  >
                    <Text style={styles.switchText}>NO</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelbutton}
                    onPress={handleCancelRide}
                  >
                    <Text style={styles.switchText}>YES, CANCEL</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    );
  }
  const styles = StyleSheet.create({
    modal: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
    },
    modalContent: {
      backgroundColor: "#ffffff",
      paddingHorizontal: 40,
      paddingVertical: 20,
      borderRadius: 8,
      width: "100%",
      // height: "40%",
      bottom: 0,
      gap: 10,
    },
    switchText: {
      fontWeight: "400",
      fontSize: 16,
    },
    textBold: {
      fontWeight: "bold",
      textAlign: "center",
      fontSize: 16,
    },
    cancelbutton: {
      alignItems: "center",
      borderWidth: 0.2,
      width: 120,
      fontWeight: "500",
      padding: 5,
      borderRadius: 12,
      backgroundColor: "#21D375",
    },
    yesButton: {
      alignItems: "center",
      borderWidth: 0.2,
      width: 120,
      fontWeight: "500",
      padding: 5,
      borderRadius: 12,
      backgroundColor: "whitesmoke",
    },
    textBold: {
      fontWeight: "500",
      fontSize: 15,
      paddingLeft: 15,
    },
    button: {
      backgroundColor: "#21D375",
      width: 200,
      marginLeft: "auto",
      marginRight: "auto",
      padding: 12,
      borderRadius: 8,
      marginVertical: 8,
    },
  });
  