import { NativeModules } from "react-native"

interface Contact {
  id: string
  name: string
  phoneNumber: string
  type: number
}

interface ContactManagerInterface {
  getAllContacts(): Promise<Contact[]>
  addContact(contact: { name: string; phoneNumber: string }): Promise<boolean>
}

export const ContactManager: ContactManagerInterface = NativeModules.ContactManager
