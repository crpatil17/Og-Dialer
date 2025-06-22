"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useCall } from "../context/CallContext"
import { CallManager } from "../native/CallManager"

const InCallScreen: React.FC = () => {
  const navigation = useNavigation()
  const { callState, endCall, toggleMute, toggleSpeaker, toggleHold } = useCall()
  const [callDuration, setCallDuration] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      if (callState.currentCall?.startTime) {
        const duration = Math.floor((Date.now() - callState.currentCall.startTime.getTime()) / 1000)
        setCallDuration(duration)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [callState.currentCall?.startTime])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleEndCall = async () => {
    try {
      await CallManager.endCall()
      endCall()
      navigation.goBack()
    } catch (error) {
      endCall()
      navigation.goBack()
    }
  }

  const handleAddCall = () => {
    // Navigate to dialer to add another call
    navigation.navigate("Main", { screen: "Dialer" })
  }

  if (!callState.currentCall) {
    return null
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.durationText}>{formatDuration(callDuration)}</Text>

        <View style={styles.callerInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {callState.currentCall.contactName
                ? callState.currentCall.contactName.charAt(0).toUpperCase()
                : callState.currentCall.phoneNumber.charAt(0)}
            </Text>
          </View>
          <Text style={styles.callerName}>
            {callState.currentCall.contactName || callState.currentCall.phoneNumber}
          </Text>
          <Text style={styles.callerNumber}>
            {callState.currentCall.contactName ? callState.currentCall.phoneNumber : ""}
          </Text>
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.controlButton, callState.isMuted && styles.controlButtonActive]}
            onPress={toggleMute}
          >
            <Icon name={callState.isMuted ? "mic-off" : "mic"} size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, callState.isSpeakerOn && styles.controlButtonActive]}
            onPress={toggleSpeaker}
          >
            <Icon name="volume-up" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, callState.isOnHold && styles.controlButtonActive]}
            onPress={toggleHold}
          >
            <Icon name="pause" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.controlButton} onPress={handleAddCall}>
            <Icon name="person-add" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
            <Icon name="call-end" size={32} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton}>
            <Icon name="dialpad" size={24} color="white" />
          </TouchableOpacity>
        </View>
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
  durationText: {
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
  controlsContainer: {
    paddingHorizontal: 32,
    paddingBottom: 64,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  controlButtonActive: {
    backgroundColor: "#2196F3",
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

export default InCallScreen
