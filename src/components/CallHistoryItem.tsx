import type React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"

interface CallHistoryItemProps {
  id: string
  name?: string
  phoneNumber: string
  type: number
  date: string
  duration: string
  onCall: () => void
  onDelete: () => void
}

const CallHistoryItem: React.FC<CallHistoryItemProps> = ({
  name,
  phoneNumber,
  type,
  date,
  duration,
  onCall,
  onDelete,
}) => {
  const getCallTypeIcon = () => {
    switch (type) {
      case 1:
        return { name: "call-received", color: "#4CAF50" }
      case 2:
        return { name: "call-made", color: "#2196F3" }
      case 3:
        return { name: "call-received", color: "#F44336" }
      default:
        return { name: "call", color: "#666" }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(Number.parseInt(dateString))
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDuration = (durationString: string) => {
    const duration = Number.parseInt(durationString)
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const callIcon = getCallTypeIcon()

  return (
    <View style={styles.container}>
      <Icon name={callIcon.name} size={24} color={callIcon.color} style={styles.callTypeIcon} />
      <View style={styles.content}>
        <Text style={styles.name}>{name || phoneNumber}</Text>
        {name && <Text style={styles.phoneNumber}>{phoneNumber}</Text>}
        <Text style={styles.details}>
          {formatDate(date)} • {formatDuration(duration)}
        </Text>
      </View>
      <TouchableOpacity onPress={onCall} style={styles.actionButton}>
        <Icon name="call" size={20} color="#2196F3" />
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
        <Icon name="delete" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  callTypeIcon: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  phoneNumber: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  details: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
})

export default CallHistoryItem
