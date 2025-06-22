"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ContactManager } from "../native/ContactManager"

// Add this demo data at the top of the file after imports
const DEMO_CONTACTS = [
  { id: "1", name: "John Doe", phoneNumber: "+1234567890", type: 1, isFavorite: true },
  { id: "2", name: "Jane Smith", phoneNumber: "+1987654321", type: 1, isFavorite: false },
  { id: "3", name: "Mike Johnson", phoneNumber: "+1555123456", type: 1, isFavorite: true },
  { id: "4", name: "Sarah Wilson", phoneNumber: "+1444987654", type: 1, isFavorite: false },
  { id: "5", name: "David Brown", phoneNumber: "+1333456789", type: 1, isFavorite: true },
  { id: "6", name: "Lisa Davis", phoneNumber: "+1222789012", type: 1, isFavorite: false },
  { id: "7", name: "Tom Anderson", phoneNumber: "+1111234567", type: 1, isFavorite: false },
  { id: "8", name: "Emily Taylor", phoneNumber: "+1666543210", type: 1, isFavorite: true },
]

interface Contact {
  id: string
  name: string
  phoneNumber: string
  type: number
  isFavorite?: boolean
}

interface ContactContextType {
  contacts: Contact[]
  favorites: Contact[]
  loading: boolean
  refreshContacts: () => Promise<void>
  addContact: (contact: { name: string; phoneNumber: string }) => Promise<boolean>
  toggleFavorite: (contactId: string) => void
  searchContacts: (query: string) => Contact[]
  resetToDemo: () => void
}

const ContactContext = createContext<ContactContextType | undefined>(undefined)

export const ContactProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [favorites, setFavorites] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)

  // In the ContactProvider component, modify the useEffect to load demo data:
  useEffect(() => {
    loadDemoData()
  }, [])

  const loadDemoData = async () => {
    try {
      setLoading(true)
      // Simulate loading time
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Load demo contacts
      setContacts(DEMO_CONTACTS)

      // Set demo favorites
      const demoFavorites = DEMO_CONTACTS.filter((contact) => contact.isFavorite)
      setFavorites(demoFavorites)
    } catch (error) {
      console.error("Error loading demo data:", error)
    } finally {
      setLoading(false)
    }
  }

  const refreshContacts = async () => {
    try {
      setLoading(true)
      const contactsData = await ContactManager.getAllContacts()
      setContacts(contactsData)
    } catch (error) {
      console.error("Error fetching contacts:", error)
    } finally {
      setLoading(false)
    }
  }

  const addContact = async (contact: { name: string; phoneNumber: string }) => {
    try {
      const success = await ContactManager.addContact(contact)
      if (success) {
        await refreshContacts()
      }
      return success
    } catch (error) {
      console.error("Error adding contact:", error)
      return false
    }
  }

  const toggleFavorite = (contactId: string) => {
    const contact = contacts.find((c) => c.id === contactId)
    if (contact) {
      const isFavorite = favorites.some((f) => f.id === contactId)
      if (isFavorite) {
        setFavorites((prev) => prev.filter((f) => f.id !== contactId))
      } else {
        setFavorites((prev) => [...prev, contact])
      }
    }
  }

  const searchContacts = (query: string): Contact[] => {
    if (!query.trim()) return contacts

    const lowercaseQuery = query.toLowerCase()
    return contacts.filter(
      (contact) => contact.name.toLowerCase().includes(lowercaseQuery) || contact.phoneNumber.includes(query),
    )
  }

  // Add a method to reset to demo data
  const resetToDemo = () => {
    setContacts(DEMO_CONTACTS)
    const demoFavorites = DEMO_CONTACTS.filter((contact) => contact.isFavorite)
    setFavorites(demoFavorites)
  }

  // Update the context value to include resetToDemo
  return (
    <ContactContext.Provider
      value={{
        contacts,
        favorites,
        loading,
        refreshContacts: loadDemoData,
        addContact,
        toggleFavorite,
        searchContacts,
        resetToDemo,
      }}
    >
      {children}
    </ContactContext.Provider>
  )
}

export const useContacts = () => {
  const context = useContext(ContactContext)
  if (context === undefined) {
    throw new Error("useContacts must be used within a ContactProvider")
  }
  return context
}
