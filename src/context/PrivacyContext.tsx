"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface ConsentRecord {
  phoneNumber: string
  consentGiven: boolean
  consentDate: Date
  consentType: "explicit" | "implied" | "legal_basis"
  recordingPurpose: string
  dataRetentionPeriod: number // days
  canRevoke: boolean
}

interface PrivacySettings {
  recordingEnabled: boolean
  autoDeleteAfterDays: number
  encryptRecordings: boolean
  requireExplicitConsent: boolean
  showRecordingIndicator: boolean
  allowThirdPartySharing: boolean
  complianceRegion: "US" | "EU" | "CA" | "AU" | "GLOBAL"
}

interface PrivacyContextType {
  privacySettings: PrivacySettings
  consentRecords: ConsentRecord[]
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => Promise<void>
  requestRecordingConsent: (phoneNumber: string, purpose: string) => Promise<boolean>
  revokeConsent: (phoneNumber: string) => Promise<void>
  checkConsentStatus: (phoneNumber: string) => ConsentRecord | null
  getComplianceRequirements: () => {
    requiresConsent: boolean
    maxRetentionDays: number
    allowsImpliedConsent: boolean
    requiresNotification: boolean
  }
  exportPrivacyData: () => Promise<string>
  deleteAllPrivacyData: () => Promise<void>
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined)

export const PrivacyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    recordingEnabled: false,
    autoDeleteAfterDays: 30,
    encryptRecordings: true,
    requireExplicitConsent: true,
    showRecordingIndicator: true,
    allowThirdPartySharing: false,
    complianceRegion: "GLOBAL",
  })

  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([])

  useEffect(() => {
    loadPrivacyData()
  }, [])

  const loadPrivacyData = async () => {
    try {
      const settingsData = await AsyncStorage.getItem("privacy_settings")
      const consentData = await AsyncStorage.getItem("consent_records")

      if (settingsData) {
        setPrivacySettings(JSON.parse(settingsData))
      }

      if (consentData) {
        const records = JSON.parse(consentData).map((record: any) => ({
          ...record,
          consentDate: new Date(record.consentDate),
        }))
        setConsentRecords(records)
      }
    } catch (error) {
      console.error("Error loading privacy data:", error)
    }
  }

  const updatePrivacySettings = async (newSettings: Partial<PrivacySettings>) => {
    const updatedSettings = { ...privacySettings, ...newSettings }
    setPrivacySettings(updatedSettings)
    await AsyncStorage.setItem("privacy_settings", JSON.stringify(updatedSettings))
  }

  const requestRecordingConsent = async (phoneNumber: string, purpose: string): Promise<boolean> => {
    // This would typically show a consent dialog
    const consentRecord: ConsentRecord = {
      phoneNumber,
      consentGiven: true, // This would be set based on user response
      consentDate: new Date(),
      consentType: "explicit",
      recordingPurpose: purpose,
      dataRetentionPeriod: privacySettings.autoDeleteAfterDays,
      canRevoke: true,
    }

    const updatedRecords = [...consentRecords.filter((r) => r.phoneNumber !== phoneNumber), consentRecord]
    setConsentRecords(updatedRecords)
    await AsyncStorage.setItem("consent_records", JSON.stringify(updatedRecords))

    return consentRecord.consentGiven
  }

  const revokeConsent = async (phoneNumber: string) => {
    const updatedRecords = consentRecords.filter((r) => r.phoneNumber !== phoneNumber)
    setConsentRecords(updatedRecords)
    await AsyncStorage.setItem("consent_records", JSON.stringify(updatedRecords))
  }

  const checkConsentStatus = (phoneNumber: string): ConsentRecord | null => {
    return consentRecords.find((r) => r.phoneNumber === phoneNumber) || null
  }

  const getComplianceRequirements = () => {
    const requirements = {
      US: { requiresConsent: true, maxRetentionDays: 365, allowsImpliedConsent: true, requiresNotification: true },
      EU: { requiresConsent: true, maxRetentionDays: 90, allowsImpliedConsent: false, requiresNotification: true },
      CA: { requiresConsent: true, maxRetentionDays: 180, allowsImpliedConsent: true, requiresNotification: true },
      AU: { requiresConsent: true, maxRetentionDays: 365, allowsImpliedConsent: true, requiresNotification: true },
      GLOBAL: { requiresConsent: true, maxRetentionDays: 30, allowsImpliedConsent: false, requiresNotification: true },
    }

    return requirements[privacySettings.complianceRegion]
  }

  const exportPrivacyData = async (): Promise<string> => {
    const data = {
      settings: privacySettings,
      consents: consentRecords,
      exportDate: new Date().toISOString(),
    }
    return JSON.stringify(data, null, 2)
  }

  const deleteAllPrivacyData = async () => {
    setPrivacySettings({
      recordingEnabled: false,
      autoDeleteAfterDays: 30,
      encryptRecordings: true,
      requireExplicitConsent: true,
      showRecordingIndicator: true,
      allowThirdPartySharing: false,
      complianceRegion: "GLOBAL",
    })
    setConsentRecords([])
    await AsyncStorage.multiRemove(["privacy_settings", "consent_records"])
  }

  return (
    <PrivacyContext.Provider
      value={{
        privacySettings,
        consentRecords,
        updatePrivacySettings,
        requestRecordingConsent,
        revokeConsent,
        checkConsentStatus,
        getComplianceRequirements,
        exportPrivacyData,
        deleteAllPrivacyData,
      }}
    >
      {children}
    </PrivacyContext.Provider>
  )
}

export const usePrivacy = () => {
  const context = useContext(PrivacyContext)
  if (context === undefined) {
    throw new Error("usePrivacy must be used within a PrivacyProvider")
  }
  return context
}
