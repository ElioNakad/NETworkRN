import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function BottomNav({ navigation, active }) {
  return (
    <View style={styles.bottomBar}>
        
      <BottomItem
        emoji="👥"
        active={active === "contacts"}
        onPress={() => navigation.navigate("My Contacts")}
        name={"CONTACTS"}
      />
      <BottomItem
        emoji="🪪"
        active={active === "default"}
        onPress={() => navigation.navigate("Default")}
        name={"LABELS"}
      />
     <BottomItem
        emoji="🏠"
        active={active === "menu"}
        onPress={() => navigation.navigate("Menu")}
        name={"HOME"}
      />
      <BottomItem
        emoji="✈️"
        active={active === "reco"}
        onPress={() => navigation.navigate("Recommendations")}
        name={"EXPLORE"}
      />
      <BottomItem
        emoji="⚙️"
        active={active === "settings"}
        onPress={() => navigation.navigate("Settings")}
        name={"SETTINGS"}
      />
      
      
    </View>
  );
}

function BottomItem({ emoji, onPress, active, name }) {
  return (
    <TouchableOpacity
      style={[styles.bottomItem, active && styles.bottomItemActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.bottomEmoji, active && styles.bottomEmojiActive]}>
        {emoji}
      </Text>

      <Text style={[styles.bottomLabel, active && styles.bottomLabelActive]}>
        {name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    height: 75,
    backgroundColor: "#161B22",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  bottomItem: {
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
  },
  bottomItemActive: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  bottomEmoji: {
    fontSize: 28,
    opacity: 0.85,
  },
  bottomEmojiActive: {
    opacity: 1,
  },
  bottomLabel: {
  fontSize: 11,
  color: "#aaa",
  marginTop: 2,
},

bottomLabelActive: {
  color: "#fff",
  fontWeight: "600",
},
});