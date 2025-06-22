"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { CallManager } from "../native/CallManager"
import { useCall } from "../context/CallContext"
import { useNavigation } from "@react-navigation/native"

const DialerScreen: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState("")
  const { startCall } = useCall()
  const navigation = useNavigation()

  const handleNumberPress = (digit: string) => {
    setPhoneNumber((prev) => prev + digit)
  }

  const handleBackspace = () => {
    setPhoneNumber((prev) => prev.slice(0, -1))
  }

  const handleCall = async () => {
    if (phoneNumber.length === 0) return

    try {
      startCall(phoneNumber)
      await CallManager.makeCall(phoneNumber)
    } catch (error) {
      Alert.alert("Error", "Failed to make call")
      console.error("Call error:", error)
    }
  }

  const renderDialButton = (digit: string, letters?: string) => (
    <TouchableOpacity style={styles.dialButton} onPress={() => handleNumberPress(digit)}>
      <Text style={styles.digitText}>{digit}</Text>
      {letters && <Text style={styles.lettersText}>{letters}</Text>}
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dialer</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Demo")} style={styles.demoButton}>
          <Icon name="play-circle-filled" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <View style={styles.numberDisplay}>
        <Text style={styles.phoneNumberText}>{phoneNumber || "Enter number"}</Text>
        {phoneNumber.length > 0 && (
          <TouchableOpacity onPress={handleBackspace} style={styles.backspaceButton}>
            <Icon name="backspace" size={24} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.dialPad}>
        <View style={styles.dialRow}>
          {renderDialButton("1", "")}
          {renderDialButton("2", "ABC")}
          {renderDialButton("3", "DEF")}
        </View>
        <View style={styles.dialRow}>
          {renderDialButton("4", "GHI")}
          {renderDialButton("5", "JKL")}
          {renderDialButton("6", "MNO")}
        </View>
        <View style={styles.dialRow}>
          {renderDialButton("7", "PQRS")}
          {renderDialButton("8", "TUV")}
          {renderDialButton("9", "WXYZ")}
        </View>
        <View style={styles.dialRow}>
          {renderDialButton("*", "")}
          {renderDialButton("0", "+")}
          {renderDialButton("#", "")}
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.callButton, phoneNumber.length === 0 && styles.callButtonDisabled]}
          onPress={handleCall}
          disabled={phoneNumber.length === 0}
        >
          <Icon name="call" size={28} color="white" />
        </TouchableOpacity>
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
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  numberDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 24,
    minHeight: 80,
  },
  phoneNumberText: {
    fontSize: 24,
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  backspaceButton: {
    padding: 8,
  },
  dialPad: {
    flex: 1,
    paddingHorizontal: 32,
  },
  dialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dialButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  digitText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
  },
  lettersText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  actionButtons: {
    alignItems: "center",
    paddingBottom: 32,
  },
  callButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  callButtonDisabled: {
    backgroundColor: "#ccc",
  },
  demoButton: {
    position: "absolute",
    right: 16,
    top: 50,
    padding: 8,
  },
})

export default DialerScreen
