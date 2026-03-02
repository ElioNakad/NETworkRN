import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
  ImageBackground,
} from "react-native";
import Contacts from "react-native-contacts";
import AsyncStorage from "@react-native-async-storage/async-storage";

import logo from "../NETworkLogo.png";

export default function Menu({ navigation }) {

  const normalizePhone = (rawNumber, countryCode = "+961") => {
    if (!rawNumber) return null;
    let number = rawNumber.replace(/[^\d+]/g, "");
    if (number.startsWith("+")) return number;
    if (number.startsWith("00")) return "+" + number.slice(2);
    return `${countryCode}${number}`;
  };

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
          ? { phone: normalized, displayName: c.displayName || "Unknown" }
          : null;
      })
      .filter(Boolean);
  };

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
      if (!res.ok) throw new Error(data.message || "Resync failed");

      Alert.alert("Done", "Contacts synced.");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const handleResync = () => {
    Alert.alert(
      "Resync contacts",
      "Scan phone & sync changes.\nNo deletions.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sync", onPress: doResync },
      ]
    );
  };

  return (
    <ImageBackground
      source={logo}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      {/* Dark overlay for readability */}
      <View style={styles.overlay}>

        {/* 🔹 TOP BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.navigate("LogIn")}>
            <Text style={styles.logout}>Logout</Text>
          </TouchableOpacity>

          <View style={styles.brandContainer}>
            <Text style={styles.brandTop}>from your</Text>
            <Text style={styles.brandMain}>
              <Text style={{color:"#059669"}}>NET</Text>
              <Text style={{color:"#4F46E5"}}>work</Text>
            
            </Text>
            <Text style={styles.brandBottom}>to the whole WORLD</Text>
          </View>

          <TouchableOpacity onPress={handleResync}>
            <Text style={styles.sync}>Resync</Text>
          </TouchableOpacity>
        </View>

        {/* 🔥 CENTERED HERO SECTION */}
        <View style={styles.centerContainer}>
          <TouchableOpacity
            style={[styles.heroButton, styles.aiButton]}
            onPress={() => navigation.navigate("AI")}
          >
            <Text style={styles.heroIcon}>🤖</Text>
            <Text style={styles.heroTitle}>AI Search</Text>
            <Text style={styles.heroSubtitle}>
              Smart semantic search
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.heroButton, styles.referralButton]}
            onPress={() => navigation.navigate("Referral")}
          >
            <Text style={styles.heroIcon}>🤝</Text>
            <Text style={styles.heroTitle}>Referral</Text>
            <Text style={styles.heroSubtitle}>
              Connect professionals
            </Text>
          </TouchableOpacity>
        </View>

        {/* 🔥 BOTTOM NAVIGATION */}
        <View style={styles.bottomBar}>
          <BottomItem emoji="👥" onPress={() => navigation.navigate("My Contacts")} />
          <BottomItem emoji="🪪" onPress={() => navigation.navigate("Default")} />
          <BottomItem emoji="✈️" onPress={() => navigation.navigate("Recommendations")} />
          <BottomItem emoji="⚙️" onPress={() => navigation.navigate("Settings")} />
        </View>

      </View>
    </ImageBackground>
  );
}

/* 🔹 Bottom Item */
const BottomItem = ({ emoji, onPress }) => (
  <TouchableOpacity style={styles.bottomItem} onPress={onPress}>
    <Text style={styles.bottomEmoji}>{emoji}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },

  backgroundImage: {
    opacity: 0.8,   // makes logo subtle watermark
    resizeMode: "contain",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(13,17,23,0.95)", // dark overlay
  },

  topBar: {
    marginTop: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },

  logout: {
    color: "#ff4d4f",
    fontWeight: "600",
  },

  sync: {
    color: "#00d1b2",
    fontWeight: "600",
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  heroButton: {
    padding: 30,
    borderRadius: 25,
    marginBottom: 25,
    alignItems: "center",
    elevation: 8,
  },

  aiButton: {
    backgroundColor: "#4F46E5",
  },

  referralButton: {
    backgroundColor: "#059669",
  },

  heroIcon: {
    fontSize: 32,
    marginBottom: 10,
  },

  heroTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },

  heroSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 5,
  },

  bottomBar: {
    height: 75,
    backgroundColor: "#161B22",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#30363D",
  },

  bottomItem: {
    alignItems: "center",
  },

  bottomEmoji: {
    fontSize: 28,
  },
  brandContainer: {
  alignItems: "center",
},

brandTop: {
  fontSize: 11,
  color: "white",
  fontweight: "bold",
  letterSpacing: 1,
},

brandMain: {
  fontSize: 22,
  fontWeight: "bold",
  color: "white",
  letterSpacing: 1.5,
},

brandBottom: {
  fontSize: 11,
  color: "white",
  letterSpacing: 1,
},
});