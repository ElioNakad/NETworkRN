import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import SignUpScreen from "./components/SignUpScreen";
import LoginScreen from "./components/LoginScreen";
import DisplayContacts from "./components/DisplayContacts";
import ContatDetails from "./components/ContactDetails";
import MyDefaultDescription from "./components/MyDefaultDescription";
import Menu from "./components/Menu"
import Review from "./components/Review"
import Settings from "./components/Settings"
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="LogIn" component={LoginScreen} />
        <Stack.Screen name="Menu" component={Menu} />

        <Stack.Screen name="My Contacts" component={DisplayContacts} />
        <Stack.Screen name="Default" component={MyDefaultDescription} />

        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Details" component={ContatDetails} />
        <Stack.Screen name="Reviews" component={Review} />
        <Stack.Screen name="Settings" component={Settings} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});