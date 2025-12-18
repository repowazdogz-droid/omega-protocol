using System;
using UnityEngine;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// ShowtimeController: One-button safety, enforces mode exclusivity.
    /// No UI logic. Policy only.
    /// </summary>
    public class ShowtimeController : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private SpatialLearningBoard board;

        private ShowtimeState currentState = ShowtimeState.CreateForMode(ShowtimeMode.Off);
        private ShowtimeMode previousMode = ShowtimeMode.Off;

        // Event published when showtime state changes
        public static event Action<ShowtimeState> OnShowtimeChanged;

        private void Awake()
        {
            if (board == null)
            {
                board = GetComponent<SpatialLearningBoard>();
            }
        }

        /// <summary>
        /// Enters showtime mode (one public call).
        /// Enforces mutual exclusivity and auto-configures systems.
        /// </summary>
        public void EnterShowtime(ShowtimeMode mode)
        {
            if (mode == currentState.Mode) return; // Already in this mode

            // Enforce mutual exclusivity
            if (mode == ShowtimeMode.Replay && currentState.Mode == ShowtimeMode.Presence)
            {
                Debug.LogWarning("Cannot enter Replay while in Presence mode. Exiting Presence first.");
                ExitCurrentMode();
            }
            else if (mode == ShowtimeMode.Presence && currentState.Mode == ShowtimeMode.Replay)
            {
                Debug.LogWarning("Cannot enter Presence while in Replay mode. Exiting Replay first.");
                ExitCurrentMode();
            }

            previousMode = currentState.Mode;
            currentState = ShowtimeState.CreateForMode(mode);

            // Auto-configure systems based on mode
            ConfigureSystemsForMode(mode);

            // Notify listeners
            OnShowtimeChanged?.Invoke(currentState);

            Debug.Log($"Entered Showtime mode: {mode}");
        }

        /// <summary>
        /// Exits current showtime mode (returns to Off).
        /// </summary>
        public void ExitShowtime()
        {
            if (currentState.Mode == ShowtimeMode.Off) return;

            ExitCurrentMode();
            EnterShowtime(ShowtimeMode.Off);
        }

        /// <summary>
        /// Gets the current showtime state.
        /// </summary>
        public ShowtimeState GetCurrentState()
        {
            return currentState;
        }

        /// <summary>
        /// Checks if an action is allowed in current mode.
        /// </summary>
        public bool IsActionAllowed(string action)
        {
            return currentState.IsActionAllowed(action);
        }

        /// <summary>
        /// Exits the current mode (cleanup).
        /// </summary>
        private void ExitCurrentMode()
        {
            var mode = currentState.Mode;

            switch (mode)
            {
                case ShowtimeMode.Demo:
                    // Stop demo guide
                    if (board != null)
                    {
                        var demoGuide = board.GetComponent<DemoGuide>();
                        if (demoGuide != null)
                        {
                            demoGuide.StopDemo();
                        }
                    }
                    break;

                case ShowtimeMode.Replay:
                    // Stop replay
                    if (board != null)
                    {
                        var replayer = board.GetComponent<BoardSessionReplayer>();
                        if (replayer != null)
                        {
                            replayer.Stop();
                        }
                    }
                    break;

                case ShowtimeMode.Presence:
                    // Stop presence
                    if (board != null)
                    {
                        var broadcaster = board.GetComponent<PresenceBroadcaster>();
                        var receiver = board.GetComponent<PresenceReceiver>();
                        if (broadcaster != null)
                        {
                            broadcaster.StopBroadcasting();
                        }
                        if (receiver != null)
                        {
                            receiver.StopReceiving();
                        }
                    }
                    break;
            }
        }

        /// <summary>
        /// Configures systems for a given mode.
        /// </summary>
        private void ConfigureSystemsForMode(ShowtimeMode mode)
        {
            if (board == null) return;

            switch (mode)
            {
                case ShowtimeMode.Demo:
                    // Auto-start demo guide
                    var demoGuide = board.GetComponent<DemoGuide>();
                    if (demoGuide != null)
                    {
                        demoGuide.StartDemo();
                    }

                    // Disable recorder
                    var recorder = board.GetComponent<BoardSessionRecorder>();
                    if (recorder != null && recorder.IsRecording())
                    {
                        recorder.StopRecording();
                    }
                    break;

                case ShowtimeMode.Replay:
                    // Disable recorder
                    var recorder2 = board.GetComponent<BoardSessionRecorder>();
                    if (recorder2 != null && recorder2.IsRecording())
                    {
                        recorder2.StopRecording();
                    }

                    // Disable presence
                    var broadcaster = board.GetComponent<PresenceBroadcaster>();
                    var receiver = board.GetComponent<PresenceReceiver>();
                    if (broadcaster != null)
                    {
                        broadcaster.StopBroadcasting();
                    }
                    if (receiver != null)
                    {
                        receiver.StopReceiving();
                    }
                    break;

                case ShowtimeMode.Presence:
                    // Disable recorder
                    var recorder3 = board.GetComponent<BoardSessionRecorder>();
                    if (recorder3 != null && recorder3.IsRecording())
                    {
                        recorder3.StopRecording();
                    }

                    // Disable replay
                    var replayer = board.GetComponent<BoardSessionReplayer>();
                    if (replayer != null)
                    {
                        replayer.Stop();
                    }

                    // Start presence (host/client determined by board settings)
                    var enablePresence = board.GetComponent<SpatialLearningBoard>();
                    if (enablePresence != null)
                    {
                        // Presence will be started by board's Awake if enablePresence=true
                        // Or can be started manually via broadcaster/receiver
                    }
                    break;

                case ShowtimeMode.Solo:
                    // Everything enabled, no restrictions
                    break;

                case ShowtimeMode.Off:
                    // Reset to defaults
                    break;
            }
        }
    }
}

