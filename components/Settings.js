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
  Platform,
  KeyboardAvoidingView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { pick, types } from "@react-native-documents/picker";
import logo from "../NETworkLogo.png";
import BottomNav from "./BottomNav";
import { url } from "../config";

export default function Settings({ navigation }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loadingCV, setLoadingCV] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      const res = await fetch("http://" + url + ":3000/api/settings/get-user", {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      const body = { fname: firstName, lname: lastName, linkedin };
      if (password.trim()) body.password = password;
      const res = await fetch("http://" + url + ":3000/api/settings/update-user", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
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
      const res = await pick({ type: [types.pdf, types.doc, types.docx] });
      setSelectedDocument(res[0]);
    } catch (err) {
      if (err.code !== "DOCUMENT_PICKER_CANCELED") Alert.alert("Error", "Failed to pick file");
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
        uri: Platform.OS === "android" ? selectedDocument.uri : selectedDocument.uri.replace("file://", ""),
        name: selectedDocument.name,
        type: selectedDocument.type || "application/pdf",
      });
      const res = await fetch("http://" + url + ":3000/api/settings/update-cv", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
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
      await fetch("http://" + url + ":3000/api/settings/change-refer", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ refer: value ? "true" : "false" }),
      });
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <ImageBackground source={logo} style={styles.background} imageStyle={styles.backgroundImage}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            
            <View style={styles.header}>
              <Image source={logo} style={styles.logo} resizeMode="contain" />
              <Text style={styles.title}>Account Settings</Text>
              <Text style={styles.subtitle}>Manage your profile and preferences</Text>
            </View>

            {/* PREFERENCES SECTION */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Preferences</Text>
              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.switchLabel}>Referral Status</Text>
                  <Text style={styles.switchSubtext}>{isEnabled ? "Active" : "Inactive"}</Text>
                </View>
                <Switch
                  value={isEnabled}
                  onValueChange={toggleRefer}
                  trackColor={{ false: "#30363D", true: "#10B981" }}
                  thumbColor={"#fff"}
                />
              </View>
            </View>

            {/* PROFILE SECTION */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Personal Information</Text>
              
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput style={styles.input} placeholder="John" placeholderTextColor="#666" value={firstName} onChangeText={setFirstName} />

              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput style={styles.input} placeholder="Doe" placeholderTextColor="#666" value={lastName} onChangeText={setLastName} />

              <Text style={styles.inputLabel}>LinkedIn URL</Text>
              <TextInput style={styles.input} placeholder="linkedin.com/in/username" placeholderTextColor="#666" value={linkedin} onChangeText={setLinkedin} />

              <Text style={styles.inputLabel}>Update Password</Text>
              <TextInput style={styles.input} placeholder="Leave blank to keep current" placeholderTextColor="#666" secureTextEntry value={password} onChangeText={setPassword} />

              <TouchableOpacity style={styles.primaryBtn} onPress={handleSaveProfile}>
                <Text style={styles.primaryText}>Update Profile</Text>
              </TouchableOpacity>
            </View>

            {/* CV SECTION */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Professional Resume</Text>
              <Text style={styles.cardSubtext}>Upload your latest CV to improve your visibility.</Text>
              
              <TouchableOpacity style={styles.outlineBtn} onPress={pickCV}>
                <Text style={styles.outlineText} numberOfLines={1}>
                  {selectedDocument ? selectedDocument.name : "Choose File..."}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.uploadBtn, loadingCV && { opacity: 0.6 }]}
                onPress={uploadCV}
                disabled={loadingCV}
              >
                <Text style={styles.primaryText}>
                  {loadingCV ? "Processing..." : "Upload Document"}
                </Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
        <BottomNav navigation={navigation} active="settings" />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#0D1117" },
  backgroundImage: { opacity: 0.05, resizeMode: "cover" },
  overlay: { flex: 1, backgroundColor: "rgba(13,17,23,0.92)", paddingHorizontal: 20 },
  
  header: { marginTop: 60, alignItems: "center", marginBottom: 30 },
  logo: { width: 80, height: 80, marginBottom: 15 },
  title: { fontSize: 26, fontWeight: "800", color: "#fff", letterSpacing: 0.5 },
  subtitle: { fontSize: 14, color: "#8B949E", marginTop: 4 },

  card: {
    backgroundColor: "rgba(22, 27, 34, 0.8)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(48, 54, 61, 0.5)",
  },
  cardTitle: { fontSize: 17, fontWeight: "700", color: "#F0F6FC", marginBottom: 15 },
  cardSubtext: { fontSize: 13, color: "#8B949E", marginBottom: 15, lineHeight: 18 },

  inputLabel: { color: "#8B949E", fontSize: 12, fontWeight: "600", marginBottom: 8, marginLeft: 4, textTransform: "uppercase" },
  input: {
    backgroundColor: "#0D1117",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#30363D",
    color: "white",
  },

  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  switchLabel: { color: "white", fontSize: 16, fontWeight: "600" },
  switchSubtext: { color: "#10B981", fontSize: 13, marginTop: 2 },

  primaryBtn: {
    backgroundColor: "#4F46E5",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  uploadBtn: {
    backgroundColor: "#059669",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryText: { color: "white", fontSize: 15, fontWeight: "bold" },

  outlineBtn: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#4F46E5",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "rgba(79, 70, 229, 0.05)",
  },
  outlineText: { color: "#818CF8", fontSize: 14, fontWeight: "600" },
});