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
} from "react-native";
import Contacts from "react-native-contacts";

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

  const normalizePhone = (rawNumber, countryCode) => {
  if (!rawNumber) return null;

  // Remove spaces, dashes, parentheses
  let number = rawNumber.replace(/[^\d+]/g, "");

  // If already international
  if (number.startsWith("+")) return number;

  // If starts with 00 (international)
  if (number.startsWith("00")) return "+" + number.slice(2);

  // Otherwise assume local number
  return `${countryCode}${number}`;
  };


  // 🔹 Load contacts
  const loadContacts = async () => {
  if (Platform.OS === "android") {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) return [];
  }

  const contacts = await Contacts.getAll();

  return contacts
    .map(c => {
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


  // 🔹 SEND OTP
  const handleSignUp = async () => {
    if (!firstName || !lastName || !email || !countryCode || !phone || !password) {
     Alert.alert("Error", "All fields are required");
     return;
    }


    if (!email.includes("@")) {
      Alert.alert("Error", "Invalid email");
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
      };

      const res = await fetch(
        "http://192.168.16.106:3000/api/auth/send-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, payload }),
        }
      );

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

  // 🔹 VERIFY OTP
  const verifyOtp = async () => {
    if (!otp) {
      Alert.alert("Error", "Enter OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "http://192.168.16.106:3000/api/auth/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        }
      );

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
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput style={styles.input} placeholder="First Name" placeholderTextColor={"grey"} onChangeText={setFirstName} />
      <TextInput style={styles.input} placeholder="Last Name" placeholderTextColor={"grey"} onChangeText={setLastName} />
      <TextInput style={styles.input} placeholder="Country Code (e.g. +961)" placeholderTextColor={"grey"} keyboardType="phone-pad" value={countryCode} onChangeText={setCountryCode}/>
      <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor={"grey"} keyboardType="phone-pad" onChangeText={setPhone} />
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor={"grey"} autoCapitalize="none" onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" placeholderTextColor={"grey"} secureTextEntry onChangeText={setPassword} />

      <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? "Please wait..." : "Create Account"}
        </Text>
      </TouchableOpacity>

      {/* 🔐 OTP MODAL */}
      <Modal visible={showOtpModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Enter OTP</Text>

            <TextInput
              style={styles.input}
              placeholder="6-digit OTP"
              keyboardType="numeric"
              value={otp}
              onChangeText={setOtp}
            />

            <TouchableOpacity style={styles.button} onPress={verifyOtp}>
              <Text style={styles.buttonText}>Verify OTP</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// 🎨 STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    color: "black"
  },
  button: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    width: "85%",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
});
