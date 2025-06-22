"use client"

import { useEffect, useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import { StatusBar } from "expo-status-bar"
import { Alert } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"

import DialerScreen from "./src/screens/DialerScreen"
import RecentsScreen from "./src/screens/RecentsScreen"
import ContactsScreen from "./src/screens/ContactsScreen"
import FavoritesScreen from "./src/screens/FavoritesScreen"
import ContactDetailScreen from "./src/screens/ContactDetailScreen"
import AddContactScreen from "./src/screens/AddContactScreen"
import IncomingCallScreen from "./src/screens/IncomingCallScreen"
import EnhancedIncomingCallScreen from "./src/screens/EnhancedIncomingCallScreen"
import OutgoingCallScreen from "./src/screens/OutgoingCallScreen"
import InCallScreen from "./src/screens/InCallScreen"
import CallRecordingScreen from "./src/screens/CallRecordingScreen"
import AutoDialerScreen from "./src/screens/AutoDialerScreen"
import DemoScreen from "./src/screens/DemoScreen"
import SettingsScreen from "./src/screens/SettingsScreen"

import { PermissionManager } from "./src/native/PermissionManager"
import { CallProvider } from "./src/context/CallContext"
import { ContactProvider } from "./src/context/ContactContext"
import { CallLogProvider } from "./src/context/CallLogContext"
import { PrivacyProvider } from "./src/context/PrivacyContext"
import { AutoDialerProvider } from "./src/context/AutoDialerContext"
import { SimProvider } from "./src/context/SimContext"

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName
          switch (route.name) {
            case "Favorites":
              iconName = "star"
              break
            case "Recents":
              iconName = "history"
              break
            case "Contacts":
              iconName = "contacts"
              break
            case "Dialer":
              iconName = "dialpad"
              break
            case "Settings":
              iconName = "settings"
              break
            default:
              iconName = "circle"
          }
          return <Icon name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: "#2196F3",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Recents" component={RecentsScreen} />
      <Tab.Screen name="Contacts" component={ContactsScreen} />
      <Tab.Screen name="Dialer" component={DialerScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  )
}

export default function App() {
  const [permissionsGranted, setPermissionsGranted] = useState(false)

  useEffect(() => {
    requestPermissions()
  }, [])

  const requestPermissions = async () => {
    try {
      const granted = await PermissionManager.requestAllPermissions()
      if (granted) {
        setPermissionsGranted(true)
      } else {
        Alert.alert("Permissions Required", "This app needs phone and contacts permissions to function properly.", [
          { text: "Exit", onPress: () => {} },
          { text: "Retry", onPress: requestPermissions },
        ])
      }
    } catch (error) {
      console.error("Permission error:", error)
    }
  }

  if (!permissionsGranted) {
    return null // Show loading or permission screen
  }

  return (
    <PrivacyProvider>
      <AutoDialerProvider>
        <SimProvider>
          <CallProvider>
            <ContactProvider>
              <CallLogProvider>
                <NavigationContainer>
                  <StatusBar style="auto" />
                  <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Demo" component={DemoScreen} />
                    <Stack.Screen name="Main" component={TabNavigator} />
                    <Stack.Screen name="ContactDetail" component={ContactDetailScreen} />
                    <Stack.Screen name="AddContact" component={AddContactScreen} />
                    <Stack.Screen name="CallRecording" component={CallRecordingScreen} />
                    <Stack.Screen name="AutoDialer" component={AutoDialerScreen} />
                    <Stack.Screen name="Settings" component={SettingsScreen} />
                    <Stack.Screen
                      name="IncomingCall"
                      component={IncomingCallScreen}
                      options={{ presentation: "fullScreenModal" }}
                    />
                    <Stack.Screen
                      name="EnhancedIncomingCall"
                      component={EnhancedIncomingCallScreen}
                      options={{ presentation: "fullScreenModal" }}
                    />
                    <Stack.Screen
                      name="OutgoingCall"
                      component={OutgoingCallScreen}
                      options={{ presentation: "fullScreenModal" }}
                    />
                    <Stack.Screen
                      name="InCall"
                      component={InCallScreen}
                      options={{ presentation: "fullScreenModal" }}
                    />
                  </Stack.Navigator>
                </NavigationContainer>
              </CallLogProvider>
            </ContactProvider>
          </CallProvider>
        </SimProvider>
      </AutoDialerProvider>
    </PrivacyProvider>
  )
}
