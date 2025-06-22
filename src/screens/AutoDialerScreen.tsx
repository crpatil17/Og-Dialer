"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput } from "react-native"
import { useNavigation } from "@react-navigation/native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useAutoDialer } from "../context/AutoDialerContext"

const AutoDialerScreen: React.FC = () => {
  const navigation = useNavigation()
  const {
    callQueue,
    settings,
    isActive,
    currentCall,
    statistics,
    addToQueue,
    startAutoDialer,
    stopAutoDialer,
    validateCompliance,
  } = useAutoDialer()

  const [newCallNumber, setNewCallNumber] = useState("")
  const [newCallPurpose, setNewCallPurpose] = useState("")

  const handleAddCall = async () => {
    if (!newCallNumber.trim() || !newCallPurpose.trim()) {
      Alert.alert("Error", "Please enter both phone number and purpose")
      return
    }

    Alert.alert("Consent Verification", "Do you have explicit consent from this number to make automated calls?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, I have consent",
        onPress: async () => {
          await addToQueue([
            {
              phoneNumber: newCallNumber.trim(),
              priority: "medium",
              maxAttempts: 3,
              purpose: newCallPurpose.trim(),
              consentVerified: true,
            },
          ])
          setNewCallNumber("")
          setNewCallPurpose("")
        },
      },
    ])
  }

  const handleStartDialer = async () => {
    const compliance = await validateCompliance()
    if (!compliance.isCompliant) {
      Alert.alert("Compliance Issues", compliance.issues.join("\n"))
      return
    }

    const success = await startAutoDialer()
    if (!success) {
      Alert.alert("Failed to Start", "Auto dialer could not be started")
    }
  }

  const renderComplianceWarning = () => (
    <View style={styles.warningCard}>
      <View style={styles.warningHeader}>
        <Icon name="warning" size={24} color="#F44336" />
        <Text style={styles.warningTitle}>Important Legal Notice</Text>
      </View>
      <Text style={styles.warningText}>
        Automated calling is heavily regulated. Ensure you:
        {"\n\n"}• Have explicit consent from all recipients
        {"\n"}• Comply with TCPA, CAN-SPAM, and local laws
        {"\n"}• Respect Do Not Call registries
        {"\n"}• Maintain proper records
        {"\n"}• Provide opt-out mechanisms
        {"\n\n"}Violations can result in fines up to $1,500 per call.
      </Text>
    </View>
  )

  const renderStatistics = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{statistics.totalCalls}</Text>
        <Text style={styles.statLabel}>Total Calls</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{statistics.successfulCalls}</Text>
        <Text style={styles.statLabel}>Successful</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{callQueue.length}</Text>
        <Text style={styles.statLabel}>In Queue</Text>
      </View>
    </View>
  )

  const renderCurrentCall = () => {
    if (!currentCall) return null

    return (
      <View style={styles.currentCallCard}>
        <View style={styles.currentCallHeader}>
          <Icon name="phone" size={20} color="#4CAF50" />
          <Text style={styles.currentCallTitle}>Currently Calling</Text>
        </View>
        <Text style={styles.currentCallNumber}>{currentCall.phoneNumber}</Text>
        <Text style={styles.currentCallPurpose}>{currentCall.purpose}</Text>
        <Text style={styles.currentCallAttempt}>
          Attempt {currentCall.currentAttempts} of {currentCall.maxAttempts}
        </Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Auto Dialer</Text>
        <View style={[styles.statusIndicator, { backgroundColor: isActive ? "#4CAF50" : "#ccc" }]}>
          <Text style={styles.statusText}>{isActive ? "Active" : "Inactive"}</Text>
        </View>
      </View>

      {renderComplianceWarning()}
      {renderStatistics()}
      {renderCurrentCall()}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add Call to Queue</Text>

        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={newCallNumber}
          onChangeText={setNewCallNumber}
          keyboardType="phone-pad"
        />

        <TextInput
          style={styles.input}
          placeholder="Call Purpose (required for compliance)"
          value={newCallPurpose}
          onChangeText={setNewCallPurpose}
          multiline
        />

        <TouchableOpacity style={styles.addButton} onPress={handleAddCall}>
          <Icon name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>Add to Queue</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Call Queue ({callQueue.length})</Text>
          <View style={styles.controlButtons}>
            {!isActive ? (
              <TouchableOpacity
                style={[styles.controlButton, styles.startButton]}
                onPress={handleStartDialer}
                disabled={callQueue.length === 0}
              >
                <Icon name="play-arrow" size={20} color="white" />
                <Text style={styles.controlButtonText}>Start</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.controlButton, styles.stopButton]} onPress={stopAutoDialer}>
                <Icon name="stop" size={20} color="white" />
                <Text style={styles.controlButtonText}>Stop</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {callQueue.length === 0 ? (
          <Text style={styles.emptyText}>No calls in queue</Text>
        ) : (
          callQueue.map((call) => (
            <View key={call.id} style={styles.queueItem}>
              <View style={styles.queueItemHeader}>
                <Text style={styles.queueItemNumber}>{call.phoneNumber}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(call.status) }]}>
                  <Text style={styles.statusBadgeText}>{call.status}</Text>
                </View>
              </View>
              <Text style={styles.queueItemPurpose}>{call.purpose}</Text>
              <Text style={styles.queueItemAttempts}>
                Attempts: {call.currentAttempts}/{call.maxAttempts}
              </Text>
              {call.lastAttempt && (
                <Text style={styles.queueItemTime}>Last attempt: {call.lastAttempt.toLocaleString()}</Text>
              )}
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compliance Settings</Text>
        <View style={styles.complianceSettings}>
          <Text style={styles.complianceItem}>
            ✓ Business hours only: {settings.businessHoursOnly ? "Enabled" : "Disabled"}
          </Text>
          <Text style={styles.complianceItem}>✓ Consent required: {settings.requireConsent ? "Yes" : "No"}</Text>
          <Text style={styles.complianceItem}>✓ Do Not Call respect: {settings.respectDoNotCall ? "Yes" : "No"}</Text>
          <Text style={styles.complianceItem}>✓ Max daily attempts: {settings.maxDailyAttempts}</Text>
          <Text style={styles.complianceItem}>✓ Delay between calls: {settings.delayBetweenCalls}s</Text>
        </View>
      </View>
    </ScrollView>
  )

  function getStatusColor(status: string) {
    switch (status) {
      case "pending":
        return "#FFC107"
      case "calling":
        return "#2196F3"
      case "completed":
        return "#4CAF50"
      case "failed":
        return "#F44336"
      case "cancelled":
        return "#9E9E9E"
      default:
        return "#ccc"
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  warningCard: {
    backgroundColor: "#FFEBEE",
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#C62828",
    marginLeft: 8,
  },
  warningText: {
    fontSize: 14,
    color: "#B71C1C",
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: "row",
    margin: 16,
    marginTop: 0,
  },
  statCard: {
    backgroundColor: "white",
    flex: 1,
    margin: 4,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  currentCallCard: {
    backgroundColor: "#E8F5E8",
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  currentCallHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  currentCallTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
    marginLeft: 8,
  },
  currentCallNumber: {
    fontSize: 18,
    fontWeight: "500",
    color: "#1B5E20",
  },
  currentCallPurpose: {
    fontSize: 14,
    color: "#388E3C",
    marginTop: 4,
  },
  currentCallAttempt: {
    fontSize: 12,
    color: "#4CAF50",
    marginTop: 4,
  },
  section: {
    backgroundColor: "white",
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  controlButtons: {
    flexDirection: "row",
  },
  controlButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  startButton: {
    backgroundColor: "#4CAF50",
  },
  stopButton: {
    backgroundColor: "#F44336",
  },
  controlButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  queueItem: {
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 8,
  },
  queueItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  queueItemNumber: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  queueItemPurpose: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  queueItemAttempts: {
    fontSize: 12,
    color: "#999",
  },
  queueItemTime: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    padding: 20,
  },
  complianceSettings: {
    marginTop: 8,
  },
  complianceItem: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    paddingLeft: 8,
  },
})

export default AutoDialerScreen
