# Task List - Background Playback & Native Optimization

- [x] **Android Native Configuration & Module**
  - [x] Add permissions and service configuration to [AndroidManifest.xml](file:///Users/apinan/Developments/music-bar/mobile/android/app/src/main/AndroidManifest.xml)
  - [x] Create [BackgroundOptimizationModule.kt](file:///Users/apinan/Developments/music-bar/mobile/android/app/src/main/java/com/musicbarmobile/BackgroundOptimizationModule.kt) to handle Android PowerManager APIs
  - [x] Create [BackgroundOptimizationPackage.kt](file:///Users/apinan/Developments/music-bar/mobile/android/app/src/main/java/com/musicbarmobile/BackgroundOptimizationPackage.kt)
  - [x] Register the new package in [MainApplication.kt](file:///Users/apinan/Developments/music-bar/mobile/android/app/src/main/java/com/musicbarmobile/MainApplication.kt)

- [x] **Audio Engine & Services**
  - [x] Update [playback-service.ts](file:///Users/apinan/Developments/music-bar/mobile/src/data/services/playback-service.ts) to keep background playback active (`ContinuePlayback`)

- [x] **UI & Permissions Integration**
  - [x] Fix `MOCK_TRACKS` crash and implement Android 13+ Notification permission request in [player-screen.tsx](file:///Users/apinan/Developments/music-bar/mobile/src/presentation/screens/player-screen.tsx)
  - [x] Add Battery Optimization whitelist checking and request action on the playback UI

- [x] **Testing & Verification**
  - [x] Verify Gradle build and compile success
  - [x] Verify Native Module links successfully to JS side
