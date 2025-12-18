# Spatial Learning Board (Vision Pro MVP)

## Overview

This module brings the Learning Board from the web app into Unity/Vision Pro using Thought Objects as the shared primitive.

## Architecture

### Shared Boundary
- **ThoughtObjects.schema.json**: JSON schema defining the ThoughtObject structure
- **ThoughtObjectDto.cs**: C# DTO matching the schema for Unity deserialization

### Components

1. **ThoughtCard.cs**: Renders a single ThoughtObject in 3D space
   - Uses TextMeshPro if available, fallback otherwise
   - Interactable via pointer events
   - Publishes `ThoughtCardSelected` event to RoomOS bus
   - No per-frame allocations

2. **SpatialLearningBoard.cs**: Main board renderer
   - Accepts list of ThoughtObjectDto
   - Layout modes: Arc or Grid
   - Supports pinning (max 5 pinned cards)
   - Uncertainty visualization (outline/badge)
   - Deterministic ordering by id

3. **ThoughtObjectFeed.cs**: Import pipeline
   - **EditorDemo**: Hardcoded sample data (10 cards)
   - **File**: Reads from `persistentDataPath/thoughtObjects.json`
   - **Http**: Live sync from web app (GET endpoint, hash-based change detection)
   - Polls every 1s (Editor + device), updates only if hash changed

4. **SpatialWorkspaceEntry.cs**: Entry point
   - Instantiates Learning Board on Start
   - Hotkey: Press `L` in Editor to load board
   - Connects feed to board

## Record/Replay Setup (XR-05)

### Recording a Session
1. BoardSessionRecorder is auto-created on SpatialLearningBoard
2. Call `recorder.StartRecording()` to begin
3. Interact with board (select cards, focus, cluster, pin, etc.)
4. Call `recorder.StopRecording()` when done
5. Call `recorder.Save()` to persist to disk

### Replaying a Session
1. BoardSessionReplayer is auto-created on SpatialLearningBoard
2. Call `replayer.LoadLog(recorder.Load())` to load a session
3. Call `replayer.Play()` to start playback
4. Controls: `Pause()`, `StepForward()`, `Restart()`, `SetPlaybackSpeed(speed)`
5. Replay respects reduce-motion tuning

### Presence Setup (LAN)
1. Set `enablePresence = true` in SpatialLearningBoard
2. Host: Set `isHost = true` → broadcaster starts automatically
3. Client: Set `isHost = false` → receiver starts automatically
4. Set `expectedSessionId` on receiver to match host
5. State syncs within 1-2 seconds

### Spotlight Setup
1. SpotlightOverlay is auto-created on SpatialLearningBoard
2. Call `board.ShowSpotlight(thoughtId)` to activate
3. Learner can dismiss via "Dismiss" button
4. Dismissal propagates to host if broadcasting

## Setup

### 1. Create ThoughtCard Prefab

1. Create a GameObject with:
   - Collider (for pointer interaction)
   - TextMeshPro component (for text display)
   - Optional: Icon GameObject
   - Optional: Outline renderer (child object)

2. Add `ThoughtCard` component

3. Assign prefab to `SpatialLearningBoard.thoughtCardPrefab`

### 2. Configure SpatialLearningBoard

1. Create GameObject in scene
2. Add `SpatialLearningBoard` component
3. Assign ThoughtCard prefab
4. Configure layout settings (Arc/Grid, spacing, etc.)

### 3. Configure ThoughtObjectFeed

1. Create GameObject in scene
2. Add `ThoughtObjectFeed` component
3. Assign `SpatialLearningBoard` reference
4. Set FeedMode (EditorDemo for testing, File for production)

### 4. Hook into SpatialWorkspaceEntry

1. Add `SpatialWorkspaceEntry` to main scene GameObject
2. Assign Learning Board prefab (optional, can be instantiated at runtime)
3. Assign ThoughtObjectFeed reference

## Testing

### Editor Testing

1. Press `L` key to load board with demo data
2. Or use Context Menu: "Load Learning Board"
3. Board will spawn with 10 demo ThoughtObjects

### File-Based Testing

1. Set FeedMode to `File`
2. Create JSON file at: `Application.persistentDataPath/thoughtObjects.json`
3. Format:
```json
{
  "objects": [
    {
      "id": "obj-1",
      "type": "Question",
      "contentText": "What is the first step?",
      "source": "tutor",
      "confidence": "medium",
      "timestampIso": "2024-01-01T12:00:00Z",
      "ephemeral": false
    }
  ]
}
```
4. File will be polled every 1s in Editor

## Vision Pro Interaction

- **Gaze + Pinch**: Selects a card (triggers `ThoughtCardSelected` event)
- **Hover Feedback**: Cards highlight when pointer ray is over them
- **Selection Pulse**: Short scale pulse (0.08-0.12s) on PrimaryDown
- **Pin Thought**: Selecting a card toggles pin state (max 5 pinned)
- **Pin Shelf**: Pinned cards appear in curved row above board with "PINNED" label
- **Toast Messages**: "Pinned" / "Unpinned" messages (rate-limited, 0.8s display)
- **Uncertainty Toggle**: Visual state (yellow outline/badge) for uncertain objects

### Focus Mode (XR-03)
- **Focus on Card**: Selecting a card enters focus mode
  - Focused card comes forward (0.5 units closer)
  - Other cards dim (30% alpha) and push back (0.2 units)
  - Smooth transition (0.3s)
  - Exit with second tap on same card or "Back" button
