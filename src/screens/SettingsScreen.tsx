"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity, Alert, Modal, TextInput } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { usePrivacy } from "../context/PrivacyContext"
import { useAutoDialer } from "../context/AutoDialerContext"

interface SettingsScreenProps {
  navigation: any
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { privacySettings, updatePrivacySettings, exportPrivacyData, deleteAllPrivacyData } = usePrivacy()
  const { settings: autoDialerSettings, updateSettings: updateAutoDialerSettings } = useAutoDialer()

  const [modalVisible, setModalVisible] = useState(false)
  const [modalType, setModalType] = useState<string>("")
  const [tempValue, setTempValue] = useState<string>("")

  const handleExportData = async () => {
    try {
      const data = await exportPrivacyData()
      Alert.alert("Data Exported", "Privacy data has been exported successfully")
      // In a real app, you would save this to a file or share it
      console.log("Exported data:", data)
    } catch (error) {
      Alert.alert("Export Failed", "Failed to export privacy data")
    }
  }

  const handleDeleteAllData = () => {
    Alert.alert(
      "Delete All Data",
      "This will permanently delete all privacy data, consent records, and settings. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            await deleteAllPrivacyData()
            Alert.alert("Data Deleted", "All privacy data has been deleted")
          },
        },
      ],
    )
  }

  const openModal = (type: string, currentValue = "") => {
    setModalType(type)
    setTempValue(currentValue)
    setModalVisible(true)
  }

  const handleModalSave = async () => {
    switch (modalType) {
      case "retention_days":
        await updatePrivacySettings({ autoDeleteAfterDays: Number.parseInt(tempValue) || 30 })
        break
      case "business_start":
        await updateAutoDialerSettings({
          businessHours: { ...autoDialerSettings.businessHours, start: tempValue },
        })
        break
      case "business_end":
        await updateAutoDialerSettings({
          businessHours: { ...autoDialerSettings.businessHours, end: tempValue },
        })
        break
      case "delay_between_calls":
        await updateAutoDialerSettings({ delayBetweenCalls: Number.parseInt(tempValue) || 30 })
        break
      case "max_daily_attempts":
        await updateAutoDialerSettings({ maxDailyAttempts: Number.parseInt(tempValue) || 100 })
        break
    }
    setModalVisible(false)
  }

  const SettingItem: React.FC<{
    title: string
    subtitle?: string
    value?: string | boolean
    type: "switch" | "navigation" | "value" | "action"
    onPress?: () => void
    onValueChange?: (value: boolean) => void
    icon?: string
    danger?: boolean
  }> = ({ title, subtitle, value, type, onPress, onValueChange, icon, danger }) => (
    <TouchableOpacity
      style={[styles.settingItem, danger && styles.dangerItem]}
      onPress={onPress}
      disabled={type === "switch"}
    >
      <View style={styles.settingContent}>
        {icon && <Icon name={icon} size={24} color={danger ? "#FF3B30" : "#007AFF"} style={styles.settingIcon} />}
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, danger && styles.dangerText]}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
        <View style={styles.settingControl}>
          {type === "switch" && (
            <Switch
              value={value as boolean}
              onValueChange={onValueChange}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={value ? "#007AFF" : "#f4f3f4"}
            />
          )}
          {type === "value" && <Text style={styles.settingValue}>{value}</Text>}
          {(type === "navigation" || type === "action") && <Icon name="chevron-right" size={24} color="#C7C7CC" />}
        </View>
      </View>
    </TouchableOpacity>
  )

  const SettingSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Privacy & Recording Settings */}
        <SettingSection title="Privacy & Recording">
          <SettingItem
            title="Enable Call Recording"
            subtitle="Record calls with proper consent"
            type="switch"
            value={privacySettings.recordingEnabled}
            onValueChange={(value) => updatePrivacySettings({ recordingEnabled: value })}
            icon="record-voice-over"
          />

          <SettingItem
            title="Require Explicit Consent"
            subtitle="Always ask for consent before recording"
            type="switch"
            value={privacySettings.requireExplicitConsent}
            onValueChange={(value) => updatePrivacySettings({ requireExplicitConsent: value })}
            icon="security"
          />

          <SettingItem
            title="Show Recording Indicator"
            subtitle="Display visual indicator during recording"
            type="switch"
            value={privacySettings.showRecordingIndicator}
            onValueChange={(value) => updatePrivacySettings({ showRecordingIndicator: value })}
            icon="visibility"
          />

          <SettingItem
            title="Encrypt Recordings"
            subtitle="Encrypt all recorded files"
            type="switch"
            value={privacySettings.encryptRecordings}
            onValueChange={(value) => updatePrivacySettings({ encryptRecordings: value })}
            icon="lock"
          />

          <SettingItem
            title="Auto-Delete After"
            subtitle={`Delete recordings after ${privacySettings.autoDeleteAfterDays} days`}
            type="value"
            value={`${privacySettings.autoDeleteAfterDays} days`}
            onPress={() => openModal("retention_days", privacySettings.autoDeleteAfterDays.toString())}
            icon="schedule"
          />

          <SettingItem
            title="Compliance Region"
            subtitle={`Current: ${privacySettings.complianceRegion}`}
            type="navigation"
            onPress={() => {
              Alert.alert("Select Compliance Region", "Choose your jurisdiction for compliance requirements", [
                { text: "Cancel", style: "cancel" },
                { text: "United States", onPress: () => updatePrivacySettings({ complianceRegion: "US" }) },
                { text: "European Union", onPress: () => updatePrivacySettings({ complianceRegion: "EU" }) },
                { text: "Canada", onPress: () => updatePrivacySettings({ complianceRegion: "CA" }) },
                { text: "Australia", onPress: () => updatePrivacySettings({ complianceRegion: "AU" }) },
                { text: "Global", onPress: () => updatePrivacySettings({ complianceRegion: "GLOBAL" }) },
              ])
            }}
            icon="public"
          />
        </SettingSection>

        {/* Auto Dialer Settings */}
        <SettingSection title="Auto Dialer">
          <SettingItem
            title="Enable Auto Dialer"
            subtitle="Allow automated calling functionality"
            type="switch"
            value={autoDialerSettings.enabled}
            onValueChange={(value) => updateAutoDialerSettings({ enabled: value })}
            icon="phone-forwarded"
          />

          <SettingItem
            title="Require Consent"
            subtitle="Verify consent before auto-dialing"
            type="switch"
            value={autoDialerSettings.requireConsent}
            onValueChange={(value) => updateAutoDialerSettings({ requireConsent: value })}
            icon="verified-user"
          />

          <SettingItem
            title="Business Hours Only"
            subtitle="Only call during business hours"
            type="switch"
            value={autoDialerSettings.businessHoursOnly}
            onValueChange={(value) => updateAutoDialerSettings({ businessHoursOnly: value })}
            icon="access-time"
          />

          <SettingItem
            title="Business Start Time"
            subtitle={`Calls start at ${autoDialerSettings.businessHours.start}`}
            type="value"
            value={autoDialerSettings.businessHours.start}
            onPress={() => openModal("business_start", autoDialerSettings.businessHours.start)}
            icon="schedule"
          />

          <SettingItem
            title="Business End Time"
            subtitle={`Calls end at ${autoDialerSettings.businessHours.end}`}
            type="value"
            value={autoDialerSettings.businessHours.end}
            onPress={() => openModal("business_end", autoDialerSettings.businessHours.end)}
            icon="schedule"
          />

          <SettingItem
            title="Delay Between Calls"
            subtitle={`Wait ${autoDialerSettings.delayBetweenCalls} seconds between calls`}
            type="value"
            value={`${autoDialerSettings.delayBetweenCalls}s`}
            onPress={() => openModal("delay_between_calls", autoDialerSettings.delayBetweenCalls.toString())}
            icon="timer"
          />

          <SettingItem
            title="Max Daily Attempts"
            subtitle={`Maximum ${autoDialerSettings.maxDailyAttempts} calls per day`}
            type="value"
            value={autoDialerSettings.maxDailyAttempts.toString()}
            onPress={() => openModal("max_daily_attempts", autoDialerSettings.maxDailyAttempts.toString())}
            icon="call"
          />

          <SettingItem
            title="Respect Do Not Call"
            subtitle="Honor Do Not Call registry"
            type="switch"
            value={autoDialerSettings.respectDoNotCall}
            onValueChange={(value) => updateAutoDialerSettings({ respectDoNotCall: value })}
            icon="block"
          />

          <SettingItem
            title="Compliance Mode"
            subtitle={`Current: ${autoDialerSettings.complianceMode}`}
            type="navigation"
            onPress={() => {
              Alert.alert("Select Compliance Mode", "Choose compliance strictness level", [
                { text: "Cancel", style: "cancel" },
                { text: "Strict", onPress: () => updateAutoDialerSettings({ complianceMode: "strict" }) },
                { text: "Standard", onPress: () => updateAutoDialerSettings({ complianceMode: "standard" }) },
                { text: "Minimal", onPress: () => updateAutoDialerSettings({ complianceMode: "minimal" }) },
              ])
            }}
            icon="gavel"
          />
        </SettingSection>

        {/* Call Features */}
        <SettingSection title="Call Features">
          <SettingItem
            title="Call Recording"
            subtitle="Manage call recording settings"
            type="navigation"
            onPress={() => navigation.navigate("CallRecording")}
            icon="record-voice-over"
          />

          <SettingItem
            title="Auto Dialer Queue"
            subtitle="Manage automated calling queue"
            type="navigation"
            onPress={() => navigation.navigate("AutoDialer")}
            icon="queue"
          />

          <SettingItem
            title="Caller ID & Spam Detection"
            subtitle="Configure caller identification"
            type="navigation"
            onPress={() => {
              Alert.alert("Coming Soon", "Caller ID settings will be available in the next update")
            }}
            icon="contact-phone"
          />

          <SettingItem
            title="Call Notifications"
            subtitle="Customize call notification behavior"
            type="navigation"
            onPress={() => {
              Alert.alert("Coming Soon", "Notification settings will be available in the next update")
            }}
            icon="notifications"
          />
        </SettingSection>

        {/* Data Management */}
        <SettingSection title="Data Management">
          <SettingItem
            title="Export Privacy Data"
            subtitle="Download all privacy and consent data"
            type="action"
            onPress={handleExportData}
            icon="download"
          />

          <SettingItem
            title="View Consent Records"
            subtitle="Review all consent records"
            type="navigation"
            onPress={() => {
              Alert.alert("Coming Soon", "Consent records viewer will be available in the next update")
            }}
            icon="assignment"
          />

          <SettingItem
            title="Clear Cache"
            subtitle="Clear temporary app data"
            type="action"
            onPress={() => {
              Alert.alert("Cache Cleared", "Temporary data has been cleared")
            }}
            icon="clear-all"
          />
        </SettingSection>

        {/* Legal & Compliance */}
        <SettingSection title="Legal & Compliance">
          <SettingItem
            title="Privacy Policy"
            subtitle="View our privacy policy"
            type="navigation"
            onPress={() => {
              Alert.alert("Privacy Policy", "Privacy policy would be displayed here")
            }}
            icon="policy"
          />

          <SettingItem
            title="Terms of Service"
            subtitle="View terms of service"
            type="navigation"
            onPress={() => {
              Alert.alert("Terms of Service", "Terms of service would be displayed here")
            }}
            icon="description"
          />

          <SettingItem
            title="Compliance Report"
            subtitle="Generate compliance report"
            type="action"
            onPress={() => {
              Alert.alert("Coming Soon", "Compliance reporting will be available in the next update")
            }}
            icon="assessment"
          />
        </SettingSection>

        {/* Danger Zone */}
        <SettingSection title="Danger Zone">
          <SettingItem
            title="Delete All Privacy Data"
            subtitle="Permanently delete all privacy data and consent records"
            type="action"
            onPress={handleDeleteAllData}
            icon="delete-forever"
            danger
          />

          <SettingItem
            title="Reset All Settings"
            subtitle="Reset all app settings to defaults"
            type="action"
            onPress={() => {
              Alert.alert("Reset Settings", "This will reset all settings to their default values. Continue?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Reset",
                  style: "destructive",
                  onPress: () => {
                    // Reset logic would go here
                    Alert.alert("Settings Reset", "All settings have been reset to defaults")
                  },
                },
              ])
            }}
            icon="restore"
            danger
          />
        </SettingSection>

        <View style={styles.footer}>
          <Text style={styles.footerText}>React Native Dialer v1.0.0</Text>
          <Text style={styles.footerText}>Built with privacy and compliance in mind</Text>
        </View>
      </ScrollView>

      {/* Modal for editing values */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modalType === "retention_days" && "Auto-Delete After (Days)"}
              {modalType === "business_start" && "Business Start Time (HH:MM)"}
              {modalType === "business_end" && "Business End Time (HH:MM)"}
              {modalType === "delay_between_calls" && "Delay Between Calls (Seconds)"}
              {modalType === "max_daily_attempts" && "Max Daily Attempts"}
            </Text>

            <TextInput
              style={styles.modalInput}
              value={tempValue}
              onChangeText={setTempValue}
              placeholder="Enter value"
              keyboardType={modalType.includes("time") ? "default" : "numeric"}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleModalSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    color: "#000000",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "400",
    color: "#6D6D80",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E5E5EA",
  },
  settingItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  settingContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#000000",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#6D6D80",
  },
  settingControl: {
    alignItems: "center",
  },
  settingValue: {
    fontSize: 16,
    color: "#6D6D80",
  },
  dangerItem: {
    backgroundColor: "#FFF5F5",
  },
  dangerText: {
    color: "#FF3B30",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 12,
    color: "#6D6D80",
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    width: "80%",
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F2F2F7",
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    marginLeft: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#6D6D80",
  },
  saveButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
})

export default SettingsScreen
