"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Switch } from "react-native"
import { useNavigation } from "@react-navigation/native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { usePrivacy } from "../context/PrivacyContext"

const CallRecordingScreen: React.FC = () => {
  const navigation = useNavigation()
  const { privacySettings, updatePrivacySettings, consentRecords, getComplianceRequirements } = usePrivacy()
  const [recordings, setRecordings] = useState([])
  const [isRecording, setIsRecording] = useState(false)

  const complianceReqs = getComplianceRequirements()

  const handleToggleRecording = async (enabled: boolean) => {
    if (enabled && !complianceReqs.requiresConsent) {
      Alert.alert(
        "Recording Consent Required",
        "Call recording requires explicit consent from all parties in your jurisdiction. " +
          "Ensure you have proper consent before enabling this feature.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "I Understand",
            onPress: () => updatePrivacySettings({ recordingEnabled: enabled }),
          },
        ],
      )
    } else {
      await updatePrivacySettings({ recordingEnabled: enabled })
    }
  }

  const renderComplianceInfo = () => (
    <View style={styles.complianceCard}>
      <View style={styles.complianceHeader}>
        <Icon name="security" size={24} color="#FF9800" />
        <Text style={styles.complianceTitle}>Compliance Information</Text>
      </View>
      <Text style={styles.complianceText}>• Consent required: {complianceReqs.requiresConsent ? "Yes" : "No"}</Text>
      <Text style={styles.complianceText}>• Max retention: {complianceReqs.maxRetentionDays} days</Text>
      <Text style={styles.complianceText}>
        • Notification required: {complianceReqs.requiresNotification ? "Yes" : "No"}
      </Text>
      <Text style={styles.complianceText}>• Region: {privacySettings.complianceRegion}</Text>
    </View>
  )

  const renderConsentStatus = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Consent Records</Text>
      {consentRecords.length === 0 ? (
        <Text style={styles.emptyText}>No consent records found</Text>
      ) : (
        consentRecords.map((record, index) => (
          <View key={index} style={styles.consentItem}>
            <Text style={styles.consentNumber}>{record.phoneNumber}</Text>
            <Text style={styles.consentDate}>Consented: {record.consentDate.toLocaleDateString()}</Text>
            <Text style={styles.consentPurpose}>Purpose: {record.recordingPurpose}</Text>
          </View>
        ))
      )}
    </View>
  )

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Call Recording</Text>
      </View>

      {renderComplianceInfo()}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recording Settings</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Enable Call Recording</Text>
            <Text style={styles.settingDescription}>Record calls with proper consent</Text>
          </View>
          <Switch
            value={privacySettings.recordingEnabled}
            onValueChange={handleToggleRecording}
            trackColor={{ false: "#ccc", true: "#4CAF50" }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Show Recording Indicator</Text>
            <Text style={styles.settingDescription}>Display recording status during calls</Text>
          </View>
          <Switch
            value={privacySettings.showRecordingIndicator}
            onValueChange={(value) => updatePrivacySettings({ showRecordingIndicator: value })}
            trackColor={{ false: "#ccc", true: "#4CAF50" }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Encrypt Recordings</Text>
            <Text style={styles.settingDescription}>Encrypt stored recordings for security</Text>
          </View>
          <Switch
            value={privacySettings.encryptRecordings}
            onValueChange={(value) => updatePrivacySettings({ encryptRecordings: value })}
            trackColor={{ false: "#ccc", true: "#4CAF50" }}
          />
        </View>
      </View>

      {renderConsentStatus()}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal Notice</Text>
        <Text style={styles.legalText}>
          Call recording laws vary by jurisdiction. You are responsible for:
          {"\n\n"}• Obtaining proper consent from all parties
          {"\n"}• Complying with local and federal laws
          {"\n"}• Informing participants about recording
          {"\n"}• Securing and properly handling recorded data
          {"\n"}• Respecting privacy rights
          {"\n\n"}Misuse of call recording features may result in legal consequences.
        </Text>
      </View>
    </ScrollView>
  )
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
  },
  complianceCard: {
    backgroundColor: "#FFF3E0",
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  complianceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  complianceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E65100",
    marginLeft: 8,
  },
  complianceText: {
    fontSize: 14,
    color: "#BF360C",
    marginBottom: 4,
  },
  section: {
    backgroundColor: "white",
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  settingDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  consentItem: {
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 8,
  },
  consentNumber: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  consentDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  consentPurpose: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    padding: 20,
  },
  legalText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
})

export default CallRecordingScreen
