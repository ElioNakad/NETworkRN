import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ImageBackground,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import logo from "../NETworkLogo.png";
import BottomNav from "./BottomNav";
import { url } from "../config";

export default function DisplayContacts({ navigation }) {
  const [searchName, setSearchName] = useState("");
  const [token, setToken] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem("token").then((t) => {
      setToken(t);
    });
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchContacts = async () => {
      try {
        setIsLoading(true);

        const res = await fetch(`http://${url}:3000/api/contacts/full`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        // ✅ Already enriched from backend
        setContacts(data.contacts);

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, [token]);

  const filteredContacts = useMemo(() => {
    const q = searchName.toLowerCase();

    return [...contacts]
      .filter(
        (c) =>
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

  return (
    <ImageBackground
      source={logo}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.addContactButton}
          onPress={() => navigation.navigate("AddContactScreen")}
        >
          <Text style={styles.addContactText}>➕ Add Contact</Text>
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>My Contacts</Text>
          <Text style={styles.count}>{contacts.length} contacts</Text>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, phone, or label"
          placeholderTextColor="#aaa"
          value={searchName}
          onChangeText={setSearchName}
        />

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={{ color: "white" }}>Error loading contacts</Text>
          </View>
        ) : !contacts.length ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>No contacts found</Text>
          </View>
        ) : (
          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item.contact_id.toString()}
            renderItem={renderContact}
            contentContainerStyle={{ paddingBottom: 30 }}
          />
        )}

        <BottomNav navigation={navigation} active="contacts" />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  backgroundImage: { opacity: 0.15, resizeMode: "contain" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(13,17,23,0.95)",
    paddingHorizontal: 20,
  },
  logoContainer: { marginTop: 60, alignItems: "center" },
  logo: { width: 120, height: 120 },
  header: { marginTop: 10, marginBottom: 15, alignItems: "center" },
  title: { fontSize: 26, fontWeight: "bold", color: "white" },
  count: { fontSize: 14, color: "#aaa", marginTop: 4 },
  searchInput: {
    backgroundColor: "#161B22",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 15,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#30363D",
    color: "white",
  },
  contactItem: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#161B22",
    borderRadius: 18,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#30363D",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: { color: "white", fontSize: 20, fontWeight: "bold" },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 18, fontWeight: "600", color: "white" },
  contactPhone: { fontSize: 14, color: "#aaa", marginTop: 4 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#999" },
  addContactButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#00d1b2",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    elevation: 4,
  },
  addContactText: { color: "white", fontWeight: "600", fontSize: 14 },
});