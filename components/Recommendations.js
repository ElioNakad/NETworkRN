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
  Image,
  Dimensions
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNav from "./BottomNav";
import logo from "../NETworkLogo.png";
import { url } from "../config";

const { width } = Dimensions.get("window");

export default function Recommendations({ navigation }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`http://${url}:3000/api/recommendations`, {
        headers: { Authorization: `Bearer ${token}` }
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
    if (cleanedPhone.startsWith("0")) cleanedPhone = "961" + cleanedPhone.substring(1);
    const whatsappUrl = `https://wa.me/${cleanedPhone}`;
    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert("Error", "Make sure WhatsApp is installed");
    });
  };

  const renderItem = ({ item }) => {
    const match = (item.similarity_score * 100).toFixed(0);
    const isExpanded = expandedUser === item.user_id;

    return (
      <View style={[styles.cardWrapper, isExpanded && styles.cardExpanded]}>
        <View style={styles.card}>
          {/* TOP SECTION: AVATAR & BASIC INFO */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setExpandedUser(isExpanded ? null : item.user_id)}
            style={styles.cardHeader}
          >
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.onlineIndicator} />
            </View>

            <View style={styles.mainInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{item.name}</Text>
                <View style={[styles.matchBadge, { borderColor: match > 80 ? "#22C55E" : "#6366F1" }]}>
                  <Text style={styles.matchText}>{match}% Match</Text>
                </View>
              </View>
              <Text style={styles.subtitle}>AI-Powered Connection</Text>
            </View>
          </TouchableOpacity>

          {/* LABELS SECTION */}
          {item.labels && item.labels.length > 0 && (
            <View style={styles.labelContainer}>
              {item.labels.slice(0, 3).map((label, index) => (
                <View key={index} style={styles.labelBadge}>
                  <Text style={styles.labelText}>#{label.toLowerCase()}</Text>
                </View>
              ))}
              {item.labels.length > 3 && (
                <Text style={styles.moreLabels}>+{item.labels.length - 3} more</Text>
              )}
            </View>
          )}

          {/* ACTIONS */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.msgButton} onPress={() => openWhatsApp(item.phone)}>
              <Text style={styles.msgButtonText}>Send Message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.expandIcon}
              onPress={() => setExpandedUser(isExpanded ? null : item.user_id)}
            >
              <Text style={{ color: "#8B949E", fontSize: 12 }}>
                {isExpanded ? "Hide Path" : "View Path"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* NETWORK PATH - EXPANDABLE */}
          {isExpanded && item.bridge_user && (
            <View style={styles.networkBox}>
              <View style={styles.pathHeader}>
                <View style={styles.pathLine} />
                <Text style={styles.networkLabel}>CONNECTION PATH</Text>
                <View style={styles.pathLine} />
              </View>

              <View style={styles.networkRow}>
                <View style={styles.node}>
                  <View style={[styles.nodeCircle, { backgroundColor: "#4F46E5" }]}>
                    <Text style={styles.nodeText}>Y</Text>
                  </View>
                  <Text style={styles.nodeName}>You</Text>
                </View>

                <View style={styles.connector} />

                <View style={styles.node}>
                  <View style={[styles.nodeCircle, { backgroundColor: "#D97706" }]}>
                    <Text style={styles.nodeText}>
                      {item.bridge_user.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.nodeName} numberOfLines={1}>
                    {item.bridge_user.name}
                  </Text>
                </View>

                <View style={styles.connector} />

                <View style={styles.node}>
                  <View style={[styles.nodeCircle, { backgroundColor: "#10B981" }]}>
                    <Text style={styles.nodeText}>{item.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <Text style={styles.nodeName} numberOfLines={1}>
                    {item.name.split(" ")[0]}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <ImageBackground source={logo} style={styles.background} imageStyle={styles.backgroundImage}>
      <View style={styles.overlay}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.topHeader}>
            <Image source={logo} style={styles.smallLogo} resizeMode="contain" />
            <View>
              <Text style={styles.headerTitle}>Discovery</Text>
              <Text style={styles.headerSubtitle}>Beyond your direct circle</Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#6366F1" />
              <Text style={styles.loadingText}>Analyzing Network...</Text>
            </View>
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : recommendations.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔭</Text>
              <Text style={styles.emptyTitle}>Expanding Horizons</Text>
              <Text style={styles.emptyText}>
                No matches found. Update your profile to help our AI find your peers.
              </Text>
            </View>
          ) : (
            <FlatList
              data={recommendations}
              keyExtractor={(item) => item.user_id.toString()}
              renderItem={renderItem}
              contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
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
  background: { flex: 1, backgroundColor: "#0D1117" },
  backgroundImage: { opacity: 0.05, resizeMode: "cover" },
  overlay: { flex: 1, backgroundColor: "rgba(13,17,23,0.96)" },

  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10
  },
  smallLogo: { width: 40, height: 40, marginRight: 12 },
  headerTitle: { fontSize: 26, fontWeight: "800", color: "white" },
  headerSubtitle: { color: "#8B949E", fontSize: 13 },

  cardWrapper: { marginBottom: 16 },
  card: {
    backgroundColor: "#161B22",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#30363D"
  },
  cardExpanded: {
    borderColor: "#4F46E5",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5
  },

  cardHeader: { flexDirection: "row", alignItems: "center" },
  avatarContainer: { position: "relative" },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#30363D"
  },
  avatarText: { color: "white", fontSize: 22, fontWeight: "bold" },
  onlineIndicator: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#161B22"
  },

  mainInfo: { flex: 1, marginLeft: 15 },
  nameRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 18, fontWeight: "700", color: "white" },
  matchBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, borderWidth: 1 },
  matchText: { color: "white", fontSize: 11, fontWeight: "800" },
  subtitle: { color: "#8B949E", fontSize: 12, marginTop: 2 },

  labelContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 15, alignItems: "center" },
  labelBadge: {
    backgroundColor: "rgba(79, 70, 229, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "rgba(79, 70, 229, 0.2)"
  },
  labelText: { fontSize: 11, color: "#818CF8", fontWeight: "600" },
  moreLabels: { color: "#444C56", fontSize: 11, fontWeight: "600" },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(48, 54, 61, 0.4)"
  },
  msgButton: { backgroundColor: "#25D366", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  msgButtonText: { color: "white", fontWeight: "bold", fontSize: 14 },
  expandIcon: { padding: 5 },

  networkBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#0D1117",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#30363D"
  },
  pathHeader: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 15 },
  pathLine: { flex: 1, height: 1, backgroundColor: "#30363D" },
  networkLabel: { color: "#8B949E", fontSize: 10, fontWeight: "800", marginHorizontal: 10 },
  networkRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  node: { alignItems: "center", width: 60 },
  nodeCircle: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  nodeText: { color: "white", fontWeight: "bold", fontSize: 12 },
  nodeName: { color: "#8B949E", fontSize: 9, marginTop: 6, textAlign: "center" },
  connector: { flex: 1, height: 1, backgroundColor: "#30363D", marginTop: -15 },

  center: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 100 },
  loadingText: { color: "#8B949E", marginTop: 15, fontSize: 14 },
  error: { color: "#F85149", textAlign: "center", marginTop: 50, fontWeight: "600" },
  emptyState: { alignItems: "center", marginTop: 80, paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 60, marginBottom: 20 },
  emptyTitle: { color: "white", fontSize: 22, fontWeight: "bold" },
  emptyText: { color: "#8B949E", textAlign: "center", marginTop: 10, lineHeight: 20 }
});