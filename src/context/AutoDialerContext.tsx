"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { Alert } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface CallQueueItem {
  id: string
  phoneNumber: string
  contactName?: string
  priority: "low" | "medium" | "high"
  scheduledTime?: Date
  maxAttempts: number
  currentAttempts: number
  status: "pending" | "calling" | "completed" | "failed" | "cancelled"
  purpose: string
  consentVerified: boolean
  lastAttempt?: Date
  callResult?: {
    connected: boolean
    duration: number
    outcome: string
    notes: string
  }
}

interface AutoDialerSettings {
  enabled: boolean
  maxConcurrentCalls: number
  delayBetweenCalls: number // seconds
  maxDailyAttempts: number
  respectDoNotCall: boolean
  requireConsent: boolean
  businessHoursOnly: boolean
  businessHours: {
    start: string // "09:00"
    end: string // "17:00"
  }
  allowedDays: number[] // 0-6, Sunday = 0
  complianceMode: "strict" | "standard" | "minimal"
}

interface AutoDialerContextType {
  callQueue: CallQueueItem[]
  settings: AutoDialerSettings
  isActive: boolean
  currentCall: CallQueueItem | null
  statistics: {
    totalCalls: number
    successfulCalls: number
    failedCalls: number
    averageDuration: number
  }
  addToQueue: (items: Omit<CallQueueItem, "id" | "currentAttempts" | "status">[]) => Promise<void>
  removeFromQueue: (id: string) => void
  updateQueueItem: (id: string, updates: Partial<CallQueueItem>) => void
  startAutoDialer: () => Promise<boolean>
  stopAutoDialer: () => void
  updateSettings: (newSettings: Partial<AutoDialerSettings>) => Promise<void>
  exportCallResults: () => Promise<string>
  validateCompliance: () => Promise<{ isCompliant: boolean; issues: string[] }>
}

const AutoDialerContext = createContext<AutoDialerContextType | undefined>(undefined)