- **ND-First**: Reduces cognitive load by focusing on one thought at a time

### Cluster Buttons (XR-03)
- **One-Tap Clusters**: Group related thoughts by type
  - "All" (default): Shows all cards
  - "Questions": Shows only Question cards
  - "Examples": Shows only Example cards
  - "Attempts": Shows only LearnerAttempt cards
  - "Uncertainty": Shows Uncertainty cards + uncertain objects
- **Deterministic**: Same filter → same result
- **Smooth Reorganization**: Cards hide/show smoothly when filter changes

### Explain-Back Mode (XR-03)
- **Explain-Back Prompt**: System asks user to teach 1 thought object back
  - Short, calm, age/ND-tuned prompts
  - Never "grades," just guides
  - Fetches from web endpoint: `/api/learning/explainBack?learnerId=...&thoughtId=...`
  - Fallback: Local prompt generation if web unavailable
- **Overlay**: Fades in/out (0.3s), shows prompt text
- **Close Button**: Dismisses prompt

## Live Sync (HTTP Mode)

1. Set FeedMode to `Http`
2. Configure `httpUrl` (default: `http://localhost:3000/api/learning/thoughtObjects`)
3. Set `learnerId` parameter
4. Unity polls endpoint every 1s
5. Updates only if hash changed (deterministic, efficient)
6. Works in Editor and on device

## Durable Board State

- Pins and custom ordering persist across app relaunches
- Saved to `persistentDataPath/learningBoard.json`
- Atomic write pattern (tmp + replace) for safety
- Stale IDs are safely ignored on load
- State applied after baseline sort-by-id

## Constraints

- ✅ No changes to RoomOS/GameOS spines
- ✅ Only Factory/Examples layer (SpatialWorkspace)
- ✅ SDK-gated (PolySpatial) + Editor fallback
- ✅ Deterministic mapping (same object list → same layout)
- ✅ No stuck drags (stale-ray safety works)

## New Features (XR-02)

### Live Sync
- ✅ HTTP mode implemented (not stub)
- ✅ Hash-based change detection (deterministic)
- ✅ Polls every 1s (Editor + device)
- ✅ Web endpoint: `/api/learning/thoughtObjects?learnerId=...`

### Micro-Feedback
- ✅ Hover highlight (subtle blue tint)
- ✅ Selection pulse (0.08-0.12s scale animation)
- ✅ Toast messages (rate-limited, fade in/out)

### Durable State
- ✅ BoardPersistence.cs (atomic write pattern)
- ✅ Pins persist across relaunches
- ✅ Custom ordering persists
- ✅ Stale IDs safely ignored

### Pin Shelf
- ✅ Curved row layout above board
- ✅ Subtle parabolic curve (center cards slightly higher)
- ✅ Optional "PINNED" label
- ✅ Smooth transitions

## New Features (XR-03)

### Focus Mode
- ✅ FocusMode.cs component
- ✅ Brings selected card forward (0.5 units)
- ✅ Dims other cards (30% alpha)
- ✅ Pushes other cards back (0.2 units)
- ✅ Smooth transitions (0.3s)
- ✅ Exit with second tap or "Back" button
- ✅ ND-first: Reduces cognitive load

### Cluster Buttons
- ✅ ClusterButtons.cs component
- ✅ One-tap filtering by type (Questions, Examples, Attempts, Uncertainty, All)
- ✅ Deterministic cluster ordering
- ✅ Smooth hide/show when filter changes
- ✅ Button visual feedback (selected = cyan, unselected = gray)

### Explain-Back Mode
- ✅ ExplainBackPrompt.cs component
- ✅ Fetches prompts from web: `/api/learning/explainBack?learnerId=...&thoughtId=...`
- ✅ Age/ND-tuned prompts (short, calm, guiding)
- ✅ Never "grades," just guides
- ✅ Fallback: Local prompt generation
- ✅ Fade in/out animations (0.3s)
- ✅ Close button to dismiss

## New Features (XR-05)

### Session Recording & Replay
- ✅ BoardSessionRecorder: Records all board interactions
- ✅ BoardSessionReplayer: Replays sessions deterministically
- ✅ Events: CardSelected, FocusEntered/Exited, ClusterChanged, PinToggled, ExplainBackShown, SpotlightShown/Dismissed, DemoStepAdvanced
- ✅ Bounded: Max 2,000 events per session
- ✅ Atomic write: `.tmp` then replace
- ✅ Public API: All replay uses same APIs as real interactions

### Presence-Lite Networking (LAN)
- ✅ PresenceBroadcaster: Broadcasts state over UDP (4-10 Hz)
- ✅ PresenceReceiver: Receives and applies state updates
- ✅ Rules: Same sessionId, newer timestamp only
- ✅ IDs only: Never syncs text content
- ✅ Host/Client: Toggle in inspector

### Spotlight (Dismissible)
- ✅ SpotlightOverlay: Teacher guidance tool
- ✅ Visual: Brings card forward OR adds outline halo (reduce-motion aware)
- ✅ Dismissible: Learner can always dismiss locally
- ✅ Propagation: Dismissal broadcasts if host

### Privacy & Safety
- ✅ IDs only: Presence never syncs text content
- ✅ Learner control: Spotlight always dismissible locally
- ✅ Opt-in: Presence disabled by default

## Future Enhancements

- Drag-and-drop reordering (structure ready)
- Spatial grouping/clustering
- Hand tracking for manipulation
- Voice commands for pinning/unpinning

