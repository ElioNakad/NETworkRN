import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DisplayContacts() {
  const [contacts, setContacts] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  async function loadContacts() {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "Not authenticated");
        return;
      }

      const res = await fetch(
        "http://192.168.16.103:3000/api/contacts",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load contacts");
      }

      setContacts(data.contacts);
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredContacts = useMemo(() => {
    return [...contacts]
      .filter((c) =>
        (c.display_name || "")
          .toLowerCase()
          .includes(searchName.toLowerCase())
      )
      .sort((a, b) =>
        (a.display_name || "").localeCompare(b.display_name || "")
      );
  }, [contacts, searchName]);

  const openWhatsApp = (phone) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/[^\d]/g, "");
    const url = `whatsapp://send?phone=${cleanPhone}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          Alert.alert("Error", "WhatsApp is not installed");
        } else {
          return Linking.openURL(url);
        }
      })
      .catch(() => Alert.alert("Error", "Something went wrong"));
  };

  const renderContact = ({ item }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => openWhatsApp(item.phone)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.display_name ? item.display_name[0] : "?"}
        </Text>
      </View>

      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.display_name}</Text>
        <Text style={styles.contactPhone}>{item.phone}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!contacts.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No contacts found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>My Contacts</Text>
        <Text style={styles.count}>{contacts.length} contacts</Text>
      </View>

      {/* SEARCH */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by name"
        placeholderTextColor="#999"
        value={searchName}
        onChangeText={setSearchName}
      />

      {/* LIST */}
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.contact_id.toString()}
        renderItem={renderContact}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#007AFF",
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  count: {
    fontSize: 16,
    color: "white",
    marginTop: 5,
  },
  searchInput: {
    backgroundColor: "white",
    margin: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    color: "#333",
  },
  contactItem: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  contactPhone: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#999",
  },
});
