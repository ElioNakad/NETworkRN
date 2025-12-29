import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ContactDetails({ route }) {
  const { contact } = route.params || {};

  // /////////////////
  // 🔹 STATE
  /////////////////
  const [modalVisible, setModalVisible] = useState(false);
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");

  const [descriptions, setDescriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  /////////////////
  // 🔹 FETCH DESCRIPTIONS
  /////////////////
  const loadDescriptions = useCallback(async () => {
    if (!contact) return;

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      const res = await fetch(
  `http://192.168.16.103:3000/api/set-description/${contact.contact_id}`,
      {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
  );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load descriptions");
      }

      setDescriptions(data.descriptions);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  }, [contact]);

  /////////////////
  // 🔹 LOAD ON MOUNT
  /////////////////
  useEffect(() => {
    loadDescriptions();
  }, [loadDescriptions]);

  /////////////////
  // 🔹 INSERT DESCRIPTION
  /////////////////
  const handleSave = async () => {
    if (!label || !description) {
      Alert.alert("Error", "Both fields are required");
      return;
    }

    try {
      const res = await fetch(
        "http://192.168.16.103:3000/api/set-description",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_contact_id: contact.user_contact_id,
            label,
            description,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save");
      }

      await loadDescriptions();

      setLabel("");
      setDescription("");
      setModalVisible(false);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", err.message);
    }
  };

  /////////////////
  // 🔹 SAFE RENDER
  /////////////////
  if (!contact) {
    return (
      <View style={styles.center}>
        <Text>No contact data</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {contact.display_name ? contact.display_name[0] : "?"}
        </Text>
      </View>

      {/* Info */}
      <Text style={styles.name}>{contact.display_name}</Text>
      <Text style={styles.phone}>{contact.phone}</Text>

      {/* Add Label Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ color: "white" }}>
          + Add new labels to {contact.display_name}
        </Text>
      </TouchableOpacity>

      {/* 🔹 LABEL CARDS */}
      <View style={styles.cardsContainer}>
        {loading && <Text>Loading...</Text>}

        {!loading && descriptions.length === 0 && (
          <Text style={styles.emptyText}>No labels added yet</Text>
        )}

        {descriptions.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardLabel}>{item.label}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
          </View>
        ))}
      </View>

      {/* 🔹 MODAL */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Label</Text>

            <TextInput
              placeholder="Label"
              placeholderTextColor="grey"
              style={styles.input}
              value={label}
              onChangeText={setLabel}
            />

            <TextInput
              placeholder="Description"
              placeholderTextColor="grey"
              style={styles.input}
              value={description}
              onChangeText={setDescription}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={{ color: "white", fontWeight: "600" }}>Save</Text>
            </TouchableOpacity>

            <Pressable onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

/////////////////
// 🔹 STYLES
/////////////////
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#f5f5f5",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarText: {
    color: "white",
    fontSize: 36,
    fontWeight: "bold",
  },
  name: {
    fontSize: 26,
    fontWeight: "600",
    color: "#333",
  },
  phone: {
    fontSize: 18,
    color: "#666",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 15,
  },
  cardsContainer: {
    width: "90%",
    marginTop: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#007AFF",
  },
  cardDescription: {
    marginTop: 5,
    fontSize: 15,
    color: "#333",
  },
  emptyText: {
    textAlign: "center",
    color: "#777",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    color: "black",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
  },
  cancelText: {
    textAlign: "center",
    marginTop: 12,
    color: "black",
    fontWeight: "bold",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
