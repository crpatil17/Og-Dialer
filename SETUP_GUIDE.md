# 🚀 React Native Dialer App - Complete Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Android Studio** - [Download here](https://developer.android.com/studio)
- **Java Development Kit (JDK 11)** - [Download here](https://www.oracle.com/java/technologies/javase-jdk11-downloads.html)
- **Expo CLI** - Install globally: `npm install -g @expo/cli`
- **Git** - [Download here](https://git-scm.com/)

## 📱 Android Setup

### 1. Android Studio Configuration

1. **Install Android Studio** and open it
2. **Configure SDK**:
   - Go to `Tools > SDK Manager`
   - Install Android SDK Platform 33 (or latest)
   - Install Android SDK Build-Tools 33.0.0 (or latest)
   - Install Android Emulator
3. **Set Environment Variables**:
   \`\`\`bash
   # Add to your ~/.bashrc, ~/.zshrc, or ~/.profile
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   \`\`\`
4. **Create Virtual Device**:
   - Open AVD Manager in Android Studio
   - Create a new virtual device (Pixel 4 recommended)
   - Choose Android 13 (API level 33) system image

### 2. Physical Device Setup (Recommended for Testing)

1. **Enable Developer Options**:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
2. **Enable USB Debugging**:
   - Go to Settings > Developer Options
   - Enable "USB Debugging"
3. **Connect Device** via USB and authorize computer

## 🛠️ Project Setup

### 1. Clone and Install

\`\`\`bash
# Clone the repository
git clone <your-repo-url>
cd react-native-dialer-app

# Install dependencies
npm install

# Install iOS dependencies (if planning to support iOS later)
cd ios && pod install && cd ..
\`\`\`

### 2. Expo Configuration

\`\`\`bash
# Install Expo CLI globally if not already installed
npm install -g @expo/cli

# Install Expo Dev Client
npx expo install expo-dev-client

# Configure for custom native code
npx expo prebuild --platform android
\`\`\`

### 3. Android Native Module Setup

1. **Copy Native Modules**:
   - Ensure all Java files are in `android/app/src/main/java/com/dialerapp/`
   - Files should include:
     - `PermissionManagerModule.java`
     - `CallManagerModule.java`
     - `ContactManagerModule.java`
     - `CallLogManagerModule.java`
     - `CallRecordingModule.java`
     - `CallerIdentificationModule.java`
     - `CallNotificationModule.java`
     - `DialerPackage.java`
     - `MainApplication.java`

2. **Verify AndroidManifest.xml** includes all required permissions:
   \`\`\`xml
   <uses-permission android:name="android.permission.CALL_PHONE" />
   <uses-permission android:name="android.permission.READ_CONTACTS" />
   <uses-permission android:name="android.permission.WRITE_CONTACTS" />
   <uses-permission android:name="android.permission.READ_CALL_LOG" />
   <uses-permission android:name="android.permission.WRITE_CALL_LOG" />
   <uses-permission android:name="android.permission.READ_PHONE_STATE" />
   <uses-permission android:name="android.permission.RECORD_AUDIO" />
   <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
   <uses-permission android:name="android.permission.VIBRATE" />
   <uses-permission android:name="android.permission.WAKE_LOCK" />
   \`\`\`

### 4. Build and Run

\`\`\`bash
# Start Metro bundler
npx expo start --dev-client

# Build and run on Android (in a new terminal)
npx expo run:android

# Or run on specific device
npx expo run:android --device
\`\`\`

## 🔧 Development Commands

\`\`\`bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS (if configured)
npm run ios

# Build for production
npx expo build:android

# Clear cache if needed
npx expo start --clear

# Check for issues
npx expo doctor
\`\`\`

## 📋 Testing Checklist

### Basic Functionality
- [ ] App launches without crashes
- [ ] All tabs are accessible (Favorites, Recents, Contacts, Dialer, Settings)
- [ ] Permissions are requested on first launch
- [ ] Demo mode works correctly

### Dialer Features
- [ ] Number pad input works
- [ ] Call button initiates calls (test with a real number)
- [ ] Call history displays correctly
- [ ] Contacts can be added/edited/deleted

### Advanced Features
- [ ] Call recording settings are accessible
- [ ] Auto dialer configuration works
- [ ] Privacy settings can be modified
- [ ] Settings screen displays all options

### Permissions Testing
- [ ] Phone permission granted
- [ ] Contacts permission granted
- [ ] Microphone permission granted (for recording)
- [ ] Storage permission granted

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler won't start**:
   \`\`\`bash
   npx expo start --clear
   rm -rf node_modules && npm install
   \`\`\`

2. **Android build fails**:
   \`\`\`bash
   cd android && ./gradlew clean && cd ..
   npx expo run:android
   \`\`\`

3. **Native modules not found**:
   - Verify all Java files are in correct directories
   - Check that `DialerPackage` is registered in `MainApplication.java`
   - Clean and rebuild: `cd android && ./gradlew clean && cd ..`

4. **Permission errors**:
   - Ensure all permissions are in `AndroidManifest.xml`
   - Test on physical device (emulator may have limitations)
   - Check device settings for app permissions

5. **Call functionality not working**:
   - Test on physical device (emulator can't make real calls)
   - Verify phone permissions are granted
   - Check that device has cellular capability

### Debug Commands

\`\`\`bash
# View logs
npx expo logs --platform android

# Debug on device
adb logcat | grep ReactNativeJS

# Check connected devices
adb devices

# Install APK manually
adb install android/app/build/outputs/apk/debug/app-debug.apk
\`\`\`

## 📱 Production Build

### 1. Prepare for Release

\`\`\`bash
# Update version in app.json
# Update version in package.json

# Generate signed APK
cd android
./gradlew assembleRelease
\`\`\`

### 2. App Store Deployment

\`\`\`bash
# Build for Play Store
npx expo build:android --type app-bundle

# Build standalone APK
npx expo build:android --type apk
\`\`\`

## 🔒 Security Considerations

1. **Permissions**: Only request necessary permissions
2. **Data Storage**: Encrypt sensitive data
3. **Network**: Use HTTPS for all API calls
4. **Compliance**: Ensure GDPR/CCPA compliance for recording features
5. **Testing**: Test thoroughly on multiple devices and Android versions

## 📞 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review the [React Native documentation](https://reactnative.dev/docs/getting-started)
3. Check [Expo documentation](https://docs.expo.dev/)
4. Create an issue in the project repository

## 🎯 Next Steps

After successful setup:

1. Test all features thoroughly
2. Customize UI/UX to your needs
3. Add additional features as required
4. Prepare for production deployment
5. Set up CI/CD pipeline for automated builds

---

**Note**: This app requires physical Android device testing for full functionality, especially call-related features. Emulators have limitations with phone capabilities.
