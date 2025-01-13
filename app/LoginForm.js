import { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
  ActivityIndicator,
} from "react-native";
import Rikshaw from "../assets/ricksaw.png";
import { router } from "expo-router";
import { AppContext } from "../context";
import axios from "axios";
import Constants from 'expo-constants';
import { login, saveAccessToken } from "../services/authService";

export default function LoginForm() {
  const { role, setRole } = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const toggleSwitch = () => {
    setRole((prevRole) => (prevRole === "customer" ? "driver" : "customer"));
  };

  const signIn = async () => {
    setLoading(true);
    try {
      const payload = {
        email,
        password,
        role
      };

      const response = await login(payload);
      await saveAccessToken(response.token);
      if (response.status === 1) {
        router.push("/dashboard");
      }
      else {
        Alert.alert("Sign in failed: " + response.data.message)
      }
    } catch (error) {
      console.log(error, "Error");
      Alert.alert("Sign in failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const driversignUp = async () => {
    router.push("/driversignUp");
  };
  const usersignUp = async () => {
    router.push("/usersignUp");
  };

  return (
    <View style={styles.mainContainer}>
      <Image source={Rikshaw} style={styles.logo} />
      <TextInput
        style={styles.inputField}
        value={email}
        onChangeText={(text) => setEmail(text)}
        autoCapitalize="none"
        placeholder="Email"
      ></TextInput>
      <TextInput
        style={styles.inputField}
        secureTextEntry={true}
        value={password}
        onChangeText={(text) => setPassword(text)}
        placeholder="Password"
        autoCapitalize="none"
      ></TextInput>

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={{fontSize: 14, fontWeight: "600"}}>{role.toUpperCase()} </Text>

        <Switch
          trackColor={{ false: "#4CAF50", true: "#81b0ff" }}
          thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          value={role === "driver"}
          onValueChange={toggleSwitch}
        />
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity onPress={signIn} style={styles.button}>
          <Text style={styles.textBold}>LOGIN</Text>
        </TouchableOpacity>
        {
          loading && <ActivityIndicator size='large' color="#0000ff"/>
        }
        <View style={styles.signUpButton}>
          <TouchableOpacity onPress={usersignUp}>
            <Text style={styles.signupText}>for Customer</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={driversignUp}>
            <Text style={styles.signupText}>for Driver</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  mainContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    gap: 5,
  },
  inputField: {
    backgroundColor: "#e1e1e1",
    padding: 7,
    width: "70%",
    borderRadius: 8,
  },
  buttons: {
    gap: 8,
    marginTop: 8,
    borderRadius: 20,
  },
  button: {
    borderRadius: 20,
    backgroundColor: "#21D375",
    padding: 10,
    paddingHorizontal: 50,
  },
  textBold: {
    fontWeight: "bold",
  },
  logo: {
    width: 70,
    height: 70,
  },
  signUpButton: {
    flexDirection: "row",
    gap: 10,
    bottom: 450,
    left: 80,
  },
  signupText: {
    fontWeight: "bold",
    fontSize: 15,
    borderBottomWidth: 0.2,
  },
});
