import { NativeModules } from "react-native"

interface PermissionManagerInterface {
  requestAllPermissions(): Promise<boolean>
  checkPermissions(): Promise<{ [key: string]: boolean }>
}

export const PermissionManager: PermissionManagerInterface = NativeModules.PermissionManager
