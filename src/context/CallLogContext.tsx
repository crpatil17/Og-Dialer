"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface CallLogEntry {
  id: string
  number: string
  name: string
  type: number // 1: incoming, 2: outgoing, 3: missed
  date: string
  duration: string
}

interface CallLogContextType {
  callLogs: CallLogEntry[]
  loading: boolean
  refreshCallLogs: () => Promise<void>
  deleteCallLogEntry: (callId: string) => Promise<boolean>
  clearAllCallLogs: () => void
  searchCallLogs: (query: string) => CallLogEntry[]
}

// Demo call log data
const DEMO_CALL_LOGS: CallLogEntry[] = [
  {
    id: "1",
    number: "+1234567890",
    name: "John Doe",
    type: 2, // outgoing
    date: new Date(Date.now() - 1000 * 60 * 30).getTime().toString(), // 30 minutes ago
    duration: "180", // 3 minutes
  },
  {
    id: "2",
    number: "+1987654321",
    name: "Jane Smith",
    type: 1, // incoming
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).getTime().toString(), // 2 hours ago
    duration: "120", // 2 minutes
  },
  {
    id: "3",
    number: "+1555123456",
    name: "Mike Johnson",
    type: 3, // missed
    date: new Date(Date.now() - 1000 * 60 * 60 * 4).getTime().toString(), // 4 hours ago
    duration: "0",
  },
  {
    id: "4",
    number: "+1444987654",
    name: "Sarah Wilson",
    type: 1, // incoming
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).getTime().toString(), // 1 day ago
    duration: "300", // 5 minutes
  },
  {
    id: "5",
    number: "+1333456789",
    name: "David Brown",
    type: 2, // outgoing
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).getTime().toString(), // 2 days ago
    duration: "90", // 1.5 minutes
  },
  {
    id: "6",
    number: "+1222789012",
    name: "Lisa Davis",
    type: 1, // incoming
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).getTime().toString(), // 3 days ago
    duration: "240", // 4 minutes
  },
  {
    id: "7",
    number: "+1111234567",
    name: "Tom Anderson",
    type: 3, // missed
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).getTime().toString(), // 4 days ago
    duration: "0",
  },
  {
    id: "8",
    number: "+1666543210",
    name: "Emily Taylor",
    type: 2, // outgoing
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).getTime().toString(), // 5 days ago
    duration: "450", // 7.5 minutes
  },
]

const CallLogContext = createContext<CallLogContextType | undefined>(undefined)

export const CallLogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [callLogs, setCallLogs] = useState<CallLogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDemoCallLogs()
  }, [])

  const loadDemoCallLogs = async () => {
    try {
      setLoading(true)
      // Simulate loading time
      await new Promise((resolve) => setTimeout(resolve, 800))
      setCallLogs(DEMO_CALL_LOGS)
    } catch (error) {
      console.error("Error loading demo call logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const refreshCallLogs = async () => {
    await loadDemoCallLogs()
  }

  const deleteCallLogEntry = async (callId: string): Promise<boolean> => {
    try {
      setCallLogs((prev) => prev.filter((log) => log.id !== callId))
      return true
    } catch (error) {
      console.error("Error deleting call log:", error)
      return false
    }
  }

  const clearAllCallLogs = () => {
    setCallLogs([])
  }

  const searchCallLogs = (query: string): CallLogEntry[] => {
    if (!query.trim()) return callLogs

    const lowercaseQuery = query.toLowerCase()
    return callLogs.filter(
      (log) => (log.name && log.name.toLowerCase().includes(lowercaseQuery)) || log.number.includes(query),
    )
  }

  return (
    <CallLogContext.Provider
      value={{
        callLogs,
        loading,
        refreshCallLogs,
        deleteCallLogEntry,
        clearAllCallLogs,
        searchCallLogs,
      }}
    >
      {children}
    </CallLogContext.Provider>
  )
}

export const useCallLog = () => {
  const context = useContext(CallLogContext)
  if (context === undefined) {
    throw new Error("useCallLog must be used within a CallLogProvider")
  }
  return context
}
