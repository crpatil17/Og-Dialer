import { NativeModules } from "react-native"

interface CallManagerInterface {
  makeCall(phoneNumber: string): Promise<boolean>
  makeCallWithSim(phoneNumber: string, subscriptionId: number): Promise<boolean>
  endCall(): Promise<boolean>
}

const { CallManager } = NativeModules

export default CallManager as CallManagerInterface
