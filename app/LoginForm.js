import { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import Rikshaw from "../assets/ricksaw.png";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { AppContext } from "../context";

export default function LoginForm() {
  const {setAuthInfo} = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signIn = async () => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      if(response?.user) {
        setAuthInfo(response.user);
        router.push("/dashboard")
        // Alert.alert('issue with routing');
      }
    } catch (error) {
      Alert.alert("Sign in failed: " + error.message);
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
      <View style={styles.buttons}>
        <TouchableOpacity  onPress={signIn} style={styles.button}>
          <Text style={styles.textBold}>LOGIN</Text>
        </TouchableOpacity>
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
    bottom: 400,
    left: 80,
  },
  signupText: {
    fontWeight: "bold",
    fontSize: 15,
    borderBottomWidth: 0.2,
  },
});
