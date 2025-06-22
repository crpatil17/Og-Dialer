"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useContacts } from "../context/ContactContext"
import { useCall } from "../context/CallContext"

const DemoScreen: React.FC = () => {
  const navigation = useNavigation()
  const { contacts, favorites } = useContacts()
  const { startCall } = useCall()
  const [currentDemo, setCurrentDemo] = useState<string | null>(null)

  const demoScenarios = [
    {
      id: "incoming-call",
      title: "Incoming Call Demo",
      description: "Simulate receiving a call from John Doe",
      icon: "call-received",
      color: "#4CAF50",
      action: () => {
        navigation.navigate("IncomingCall", {
          phoneNumber: "+1234567890",
          contactName: "John Doe",
        })
      },
    },
    {
      id: "outgoing-call",
      title: "Outgoing Call Demo",
      description: "Simulate making a call to Jane Smith",
      icon: "call-made",
      color: "#2196F3",
      action: () => {
        startCall("+1987654321", "Jane Smith", false)
        navigation.navigate("OutgoingCall", {
          phoneNumber: "+1987654321",
          contactName: "Jane Smith",
        })
      },
    },
    {
      id: "in-call",
      title: "In-Call Controls Demo",
      description: "Experience the in-call interface with controls",
      icon: "call",
      color: "#FF9800",
      action: () => {
        startCall("+1555123456", "Mike Johnson", false)
        navigation.navigate("InCall")
      },
    },
    {
      id: "dialer-demo",
      title: "Dialer Interface",
      description: "Try the numeric keypad and call functionality",
      icon: "dialpad",
      color: "#9C27B0",
      action: () => {
        navigation.navigate("Main", { screen: "Dialer" })
      },
    },
    {
      id: "contacts-demo",
      title: "Contacts Management",
      description: "Browse and manage your contacts",
      icon: "contacts",
      color: "#607D8B",
      action: () => {
        navigation.navigate("Main", { screen: "Contacts" })
      },
    },
    {
      id: "favorites-demo",
      title: "Favorites Quick Access",
      description: "View and call your favorite contacts",
      icon: "star",
      color: "#FFC107",
      action: () => {
        navigation.navigate("Main", { screen: "Favorites" })
      },
    },
    {
      id: "recents-demo",
      title: "Call History",
      description: "Review your recent calls and actions",
      icon: "history",
      color: "#795548",
      action: () => {
        navigation.navigate("Main", { screen: "Recents" })
      },
    },
    {
      id: "add-contact",
      title: "Add New Contact",
      description: "Create a new contact entry",
      icon: "person-add",
      color: "#E91E63",
      action: () => {
        navigation.navigate("AddContact")
      },
    },
  ]

  const stats = [
    { label: "Total Contacts", value: contacts.length, icon: "contacts", color: "#2196F3" },
    { label: "Favorites", value: favorites.length, icon: "star", color: "#FFC107" },
    { label: "Demo Scenarios", value: demoScenarios.length, icon: "play-circle-filled", color: "#4CAF50" },
  ]

  const handleScenario = (scenario: any) => {
    setCurrentDemo(scenario.id)
    Alert.alert(
      scenario.title,
      `${scenario.description}\n\nThis will demonstrate the ${scenario.title.toLowerCase()} functionality.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Start Demo",
          onPress: () => {
            scenario.action()
            setTimeout(() => setCurrentDemo(null), 1000)
          },
        },
      ],
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Dialer App Demo</Text>
      </View>

      <View style={styles.welcomeCard}>
        <Icon name="phone-android" size={48} color="#2196F3" />
        <Text style={styles.welcomeTitle}>Welcome to the Demo</Text>
        <Text style={styles.welcomeText}>
          Explore all features of this comprehensive dialer app. Try different scenarios to see how the app handles
          calls, contacts, and more.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Statistics</Text>
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Icon name={stat.icon} size={24} color={stat.color} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Demo Scenarios</Text>
        <Text style={styles.sectionSubtitle}>Try these interactive demos to experience all app features</Text>

        {demoScenarios.map((scenario) => (
          <TouchableOpacity
            key={scenario.id}
            style={[styles.scenarioCard, currentDemo === scenario.id && styles.scenarioCardActive]}
            onPress={() => handleScenario(scenario)}
            disabled={currentDemo === scenario.id}
          >
            <View style={[styles.scenarioIcon, { backgroundColor: scenario.color }]}>
              <Icon name={scenario.icon} size={24} color="white" />
            </View>
            <View style={styles.scenarioContent}>
              <Text style={styles.scenarioTitle}>{scenario.title}</Text>
              <Text style={styles.scenarioDescription}>{scenario.description}</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features Included</Text>
        <View style={styles.featuresList}>
          {[
            "Full numeric dialer with T9 support",
            "Contact management (add, edit, delete)",
            "Call history with search and filters",
            "Favorites system for quick access",
            "In-call controls (mute, speaker, hold)",
            "Native Android integration",
            "Material Design UI components",
            "Search functionality across all screens",
            "Permission handling and validation",
            "Call state management",
          ].map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Icon name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          This demo showcases a production-ready dialer app built with React Native and native Android modules.
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  welcomeCard: {
    backgroundColor: "white",
    margin: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: "white",
    flex: 1,
    margin: 4,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  scenarioCard: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scenarioCardActive: {
    opacity: 0.6,
  },
  scenarioIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  scenarioContent: {
    flex: 1,
  },
  scenarioTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  scenarioDescription: {
    fontSize: 14,
    color: "#666",
  },
  featuresList: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  featureText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 12,
    flex: 1,
  },
  footer: {
    margin: 16,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  footerText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
})

export default DemoScreen
