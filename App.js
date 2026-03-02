import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import SignUpScreen from "./components/SignUpScreen";
import LoginScreen from "./components/LoginScreen";
import DisplayContacts from "./components/DisplayContacts";
import ContatDetails from "./components/ContactDetails";
import MyDefaultDescription from "./components/MyDefaultDescription";
import Menu from "./components/Menu";
import Review from "./components/Review";
import Settings from "./components/Settings";
import AI from "./components/AI";
import Referral from "./components/Referral";
import Recommendations from "./components/Recommendations"
const Stack = createNativeStackNavigator();

// 🔥 Create Query Client
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator  screenOptions={{ headerShown: false }}>
          <Stack.Screen name="LogIn" component={LoginScreen} />
          <Stack.Screen name="Menu" component={Menu} />
          <Stack.Screen name="My Contacts" component={DisplayContacts} />
          <Stack.Screen name="Default" component={MyDefaultDescription} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="Details" component={ContatDetails} />
          <Stack.Screen name="Reviews" component={Review} />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="AI" component={AI} />
          <Stack.Screen name="Referral" component={Referral} />
          <Stack.Screen name="Recommendations" component={Recommendations} />
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}
