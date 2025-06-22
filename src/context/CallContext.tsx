"use client"

import type React from "react"
import { createContext, useContext, useState, type ReactNode } from "react"

interface CallState {
  isInCall: boolean
  currentCall: {
    phoneNumber: string
    contactName?: string
    isIncoming: boolean
    startTime?: Date
  } | null
  isMuted: boolean
  isSpeakerOn: boolean
  isOnHold: boolean
}

interface CallContextType {
  callState: CallState
  startCall: (phoneNumber: string, contactName?: string, isIncoming?: boolean) => void
  endCall: () => void
  toggleMute: () => void
  toggleSpeaker: () => void
  toggleHold: () => void
}

const CallContext = createContext<CallContextType | undefined>(undefined)

export const CallProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [callState, setCallState] = useState<CallState>({
    isInCall: false,
    currentCall: null,
    isMuted: false,
    isSpeakerOn: false,
    isOnHold: false,
  })

  const startCall = (phoneNumber: string, contactName?: string, isIncoming = false) => {
    setCallState({
      isInCall: true,
      currentCall: {
        phoneNumber,
        contactName,
        isIncoming,
        startTime: new Date(),
      },
      isMuted: false,
      isSpeakerOn: false,
      isOnHold: false,
    })
  }

  const endCall = () => {
    setCallState({
      isInCall: false,
      currentCall: null,
      isMuted: false,
      isSpeakerOn: false,
      isOnHold: false,
    })
  }

  const toggleMute = () => {
    setCallState((prev) => ({ ...prev, isMuted: !prev.isMuted }))
  }

  const toggleSpeaker = () => {
    setCallState((prev) => ({ ...prev, isSpeakerOn: !prev.isSpeakerOn }))
  }

  const toggleHold = () => {
    setCallState((prev) => ({ ...prev, isOnHold: !prev.isOnHold }))
  }

  return (
    <CallContext.Provider
      value={{
        callState,
        startCall,
        endCall,
        toggleMute,
        toggleSpeaker,
        toggleHold,
      }}
    >
      {children}
    </CallContext.Provider>
  )
}

export const useCall = () => {
  const context = useContext(CallContext)
  if (context === undefined) {
    throw new Error("useCall must be used within a CallProvider")
  }
  return context
}