export const AutoDialerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [callQueue, setCallQueue] = useState<CallQueueItem[]>([])
  const [settings, setSettings] = useState<AutoDialerSettings>({
    enabled: false,
    maxConcurrentCalls: 1,
    delayBetweenCalls: 30,
    maxDailyAttempts: 100,
    respectDoNotCall: true,
    requireConsent: true,
    businessHoursOnly: true,
    businessHours: { start: "09:00", end: "17:00" },
    allowedDays: [1, 2, 3, 4, 5], // Monday to Friday
    complianceMode: "strict",
  })
  const [isActive, setIsActive] = useState(false)
  const [currentCall, setCurrentCall] = useState<CallQueueItem | null>(null)
  const [statistics, setStatistics] = useState({
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    averageDuration: 0,
  })

  useEffect(() => {
    loadAutoDialerData()
  }, [])

  const loadAutoDialerData = async () => {
    try {
      const queueData = await AsyncStorage.getItem("auto_dialer_queue")
      const settingsData = await AsyncStorage.getItem("auto_dialer_settings")
      const statsData = await AsyncStorage.getItem("auto_dialer_stats")

      if (queueData) {
        const queue = JSON.parse(queueData).map((item: any) => ({
          ...item,
          scheduledTime: item.scheduledTime ? new Date(item.scheduledTime) : undefined,
          lastAttempt: item.lastAttempt ? new Date(item.lastAttempt) : undefined,
        }))
        setCallQueue(queue)
      }

      if (settingsData) {
        setSettings(JSON.parse(settingsData))
      }

      if (statsData) {
        setStatistics(JSON.parse(statsData))
      }
    } catch (error) {
      console.error("Error loading auto dialer data:", error)
    }
  }

  const saveData = async () => {
    try {
      await AsyncStorage.setItem("auto_dialer_queue", JSON.stringify(callQueue))
      await AsyncStorage.setItem("auto_dialer_settings", JSON.stringify(settings))
      await AsyncStorage.setItem("auto_dialer_stats", JSON.stringify(statistics))
    } catch (error) {
      console.error("Error saving auto dialer data:", error)
    }
  }

  const addToQueue = async (items: Omit<CallQueueItem, "id" | "currentAttempts" | "status">[]) => {
    // Validate compliance before adding
    const compliance = await validateCompliance()
    if (!compliance.isCompliant) {
      Alert.alert("Compliance Error", `Cannot add calls: ${compliance.issues.join(", ")}`)
      return
    }

    // Check daily limits
    const today = new Date().toDateString()
    const todaysCalls = callQueue.filter((item) => item.lastAttempt && item.lastAttempt.toDateString() === today).length

    if (todaysCalls + items.length > settings.maxDailyAttempts) {
      Alert.alert("Daily Limit Exceeded", `Cannot exceed ${settings.maxDailyAttempts} calls per day`)
      return
    }

    const newItems: CallQueueItem[] = items.map((item) => ({
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      currentAttempts: 0,
      status: "pending",
    }))

    setCallQueue((prev) => [...prev, ...newItems])
    await saveData()
  }

  const removeFromQueue = (id: string) => {
    setCallQueue((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQueueItem = (id: string, updates: Partial<CallQueueItem>) => {
    setCallQueue((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }

  const validateCompliance = async (): Promise<{ isCompliant: boolean; issues: string[] }> => {
    const issues: string[] = []

    // Check if consent is required and verified
    if (settings.requireConsent) {
      const unconsentedCalls = callQueue.filter((item) => !item.consentVerified)
      if (unconsentedCalls.length > 0) {
        issues.push(`${unconsentedCalls.length} calls lack proper consent`)
      }
    }

    // Check business hours compliance
    if (settings.businessHoursOnly) {
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinutes = now.getMinutes()
      const currentTime = currentHour * 60 + currentMinutes

      const [startHour, startMin] = settings.businessHours.start.split(":").map(Number)
      const [endHour, endMin] = settings.businessHours.end.split(":").map(Number)
      const startTime = startHour * 60 + startMin
      const endTime = endHour * 60 + endMin

      const currentDay = now.getDay()

      if (!settings.allowedDays.includes(currentDay)) {
        issues.push("Current day is not allowed for calling")
      }

      if (currentTime < startTime || currentTime > endTime) {
        issues.push("Current time is outside business hours")
      }
    }

    // Check daily limits
    const today = new Date().toDateString()
    const todaysCalls = callQueue.filter((item) => item.lastAttempt && item.lastAttempt.toDateString() === today).length

    if (todaysCalls >= settings.maxDailyAttempts) {
      issues.push("Daily call limit reached")
    }

    return {
      isCompliant: issues.length === 0,
      issues,
    }
  }

  const startAutoDialer = async (): Promise<boolean> => {
    const compliance = await validateCompliance()
    if (!compliance.isCompliant) {
      Alert.alert("Compliance Check Failed", compliance.issues.join("\n"))
      return false
    }

    // Show warning about automated calling
    return new Promise((resolve) => {
      Alert.alert(
        "Start Automated Calling",
        "This will start automated calling. Ensure you have:\n\n" +
          "• Proper consent from all recipients\n" +
          "• Compliance with local regulations\n" +
          "• Valid business purpose\n" +
          "• Respect for Do Not Call lists\n\n" +
          "Misuse may result in legal consequences.",
        [
          { text: "Cancel", onPress: () => resolve(false) },
          {
            text: "I Understand - Start",
            onPress: () => {
              setIsActive(true)
              processQueue()
              resolve(true)
            },
          },
        ],
      )
    })
  }

  const stopAutoDialer = () => {
    setIsActive(false)
    setCurrentCall(null)
  }

  const processQueue = async () => {
    if (!isActive) return

    const pendingCalls = callQueue.filter(
      (item) => item.status === "pending" && item.currentAttempts < item.maxAttempts,
    )

    if (pendingCalls.length === 0) {
      setIsActive(false)
      Alert.alert("Queue Complete", "All calls have been processed")
      return
    }

    // Get next call based on priority and schedule
    const nextCall = pendingCalls.sort((a, b) => {
      if (a.priority !== b.priority) {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      if (a.scheduledTime && b.scheduledTime) {
        return a.scheduledTime.getTime() - b.scheduledTime.getTime()
      }
      return 0
    })[0]

    setCurrentCall(nextCall)

    // Update call status
    updateQueueItem(nextCall.id, {
      status: "calling",
      currentAttempts: nextCall.currentAttempts + 1,
      lastAttempt: new Date(),
    })

    // Simulate call process (in real implementation, this would trigger actual call)
    setTimeout(() => {
      if (isActive) {
        // Simulate call completion
        const success = Math.random() > 0.3 // 70% success rate for demo

        updateQueueItem(nextCall.id, {
          status: success ? "completed" : "failed",
          callResult: {
            connected: success,
            duration: success ? Math.floor(Math.random() * 300) + 30 : 0,
            outcome: success ? "answered" : "no_answer",
            notes: "",
          },
        })

        // Update statistics
        setStatistics((prev) => ({
          totalCalls: prev.totalCalls + 1,
          successfulCalls: prev.successfulCalls + (success ? 1 : 0),
          failedCalls: prev.failedCalls + (success ? 0 : 1),
          averageDuration: prev.averageDuration, // Would calculate actual average
        }))

        setCurrentCall(null)

        // Continue with next call after delay
        setTimeout(() => {
          if (isActive) {
            processQueue()
          }
        }, settings.delayBetweenCalls * 1000)
      }
    }, 5000) // 5 second call simulation
  }

  const updateSettings = async (newSettings: Partial<AutoDialerSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    await AsyncStorage.setItem("auto_dialer_settings", JSON.stringify(updatedSettings))
  }

  const exportCallResults = async (): Promise<string> => {
    const data = {
      queue: callQueue,
      statistics,
      settings,
      exportDate: new Date().toISOString(),
    }
    return JSON.stringify(data, null, 2)
  }

  return (
    <AutoDialerContext.Provider
      value={{
        callQueue,
        settings,
        isActive,
        currentCall,
        statistics,
        addToQueue,
        removeFromQueue,
        updateQueueItem,
        startAutoDialer,
        stopAutoDialer,
        updateSettings,
        exportCallResults,
        validateCompliance,
      }}
    >
      {children}
    </AutoDialerContext.Provider>
  )
}

export const useAutoDialer = () => {
  const context = useContext(AutoDialerContext)
  if (context === undefined) {
    throw new Error("useAutoDialer must be used within an AutoDialerProvider")
  }
  return context
}
