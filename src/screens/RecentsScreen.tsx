"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, FlatList, StyleSheet, Alert } from "react-native"
import { CallManager } from "../native/CallManager"
import CallHistoryItem from "../components/CallHistoryItem"
import EmptyState from "../components/EmptyState"
import LoadingSpinner from "../components/LoadingSpinner"
import SearchBar from "../components/SearchBar"
import { useCallLog } from "../context/CallLogContext"

const RecentsScreen: React.FC = () => {
  const { callLogs, loading, searchCallLogs, deleteCallLogEntry } = useCallLog()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredLogs = searchCallLogs(searchQuery)

  const handleCall = async (phoneNumber: string) => {
    try {
      await CallManager.makeCall(phoneNumber)
    } catch (error) {
      Alert.alert("Error", "Failed to make call")
    }
  }

  const handleDelete = async (callId: string) => {
    Alert.alert("Delete Call", "Are you sure you want to delete this call from history?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCallLogEntry(callId)
          } catch (error) {
            Alert.alert("Error", "Failed to delete call")
          }
        },
      },
    ])
  }

  const renderCallLogItem = ({ item }: { item: any }) => (
    <CallHistoryItem
      id={item.id}
      name={item.name}
      phoneNumber={item.number}
      type={item.type}
      date={item.date}
      duration={item.duration}
      onCall={() => handleCall(item.number)}
      onDelete={() => handleDelete(item.id)}
    />
  )

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recents</Text>
      </View>

      <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Search call history" />

      {filteredLogs.length === 0 ? (
        <EmptyState icon="history" title="No call history" subtitle="Your recent calls will appear here" />
      ) : (
        <FlatList
          data={filteredLogs}
          renderItem={renderCallLogItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  list: {
    flex: 1,
  },
})

export default RecentsScreen
