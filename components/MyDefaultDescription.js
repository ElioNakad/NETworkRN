import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

export default function MyDefaultDescription() {
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const [defaults, setDefaults] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  // 🔹 FETCH DEFAULT DESCRIPTIONS
  const loadDefaults = useCallback(async () => {
    try {
      setLoadingList(true);

      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const res = await fetch(
        "http://192.168.16.104:3000/api/description/get-default",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load");
      }

      setDefaults(data.descriptions || []);
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadDefaults();
  }, [loadDefaults]);

  // 🔹 SUBMIT NEW DEFAULT
  const handleSubmit = async () => {
    if (!label || !description) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Not authenticated");
        return;
      }

      const res = await fetch(
        "http://192.168.16.104:3000/api/description/set-default",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ label, description }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save");
      }

      Alert.alert("Success", "Default description saved");
      setLabel("");
      setDescription("");

      // 🔁 Refresh list
      loadDefaults();
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 RENDER ITEM
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{item.label}</Text>
      <Text style={styles.cardDescription}>{item.description}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Text style={styles.title}>Add Default Description</Text>

      <TextInput
        style={styles.input}
        placeholder="Label"
        value={label}
        onChangeText={setLabel}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>My Default Descriptions</Text>

      {loadingList ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={defaults}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.empty}>No default descriptions yet</Text>
          }
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
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
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#f1f1f1",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardLabel: {
    fontWeight: "bold",
    fontSize: 16,
  },
  cardDescription: {
    marginTop: 4,
    color: "#555",
  },
  empty: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
  },
});
