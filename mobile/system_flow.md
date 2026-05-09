# System Flow - Music Bar Mobile

```mermaid
graph TD
    A[App Initialization] --> B[Initialize TrackPlayer]
    A --> C[Initialize KeepAwake]
    
    B --> D[Load Mock Tracks]
    D --> E[Display Player UI]
    
    E --> F{User Action}
    F -->|Play/Pause| G[Toggle Playback]
    F -->|Next/Prev| H[Skip Track]
    F -->|Seek| I[Change Position]
    
    G --> J[TrackPlayer Engine]
    H --> J
    I --> J
    
    J --> K[Background Service]
    K --> L[OS Media Controls]
    K --> M[Audio Focus Management]
    
    N[App in Background] --> K
    O[Screen Locked] --> K
    
    P[KeepAwake Logic] -->|Active Playback| Q[Prevent Sleep]
    P -->|Paused/Stopped| R[Allow Sleep]
```

## Key Logic
1. **Background Service**: Handles events even when the app is minimized.
2. **Foreground Service**: Ensures the OS doesn't kill the playback process.
3. **Sleep Prevention**: Dynamically toggled based on playback state to save battery when not playing.
```
