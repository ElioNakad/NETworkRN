import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
} from "react-native";

export default function ContactDetails({ route }) {
  const { contact } = route.params;

  const [modalVisible, setModalVisible] = useState(false);
  const [label1, setLabel1] = useState("");
  const [label2, setLabel2] = useState("");

  if (!contact) {
    return (
      <View style={styles.center}>
        <Text>No contact data</Text>
      </View>
    );
  }

  const handleSave = async () => {
    try {
        const res = await fetch("http://192.168.16.103:3000/api/set-description", {
        method: "POST",
        headers: {
         "Content-Type": "application/json",
        // add Authorization if you use JWT
        // Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
         user_contact_id: contact.user_contact_id, // VERY IMPORTANT
         label: label1,
         description: label2,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save");
      }
      alert("saved")
      

    console.log("Saved:", data);

    setLabel1("");
    setLabel2("");
    setModalVisible(false);
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
  };


  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {contact.display_name ? contact.display_name[0] : "?"}
        </Text>
      </View>

      {/* Info */}
      <Text style={styles.name}>{contact.display_name}</Text>
      <Text style={styles.phone}>{contact.phone}</Text>

      {/* Open Modal Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ color: "white" }}>
          + Add new labels to {contact.display_name}
        </Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Labels</Text>

            <TextInput
              placeholder="Label/Job"
              placeholderTextColor={"grey"}
              style={styles.input}
              value={label1}
              onChangeText={setLabel1}
            />

            <TextInput
              placeholder="Description"
              placeholderTextColor={"grey"}
              style={styles.input}
              value={label2}
              onChangeText={setLabel2}
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
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    paddingTop: 6,
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
  backgroundColor: "#007AFF",
  paddingVertical: 14,
  paddingHorizontal: 20,
  borderRadius: 12,
  marginTop: 10,
  alignItems: "center",
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
  color: "black"
},
saveButton: {
  backgroundColor: "#007AFF",
  paddingVertical: 14,
  borderRadius: 10,
  alignItems: "center",
  marginTop: 5,
  fontWeight: "bold"
},
cancelText: {
  textAlign: "center",
  marginTop: 12,
  color: "black",
  fontWeight: "bold"
},

});
