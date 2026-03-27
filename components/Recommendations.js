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
import { url } from "../config";

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
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          setExpandedUser(
            expandedUser === item.user_id ? null : item.user_id
          )
        }
      >
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

          {item.labels && item.labels.length > 0 && (
  <View style={styles.labelContainer}>
    {item.labels.map((label, index) => (
      <View key={index} style={styles.labelBadge}>
        <Text style={styles.labelText}>{label}</Text>
      </View>
    ))}
  </View>
)}

          <TouchableOpacity
            style={styles.button}
            onPress={() => openWhatsApp(item.phone)}
          >
            <Text style={styles.buttonText}>💬 Message</Text>
          </TouchableOpacity>

          {/* NETWORK TREE */}
          {/* NETWORK TREE */}
{/* NETWORK TREE */}
{expandedUser === item.user_id && item.bridge_user && (
  <View style={styles.networkBox}>
    <Text style={styles.networkLabel}>Connection Path</Text>

    <View style={styles.networkRow}>

      {/* YOU */}
      <View style={styles.node}>
        <View style={[styles.nodeCircle, { backgroundColor: "#4F46E5" }]}>
          <Text style={styles.nodeText}>Y</Text>
        </View>
        <Text style={styles.nodeLabel}>You</Text>
      </View>

      <View style={styles.connector} />

      {/* BRIDGE */}
      <View style={styles.node}>
        <View style={[styles.nodeCircle, { backgroundColor: "#D97706" }]}>
          <Text style={styles.nodeText}>
            {item.bridge_user.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.nodeLabel} numberOfLines={1}>
          {item.bridge_user.name}
        </Text>
      </View>

      <View style={styles.connector} />

      {/* TARGET */}
      <View style={styles.node}>
        <View style={[styles.nodeCircle, { backgroundColor: "#16A34A" }]}>
          <Text style={styles.nodeText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.nodeLabel} numberOfLines={1}>
          {item.name.split(" ")[0]}
        </Text>
      </View>

    </View>
  </View>
)}
        </View>
      </TouchableOpacity>
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

          <View style={styles.logoContainer}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          </View>

          <View style={styles.header}>
            <Text style={styles.headerTitle}>AI Recommendations</Text>
            <Text style={styles.headerSubtitle}>
              Discover people beyond your NETwork
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#6366F1"
              style={{ marginTop: 50 }}
            />
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
    flex: 1
  },

  backgroundImage: {
    opacity: 0.8,
    resizeMode: "contain"
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(13,17,23,0.95)"
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

  tree: {
    marginTop: 15,
    alignItems: "center"
  },

  treeNode: {
    color: "#58A6FF",
    fontWeight: "bold",
    fontSize: 14
  },

  treeLine: {
    color: "#8B949E",
    fontSize: 18
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
  },
  networkContainer: {
  marginTop: 20,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center"
},

nodeContainer: {
  alignItems: "center"
},


nodeWrapper: {
  alignItems: "center",
  width: 55
},

pulseRing: {
  display: "none"
},

connectorWrapper: {
  width: 40,
  alignItems: "center",
  justifyContent: "center",
  marginHorizontal: 3
},

connectorLine: {
  height: 2,
  width: "100%",
  backgroundColor: "#30363D",
  borderRadius: 1
},

hopLabel: {
  color: "#555E6B",
  fontSize: 8,
  marginBottom: 3
},

legend: {
  flexDirection: "row",
  justifyContent: "center",
  gap: 10,
  marginTop: 10
},

legendDot: {
  fontSize: 10
},
networkBox: {
  marginTop: 14,
  padding: 14,
  backgroundColor: "#0D1117",
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "#21262D"
},

networkLabel: {
  color: "#8B949E",
  fontSize: 11,
  marginBottom: 12,
  textAlign: "center"
},

networkRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center"
},

node: {
  alignItems: "center",
  width: 70
},

nodeCircle: {
  width: 36,
  height: 36,
  borderRadius: 18,
  justifyContent: "center",
  alignItems: "center"
},

nodeText: {
  color: "white",
  fontWeight: "bold",
  fontSize: 14
},

nodeLabel: {
  color: "#C9D1D9",
  fontSize: 10,
  marginTop: 5,
  maxWidth: 70,
  textAlign: "center"
},

connector: {
  width: 30,
  height: 2,
  backgroundColor: "#30363D",
  marginHorizontal: 5
},
labelContainer: {
  flexDirection: "row",
  flexWrap: "wrap",
  marginTop: 6,
},

labelBadge: {
  backgroundColor: "#EEF2FF",
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 12,
  marginRight: 6,
  marginTop: 4
},

labelText: {
  fontSize: 12,
  color: "#4F46E5",
  fontWeight: "500"
},
});