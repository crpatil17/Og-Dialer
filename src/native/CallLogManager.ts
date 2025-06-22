import { NativeModules } from "react-native"

interface CallLogEntry {
  id: string
  number: string
  name: string
  type: number
  date: string
  duration: string
}

interface CallLogManagerInterface {
  getCallLog(): Promise<CallLogEntry[]>
  deleteCallLogEntry(callId: string): Promise<boolean>
}

export const CallLogManager: CallLogManagerInterface = NativeModules.CallLogManager
