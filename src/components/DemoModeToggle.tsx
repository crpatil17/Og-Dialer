import type React from "react"
import { Text, TouchableOpacity, StyleSheet, Alert } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"

interface DemoModeToggleProps {
  isDemoMode: boolean
  onToggle: () => void
}

const DemoModeToggle: React.FC<DemoModeToggleProps> = ({ isDemoMode, onToggle }) => {
  const handleToggle = () => {
    Alert.alert(
      "Demo Mode",
      isDemoMode
        ? "Switch to live data? This will use your actual contacts and call logs."
        : "Switch to demo mode? This will show sample data for demonstration.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Switch", onPress: onToggle },
      ],
    )
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handleToggle}>
      <Icon name={isDemoMode ? "visibility" : "visibility-off"} size={16} color={isDemoMode ? "#4CAF50" : "#666"} />
      <Text style={[styles.text, { color: isDemoMode ? "#4CAF50" : "#666" }]}>
        {isDemoMode ? "Demo Mode" : "Live Mode"}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
  },
  text: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
})

export default DemoModeToggle
