import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Alert,
  SafeAreaView,
  ImageBackground,
  Image
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNav from "./BottomNav";
import logo from "../NETworkLogo.png";

export default function Recommendations({ navigation }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const url = "192.168.16.105";

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`http://${url}:3000/api/recommendations`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setRecommendations(data.recommendations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = (phone) => {
    if (!phone) {
      Alert.alert("Error", "No phone number available");
      return;
    }

    let cleanedPhone = phone.replace(/\D/g, "");

    if (cleanedPhone.startsWith("0")) {
      cleanedPhone = "961" + cleanedPhone.substring(1);
    }

    const url = `https://wa.me/${cleanedPhone}`;

    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Make sure WhatsApp is installed");
    });
  };

  const renderItem = ({ item }) => {
    const match = (item.similarity_score * 100).toFixed(0);

    return (
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.info}>
          <View style={styles.topRow}>
            <Text style={styles.name}>{item.name}</Text>

            <View style={styles.matchBadge}>
              <Text style={styles.matchText}>{match}%</Text>
            </View>
          </View>

          <Text style={styles.subtitle}>
            AI Compatibility Score
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => openWhatsApp(item.phone)}
          >
            <Text style={styles.buttonText}>💬 Message</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground
      source={logo}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={{ flex: 1 }}>

          {/* LOGO */}
          <View style={styles.logoContainer}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          </View>

          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>AI Recommendations</Text>
            <Text style={styles.headerSubtitle}>
              Discover people beyond your NETwork
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 50 }} />
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : recommendations.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🚀</Text>
              <Text style={styles.emptyTitle}>No Matches Yet</Text>
              <Text style={styles.emptyText}>
                Try improving your default description to get better AI matches.
              </Text>
            </View>
          ) : (
            <FlatList
              data={recommendations}
              keyExtractor={(item) => item.user_id.toString()}
              renderItem={renderItem}
              contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
              showsVerticalScrollIndicator={false}
            />
          )}

          <BottomNav navigation={navigation} active="reco" />

        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({

  background: {
    flex: 1,
  },

  backgroundImage: {
    opacity: 0.8,
    resizeMode: "contain",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(13,17,23,0.95)",
  },

  logoContainer: {
    alignItems: "center",
    marginTop: 20
  },

  logo: {
    width: 120,
    height: 120
  },

  header: {
    paddingHorizontal: 25,
    paddingBottom: 10
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white"
  },

  headerSubtitle: {
    color: "#8B949E",
    marginTop: 5
  },

  card: {
    backgroundColor: "#161B22",
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#21262D"
  },

  avatar: {
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15
  },

  avatarText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold"
  },

  info: {
    flex: 1
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "white"
  },

  matchBadge: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20
  },

  matchText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 13
  },

  subtitle: {
    color: "#8B949E",
    marginTop: 6,
    fontSize: 13
  },

  button: {
    marginTop: 12,
    backgroundColor: "#25D366",
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: "center"
  },

  buttonText: {
    color: "white",
    fontWeight: "600"
  },

  error: {
    color: "red",
    textAlign: "center",
    marginTop: 50
  },

  emptyState: {
    alignItems: "center",
    marginTop: 100,
    paddingHorizontal: 40
  },

  emptyEmoji: {
    fontSize: 50
  },

  emptyTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 15
  },

  emptyText: {
    color: "#8B949E",
    textAlign: "center",
    marginTop: 10
  }
});