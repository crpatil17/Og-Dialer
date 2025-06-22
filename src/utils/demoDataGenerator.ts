export const generateDemoCallLog = (count = 20) => {
  const names = [
    "John Doe",
    "Jane Smith",
    "Mike Johnson",
    "Sarah Wilson",
    "David Brown",
    "Lisa Davis",
    "Tom Anderson",
    "Emily Taylor",
    "Chris Martin",
    "Anna Garcia",
    "Robert Lee",
    "Michelle White",
    "Kevin Clark",
    "Jessica Rodriguez",
    "Daniel Lewis",
  ]

  const phoneNumbers = [
    "+1234567890",
    "+1987654321",
    "+1555123456",
    "+1444987654",
    "+1333456789",
    "+1222789012",
    "+1111234567",
    "+1666543210",
    "+1777890123",
    "+1888901234",
    "+1999012345",
    "+1000123456",
    "+1123456789",
    "+1234567891",
    "+1345678912",
  ]

  const callTypes = [1, 2, 3] // incoming, outgoing, missed
  const durations = ["30", "60", "120", "180", "240", "300", "0"] // in seconds

  return Array.from({ length: count }, (_, index) => {
    const randomName = names[Math.floor(Math.random() * names.length)]
    const randomPhone = phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)]
    const randomType = callTypes[Math.floor(Math.random() * callTypes.length)]
    const randomDuration = randomType === 3 ? "0" : durations[Math.floor(Math.random() * (durations.length - 1))]

    // Generate dates from now to 30 days ago
    const daysAgo = Math.floor(Math.random() * 30)
    const hoursAgo = Math.floor(Math.random() * 24)
    const minutesAgo = Math.floor(Math.random() * 60)

    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    date.setHours(date.getHours() - hoursAgo)
    date.setMinutes(date.getMinutes() - minutesAgo)

    return {
      id: (index + 1).toString(),
      number: randomPhone,
      name: randomName,
      type: randomType,
      date: date.getTime().toString(),
      duration: randomDuration,
    }
  }).sort((a, b) => Number.parseInt(b.date) - Number.parseInt(a.date)) // Sort by date descending
}

export const generateDemoContacts = (count = 50) => {
  const firstNames = [
    "John",
    "Jane",
    "Mike",
    "Sarah",
    "David",
    "Lisa",
    "Tom",
    "Emily",
    "Chris",
    "Anna",
    "Robert",
    "Michelle",
    "Kevin",
    "Jessica",
    "Daniel",
    "Amanda",
    "Brian",
    "Nicole",
    "Ryan",
    "Ashley",
  ]

  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Hernandez",
    "Lopez",
    "Gonzalez",
    "Wilson",
    "Anderson",
    "Thomas",
    "Taylor",
    "Moore",
    "Jackson",
    "Martin",
  ]

  return Array.from({ length: count }, (_, index) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const name = `${firstName} ${lastName}`

    // Generate phone number
    const areaCode = Math.floor(Math.random() * 900) + 100
    const exchange = Math.floor(Math.random() * 900) + 100
    const number = Math.floor(Math.random() * 9000) + 1000
    const phoneNumber = `+1${areaCode}${exchange}${number}`

    return {
      id: (index + 1).toString(),
      name,
      phoneNumber,
      type: 1,
      isFavorite: Math.random() < 0.2, // 20% chance of being favorite
    }
  }).sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically
}

export const demoScenarios = {
  incomingCall: {
    phoneNumber: "+1234567890",
    contactName: "John Doe",
    duration: 0,
  },
  outgoingCall: {
    phoneNumber: "+1987654321",
    contactName: "Jane Smith",
    duration: 0,
  },
  activeCall: {
    phoneNumber: "+1555123456",
    contactName: "Mike Johnson",
    duration: 125, // 2 minutes 5 seconds
  },
}
