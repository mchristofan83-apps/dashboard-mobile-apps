# Java Version Fix for Gradle Build

## Problem
- **Error:** "Unsupported class file major version 69"
- **Cause:** System has Java 25 LTS (version 69), but Gradle was configured for Java 11
- **Impact:** Gradle semantic analysis fails, blocks APK build

## Solution Applied

### 1. Updated gradle.ext.gradle
Added explicit source and target compatibility settings:
```gradle
sourceCompatibility = JavaVersion.VERSION_11
targetCompatibility = JavaVersion.VERSION_11
```

### 2. Updated android/app/build.gradle
Added compileOptions block:
```gradle
compileOptions {
    sourceCompatibility = JavaVersion.VERSION_11
    targetCompatibility = JavaVersion.VERSION_11
}
```

### 3. Updated gradle.properties
Added Java version configuration:
```properties
# React Native 0.72.17 requires Java 11
org.gradle.java.sourceCompatibility=11
org.gradle.java.targetCompatibility=11
org.gradle.jvm.version=11
```

## Why Java 11?
- React Native 0.72.17 is optimized for Java 11
- Gradle toolchain compatibility
- Kotlin compiler requirements (1.8.10)
- AGP (Android Gradle Plugin) compatibility

## System Setup
- Installed Java: OpenJDK 25.0.1 LTS (Temurin)
- Required for Build: Java 11 (compiler target)
- The gradle.jvmargs still uses Java 25 for the daemon (which is fine)

## Next Steps
1. Clean Gradle cache: `./gradlew clean`
2. Rebuild Android: `eas build --platform android` or `./gradlew assembleRelease`
3. Verify compilation with: `./gradlew build -i` (to see class file versions)

## Verification
If successful, you should see:
- No "class file major version 69" errors
- Build completes with "BUILD SUCCESSFUL"
- APK generated in android/app/build/outputs/apk/
