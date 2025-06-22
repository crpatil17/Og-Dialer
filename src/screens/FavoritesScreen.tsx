import type React from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useContacts } from "../context/ContactContext"
import { CallManager } from "../native/CallManager"
import EmptyState from "../components/EmptyState"

const FavoritesScreen: React.FC = () => {
  const { favorites } = useContacts()

  const handleCall = async (phoneNumber: string) => {
    try {
      await CallManager.makeCall(phoneNumber)
    } catch (error) {
      Alert.alert("Error", "Failed to make call")
    }
  }

  const renderFavoriteItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.favoriteCard} onPress={() => handleCall(item.phoneNumber)}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>
      <Text style={styles.favoriteName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.favoritePhone} numberOfLines={1}>
        {item.phoneNumber}
      </Text>
      <View style={styles.callIcon}>
        <Icon name="call" size={20} color="#2196F3" />
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
      </View>

      {favorites.length === 0 ? (
        <EmptyState icon="star" title="No favorites" subtitle="Add contacts to favorites for quick access" />
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          style={styles.list}
          contentContainerStyle={styles.listContent}
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
  listContent: {
    padding: 8,
  },
  favoriteCard: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    margin: 8,
    alignItems: "center",
    minHeight: 120,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  favoriteName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 4,
  },
  favoritePhone: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  callIcon: {
    marginTop: "auto",
  },
})

export default FavoritesScreen
