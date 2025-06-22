import type React from "react"
import { Modal, View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import type { SimCard } from "../native/SimManager"

interface SimSelectionModalProps {
  visible: boolean
  simCards: SimCard[]
  onSelectSim: (simCard: SimCard) => void
  onCancel: () => void
  phoneNumber: string
}

const SimSelectionModal: React.FC<SimSelectionModalProps> = ({
  visible,
  simCards,
  onSelectSim,
  onCancel,
  phoneNumber,
}) => {
  const renderSimCard = ({ item }: { item: SimCard }) => (
    <TouchableOpacity style={styles.simCard} onPress={() => onSelectSim(item)}>
      <View style={styles.simIcon}>
        <Icon name="sim-card" size={24} color="#2196F3" />
      </View>
      <View style={styles.simInfo}>
        <Text style={styles.simName}>{item.displayName}</Text>
        <Text style={styles.carrierName}>{item.carrierName}</Text>
        <Text style={styles.simNumber}>{item.number || `SIM ${item.simSlotIndex + 1}`}</Text>
      </View>
      <Icon name="chevron-right" size={24} color="#ccc" />
    </TouchableOpacity>
  )

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Select SIM Card</Text>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>Choose which SIM to use for calling {phoneNumber}</Text>

          <FlatList
            data={simCards}
            renderItem={renderSimCard}
            keyExtractor={(item) => item.subscriptionId.toString()}
            style={styles.simList}
          />

          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  simList: {
    flex: 1,
  },
  simCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 4,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
  },
  simIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e3f2fd",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  simInfo: {
    flex: 1,
  },
  simName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  carrierName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  simNumber: {
    fontSize: 12,
    color: "#999",
  },
  cancelButton: {
    margin: 20,
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
})

export default SimSelectionModal
