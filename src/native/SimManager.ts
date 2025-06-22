import { NativeModules } from "react-native"

interface SimCard {
  subscriptionId: number
  simSlotIndex: number
  displayName: string
  carrierName: string
  number: string
  countryIso: string
}

interface SimManagerInterface {
  getAvailableSimCards(): Promise<SimCard[]>
  getDefaultSimForCalls(): Promise<number>
  isDualSimDevice(): Promise<boolean>
}

const { SimManager } = NativeModules

export default SimManager as SimManagerInterface
export type { SimCard }
