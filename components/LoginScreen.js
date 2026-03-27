import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Image
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import logo from "../NETworkLogo.png";
import { url } from "../config";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

//  const url = "192.168.43.73";

  async function login() {
    if (!email || !password) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "http://" + url + ":3000/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      await AsyncStorage.setItem("token", data.token);

      navigation.navigate("Menu");
    } catch (err) {
      Alert.alert("Login Failed", err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
  <ImageBackground
    source={logo}
    style={styles.background}
    imageStyle={styles.backgroundImage}
  >
    <View style={styles.overlay}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* 🔥 LOGO */}
        <View style={styles.logoContainer}>
          <Image
            source={logo}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* 🔥 FORM */}
        <View style={styles.formContainer}>
          <Text style={styles.welcome}>Welcome Back</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.loginButton}
            onPress={login}
            disabled={loading}
          >
            <Text style={styles.loginText}>
              {loading ? "Logging in..." : "Login"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => navigation.navigate("SignUp")}
          >
            <Text style={styles.signUpText}>
              Don't have an account? Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  </ImageBackground>
);
}
const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  backgroundImage: {
    opacity: 0.8,
    resizeMode: "contain",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(13,17,23,0.95)",
  },

  brandContainer: {
    marginTop: 80,
    alignItems: "center",
  },

  brandTop: {
    fontSize: 11,
    color: "white",
    letterSpacing: 1,
  },

  brandMain: {
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 1.5,
  },

  brandBottom: {
    fontSize: 11,
    color: "white",
    letterSpacing: 1,
  },

  formContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  welcome: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 30,
    textAlign: "center",
  },

  input: {
    backgroundColor: "#161B22",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 15,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#30363D",
    color: "white",
  },

  loginButton: {
    backgroundColor: "#4F46E5",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 10,
    elevation: 5,
  },

  loginText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  signUpButton: {
    marginTop: 25,
    alignItems: "center",
  },

  signUpText: {
    color: "#00d1b2",
    fontSize: 14,
  },
  logoContainer: {
  marginTop: 80,
  alignItems: "center",
},

logo: {
  width: 180,
  height: 180,
},
})