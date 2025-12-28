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
} from "react-native";
import Contacts from "react-native-contacts";

export default function SignUpScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  const loadContacts = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        return [];
      }
    }

    const contacts = await Contacts.getAll();

    return contacts
      .map(c => ({
        phone: c.phoneNumbers[0]?.number?.replace(/\s+/g, ""),
        displayName: c.displayName || "Unknown",
      }))
      .filter(c => c.phone);
  };

  const handleSignUp = async () => {
    if (!firstName || !lastName || !email || !password || !phone) {
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
      const contacts = await loadContacts();

      const response = await fetch("http://192.168.16.103:3000/api/auth/signup", { 
      method: "POST",
      headers: {
      "Content-Type": "application/json",
      },
      body: JSON.stringify({
       fname: firstName,
       lname: lastName,
       email,
       phone,
       password,
       contacts,
      }),
      });

      let data = {};
      try {
       data = await response.json();
      } catch (e) {
      }

      if (!response.ok) {
       Alert.alert("Error", data.message || "Signup failed");
       return;
      }

       Alert.alert("Success", "Account created successfully");

    }catch (err) {
     console.log(err);
     Alert.alert("Error", "Network error");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput style={styles.input} placeholder="First Name" placeholderTextColor={"grey"}  onChangeText={setFirstName} />
      <TextInput style={styles.input} placeholder="Last Name" placeholderTextColor={"grey"} onChangeText={setLastName} />
      <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor={"grey"} keyboardType="phone-pad" onChangeText={setPhone} />
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor={"grey"} autoCapitalize="none" onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" placeholderTextColor={"grey"} secureTextEntry onChangeText={setPassword} />

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: "black"
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
