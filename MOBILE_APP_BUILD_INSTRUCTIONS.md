# 🚀 Mobile App Build Instructions - Complete Guide

## Quick Start (5 Minutes)

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
eas login
# Sign in with your Expo account (create free at https://expo.dev)
```

### Step 3: Navigate to Mobile App
```bash
cd d:\final-apps\apps\MobileApp
```

### Step 4: Build for Android
```bash
npm run build:android-apk
```

### Step 5: Build for iOS
```bash
npm run build:ios
```

That's it! The builds run in the cloud. You'll get download links when complete.

---

## Detailed Build Process

### Prerequisites Checklist

- [ ] Expo account created (https://expo.dev)
- [ ] Node.js installed (v14+)
- [ ] npm installed
- [ ] EAS CLI installed globally

### Installation Steps

#### 1. Install EAS CLI (One-time)

```bash
# Using npm
npm install -g eas-cli

# Or using yarn
yarn global add eas-cli

# Verify installation
eas --version
```

#### 2. Login to Expo Account

```bash
eas login
```

Follow prompts:
- Enter Expo username
- Enter Expo password
- Or use OAuth if available

**Status**: Green checkmark confirms login

#### 3. Initialize Project (First Time Only)

```bash
cd d:\final-apps\apps\MobileApp
eas init
```

This will:
- Ask if you have an Expo account (yes, you just logged in)
- Create project on Expo servers
- Generate projectId
- Update app.json with projectId

### Build Commands

All commands run from `d:\final-apps\apps\MobileApp`:

#### Android Builds

**Development APK (for testing):**
```bash
npm run build:android-apk
# Or: eas build --platform android --type apk
```

**Production AAB (for Google Play Store):**
```bash
npm run build:android-aab
# Or: eas build --platform android --type app-bundle
```

#### iOS Builds

**Development/Production IPA:**
```bash
npm run build:ios
# Or: eas build --platform ios
```

#### Build All Platforms

```bash
npm run build:all
# Or: eas build --platform all
```

### Understanding Build Output

When you run a build command, you'll see:

```
✔ Build request submitted for @username/dashboard-mobile-app
✔ Build ID: abc123def456

To monitor your build in detail, visit:
https://expo.dev/accounts/username/projects/dashboard-mobile-app/builds/abc123def456

You can also monitor progress from the Expo CLI with:
eas build --status

When your build is ready, you'll be able to download it from:
https://expo.dev/accounts/username/projects/dashboard-mobile-app/builds
```

### Monitor Build Progress

```bash
# View all builds for this project
npm run build:list

# View specific build status
eas build:status

# View build logs
npm run build:logs <BUILD_ID>
```

### Download Completed Builds

#### Method 1: Using EAS Web Dashboard
1. Go to: https://expo.dev
2. Login
3. Click your project
4. Find the completed build
5. Click "Download"

#### Method 2: From Terminal
```bash
# After build completes, terminal shows download link
# Or visit the URL provided in build output
```

### Build Configuration

The project uses `eas.json` for build settings:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  }
}
```

To use production config:
```bash
eas build --platform android --build-profile production
```

---

## Step-by-Step: First Build

### Building Android APK (Testing)

```bash
# 1. Navigate to project
cd d:\final-apps\apps\MobileApp

# 2. Run build command
npm run build:android-apk

# Expected output:
# ✔ App credentials configured
# ✔ Running build
# ✔ Build submitted successfully
# 
# Your build will start in a few moments
```

**Typical time**: 10-15 minutes

**What happens**:
- Expo cloud builds APK for Android
- All dependencies installed in cloud
- App compiled and signed
- Ready to download

### Building iOS IPA (Testing)

```bash
# 1. Navigate to project
cd d:\final-apps\apps\MobileApp

# 2. Run build command
npm run build:ios

# Expected output:
# ✔ App credentials configured
# ✔ Running build
# ✔ Build submitted successfully
```

**Typical time**: 15-20 minutes

**What happens**:
- Expo cloud builds IPA for iOS
- All dependencies installed in cloud
- App compiled and signed
- Ready to download

---

## Testing Downloaded Builds

### Android APK Testing

**Option 1: Email to testers**
- Share download link
- They click link on Android device
- App installs automatically

**Option 2: Local testing with Android Emulator**
```bash
# Download APK file
# Open Android Studio
# Open AVD Manager
# Start emulator
# Drag APK onto emulator window
# App installs and opens
```

**Option 3: Local testing with real device**
```bash
# Enable "Install from unknown sources" on device
# Download APK to device
# Tap to install
# Grant permissions
# Test app
```

### iOS IPA Testing

**Option 1: TestFlight (Easiest for beta testing)**
```bash
eas submit --platform ios
# Automatically uploads to TestFlight
# Send link to testers
# Testers install via TestFlight app
```

**Option 2: Local testing with Xcode (Mac only)**
```bash
# Download IPA file
# Open in Xcode
# Connect iPhone
# Build and Run
```

---

## Complete Workflow Example

### Day 1: Build Android APK for Testing

```bash
cd d:\final-apps\apps\MobileApp

# Build APK
npm run build:android-apk

# Output:
# ✔ Build ID: abc123
# Build URL: https://expo.dev/.../builds/abc123

# Wait 10-15 minutes...

# Download APK
# Email link to QA team
```

### Day 2: Gather Feedback, Fix Issues

