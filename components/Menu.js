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
  Image
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Contacts from "react-native-contacts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNav from "../components/BottomNav"
import logo from "../NETworkLogo.png";
import { url } from "../config";

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
        "http://"+url+":3000/api/contacts/resync",
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
          <LinearGradient
            colors={["#ff4d4f", "#760b12"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoutButton}
          >
            <TouchableOpacity onPress={() => navigation.navigate("LogIn")}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.brandContainer}>
            <Text style={styles.brandTop}>from your</Text>

            <Image source={logo} style={styles.brandLogo} />

            <Text style={styles.brandBottom}>to the whole WORLD</Text>
          </View>

          <TouchableOpacity onPress={handleResync}>
            <LinearGradient
              colors={["#00d1b2", "#043a35"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.syncButton}
            >
              <Text style={styles.syncText}>Resync</Text>
            </LinearGradient>
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
        <BottomNav navigation={navigation} active="menu" />

      </View>
    </ImageBackground>
  );
}



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

logoutButton: {
  borderRadius: 25,
  paddingVertical: 10,
  paddingHorizontal: 25,
  alignSelf: "center",
},

logoutText: {
  color: "white",
  fontWeight: "600",
  fontSize: 16,
},

  syncButton: {
  borderRadius: 25,
  paddingVertical: 10,
  paddingHorizontal: 25,
  alignSelf: "center",
  marginTop: 10,
},

syncText: {
  color: "white",
  fontWeight: "600",
  fontSize: 16,
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
  justifyContent: "center",
},

brandTop: {
  fontSize: 13,
  color: "#4F46E5",
  fontWeight: "bold",
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
  color: "#059669",
  letterSpacing: 1,
},
brandLogo: {
  width: 90,
  height: 40,
  resizeMode: "contain",
  marginVertical: 2,
},
});