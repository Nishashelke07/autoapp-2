import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set, getDatabase } from "firebase/database";
import { auth } from "../firebaseConfig";
import * as ImagePicker from "expo-image-picker";
import globalStyles from "../styles";
import { useRouter } from "expo-router";
import { registerUser } from "../services/registerUser";

export default function driversignUp() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [selectedValue, setSelectedValue] = useState("Pune");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [licenseIdPhoto, setLicenseIdPhoto] = useState(null);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [mobileNumberError, setMobileNumberError] = useState("");
  const [nameError, setNameError] = useState("");
  const [nameTouched, setNameTouched] = useState(false);

  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    setIsFormValid(
      validateName() &&
        validateEmail() &&
        validatePassword() &&
        validateMobileNumber() &&
        password === confirmPassword
    );
  }, [name, email, password, confirmPassword, mobileNumber]);

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError("Email cannot be empty.");
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = () => {
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    if (!password.trim()) {
      setPasswordError("Password cannot be empty.");
      return false;
    }
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return false;
    }
    if (!passwordRegex.test(password)) {
      setPasswordError(
        "Password must be minimum 8 characters and a combination of uppercase, lowercase, number and character."
      );
      return false;
    }
    setPasswordError("");
    return true;
  };

  const validateMobileNumber = () => {
    if (!mobileNumber.trim()) {
      setMobileNumberError("Mobile number cannot be empty.");
      return false;
    }
    if (!/^\d{10}$/.test(mobileNumber)) {
      setMobileNumberError("Please enter a valid mobile number.");
      return false;
    }
    setMobileNumberError("");
    return true;
  };

  const validateName = () => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!name.trim() && nameTouched) {
      setNameError("Name cannot be empty.");
      return false;
    }
    if (!nameRegex.test(name)) {
      setNameError("Please provide a valid name.");
      return false;
    }
    setNameError("");
    return true;
  };

  const pickImage = async (fromCamera) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Sorry, we need camera roll permissions to make this work!"
      );
      return;
    }

    let result;
    if (fromCamera) {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    }

    if (!result.cancelled) {
      setLicenseIdPhoto(result.uri);
    }
  };

  const createUserinDB = async () => {
    if (!isFormValid) {
      Alert.alert(
        "Validation Error",
        "Please ensure all fields are correctly filled and passwords match."
      );
      return;
    }

    setLoading(true);
    try {
      const driverData = {
        name: name,
        email: email,
        password: password,
        phone: mobileNumber,
        "role": "driver",
        "vehicle_number": vehicleNumber,
        "license_photo": licenseIdPhoto
      };

      registerUser(driverData, router);
      
    } catch (error) {
      console.log("Error creating user in DB:", error);
      if (error.code === "auth/email-already-in-use") {
        Alert.alert(
          "Sign Up Failed",
          "This email is already in use by another account."
        );
      } else {
        Alert.alert("Sign Up Failed", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={globalStyles.container}>
      <ImageBackground style={styles.signImg}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
            <Text style={styles.boldText}>Plan Your Ride!!</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Name*"
                value={name}
                onChangeText={setName}
                style={styles.inputText}
                onBlur={() => setNameTouched(true)}
              />
              {nameError ? <Text style={styles.error}>{nameError}</Text> : null}
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Email*"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                style={styles.inputText}
                onBlur={validateEmail}
              />
              {emailError ? (
                <Text style={styles.error}>{emailError}</Text>
              ) : null}
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Password*"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                style={styles.inputText}
                onBlur={validatePassword}
              />
              {passwordError ? (
                <Text style={styles.error}>{passwordError}</Text>
              ) : null}
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Confirm Password*"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={true}
                style={styles.inputText}
              />
            </View>
            <View style={styles.inputWrapperMobile}>
              <TextInput
                style={styles.countryCode}
                value="+91"
                editable={false}
              />
              <TextInput
                style={styles.phoneNumber}
                placeholder="Mobile*"
                keyboardType="phone-pad"
                value={mobileNumber}
                onChangeText={setMobileNumber}
                onBlur={validateMobileNumber}
              />
              {mobileNumberError ? (
                <Text style={styles.error}>{mobileNumberError}</Text>
              ) : null}
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Vehicle Number"
                value={vehicleNumber}
                onChangeText={setVehicleNumber}
                style={styles.inputText}
              />
            </View>
            <View style={styles.photoButtonContainer}>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={() => pickImage(true)}
              >
                <Text style={styles.photoButtonText}>
                  Take License ID Photo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={() => pickImage(false)}
              >
                <Text style={styles.photoButtonText}>
                  Upload License ID Photo
                </Text>
              </TouchableOpacity>
            </View>
            {licenseIdPhoto && (
              <Image
                source={{ uri: licenseIdPhoto }}
                style={styles.imagePreview}
              />
            )}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={
                  isFormValid
                    ? styles.verificationButton
                    : styles.disabledButton
                }
                disabled={!isFormValid}
              >
                <Text style={styles.verificationButtonText}>Verify</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={
                  isFormValid && password === confirmPassword
                    ? styles.registerButton
                    : styles.disabledButton
                }
                onPress={createUserinDB}
                disabled={!isFormValid || password !== confirmPassword}
              >
                <Text style={styles.buttonTextRegister}>SIGN UP</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  signImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
  },
  boldText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  vehicleNumber: {
    marginBottom: 10,
    width: "80%",
  },
  inputWrapperMobile: {
    flexDirection: "row",
    marginBottom: 10,
    width: "80%",
    alignItems: "center",
  },
  inputText: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    width: "100%",
  },
  inputWrapper: {
    width: "80%",
    padding: 5,
    marginBottom: 5,
  },
  inputField: {
    marginBottom: 10,
  },
  countryCode: {
    width: "15%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    textAlign: "center",
  },
  phoneNumber: {
    width: "85%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
    width: "80%",
    justifyContent: "center",
  },
  dropdown: {
    height: 40,
    width: "100%",
  },
  photoButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    width: "80%",
  },
  photoButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
  },
  photoButtonText: {
    color: "white",
    textAlign: "center",
  },
  imagePreview: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginBottom: 10,
  },
  buttonContainer: {
    width: "80%",
    alignItems: "center",
  },
  registerButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonTextRegister: {
    color: "white",
  },
  disabledButton: {
    backgroundColor: "#aaa",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  disabledText: {
    color: "white",
  },
  verificationButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  verificationButtonText: {
    color: "white",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
});
