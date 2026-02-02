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
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ContactDetails({ route,navigation }) {
  const { contact } = route.params || {};

  const [modalVisible, setModalVisible] = useState(false);
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [isUser, setIsUser] = useState(false);
const [checkingUser, setCheckingUser] = useState(false);

  const [descriptions, setDescriptions] = useState([]);
const [linkedUser, setLinkedUser] = useState(null);

  const [defaultDescriptions, setDefaultDescriptions] = useState([]);

  const [loading, setLoading] = useState(false);
  const url="192.168.16.105"



  const loadDescriptions = useCallback(async () => {
    if (!contact) return;

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(
        `http://${url}:3000/api/description/${contact.contact_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setDescriptions(data.descriptions);
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  }, [contact]);


  const loadDefaultDescriptions = useCallback(async () => {
    if (!contact?.phone) return;

    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(
        `http://${url}:3000/api/description/default/${contact.phone}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setDefaultDescriptions(data.descriptions);
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  }, [contact]);

 
  const openWhatsApp = () => {
    if (!contact?.phone) return;

    const phone = contact.phone.replace(/\s+/g, "");
    const url = `whatsapp://send?phone=${phone}`;

    Linking.openURL(url).catch(() =>
      Alert.alert("WhatsApp not installed")
    );
  };


  const handleDelete = async (id) => {
    Alert.alert("Delete label", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");

            const res = await fetch(
              `http://${url}:3000/api/description/manual/${id}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            setDescriptions((prev) =>
              prev.filter((item) => item.id !== id)
            );
          } catch (err) {
            Alert.alert("Error", err.message);
          }
        },
      },
    ]);
  };


  const handleSave = async () => {
    if (!label || !description) {
      Alert.alert("Error", "Both fields required");
      return;
    }

    try {
      const res = await fetch(
        "http://"+url+":3000/api/description",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_contact_id: contact.user_contact_id,
            label,
            description,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      await loadDescriptions();
      setLabel("");
      setDescription("");
      setModalVisible(false);
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

const checkIfUserExists = useCallback(async () => {
  if (!contact?.phone) return;

  try {
    const res = await fetch(
      `http://${url}:3000/api/auth/check-phone`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: contact.phone }),
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    setIsUser(data.exists);
    setLinkedUser(data.user); // 👈 full user row
  } catch (err) {
    console.log("Check phone error:", err.message);
  }
}, [contact]);



  useEffect(() => {
    loadDescriptions();
    loadDefaultDescriptions();
    checkIfUserExists();
  }, [loadDescriptions, loadDefaultDescriptions, checkIfUserExists]);


  if (!contact) {
    return (
      <View style={styles.center}>
        <Text>No contact data</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* AVATAR + REVIEWS BUTTON */}
      <View style={styles.avatarRow}>
        <TouchableOpacity style={styles.avatar} onPress={openWhatsApp}>
          <Text style={styles.avatarText}>
            {contact.display_name?.[0] || "?"}
          </Text>
        </TouchableOpacity>

        {defaultDescriptions.length > 0 && (
          <TouchableOpacity
           style={styles.reviewsButton}
           onPress={() =>
           navigation.navigate("Reviews", {
           contact,
           defaultDescriptions,
          })
        }
        > 
        <Text style={styles.reviewsIcon}>⭐</Text>
        <Text style={styles.reviewsText}>REVIEWS</Text>
         
        </TouchableOpacity>)}
      </View>

<View style={{ flexDirection: "row", alignItems: "center" }}>
  <View>
    <Text style={styles.name}>{contact.display_name}</Text>
    
  </View>

  {!checkingUser && (
    <Text
      style={[
        styles.userBadge,
        { backgroundColor: isUser ? "#34C759" : "#8E8E93" },
      ]}
    >
      {isUser ? "USER" : "NOT USER"}
    </Text>
  )}
</View>
      <Text style={styles.phone}>{contact.phone}</Text>
      {isUser && linkedUser && (
  <View style={{ marginTop: 6 }}>
    
    {/* EMAIL */}
    {linkedUser.email && (
      <Text
        style={styles.linkedin}
        onPress={() => Linking.openURL(`mailto:${linkedUser.email}`)}
      >
        📧 {linkedUser.email}
      </Text>
    )}

    {/* LINKEDIN */}
    {linkedUser.linkedin && (
      <Text
        style={styles.linkedin}
        onPress={() => Linking.openURL(linkedUser.linkedin)}
      >
        🔗 View LinkedIn Profile
      </Text>
    )}

  </View>
)}



      {/* ADD LABEL */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ color: "white" }}>
          + Add label to {contact.display_name}
        </Text>
      </TouchableOpacity>

      {/* DEFAULT LABELS */}
      <Text style={styles.sectionTitle}>Default Labels</Text>

      {defaultDescriptions.length === 0 && (
        <Text style={styles.emptyText}>No default labels</Text>
      )}

      {defaultDescriptions.map((item) => (
        <View key={item.id} style={styles.defaultCard}>
          <Text style={styles.defaultLabel}>{item.label}</Text>
          <Text>{item.description}</Text>
        </View>
      ))}

      {/* MANUAL LABELS */}
      <Text style={styles.sectionTitle}>Your Labels</Text>

      {loading && <Text>Loading...</Text>}

      {!loading && descriptions.length === 0 && (
        <Text style={styles.emptyText}>No labels yet</Text>
      )}

      {descriptions.map((item) => (
        <View key={item.id} style={styles.manualCard}>
          <View style={styles.manualHeader}>
            <Text style={styles.manualLabel}>{item.label}</Text>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
          </View>
          <Text>{item.description}</Text>
        </View>
      ))}

      {/* MODAL */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Label</Text>

            <TextInput
              placeholder="Label"
              style={styles.input}
              value={label}
              onChangeText={setLabel}
            />

            <TextInput
              placeholder="Description"
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveText}>Save</Text>
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

// =============================
// 🔹 STYLES
// =============================
const styles = StyleSheet.create({
  container: { padding: 16 },

  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  avatar: {
    backgroundColor: "#444",
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: { color: "white", fontSize: 32 },

  reviewsButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 14,
    backgroundColor: "#FFD700",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    elevation: 5,
  },

  reviewsIcon: { fontSize: 16, marginRight: 6 },

  reviewsText: {
    fontWeight: "bold",
    letterSpacing: 0.6,
  },

  name: { fontSize: 22, fontWeight: "bold" },
  phone: { color: "gray" },

  sectionTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
  },

  defaultCard: {
    backgroundColor: "#FFF3CD",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },

  defaultLabel: { fontWeight: "bold" },

  manualCard: {
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },

  manualLabel: { fontWeight: "bold" },

  manualHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  deleteIcon: { fontSize: 18, color: "#FF3B30" },

  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
  },

  emptyText: { color: "gray", marginTop: 6 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },

  textArea: { height: 100 },

  saveButton: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  saveText: { color: "white", fontWeight: "bold" },

  cancelText: {
    textAlign: "center",
    color: "#FF3B30",
    marginTop: 12,
  },

  userBadge: {
  marginLeft: 8,
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 10,
  color: "white",
  fontSize: 12,
  fontWeight: "bold",
},
linkedin: {
  color: "#0A66C2",
  marginTop: 6,
  fontWeight: "bold",
},

});
