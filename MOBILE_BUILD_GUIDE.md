# Mobile App Build Guide - Android & iOS

## Overview

This guide explains how to build the mobile app for both Android and iOS platforms using Expo and EAS Build.

## Prerequisites

### Option 1: Cloud Build (Recommended - No Local Setup Required)
- Expo account (free at https://expo.dev)
- EAS CLI installed
- Node.js and npm installed

### Option 2: Local Build
- **Android**: Android Studio + Android SDK
- **iOS**: Mac with Xcode (iOS only)
- Expo CLI
- Node.js and npm

## Method 1: Cloud Build with EAS Build (Recommended)

EAS Build is Expo's cloud build service - no local SDK installation needed!

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

Or if using yarn:
```bash
yarn global add eas-cli
```

### Step 2: Login to Expo

```bash
eas login
```

Follow the prompts to sign in with your Expo account (create one at https://expo.dev if needed).

### Step 3: Link Project to Expo

```bash
cd d:\final-apps\apps\MobileApp
eas init
```

This will:
- Create/connect to your Expo project
- Generate projectId in app.json
- Set up build configuration

### Step 4: Build for Android

```bash
eas build --platform android --auto-submit=false
```

This will:
- Build APK for testing on Android devices
- Upload to Expo Cloud
- Provide download link when complete
- Estimated time: 10-15 minutes

**To build as AAB (for Google Play Store):**
```bash
eas build --platform android --type app-bundle --auto-submit=false
```

### Step 5: Build for iOS

```bash
eas build --platform ios --auto-submit=false
```

This will:
- Build IPA for testing on iOS devices
- Upload to Expo Cloud
- Provide download link when complete
- Estimated time: 15-20 minutes
- **Note**: Requires Apple Developer Account for signed builds

### Step 6: Download Builds

After each build completes:
1. Visit the provided download link from terminal
2. Download APK/AAB (Android) or IPA (iOS)
3. Distribute to testers or submit to stores

## Method 2: Local Development Build

### For Android Only:

```bash
# Install Android SDK and set ANDROID_HOME
# Then run:
eas build --platform android --local --build-type apk
```

### For iOS (Mac only):

```bash
# Requires Xcode installed
eas build --platform ios --local
```

## Build Configuration (eas.json)

The project includes `eas.json` with preset configurations:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"  // Preview build for testing
      }
    },
    "production": {
      "android": {
        "buildType": "aab"  // Production for Google Play Store
      }
    }
  }
}
```

### Build Types:

**APK** (Android):
- Directly installable on Android devices
- Used for testing and distribution
- Build command: `eas build --platform android --type apk`

**AAB** (Android App Bundle):
- For Google Play Store submission
- Optimized app size
- Build command: `eas build --platform android --type app-bundle`

**IPA** (iOS):
- For TestFlight and App Store
- Requires Apple Developer Account
- Build command: `eas build --platform ios`

## Testing Builds

### Android APK Testing:

1. Download APK from build link
2. Transfer to Android device or emulator
3. Install with: `adb install app.apk`
4. Or email APK link to testers

### iOS IPA Testing:

1. Use TestFlight (for beta testing)
2. Or use Xcode to install on device
3. Or use Apple Configurator

## Submitting to App Stores

### Google Play Store:

1. Create Google Play Developer Account ($25 one-time)
2. Build AAB: `eas build --platform android --type app-bundle`
3. Use EAS Submit:
   ```bash
   eas submit --platform android
   ```
4. Or manually upload to Google Play Console

### Apple App Store:

1. Create Apple Developer Account ($99/year)
2. Build IPA: `eas build --platform ios`
3. Use EAS Submit:
   ```bash
   eas submit --platform ios
   ```
4. Or use Xcode/Transporter to submit

## Environment Configuration

The app uses these environment variables (in `MobileApp/src/config/environment.js`):

```javascript
const API_URL = 'http://localhost:8000/api';  // Development
// For production: 'https://your-api-domain.com/api'
```

Before building for production, update to your production API URL.

## Build Status and Logs

Monitor builds with:

```bash
# View build status
eas build:list

# View build details
eas build:view <BUILD_ID>

# View logs
eas build:log <BUILD_ID>
```

## Common Issues

### Issue: "projectId not found"
**Solution**: Run `eas init` to initialize the project

### Issue: Build fails with "Keystore not found"
**Solution**: For first Android build, EAS creates keystore automatically. Just retry.

### Issue: "iOS requires Apple Developer Account"
**Solution**: Sign up at https://developer.apple.com/

### Issue: Build stuck or timing out
**Solution**: Check logs with `eas build:log <BUILD_ID>` or retry

## Quick Build Commands

```bash
# Development/Testing Builds
eas build --platform android --type apk    # Android APK (testing)
eas build --platform ios                   # iOS (testing)

# Production Builds
eas build --platform android --type app-bundle  # Android AAB (store)
eas build --platform ios --auto-submit     # iOS (submit to store)

# Both platforms at once
eas build --platform all --auto-submit=false

# View build queue
eas build:list

# Cancel a build
eas build:cancel <BUILD_ID>
```

## App Store Submission

### Android:
```bash
# After successful AAB build
eas submit --platform android
```

### iOS:
```bash
# After successful IPA build
eas submit --platform ios
```

## Build Time Estimates

| Build | Time | Notes |
|-------|------|-------|
| Android APK | 10-15 min | For testing |
| Android AAB | 10-15 min | For Play Store |
| iOS IPA | 15-20 min | For TestFlight/Store |
| Both | 25-35 min | Sequential builds |

## Artifact Sizes (Estimated)

| Package | Size |
|---------|------|
| Android APK | ~50-80 MB |
| Android AAB | ~40-60 MB |
| iOS IPA | ~80-120 MB |

## Troubleshooting

### Clear cache before building:
```bash
eas build --platform android --clear-cache
eas build --platform ios --clear-cache
```

### Rebuild latest source:
```bash
eas build --platform android --no-cache
```

### Check build configuration:
```bash
cat eas.json  # View your build config
cat app.json  # View app configuration
```

## Next Steps After Building

1. **Test the APK/IPA**
   - Install on test devices
   - Run through all features
   - Test GPS, Camera, Photo upload

2. **Fix Issues**
   - Use logs from `eas build:log`
   - Fix code in MobileApp/src/
   - Rebuild with fixes

3. **Submit to Stores**
   - After successful testing
   - Use `eas submit` commands
   - Submit to Google Play & App Store

4. **Monitor After Release**
   - Check user reviews
   - Monitor crash reports
   - Plan updates

## References

- **Expo Documentation**: https://docs.expo.dev/
- **EAS Build Guide**: https://docs.expo.dev/build/introduction/
- **EAS Submit Guide**: https://docs.expo.dev/submit/introduction/
- **React Native**: https://reactnative.dev/

## App Configuration File Locations

- **App Config**: `MobileApp/app.json`
- **Build Config**: `MobileApp/eas.json`
- **Environment**: `MobileApp/src/config/environment.js`
- **API Service**: `MobileApp/src/services/api.js`

---

**Ready to build?** Start with: `eas build --platform android --type apk`