```bash
# Fix bugs in MobileApp/src/
# Test locally:
npm start

# Press 'a' for Android in Expo CLI
# Test fixes with Metro bundler
```

### Day 3: Rebuild with Fixes

```bash
cd d:\final-apps\apps\MobileApp

# Build new version
npm run build:android-apk

# New APK ready for testing
```

### Day 5: Ready for Production

```bash
# Build production versions
npm run build:android-aab  # For Play Store
npm run build:ios          # For App Store

# Submit to stores
npm run submit:android
npm run submit:ios
```

---

## Common Workflows

### Just Build Android

```bash
cd d:\final-apps\apps\MobileApp
npm run build:android-apk
# Wait 10-15 minutes
# Download APK from https://expo.dev
```

### Just Build iOS

```bash
cd d:\final-apps\apps\MobileApp
npm run build:ios
# Wait 15-20 minutes
# Download IPA from https://expo.dev
```

### Build Both at Same Time

```bash
cd d:\final-apps\apps\MobileApp
npm run build:all
# Both builds run in parallel
# Wait ~20 minutes
# Download both APK and IPA
```

### Build and Submit to Google Play

```bash
cd d:\final-apps\apps\MobileApp

# Build AAB (for Play Store)
npm run build:android-aab

# Wait for build to complete

# Submit to Play Store
npm run submit:android
```

### Build and Submit to App Store

```bash
cd d:\final-apps\apps\MobileApp

# Build IPA
npm run build:ios

# Wait for build to complete

# Submit to App Store (requires Apple Developer Account)
npm run submit:ios
```

---

## Troubleshooting

### "eas: command not found"
```bash
# Fix: Install EAS CLI globally
npm install -g eas-cli

# Or use npx
npx eas build --platform android
```

### "Not authenticated"
```bash
# Fix: Login to Expo
eas login
# Enter your Expo username and password
```

### "projectId not found"
```bash
# Fix: Initialize project
eas init
```

### Build stuck or slow
```bash
# View build logs
npm run build:logs

# Or visit: https://expo.dev
# Log in and view build details
```

### "Build failed with error"
```bash
# Check logs
eas build:log <BUILD_ID>

# Common fixes:
# - Clear cache: eas build --clear-cache
# - Update Expo: npm install -g eas-cli@latest
# - Check app.json syntax
# - Verify environment.js API_URL
```

### App crashes after installing
```bash
# Likely causes:
# 1. API server offline
#    - Start server: cd server && npm start
# 2. Wrong API URL in code
#    - Edit MobileApp/src/config/environment.js
# 3. Missing permissions
#    - Check Android permissions in app.json
#    - Grant permissions on device
# 4. Dependency version mismatch
#    - npm install in MobileApp folder
#    - Rebuild
```

---

## Build Specifications

### Android

**APK (Testing)**:
- BuildType: apk
- File size: ~50-80 MB
- Installation: Direct APK install
- Usage: Testing, Distribution
- Time: 10-15 minutes

**AAB (Play Store)**:
- BuildType: app-bundle
- File size: ~40-60 MB
- Installation: Play Store only
- Usage: Google Play Store submission
- Time: 10-15 minutes

### iOS

**IPA (App Store / TestFlight)**:
- BuildType: ipa
- File size: ~80-120 MB
- Installation: App Store or TestFlight
- Usage: Testing and store submission
- Time: 15-20 minutes
- Requirements: Apple Developer Account ($99/year)

---

## Environment Configuration

Before building for production, ensure API URL is correct:

**Development**: `MobileApp/src/config/environment.js`
```javascript
const API_URL = 'http://localhost:8000/api';
```

**Production**: Update to production server
```javascript
const API_URL = 'https://your-api-domain.com/api';
```

Then rebuild with new URL embedded.

---

## App Store Submission

### Google Play Store

1. Create Google Play Developer Account ($25 one-time)
2. Build AAB: `npm run build:android-aab`
3. Submit: `npm run submit:android`
4. Fill in store listing details
5. Submit for review
6. App reviewed in 2-4 hours
7. Approve and publish

### Apple App Store

1. Create Apple Developer Account ($99/year)
2. Agree to Apple Developer Program License
3. Build IPA: `npm run build:ios`
4. Submit: `npm run submit:ios`
5. Fill in App Store listing
6. Submit for review
7. Apple reviews (typically 24-48 hours)
8. Approve and publish

---

## Useful Links

- **Expo Dashboard**: https://expo.dev
- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **EAS Submit Docs**: https://docs.expo.dev/submit/introduction/
- **React Native Docs**: https://reactnative.dev/
- **Expo CLI Docs**: https://docs.expo.dev/more/expo-cli/

---

## Build Status Icons

| Icon | Meaning |
|------|---------|
| ✔ | Success / Completed |
| ✗ | Failed |
| ⏳ | In Progress / Waiting |
| ⚠ | Warning |

---

## Next Steps

1. **Build Android APK**: `npm run build:android-apk`
2. **Test on Device**: Download APK and test on Android device
3. **Build iOS IPA**: `npm run build:ios`
4. **Gather Feedback**: QA test the apps
5. **Fix Issues**: Update code based on feedback
6. **Build Production**: `npm run build:android-aab` + `npm run build:ios`
7. **Submit to Stores**: `npm run submit:android` + `npm run submit:ios`

---

**Ready to build? Start with:**
```bash
cd d:\final-apps\apps\MobileApp
npm run build:android-apk
```

Estimated build time: 10-15 minutes ⏱️
