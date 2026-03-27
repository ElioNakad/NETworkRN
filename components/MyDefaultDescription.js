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
  ImageBackground,
  Image,
  ScrollView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import logo from "../NETworkLogo.png";
import BottomNav from "./BottomNav";
import { url } from "../config";

export default function MyDefaultDescription({navigation}) {
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [defaults, setDefaults] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

 // const url = "192.168.43.73";

  const loadDefaults = useCallback(async () => {
    try {
      setLoadingList(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const res = await fetch(
        `http://${url}:3000/api/description/get-default`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

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

  const handleSubmit = async () => {
    if (!label || !description) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const res = await fetch(
        `http://${url}:3000/api/description/set-default`,
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
      if (!res.ok) throw new Error(data.message);

      setLabel("");
      setDescription("");
      loadDefaults();
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      await fetch(
        `http://${url}:3000/api/description/default/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      loadDefaults();
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardLabel}>{item.label}</Text>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.cardDescription}>{item.description}</Text>
    </View>
  );

  return (
    <ImageBackground
      source={logo}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView>

            <View style={styles.logoContainer}>
              <Image source={logo} style={styles.logo} resizeMode="contain" />
            </View>

            <Text style={styles.title}>Default Descriptions</Text>

            <TextInput
              style={styles.input}
              placeholder="Label"
              placeholderTextColor="#aaa"
              value={label}
              onChangeText={setLabel}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              placeholderTextColor="#aaa"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryText}>Save</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>My Defaults</Text>

            {loadingList ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <FlatList
                data={defaults}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                scrollEnabled={false}
                ListEmptyComponent={
                  <Text style={styles.empty}>
                    No default descriptions yet
                  </Text>
                }
              />
            )}

          </ScrollView>
        </KeyboardAvoidingView>
        <BottomNav navigation={navigation} active="default" />
        
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },

  backgroundImage: {
    opacity: 0.8,
    resizeMode: "contain",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(13,17,23,0.95)",
    paddingHorizontal: 25,
  },

  logoContainer: {
    marginTop: 60,
    alignItems: "center",
  },

  logo: {
    width: 120,
    height: 120,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 25,
  },

  input: {
    backgroundColor: "#161B22",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 15,
    fontSize: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#30363D",
    color: "white",
  },

  textArea: {
    height: 110,
    textAlignVertical: "top",
  },

  primaryBtn: {
    backgroundColor: "#4F46E5",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 25,
  },

  primaryText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 15,
  },

  card: {
    backgroundColor: "#161B22",
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#30363D",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardLabel: {
    fontWeight: "bold",
    fontSize: 16,
    color: "white",
  },

  cardDescription: {
    marginTop: 6,
    color: "#ccc",
  },

  deleteIcon: {
    fontSize: 18,
  },

  empty: {
    textAlign: "center",
    color: "#aaa",
    marginTop: 20,
  },
});