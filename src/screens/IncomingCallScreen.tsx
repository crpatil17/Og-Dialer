import type React from "react"
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useCall } from "../context/CallContext"

const { width } = Dimensions.get("window")

const IncomingCallScreen: React.FC = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { phoneNumber, contactName } = route.params as { phoneNumber: string; contactName?: string }
  const { startCall } = useCall()

  const handleAnswer = () => {
    startCall(phoneNumber, contactName, true)
    navigation.replace("InCall")
  }

  const handleReject = () => {
    navigation.goBack()
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.incomingText}>Incoming call</Text>

        <View style={styles.callerInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {contactName ? contactName.charAt(0).toUpperCase() : phoneNumber.charAt(0)}
            </Text>
          </View>
          <Text style={styles.callerName}>{contactName || phoneNumber}</Text>
          <Text style={styles.callerNumber}>{contactName ? phoneNumber : ""}</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
          <Icon name="call-end" size={32} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.answerButton} onPress={handleAnswer}>
          <Icon name="call" size={32} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  incomingText: {
    fontSize: 18,
    color: "#ccc",
    marginBottom: 32,
  },
  callerInfo: {
    alignItems: "center",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  avatarText: {
    color: "white",
    fontSize: 48,
    fontWeight: "bold",
  },
  callerName: {
    fontSize: 28,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
    marginBottom: 8,
  },
  callerNumber: {
    fontSize: 18,
    color: "#ccc",
    textAlign: "center",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 64,
    paddingBottom: 64,
  },
  rejectButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F44336",
    justifyContent: "center",
    alignItems: "center",
  },
  answerButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
})

export default IncomingCallScreen
