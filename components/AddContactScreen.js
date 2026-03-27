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
  Image,
  ActivityIndicator
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import logo from "../NETworkLogo.png";
import BottomNav from "./BottomNav";
import { url } from "../config";

export default function AddContactScreen({ navigation }) {

  const [countryCode, setCountryCode] = useState("+961");
  const [phone, setPhone] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

 // const url = "192.168.16.103";

  // =========================
  // PHONE NORMALIZER
  // =========================
  const normalizePhone = (rawNumber, countryCode) => {
    if (!rawNumber) return null;

    let number = rawNumber.replace(/[^\d+]/g, "");

    if (number.startsWith("+")) return number;

    if (number.startsWith("00")) return "+" + number.slice(2);

    return `${countryCode}${number}`;
  };

  // =========================
  // ADD CONTACT
  // =========================
  const addContact = async () => {

    if (!phone) {
      Alert.alert("Error", "Phone number is required");
      return;
    }

    const normalizedPhone = normalizePhone(phone, countryCode);

    try {

      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`http://${url}:3000/api/contacts/addcontact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          phone: normalizedPhone,
          display_name: displayName
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      Alert.alert("Success", data.message);

      setPhone("");
      setDisplayName("");

      navigation.goBack();

    } catch (err) {

      Alert.alert("Error", err.message);

    } finally {

      setLoading(false);

    }
  };

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

          {/* LOGO */}
          <View style={styles.logoContainer}>
            <Image
              source={logo}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* FORM */}
          <View style={styles.formContainer}>

            <Text style={styles.title}>Add Contact</Text>

            {/* COUNTRY CODE */}
            <TextInput
              style={styles.input}
              value={countryCode}
              onChangeText={setCountryCode}
              placeholder="Country Code (+961)"
              placeholderTextColor="#aaa"
              keyboardType="phone-pad"
            />

            {/* PHONE */}
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone number"
              placeholderTextColor="#aaa"
              keyboardType="phone-pad"
            />

            {/* DISPLAY NAME */}
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Display name (optional)"
              placeholderTextColor="#aaa"
            />

            {/* BUTTON */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={addContact}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.loginText}>Add Contact</Text>
              )}
            </TouchableOpacity>

          </View>
        </KeyboardAvoidingView>
        <BottomNav navigation={navigation} active="add" />
        
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

  logoContainer: {
    marginTop: 80,
    alignItems: "center",
  },

  logo: {
    width: 180,
    height: 180,
  },

  formContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  title: {
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
  }

});