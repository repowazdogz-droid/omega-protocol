using System;
using System.Collections.Generic;
using System.IO;
using UnityEngine;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// BoardSessionRecorder: Records board interactions to a session log.
    /// No per-frame allocations. Bounded to max 2,000 events.
    /// </summary>
    public class BoardSessionRecorder : MonoBehaviour
    {
        [Header("Settings")]
        [SerializeField] private int maxEvents = 2000;
        [SerializeField] private string sessionId = "";

        [Header("References")]
        [SerializeField] private SpatialLearningBoard board;

        private bool isRecording = false;
        private DateTime sessionStartTime;
        private List<LogEventDto> events = new List<LogEventDto>();
        private string logFilePath;

        private void Awake()
        {
            if (board == null)
            {
                board = GetComponent<SpatialLearningBoard>();
            }

            logFilePath = Path.Combine(Application.persistentDataPath, "learningBoard_sessionlog.json");
        }

        /// <summary>
        /// Starts recording.
        /// </summary>
        public void StartRecording()
        {
            if (isRecording) return;

            // Check showtime mode (disabled in Replay, Demo)
            if (board != null)
            {
                var showtime = board.GetComponent<ShowtimeController>();
                if (showtime != null && !showtime.IsActionAllowed("recording"))
                {
                    Debug.LogWarning("Recording not allowed in current Showtime mode");
                    return;
                }
            }

            isRecording = true;
            sessionStartTime = DateTime.UtcNow;
            events.Clear();

            if (string.IsNullOrEmpty(sessionId))
            {
                sessionId = $"session_{DateTime.UtcNow:yyyyMMddHHmmss}";
            }

            Debug.Log($"Started recording session: {sessionId}");
        }

        /// <summary>
        /// Stops recording.
        /// </summary>
        public void StopRecording()
        {
            if (!isRecording) return;

            isRecording = false;
            Debug.Log($"Stopped recording. Total events: {events.Count}");
        }

        /// <summary>
        /// Saves the log to disk (atomic write).
        /// </summary>
        public void Save()
        {
            if (events.Count == 0)
            {
                Debug.LogWarning("No events to save");
                return;
            }

            try
            {
                var log = new BoardSessionLogDto
                {
                    sessionId = sessionId,
                    version = "0.1",
                    startedAtIso = sessionStartTime.ToString("O"),
                    events = new List<LogEventDto>(events)
                };

                string json = JsonUtility.ToJson(log, true);
                string tempPath = logFilePath + ".tmp";

                // Atomic write
                File.WriteAllText(tempPath, json);
                File.Move(tempPath, logFilePath, true);

                Debug.Log($"Saved session log: {logFilePath} ({events.Count} events)");
            }
            catch (Exception e)
            {
                Debug.LogError($"Failed to save session log: {e.Message}");
            }
        }

        /// <summary>
        /// Loads a log from disk.
        /// </summary>
        public BoardSessionLogDto Load()
        {
            if (!File.Exists(logFilePath))
            {
                Debug.LogWarning($"Session log not found: {logFilePath}");
                return null;
            }

            try
            {
                string json = File.ReadAllText(logFilePath);
                return JsonUtility.FromJson<BoardSessionLogDto>(json);
            }
            catch (Exception e)
            {
                Debug.LogError($"Failed to load session log: {e.Message}");
                return null;
            }
        }

        /// <summary>
        /// Clears the current log.
        /// </summary>
        public void Clear()
        {
            events.Clear();
            sessionId = "";
        }

        /// <summary>
        /// Checks if currently recording.
        /// </summary>
        public bool IsRecording()
        {
            return isRecording;
        }

        /// <summary>
        /// Records a card selection event.
        /// </summary>
        private void OnCardSelected(ThoughtObjectDto obj)
        {
            if (!isRecording || obj == null || string.IsNullOrEmpty(obj.id)) return;

            RecordEvent(LogEventType.CardSelected, new LogEventPayload { thoughtId = obj.id });
        }

        /// <summary>
        /// Records a focus entered event.
        /// </summary>
        public void RecordFocusEntered(string thoughtId)
        {
            if (!isRecording || string.IsNullOrEmpty(thoughtId)) return;
            RecordEvent(LogEventType.FocusEntered, new LogEventPayload { thoughtId = thoughtId });
        }

        /// <summary>
        /// Records a focus exited event.
        /// </summary>
        public void RecordFocusExited()
        {
            if (!isRecording) return;
            RecordEvent(LogEventType.FocusExited, new LogEventPayload());
        }

        /// <summary>
        /// Records a cluster changed event.
        /// </summary>
        public void RecordClusterChanged(string clusterId)
        {
            if (!isRecording || string.IsNullOrEmpty(clusterId)) return;
            RecordEvent(LogEventType.ClusterChanged, new LogEventPayload { clusterId = clusterId });
        }

        /// <summary>
        /// Records a pin toggled event.
        /// </summary>
        public void RecordPinToggled(string thoughtId, bool isPinned)
        {
            if (!isRecording || string.IsNullOrEmpty(thoughtId)) return;
            RecordEvent(LogEventType.PinToggled, new LogEventPayload { thoughtId = thoughtId, isPinned = isPinned });
        }

        /// <summary>
        /// Records an explain-back shown event.
        /// </summary>
        public void RecordExplainBackShown(string thoughtId)
        {
            if (!isRecording || string.IsNullOrEmpty(thoughtId)) return;
            RecordEvent(LogEventType.ExplainBackShown, new LogEventPayload { thoughtId = thoughtId });
        }

        /// <summary>
        /// Records a demo step advanced event.
        /// </summary>
        public void RecordDemoStepAdvanced(int stepIndex)
        {
            if (!isRecording) return;
            RecordEvent(LogEventType.DemoStepAdvanced, new LogEventPayload { stepIndex = stepIndex });
        }

        /// <summary>
        /// Records a spotlight shown event.
        /// </summary>
        public void RecordSpotlightShown(string thoughtId)
        {
            if (!isRecording || string.IsNullOrEmpty(thoughtId)) return;
            RecordEvent(LogEventType.SpotlightShown, new LogEventPayload { thoughtId = thoughtId });
        }

        /// <summary>
        /// Records a spotlight dismissed event.
        /// </summary>
        public void RecordSpotlightDismissed()
        {
            if (!isRecording) return;
            RecordEvent(LogEventType.SpotlightDismissed, new LogEventPayload());
        }

        /// <summary>
        /// Records an event (internal helper).
        /// </summary>
        private void RecordEvent(string eventType, LogEventPayload payload)
        {
            if (events.Count >= maxEvents)
            {
                Debug.LogWarning($"Event log full ({maxEvents} events). Dropping oldest events.");
                events.RemoveAt(0);
            }

            int t = (int)(DateTime.UtcNow - sessionStartTime).TotalMilliseconds;

            events.Add(new LogEventDto
            {
                t = t,
                type = eventType,
                payload = payload
            });
        }
    }
}

