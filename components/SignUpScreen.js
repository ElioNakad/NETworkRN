import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
  Modal,
  ScrollView,
  ImageBackground,
  Image,
  KeyboardAvoidingView
} from "react-native";
import Contacts from "react-native-contacts";
import logo from "../NETworkLogo.png";

export default function SignUpScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [countryCode, setCountryCode] = useState("");

  const [otp, setOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [linkedin, setLinkedin] = useState("");

  const url = "192.168.16.105";

  const normalizePhone = (rawNumber, countryCode) => {
    if (!rawNumber) return null;

    let number = rawNumber.replace(/[^\d+]/g, "");

    if (number.startsWith("+")) return number;

    if (number.startsWith("00")) return "+" + number.slice(2);

    return `${countryCode}${number}`;
  };

  const loadContacts = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) return [];
    }

    const contacts = await Contacts.getAll();

    return contacts
      .map((c) => {
        const raw = c.phoneNumbers[0]?.number;
        const normalized = normalizePhone(raw, countryCode);

        return normalized
          ? {
              phone: normalized,
              displayName: c.displayName || "Unknown",
            }
          : null;
      })
      .filter(Boolean);
  };

  const handleSignUp = async () => {
    if (!firstName || !lastName || !email || !countryCode || !phone || !password) {
      Alert.alert("Error", "All required fields must be filled");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Invalid email format");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);
      const contacts = await loadContacts();
      const fullPhone = `${countryCode}${phone}`;

      const payload = {
        fname: firstName,
        lname: lastName,
        email,
        phone: fullPhone,
        password,
        contacts,
        linkedin,
      };

      const res = await fetch("http://" + url + ":3000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, payload }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.message || "Failed to send OTP");
        return;
      }

      setShowOtpModal(true);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Network error");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      Alert.alert("Error", "Enter OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://" + url + ":3000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.message || "Invalid OTP");
        return;
      }

      setShowOtpModal(false);
      Alert.alert("Success", "Account created successfully");
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Network error");
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
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            
            {/* LOGO */}
            <View style={styles.logoContainer}>
              <Image source={logo} style={styles.logo} resizeMode="contain" />
            </View>

            {/* FORM */}
            <View style={styles.formContainer}>
              <Text style={styles.welcome}>Create Account</Text>

              <Text style={styles.helper}>* Required fields</Text>

              <TextInput
                style={styles.input}
                placeholder="First Name *"
                placeholderTextColor="#aaa"
                onChangeText={setFirstName}
              />

              <TextInput
                style={styles.input}
                placeholder="Last Name *"
                placeholderTextColor="#aaa"
                onChangeText={setLastName}
              />

              <TextInput
                style={styles.input}
                placeholder="Country Code (e.g. +961) *"
                placeholderTextColor="#aaa"
                keyboardType="phone-pad"
                value={countryCode}
                onChangeText={setCountryCode}
              />

              <TextInput
                style={styles.input}
                placeholder="Phone Number *"
                placeholderTextColor="#aaa"
                keyboardType="phone-pad"
                onChangeText={setPhone}
              />

              <TextInput
                style={styles.input}
                placeholder="Email *"
                placeholderTextColor="#aaa"
                autoCapitalize="none"
                onChangeText={setEmail}
              />

              <TextInput
                style={styles.input}
                placeholder="LinkedIn (optional)"
                placeholderTextColor="#aaa"
                value={linkedin}
                onChangeText={setLinkedin}
              />

              <TextInput
                style={styles.input}
                placeholder="Password *"
                placeholderTextColor="#aaa"
                secureTextEntry
                onChangeText={setPassword}
              />

              <Text style={styles.helper}>
                Password must be at least 8 characters
              </Text>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleSignUp}
                disabled={loading}
              >
                <Text style={styles.loginText}>
                  {loading ? "Creating..." : "Create Account"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* OTP MODAL */}
        <Modal visible={showOtpModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>Enter OTP</Text>

              <TextInput
                style={styles.input}
                placeholder="6-digit OTP"
                placeholderTextColor="#aaa"
                keyboardType="numeric"
                value={otp}
                onChangeText={setOtp}
              />

              <TouchableOpacity style={styles.loginButton} onPress={verifyOtp}>
                <Text style={styles.loginText}>Verify OTP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },

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
    width: 160,
    height: 160,
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
    marginBottom: 25,
    textAlign: "center",
  },

  helper: {
    color: "#8b949e",
    fontSize: 12,
    marginBottom: 10,
    textAlign: "center",
  },

  input: {
    backgroundColor: "#161B22",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 15,
    fontSize: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#30363D",
    color: "white",
  },

  loginButton: {
    backgroundColor: "#4F46E5",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 15,
    elevation: 5,
  },

  loginText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    backgroundColor: "#0D1117",
    width: "85%",
    padding: 25,
    borderRadius: 18,
    borderColor: "#30363D",
    borderWidth: 1,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
    textAlign: "center",
  },
});