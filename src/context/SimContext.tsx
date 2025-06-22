"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import SimManager, { type SimCard } from "../native/SimManager"
import { Alert } from "react-native"

interface SimContextType {
  simCards: SimCard[]
  isDualSim: boolean
  defaultSimId: number | null
  loading: boolean
  refreshSimCards: () => Promise<void>
  selectSimForCall: (phoneNumber: string) => Promise<SimCard | null>
}

const SimContext = createContext<SimContextType | undefined>(undefined)

export const SimProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [simCards, setSimCards] = useState<SimCard[]>([])
  const [isDualSim, setIsDualSim] = useState(false)
  const [defaultSimId, setDefaultSimId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshSimCards = async () => {
    try {
      setLoading(true)
      const [cards, isDual, defaultId] = await Promise.all([
        SimManager.getAvailableSimCards(),
        SimManager.isDualSimDevice(),
        SimManager.getDefaultSimForCalls(),
      ])

      setSimCards(cards)
      setIsDualSim(isDual)
      setDefaultSimId(defaultId)
    } catch (error) {
      console.error("Error fetching SIM cards:", error)
      Alert.alert("Error", "Failed to load SIM card information")
    } finally {
      setLoading(false)
    }
  }

  const selectSimForCall = async (phoneNumber: string): Promise<SimCard | null> => {
    return new Promise((resolve) => {
      if (!isDualSim || simCards.length <= 1) {
        // Single SIM or no SIM selection needed
        resolve(simCards[0] || null)
        return
      }

      // Show SIM selection modal
      Alert.alert("Select SIM Card", `Choose which SIM to use for calling ${phoneNumber}`, [
        { text: "Cancel", style: "cancel", onPress: () => resolve(null) },
        ...simCards.map((sim, index) => ({
          text: `${sim.displayName} (${sim.carrierName})`,
          onPress: () => resolve(sim),
        })),
      ])
    })
  }

  useEffect(() => {
    refreshSimCards()
  }, [])

  return (
    <SimContext.Provider
      value={{
        simCards,
        isDualSim,
        defaultSimId,
        loading,
        refreshSimCards,
        selectSimForCall,
      }}
    >
      {children}
    </SimContext.Provider>
  )
}

export const useSim = () => {
  const context = useContext(SimContext)
  if (context === undefined) {
    throw new Error("useSim must be used within a SimProvider")
  }
  return context
}
