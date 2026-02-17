import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AuthLoading({ navigation }) {
  useEffect(() => {
  const checkToken = async () => {
    const token = await AsyncStorage.getItem("token");

    navigation.reset({
      index: 0,
      routes: [{ name: token ? "Menu" : "LogIn" }],
    });
    };

    checkToken();
   }, [navigation]);


  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
