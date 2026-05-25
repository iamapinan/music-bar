# Task List - Background Playback & Native Optimization

- [ ] **Android Native Configuration & Module**
  - [ ] Add permissions and service configuration to [AndroidManifest.xml](file:///Users/apinan/Developments/music-bar/mobile/android/app/src/main/AndroidManifest.xml)
  - [ ] Create [BackgroundOptimizationModule.kt](file:///Users/apinan/Developments/music-bar/mobile/android/app/src/main/java/com/musicbarmobile/BackgroundOptimizationModule.kt) to handle Android PowerManager APIs
  - [ ] Create [BackgroundOptimizationPackage.kt](file:///Users/apinan/Developments/music-bar/mobile/android/app/src/main/java/com/musicbarmobile/BackgroundOptimizationPackage.kt)
  - [ ] Register the new package in [MainApplication.kt](file:///Users/apinan/Developments/music-bar/mobile/android/app/src/main/java/com/musicbarmobile/MainApplication.kt)

- [ ] **Audio Engine & Services**
  - [ ] Update [playback-service.ts](file:///Users/apinan/Developments/music-bar/mobile/src/data/services/playback-service.ts) to keep background playback active (`ContinuePlayback`)

- [ ] **UI & Permissions Integration**
  - [ ] Fix `MOCK_TRACKS` crash and implement Android 13+ Notification permission request in [player-screen.tsx](file:///Users/apinan/Developments/music-bar/mobile/src/presentation/screens/player-screen.tsx)
  - [ ] Add Battery Optimization whitelist checking and request action on the playback UI

- [ ] **Testing & Verification**
  - [ ] Verify Gradle build and compile success
  - [ ] Verify Native Module links successfully to JS side
