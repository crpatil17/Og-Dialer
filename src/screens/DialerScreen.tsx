"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import CallManager from "../native/CallManager"
import { useCall } from "../context/CallContext"
import { useSim } from "../context/SimContext"
import { useNavigation } from "@react-navigation/native"
import SimSelectionModal from "../components/SimSelectionModal"

const DialerScreen: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [showSimSelection, setShowSimSelection] = useState(false)
  const { startCall } = useCall()
  const { simCards, isDualSim, selectSimForCall } = useSim()
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
      if (isDualSim && simCards.length > 1) {
        setShowSimSelection(true)
      } else {
        // Single SIM or no SIM selection needed
        startCall(phoneNumber)
        await CallManager.makeCall(phoneNumber)
      }
    } catch (error) {
      Alert.alert("Error", "Failed to make call")
      console.error("Call error:", error)
    }
  }

  const handleSimSelection = async (selectedSim: any) => {
    setShowSimSelection(false)
    try {
      startCall(phoneNumber)
      await CallManager.makeCallWithSim(phoneNumber, selectedSim.subscriptionId)
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
        <View style={styles.headerActions}>
          {isDualSim && (
            <View style={styles.simIndicator}>
              <Icon name="sim-card" size={16} color="#2196F3" />
              <Text style={styles.simText}>{simCards.length} SIMs</Text>
            </View>
          )}
          <TouchableOpacity onPress={() => navigation.navigate("Demo")} style={styles.demoButton}>
            <Icon name="play-circle-filled" size={24} color="#2196F3" />
          </TouchableOpacity>
        </View>
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

      <SimSelectionModal
        visible={showSimSelection}
        simCards={simCards}
        phoneNumber={phoneNumber}
        onSelectSim={handleSimSelection}
        onCancel={() => setShowSimSelection(false)}
      />
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
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  simIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  simText: {
    fontSize: 12,
    color: "#2196F3",
    marginLeft: 4,
    fontWeight: "500",
  },
  demoButton: {
    padding: 8,
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
})

export default DialerScreen
