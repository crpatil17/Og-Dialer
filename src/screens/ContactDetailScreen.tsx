import type React from "react"
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { CallManager } from "../native/CallManager"

const ContactDetailScreen: React.FC = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { contact } = route.params as { contact: any }

  const handleCall = async () => {
    try {
      await CallManager.makeCall(contact.phoneNumber)
    } catch (error) {
      Alert.alert("Error", "Failed to make call")
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Contact</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{contact.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.contactName}>{contact.name}</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
            <Icon name="call" size={24} color="#2196F3" />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Icon name="message" size={24} color="#2196F3" />
            <Text style={styles.actionButtonText}>Message</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Icon name="phone" size={20} color="#666" />
            <Text style={styles.infoText}>{contact.phoneNumber}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  avatarContainer: {
    alignItems: "center",
    marginVertical: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },
  contactName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 32,
  },
  actionButton: {
    alignItems: "center",
    padding: 16,
  },
  actionButtonText: {
    marginTop: 8,
    fontSize: 14,
    color: "#2196F3",
  },
  infoSection: {
    marginTop: 32,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  infoText: {
    marginLeft: 16,
    fontSize: 16,
    color: "#333",
  },
})

export default ContactDetailScreen
