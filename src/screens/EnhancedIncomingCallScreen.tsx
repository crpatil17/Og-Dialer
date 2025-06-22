"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useCall } from "../context/CallContext"

const { width, height } = Dimensions.get("window")

interface CallerInfo {
  name: string
  source: string
  type: string
  isSpam: boolean
  spamCategory?: string
  riskLevel?: string
  reportCount?: number
  description?: string
}

const EnhancedIncomingCallScreen: React.FC = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { phoneNumber, contactName, callerInfo } = route.params as {
    phoneNumber: string
    contactName?: string
    callerInfo?: CallerInfo
  }
  const { startCall } = useCall()

  const [pulseAnim] = useState(new Animated.Value(1))
  const [slideAnim] = useState(new Animated.Value(0))

  useEffect(() => {
    // Start pulsing animation for call button
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    )
    pulseAnimation.start()

    // Slide in animation
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()

    return () => {
      pulseAnimation.stop()
    }
  }, [])

  const handleAnswer = () => {
    startCall(phoneNumber, contactName || callerInfo?.name, true)
    navigation.replace("InCall")
  }

  const handleReject = () => {
    navigation.goBack()
  }

  const handleReportSpam = () => {
    // Would integrate with spam reporting system
    navigation.goBack()
  }

  const renderCallerIdentification = () => {
    if (!callerInfo) return null

    const getSpamColor = (riskLevel?: string) => {
      switch (riskLevel) {
        case "critical":
          return "#D32F2F"
        case "high":
          return "#F57C00"
        case "medium":
          return "#FBC02D"
        default:
          return "#666"
      }
    }

    const getSpamIcon = (category?: string) => {
      switch (category) {
        case "Scam":
          return "warning"
        case "Telemarketer":
          return "business"
        case "Robocall":
          return "smart-toy"
        default:
          return "info"
      }
    }

    if (callerInfo.isSpam) {
      return (
        <View style={[styles.spamWarning, { borderColor: getSpamColor(callerInfo.riskLevel) }]}>
          <View style={styles.spamHeader}>
            <Icon name={getSpamIcon(callerInfo.spamCategory)} size={24} color={getSpamColor(callerInfo.riskLevel)} />
            <Text style={[styles.spamTitle, { color: getSpamColor(callerInfo.riskLevel) }]}>
              {callerInfo.spamCategory}
            </Text>
          </View>
          <Text style={styles.spamDescription}>{callerInfo.description}</Text>
          <Text style={styles.spamReports}>Reported by {callerInfo.reportCount} users</Text>
        </View>
      )
    }

    return (
      <View style={styles.callerIdInfo}>
        <Icon name="verified-user" size={20} color="#4CAF50" />
        <Text style={styles.callerIdText}>
          {callerInfo.source === "contacts" ? "In your contacts" : "Identified caller"}
        </Text>
      </View>
    )
  }

  const renderActionButtons = () => {
    const isSpam = callerInfo?.isSpam
    const isCriticalSpam = callerInfo?.riskLevel === "critical"

    return (
      <View style={styles.actionButtons}>
        {/* Quick actions for spam calls */}
        {isSpam && (
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton} onPress={handleReportSpam}>
              <Icon name="report" size={20} color="#F44336" />
              <Text style={styles.quickActionText}>Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton} onPress={handleReject}>
              <Icon name="block" size={20} color="#F44336" />
              <Text style={styles.quickActionText}>Block</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main action buttons */}
        <View style={styles.mainActions}>
          <TouchableOpacity
            style={[styles.rejectButton, isCriticalSpam && styles.criticalRejectButton]}
            onPress={handleReject}
          >
            <Icon name="call-end" size={32} color="white" />
          </TouchableOpacity>

          {!isCriticalSpam && (
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity style={styles.answerButton} onPress={handleAnswer}>
                <Icon name="call" size={32} color="white" />
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        {/* Additional actions */}
        <View style={styles.additionalActions}>
          <TouchableOpacity style={styles.additionalActionButton}>
            <Icon name="message" size={20} color="white" />
            <Text style={styles.additionalActionText}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.additionalActionButton}>
            <Icon name="person-add" size={20} color="white" />
            <Text style={styles.additionalActionText}>Add Contact</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [height, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.incomingText}>{callerInfo?.isSpam ? "Potential Spam Call" : "Incoming call"}</Text>

        <View style={styles.callerInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {contactName
                ? contactName.charAt(0).toUpperCase()
                : callerInfo?.name
                  ? callerInfo.name.charAt(0).toUpperCase()
                  : phoneNumber.charAt(0)}
            </Text>
          </View>

          <Text style={styles.callerName}>{contactName || callerInfo?.name || phoneNumber}</Text>

          <Text style={styles.callerNumber}>{contactName || callerInfo?.name ? phoneNumber : ""}</Text>

          {renderCallerIdentification()}
        </View>
      </View>

      {renderActionButtons()}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  incomingText: {
    fontSize: 18,
    color: "#ccc",
    marginBottom: 32,
  },
  callerInfo: {
    alignItems: "center",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  avatarText: {
    color: "white",
    fontSize: 48,
    fontWeight: "bold",
  },
  callerName: {
    fontSize: 28,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
    marginBottom: 8,
  },
  callerNumber: {
    fontSize: 18,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 16,
  },
  spamWarning: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    marginTop: 16,
    maxWidth: width - 64,
  },
  spamHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  spamTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  spamDescription: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 4,
  },
  spamReports: {
    fontSize: 12,
    color: "#999",
  },
  callerIdInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  callerIdText: {
    color: "#4CAF50",
    fontSize: 12,
    marginLeft: 4,
  },
  actionButtons: {
    paddingHorizontal: 32,
    paddingBottom: 64,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  quickActionButton: {
    alignItems: "center",
    marginHorizontal: 20,
  },
  quickActionText: {
    color: "#F44336",
    fontSize: 12,
    marginTop: 4,
  },
  mainActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 24,
  },
  rejectButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F44336",
    justifyContent: "center",
    alignItems: "center",
  },
  criticalRejectButton: {
    backgroundColor: "#D32F2F",
    borderWidth: 3,
    borderColor: "#FFCDD2",
  },
  answerButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  additionalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  additionalActionButton: {
    alignItems: "center",
  },
  additionalActionText: {
    color: "white",
    fontSize: 12,
    marginTop: 4,
  },
})

export default EnhancedIncomingCallScreen
