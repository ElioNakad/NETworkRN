import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
} from "react-native";
import Contacts from "react-native-contacts";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Menu({ navigation }) {
const normalizePhone = (rawNumber, countryCode = "+961") => {
  if (!rawNumber) return null;

  let number = rawNumber.replace(/[^\d+]/g, "");

  if (number.startsWith("+")) return number;

  if (number.startsWith("00")) return "+" + number.slice(2);

  return `${countryCode}${number}`;
};
  

  // 🔹 LOAD CONTACTS FROM PHONE
const loadContactsFromPhone = async () => {
  if (Platform.OS === "android") {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS
    );

    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      throw new Error("Contacts permission denied");
    }
  }

  const contacts = await Contacts.getAll();

  return contacts
    .map((c) => {
      const raw = c.phoneNumbers?.[0]?.number;
      const normalized = normalizePhone(raw);

      return normalized
        ? {
            phone: normalized,
            displayName: c.displayName || "Unknown",
          }
        : null;
    })
    .filter(Boolean);
};


// 🔹 RESYNC HANDLER
const doResync = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("Error", "You are not logged in");
      return;
    }

    const allContacts = await loadContactsFromPhone();

    if (allContacts.length === 0) {
      Alert.alert("No contacts", "No valid phone numbers found");
      return;
    }

    console.log("📤 SENDING CONTACTS:", allContacts.length);

    const res = await fetch(
      "http://192.168.16.105:3000/api/contacts/resync",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ allContacts }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Resync failed");
    }

    Alert.alert(
      "Done",
      "Your contacts have been successfully synced."
    );
  } catch (err) {
    console.error("❌ RESYNC ERROR:", err);
    Alert.alert("Error", err.message);
  }
};

const handleResync = () => {
  Alert.alert(
    "Resync contacts",
    "This action will:\n\n" +
      "• Scan your phone contacts\n" +
      "• Add any new phone numbers\n" +
      "• Update names if they changed\n" +
      "• It will NOT delete anything\n\n" +
      "Do you want to continue?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "OK",
        onPress: doResync, // ✅ starts resync only after OK
      },
    ]
  );
};



  return (
    <View style={styles.container}>
      {/* 🔹 TOP RIGHT BUTTON */}
      <TouchableOpacity
        style={styles.resyncButton}
        onPress={handleResync}
      >
        <Text style={styles.resyncText}>Resync Contacts</Text>
      </TouchableOpacity>

      {/* 🔹 CENTER BUTTONS */}
      <View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("My Contacts")}
        >
          <Text style={styles.buttonText}>My Contacts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Default")}
        >
          <Text style={styles.buttonText}>My Default</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Settings")}
        >
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>
          
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("AI")}
        >
          <Text style={styles.buttonText}>AI</Text>
        </TouchableOpacity>
        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },

  resyncButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#28a745",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },

  resyncText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },

  button: {
    backgroundColor: "#007bff",
    padding: 15,
    width: 220,
    borderRadius: 8,
    marginBottom: 15,
  },

  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
  },
});
