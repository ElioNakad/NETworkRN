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

  const [privateModalVisible, setPrivateModalVisible] = useState(false);
const [privateLabel, setPrivateLabel] = useState("");
const [privateDescription, setPrivateDescription] = useState("");
const [privateDescriptions, setPrivateDescriptions] = useState([]);
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

  const loadPrivateDescriptions = useCallback(async () => {
  if (!contact) return;

  try {
    const token = await AsyncStorage.getItem("token");

    const res = await fetch(
      `http://${url}:3000/api/description/get-private/${contact.contact_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    setPrivateDescriptions(data.descriptions);
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

  const handleSavePrivate = async () => {
  if (!privateLabel || !privateDescription) {
    Alert.alert("Error", "Both fields required");
    return;
  }

  try {
    const res = await fetch(
      `http://${url}:3000/api/description/insert-private`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_contact_id: contact.user_contact_id,
          label: privateLabel,
          description: privateDescription,
        }),
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    await loadPrivateDescriptions();

    setPrivateLabel("");
    setPrivateDescription("");
    setPrivateModalVisible(false);
  } catch (err) {
    Alert.alert("Error", err.message);
  }
};

const handlePrivateDelete = async (id) => {
  Alert.alert("Delete private label", "Are you sure?", [
    { text: "Cancel", style: "cancel" },
    {
      text: "Delete",
      style: "destructive",
      onPress: async () => {
        try {
          const token = await AsyncStorage.getItem("token");

          const res = await fetch(
            `http://${url}:3000/api/description/delete-private/${id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = await res.json();
          if (!res.ok) throw new Error(data.message);

          setPrivateDescriptions((prev) =>
            prev.filter((item) => item.id !== id)
          );
        } catch (err) {
          Alert.alert("Error", err.message);
        }
      },
    },
  ]);
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
      loadPrivateDescriptions(); 
    checkIfUserExists();
  }, [loadDescriptions, loadDefaultDescriptions,  loadPrivateDescriptions,
, checkIfUserExists]);


  if (!contact) {
    return (
      <View style={styles.center}>
        <Text>No contact data</Text>
      </View>
    );
  }

  return (
  <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
    <View style={styles.overlay}>

      {/* AVATAR */}
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
          </TouchableOpacity>
        )}
      </View>

      {/* NAME + BADGE */}
      <View style={styles.nameRow}>
        <Text style={styles.name}>{contact.display_name}</Text>

        {!checkingUser && (
          <Text
            style={[
              styles.userBadge,
              {
                backgroundColor: isUser ? "#34C759" : "#30363D",
              },
            ]}
          >
            {isUser ? "USER" : "NOT USER"}
          </Text>
        )}
      </View>

      <Text style={styles.phone}>{contact.phone}</Text>

      {/* LINKED INFO */}
      {isUser && linkedUser && (
        <View style={{ marginTop: 10 }}>
          {linkedUser.email && (
            <Text
              style={styles.link}
              onPress={() => Linking.openURL(`mailto:${linkedUser.email}`)}
            >
              📧 {linkedUser.email}
            </Text>
          )}

          {linkedUser.linkedin && (
            <Text
              style={styles.link}
              onPress={() => Linking.openURL(linkedUser.linkedin)}
            >
              🔗 View LinkedIn Profile
            </Text>
          )}
        </View>
      )}

      {/* BUTTONS */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>
          + Add Label
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => setPrivateModalVisible(true)}
      >
        <Text style={styles.buttonText}>
          + Add Private Label
        </Text>
      </TouchableOpacity>

      {/* DEFAULT LABELS */}
      <Text style={styles.sectionTitle}>Default Labels</Text>

      {defaultDescriptions.length === 0 && (
        <Text style={styles.emptyText}>No default labels</Text>
      )}

      {defaultDescriptions.map((item) => (
        <View key={item.id} style={styles.cardYellow}>
          <Text style={styles.cardTitle}>{item.label}</Text>
          <Text style={styles.cardText}>{item.description}</Text>
        </View>
      ))}

      {/* PRIVATE LABELS */}
      <Text style={styles.sectionTitle}>Private Labels</Text>

      {privateDescriptions.length === 0 && (
        <Text style={styles.emptyText}>No private labels yet</Text>
      )}

      {privateDescriptions.map((item) => (
        <View key={item.id} style={styles.cardPurple}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.label}</Text>
            <TouchableOpacity onPress={() => handlePrivateDelete(item.id)}>
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.cardText}>{item.description}</Text>
        </View>
      ))}

      {/* MANUAL LABELS */}
      <Text style={styles.sectionTitle}>Your Labels</Text>

      {loading && <Text style={{ color: "white" }}>Loading...</Text>}

      {!loading && descriptions.length === 0 && (
        <Text style={styles.emptyText}>No labels yet</Text>
      )}

      {descriptions.map((item) => (
        <View key={item.id} style={styles.cardBlue}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.label}</Text>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.cardText}>{item.description}</Text>
        </View>
      ))}

    </View>
  </ScrollView>
);
}

// =============================
// 🔹 STYLES
// =============================
const styles = StyleSheet.create({

  overlay: {
    flex: 1,
    backgroundColor: "rgba(13,17,23,0.97)",
    padding: 20,
  },

  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  avatar: {
    backgroundColor: "#4F46E5",
    width: 85,
    height: 85,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "white",
    fontSize: 34,
    fontWeight: "bold",
  },

  reviewsButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 14,
    backgroundColor: "#FFD700",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },

  reviewsText: {
    fontWeight: "bold",
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },

  phone: {
    color: "#aaa",
    marginTop: 4,
  },

  link: {
    color: "#4F46E5",
    fontWeight: "bold",
    marginTop: 6,
  },

  userBadge: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },

  sectionTitle: {
    marginTop: 25,
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },

  emptyText: {
    color: "#777",
    marginTop: 8,
  },

  primaryButton: {
    backgroundColor: "#4F46E5",
    padding: 14,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 20,
  },

  secondaryButton: {
    backgroundColor: "#8E44AD",
    padding: 14,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 12,
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  cardTitle: {
    fontWeight: "bold",
    color: "white",
  },

  cardText: {
    color: "#ccc",
    marginTop: 6,
  },

  cardBlue: {
    backgroundColor: "#161B22",
    padding: 14,
    borderRadius: 18,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#30363D",
  },

  cardPurple: {
    backgroundColor: "#1E152A",
    padding: 14,
    borderRadius: 18,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#3D2C5B",
  },

  cardYellow: {
    backgroundColor: "#2A220D",
    padding: 14,
    borderRadius: 18,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#5A4A14",
  },

  deleteIcon: {
    fontSize: 18,
    color: "#FF4D4D",
  },
});
