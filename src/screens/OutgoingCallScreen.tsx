"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { CallManager } from "../native/CallManager"

const OutgoingCallScreen: React.FC = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { phoneNumber, contactName } = route.params as { phoneNumber: string; contactName?: string }
  const [callStatus, setCallStatus] = useState("Calling...")

  useEffect(() => {
    // Simulate call connection after 3 seconds
    const timer = setTimeout(() => {
      setCallStatus("Connected")
      navigation.replace("InCall")
    }, 3000)

    return () => clearTimeout(timer)
  }, [navigation])

  const handleEndCall = async () => {
    try {
      await CallManager.endCall()
      navigation.goBack()
    } catch (error) {
      navigation.goBack()
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.statusText}>{callStatus}</Text>

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
        <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
          <Icon name="call-end" size={32} color="white" />
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
  statusText: {
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
    alignItems: "center",
    paddingBottom: 64,
  },
  endCallButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F44336",
    justifyContent: "center",
    alignItems: "center",
  },
})

export default OutgoingCallScreen
