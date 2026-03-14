import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Linking,
  Alert,
  ImageBackground,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import logo from "../NETworkLogo.png";

export default function AI() {
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const url = "192.168.43.73";

  async function search() {
    if (!prompt.trim()) return;

    setHasSearched(true);
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`http://${url}:3000/api/ai/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ prompt })
      });

      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function searchReferral() {
    if (!prompt.trim()) return;

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(
        `http://${url}:3000/api/referralai/referral-search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ prompt })
        }
      );

      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const openWhatsApp = (nbr) => {
    if (!nbr) return;

    const phone = nbr.replace(/\s+/g, "");
    const url2 = `whatsapp://send?phone=${phone}`;

    Linking.openURL(url2).catch(() =>
      Alert.alert("WhatsApp not installed")
    );
  };

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

          {/* LOGO */}
          <View style={styles.logoContainer}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          </View>

          {/* SEARCH SECTION */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>AI Search</Text>

            <TextInput
              style={styles.input}
              placeholder="What are you looking for?"
              placeholderTextColor="#aaa"
              value={prompt}
              onChangeText={setPrompt}
              onSubmitEditing={search}
            />

            <TouchableOpacity
              style={styles.loginButton}
              onPress={search}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.loginText}>Search</Text>
              )}
            </TouchableOpacity>

            {hasSearched && !loading && results.length === 0 && (
              <TouchableOpacity
                style={[styles.loginButton, { marginTop: 15, backgroundColor: "#00d1b2" }]}
                onPress={searchReferral}
              >
                <Text style={styles.loginText}>Search for Referral Instead</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* RESULTS */}
          <FlatList
            data={results}
            keyExtractor={(item, i) => i.toString()}
            contentContainerStyle={{ paddingHorizontal: 25, paddingBottom: 40 }}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={styles.resultCard}
                onPress={() => openWhatsApp(item.phone)}
              >
                <Text style={styles.resultName}>{item.name}</Text>

                {item.phone && (
                  <Text style={styles.resultPhone}>📞 {item.phone}</Text>
                )}

                {item.profile_text && (
                  <Text style={styles.resultText} numberOfLines={3}>
                    {item.profile_text}
                  </Text>
                )}

                <Text style={styles.resultIndex}>Result #{index + 1}</Text>
              </TouchableOpacity>
            )}
          />

        </KeyboardAvoidingView>
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
    marginTop: 60,
    alignItems: "center",
  },

  logo: {
    width: 140,
    height: 140,
  },

  formContainer: {
    paddingHorizontal: 30,
    marginTop: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
    textAlign: "center",
  },

  input: {
    backgroundColor: "#161B22",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 15,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#30363D",
    color: "white",
  },

  loginButton: {
    backgroundColor: "#4F46E5",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    elevation: 5,
  },

  loginText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  resultCard: {
    backgroundColor: "#161B22",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#30363D",
  },

  resultName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },

  resultPhone: {
    fontSize: 14,
    color: "#00d1b2",
    marginBottom: 5,
  },

  resultText: {
    fontSize: 14,
    color: "#C9D1D9",
    marginBottom: 10,
  },

  resultIndex: {
    fontSize: 12,
    color: "#8B949E",
    textAlign: "right",
  },
});