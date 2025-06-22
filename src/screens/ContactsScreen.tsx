"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useNavigation } from "@react-navigation/native"
import { useContacts } from "../context/ContactContext"
import { CallManager } from "../native/CallManager"
import SearchBar from "../components/SearchBar"
import EmptyState from "../components/EmptyState"
import LoadingSpinner from "../components/LoadingSpinner"

const ContactsScreen: React.FC = () => {
  const navigation = useNavigation()
  const { contacts, loading, searchContacts, toggleFavorite } = useContacts()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredContacts = searchContacts(searchQuery)

  const handleCall = async (phoneNumber: string) => {
    try {
      await CallManager.makeCall(phoneNumber)
    } catch (error) {
      Alert.alert("Error", "Failed to make call")
    }
  }

  const renderContactItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => navigation.navigate("ContactDetail", { contact: item })}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactPhone}>{item.phoneNumber}</Text>
      </View>
      <TouchableOpacity onPress={() => toggleFavorite(item.id)} style={styles.favoriteButton}>
        <Icon name="star" size={20} color="#ccc" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleCall(item.phoneNumber)} style={styles.callButton}>
        <Icon name="call" size={20} color="#2196F3" />
      </TouchableOpacity>
    </TouchableOpacity>
  )

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Contacts</Text>
        <TouchableOpacity onPress={() => navigation.navigate("AddContact")} style={styles.addButton}>
          <Icon name="person-add" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Search contacts" />

      {filteredContacts.length === 0 ? (
        <EmptyState
          icon="contacts"
          title="No contacts"
          subtitle="Add contacts to see them here"
          actionText="Add Contact"
          onAction={() => navigation.navigate("AddContact")}
        />
      ) : (
        <FlatList
          data={filteredContacts}
          renderItem={renderContactItem}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    padding: 8,
  },
  list: {
    flex: 1,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  contactPhone: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  favoriteButton: {
    padding: 8,
    marginRight: 8,
  },
  callButton: {
    padding: 8,
  },
})

export default ContactsScreen
