import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  Alert,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set, getDatabase } from "firebase/database";
import { auth } from "../firebaseConfig";
import globalStyles from "../styles";
import { useRouter } from "expo-router";

export default function usersignUp() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [selectedValue, setSelectedValue] = useState("Pune");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [mobileNumberError, setMobileNumberError] = useState("");
  const [nameError, setNameError] = useState("");
  const [cfPasswordError, setConfirmPasswordError] = useState("");

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

  const validateConfirmPassword = () => {
    if (confirmPassword !== password) {
      setConfirmPasswordError(
        "Passwords do not match!"
      );
      return false;
    }
    setConfirmPasswordError("");
    return true;
  }

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
    if (!name.trim()) {
      setNameError("Name cannot be empty.");
      return false;
    }
    if(name.length < 3) {
      setNameError("Please provide full name");
      return false;
    }
    if (!nameRegex.test(name)) {
      setNameError("Please provide a valid name.");
      return false;
    }
    setNameError("");
    return true;
  };

  const createUserinDB = async () => {
    if (
      validateName() &&
      validateEmail() &&
      validatePassword() &&
      validateMobileNumber() &&
      validateConfirmPassword()
    )
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userId = userCredential.user.uid;
      const db = getDatabase();

      const userData = {
        email,
        name,
        city: selectedValue,
        mobile: mobileNumber,
        createdAt: new Date().toISOString(),
        type: "customer",
      };

      await set(ref(db, "users/" + userId), userData);
      Alert.alert(
        "Account created",
        "Your account has been successfully created!"
      );
      router.push("/LoginForm");
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
                keyboardType="text"
                onChangeText={setName}
                style={styles.inputText}
                onBlur={validateName}
              />
              { nameError ? <Text style={styles.error}>{nameError}</Text> : null}
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
                onBlur={validateConfirmPassword}
              />
              {cfPasswordError ? (
                <Text style={styles.error}>{cfPasswordError}</Text>
              ) : null}
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
              
            </View>
            {mobileNumberError ? (
                <Text style={styles.error}>{mobileNumberError}</Text>
              ) : null}
            <View style={styles.buttonContainer}>
            {name && email && mobileNumber && password && confirmPassword ? (
              <TouchableOpacity
                style={styles.registerButton}
                onPress={createUserinDB}
              >
                <Text style={styles.buttonTextRegister}>SIGN UP</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.disabledButton}
                onPress={createUserinDB}
                disabled={true}
              >
                <Text style={styles.disabledText}>SIGN UP</Text>
              </TouchableOpacity>
            )}
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
