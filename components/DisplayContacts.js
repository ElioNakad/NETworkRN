import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";

export default function DisplayContacts({ navigation }) {
  const [searchName, setSearchName] = useState("");
  const [token, setToken] = useState(null);
  const url = "192.168.16.105";

  // 🔥 Load token once
  useEffect(() => {
    AsyncStorage.getItem("token").then(setToken);
  }, []);

  const fetchContacts = async () => {
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(`http://${url}:3000/api/contacts`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    const enriched = await Promise.all(
      data.contacts.map(async (c) => {
        try {
          const [manualRes, defaultRes, privateRes] = await Promise.all([
  fetch(
    `http://${url}:3000/api/description/${c.contact_id}`,
    { headers: { Authorization: `Bearer ${token}` } }
  ),
  fetch(
    `http://${url}:3000/api/description/default/${c.phone}`,
    { headers: { Authorization: `Bearer ${token}` } }
  ),
  fetch(
    `http://${url}:3000/api/description/get-private/${c.contact_id}`,
    { headers: { Authorization: `Bearer ${token}` } }
  ),
]);

const manual = await manualRes.json();
const defaults = await defaultRes.json();
const privates = await privateRes.json();

return {
  ...c,
  labels: [
    ...(manual.descriptions || []),
    ...(defaults.descriptions || []),
    ...(privates.descriptions || []), // 🔥 THIS WAS MISSING
  ].map((d) => d.label.toLowerCase()),
};
        } catch {
          return { ...c, labels: [] };
        }
      })
    );

    return enriched;
  };

  const {
    data: contacts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["contacts", token], // 🔥 FIXED
    queryFn: fetchContacts,
    enabled: !!token,              // 🔥 wait until token exists
    staleTime: 1000 * 60 * 5,
  });

  const filteredContacts = useMemo(() => {
    const q = searchName.toLowerCase();

    return  [...contacts]
      .filter((c) =>
        (c.display_name || "").toLowerCase().includes(q) ||
        (c.phone || "").includes(searchName) ||
        (c.labels || []).some((label) => label.includes(q))
      )
      .sort((a, b) =>
        (a.display_name || "").localeCompare(b.display_name || "")
      );
  }, [contacts, searchName]);

  const renderContact = ({ item }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() =>
        navigation.navigate("Details", {
          contact: item,
        })
      }
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

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>Error loading contacts</Text>
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
      <View style={styles.header}>
        <Text style={styles.title}>My Contacts</Text>
        <Text style={styles.count}>{contacts.length} contacts</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by name"
        placeholderTextColor="#999"
        value={searchName}
        onChangeText={setSearchName}
      />

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
