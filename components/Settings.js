import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { pick, types } from "@react-native-documents/picker";

export default function Settings() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loadingCV, setLoadingCV] = useState(false);

  const url = "192.168.16.105";

  // 🔹 FETCH USER DATA
  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const res = await fetch(
        "http://" + url + ":3000/api/settings/get-user",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const user = data.user[0];
      setFirstName(user.fname || "");
      setLastName(user.lname || "");
      setLinkedin(user.linkedin || "");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  // 🔹 UPDATE PROFILE
  const handleSaveProfile = async () => {
    if (password.length < 8) {
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

  // 🔹 PICK CV
  const pickCV = async () => {
    try {
      const res = await pick({
        type: [types.pdf, types.doc, types.docx],
      });

      const file = res[0];
      setSelectedDocument(file);
    } catch (err) {
      if (err.code !== "DOCUMENT_PICKER_CANCELED") {
        Alert.alert("Error", "Failed to pick file");
      }
    }
  };

  // 🔹 UPLOAD CV
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      {/* PROFILE SECTION */}
      <Text style={styles.section}>Profile</Text>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        placeholderTextColor={"grey"}
        value={firstName}
        onChangeText={setFirstName}
      />

      <TextInput
        style={styles.input}
        placeholder="Last Name"
        placeholderTextColor={"grey"}
        value={lastName}
        onChangeText={setLastName}
      />

      <TextInput
        style={styles.input}
        placeholder="LinkedIn"
        placeholderTextColor={"grey"}
        value={linkedin}
        onChangeText={setLinkedin}
      />

      <TextInput
        style={styles.input}
        placeholder="New Password"
        placeholderTextColor={"grey"}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.primaryBtn} onPress={handleSaveProfile}>
        <Text style={styles.primaryText}>Save Profile</Text>
      </TouchableOpacity>

      {/* CV SECTION */}
      <Text style={styles.section}>CV section</Text>

      <TouchableOpacity style={styles.outlineBtn} onPress={pickCV}>
        <Text style={styles.outlineText}>
          {selectedDocument ? selectedDocument.name : "Select CV (Only .pdf are supported)"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.primaryBtn,
          loadingCV && { backgroundColor: "#aaa" },
        ]}
        onPress={uploadCV}
        disabled={loadingCV}
      >
        <Text style={styles.primaryText}>
          {loadingCV ? "Uploading..." : "Upload CV"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 22,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: "#007bff",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  primaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: "#007bff",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  outlineText: {
    color: "#007bff",
    fontSize: 15,
    fontWeight: "bold",
  },
});
