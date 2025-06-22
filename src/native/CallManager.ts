import { NativeModules } from "react-native"

interface CallManagerInterface {
  makeCall(phoneNumber: string): Promise<boolean>
  endCall(): Promise<boolean>
}

export const CallManager: CallManagerInterface = NativeModules.CallManager
