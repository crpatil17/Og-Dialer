# React Native Dialer App

A full-featured dialer app built with React Native and Expo, featuring native Android modules for phone functionality.

## Features

- **Dialer Interface**: Full numeric keypad with T9 predictive search
- **Call Management**: Make, receive, and manage calls
- **Contact Management**: Add, edit, delete, and search contacts
- **Call History**: View and manage call logs
- **Favorites**: Quick access to frequently called contacts
- **Native Integration**: Custom Java modules for Android phone functionality

## Prerequisites

- Node.js (v16 or higher)
- Expo CLI
- Android Studio
- Java Development Kit (JDK 11)
- Android SDK

## Setup Instructions

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Setup Expo Custom Dev Client

\`\`\`bash
npx expo install expo-dev-client
npx expo run:android
\`\`\`

### 3. Android Native Module Setup

1. Copy the Java files to your Android project:
   - `android/app/src/main/java/com/dialerapp/`

2. Update your `MainApplication.java` to include the custom package

3. Ensure all permissions are added to `AndroidManifest.xml`

### 4. Build and Run

\`\`\`bash
# For development
npx expo start --dev-client

# For Android
npx expo run:android
\`\`\`

## Project Structure

\`\`\`
src/
├── components/          # Reusable UI components
├── context/            # React Context providers
├── native/             # Native module bridges
├── screens/            # App screens
└── utils/              # Utility functions

android/
└── app/src/main/java/com/dialerapp/  # Native Android modules
\`\`\`

## Native Modules

### PermissionManager
- Request and check runtime permissions
- Handle phone and contacts permissions

### CallManager
- Make outgoing calls
- End active calls
- Integration with TelecomManager

### ContactManager
- CRUD operations for contacts
- Search and filter contacts
- Integration with ContactsContract

### CallLogManager
- Fetch call history
- Delete call log entries
- Integration with CallLog provider

## Key Components

### Screens
- **DialerScreen**: Numeric keypad and call initiation
- **RecentsScreen**: Call history with search and actions
- **ContactsScreen**: Contact list with search and management
- **FavoritesScreen**: Quick access to favorite contacts
- **InCallScreen**: Active call controls (mute, speaker, hold)

### Context Providers
- **CallContext**: Manages call state and actions
- **ContactContext**: Handles contact data and operations

## Permissions Required

- `CALL_PHONE`: Make phone calls
- `READ_CONTACTS`: Access contact list
- `WRITE_CONTACTS`: Add/edit contacts
- `READ_CALL_LOG`: Access call history
- `WRITE_CALL_LOG`: Modify call logs
- `READ_PHONE_STATE`: Monitor phone state

## Usage

1. **Making Calls**: Use the dialer screen to enter numbers and initiate calls
2. **Managing Contacts**: Add, edit, and organize your contacts
3. **Call History**: View recent calls and redial or delete entries
4. **Favorites**: Mark frequently called contacts for quick access

## Limitations

- Android only (iOS support would require separate native modules)
- Requires physical device for testing call functionality
- Some features may be restricted by device manufacturer (OEM limitations)

## Troubleshooting

### Permission Issues
- Ensure all permissions are granted in device settings
- Check that permissions are properly declared in AndroidManifest.xml

### Native Module Issues
- Verify Java files are in correct directory structure
- Ensure DialerPackage is registered in MainApplication.java
- Clean and rebuild the project if modules aren't recognized

### Build Issues
- Make sure Android SDK and build tools are up to date
- Verify JDK version compatibility
- Clear Metro cache: `npx expo start --clear`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on physical device
5. Submit a pull request

## License

This project is licensed under the MIT License.
