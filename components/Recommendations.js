import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Alert
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Recommendations({ navigation }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const url = "192.168.16.105"; // your node server IP

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

      if (!res.ok) {
        throw new Error(data.message);
      }

      setRecommendations(data.recommendations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Open WhatsApp
  const openWhatsApp = (phone) => {
    if (!phone) {
      Alert.alert("Error", "No phone number available");
      return;
    }

    // Remove non-numeric characters
    let cleanedPhone = phone.replace(/\D/g, "");

    // If number starts with 0 (Lebanon), replace with 961
    if (cleanedPhone.startsWith("0")) {
      cleanedPhone = "961" + cleanedPhone.substring(1);
    }

    const url = `https://wa.me/${cleanedPhone}`;

    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Make sure WhatsApp is installed");
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>

        <Text style={styles.score}>
          Match Score:{" "}
          <Text style={styles.scoreValue}>
            {(item.similarity_score * 100).toFixed(1)}%
          </Text>
        </Text>

        {/* ✅ WhatsApp Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => openWhatsApp(item.phone)}
        >
          <Text style={styles.buttonText}>Message on WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Recommended People</Text>

      {recommendations.length === 0 ? (
        <Text style={styles.noData}>No recommendations available.</Text>
      ) : (
        <FlatList
          data={recommendations}
          keyExtractor={(item) => item.user_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f7fa"
  },

  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20
  },

  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15
  },

  avatarText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18
  },

  info: {
    flex: 1
  },

  name: {
    fontSize: 16,
    fontWeight: "600"
  },

  score: {
    marginTop: 4,
    color: "#666"
  },

  scoreValue: {
    fontWeight: "bold",
    color: "#000"
  },

  button: {
    marginTop: 10,
    backgroundColor: "#25D366",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: "flex-start"
  },

  buttonText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600"
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  error: {
    color: "red"
  },

  noData: {
    color: "#666",
    marginTop: 20
  }
});