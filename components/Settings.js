import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  ImageBackground,
  Image,
  ScrollView,
  Platform
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { pick, types } from "@react-native-documents/picker";
import logo from "../NETworkLogo.png";
import BottomNav from "./BottomNav";
export default function Settings({navigation}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loadingCV, setLoadingCV] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  const url = "192.168.43.73";

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const res = await fetch(
        "http://" + url + ":3000/api/settings/get-user",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const user = data.user[0];
      setFirstName(user.fname || "");
      setLastName(user.lname || "");
      setLinkedin(user.linkedin || "");
      setIsEnabled(String(user.refer).toLowerCase() === "true");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const handleSaveProfile = async () => {
    if (password.trim() && password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const body = {
        fname: firstName,
        lname: lastName,
        linkedin,
      };

      if (password.trim()) body.password = password;

      const res = await fetch(
        "http://" + url + ":3000/api/settings/update-user",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      Alert.alert("Success", "Profile updated");
      setPassword("");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const pickCV = async () => {
    try {
      const res = await pick({
        type: [types.pdf, types.doc, types.docx],
      });
      setSelectedDocument(res[0]);
    } catch (err) {
      if (err.code !== "DOCUMENT_PICKER_CANCELED") {
        Alert.alert("Error", "Failed to pick file");
      }
    }
  };

  const uploadCV = async () => {
    if (!selectedDocument) {
      Alert.alert("No CV", "Please select a CV first");
      return;
    }

    try {
      setLoadingCV(true);
      const token = await AsyncStorage.getItem("token");

      const formData = new FormData();
      formData.append("cv", {
        uri:
          Platform.OS === "android"
            ? selectedDocument.uri
            : selectedDocument.uri.replace("file://", ""),
        name: selectedDocument.name,
        type: selectedDocument.type || "application/pdf",
      });

      const res = await fetch(
        "http://" + url + ":3000/api/settings/update-cv",
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      Alert.alert("Success", "CV uploaded successfully");
      setSelectedDocument(null);
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoadingCV(false);
    }
  };

  const toggleRefer = async (value) => {
    try {
      setIsEnabled(value);

      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      await fetch(
        "http://" + url + ":3000/api/settings/change-refer",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            refer: value ? "true" : "false",
          }),
        }
      );
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <ImageBackground
      source={logo}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

          <View style={styles.logoContainer}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          </View>

          <Text style={styles.title}>Settings</Text>

          {/* REFER SWITCH */}
          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>
              {isEnabled ? "Referral Enabled" : "Referral Disabled"}
            </Text>
            <Switch
              value={isEnabled}
              onValueChange={toggleRefer}
              trackColor={{ false: "#444", true: "#059669" }}
              thumbColor={"#fff"}
            />
          </View>

          {/* PROFILE */}
          <Text style={styles.section}>Profile</Text>

          <TextInput
            style={styles.input}
            placeholder="First Name"
            placeholderTextColor="#aaa"
            value={firstName}
            onChangeText={setFirstName}
          />

          <TextInput
            style={styles.input}
            placeholder="Last Name"
            placeholderTextColor="#aaa"
            value={lastName}
            onChangeText={setLastName}
          />

          <TextInput
            style={styles.input}
            placeholder="LinkedIn"
            placeholderTextColor="#aaa"
            value={linkedin}
            onChangeText={setLinkedin}
          />

          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.primaryBtn} onPress={handleSaveProfile}>
            <Text style={styles.primaryText}>Save Profile</Text>
          </TouchableOpacity>

          {/* CV */}
          <Text style={styles.section}>CV</Text>

          <TouchableOpacity style={styles.outlineBtn} onPress={pickCV}>
            <Text style={styles.outlineText}>
              {selectedDocument
                ? selectedDocument.name
                : "Select CV (.pdf, .doc, .docx)"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryBtn, loadingCV && { opacity: 0.6 }]}
            onPress={uploadCV}
            disabled={loadingCV}
          >
            <Text style={styles.primaryText}>
              {loadingCV ? "Uploading..." : "Upload CV"}
            </Text>
          </TouchableOpacity>

        </ScrollView>

                <BottomNav navigation={navigation} active="settings" />
        
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },

  backgroundImage: {
    opacity: 1,
    resizeMode: "contain",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(13,17,23,0.95)",
    paddingHorizontal: 25,
  },

  logoContainer: {
    marginTop: 60,
    alignItems: "center",
  },

  logo: {
    width: 130,
    height: 130,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 25,
  },

  section: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginVertical: 15,
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

  primaryBtn: {
    backgroundColor: "#4F46E5",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 20,
  },

  primaryText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  outlineBtn: {
    borderWidth: 1,
    borderColor: "#059669",
    padding: 14,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 15,
  },

  outlineText: {
    color: "#059669",
    fontSize: 15,
    fontWeight: "600",
  },

  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#161B22",
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#30363D",
  },

  switchText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
});