using UnityEngine;
using TMPro;
using System;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// BoardDiagnosticsOverlay: Runtime diagnostics (hidden by default).
    /// Toggle: Long pinch (3s) OR Editor hotkey.
    /// No perf overhead when hidden.
    /// </summary>
    public class BoardDiagnosticsOverlay : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private TextMeshPro diagnosticText;
        [SerializeField] private GameObject overlayPanel;

        [Header("Settings")]
        [SerializeField] private float longPinchDuration = 3f; // seconds
        [SerializeField] private KeyCode editorToggleKey = KeyCode.F12;

        [Header("References")]
        [SerializeField] private SpatialLearningBoard board;
        [SerializeField] private ShowtimeController showtimeController;
        [SerializeField] private StabilityGuard stabilityGuard;

        private bool isVisible = false;
        private float pinchStartTime = 0f;
        private bool isPinching = false;
        private float lastUpdateTime = 0f;
        private float updateInterval = 0.5f; // Update every 0.5s when visible

        private void Awake()
        {
            if (board == null)
            {
                board = GetComponent<SpatialLearningBoard>();
            }

            if (showtimeController == null)
            {
                showtimeController = GetComponent<ShowtimeController>();
            }

            if (stabilityGuard == null)
            {
                stabilityGuard = GetComponent<StabilityGuard>();
            }

            if (diagnosticText == null)
            {
                diagnosticText = GetComponentInChildren<TextMeshPro>();
            }

            if (overlayPanel != null)
            {
                overlayPanel.SetActive(false);
            }
        }

        private void Update()
        {
            // Editor hotkey toggle
            #if UNITY_EDITOR
            if (Input.GetKeyDown(editorToggleKey))
            {
                ToggleVisibility();
            }
            #endif

            // Long pinch detection (simplified - would use actual pinch input in real implementation)
            // For now, this is a placeholder that would be wired to actual input system

            // Update diagnostics if visible
            if (isVisible && Time.time - lastUpdateTime >= updateInterval)
            {
                UpdateDiagnostics();
                lastUpdateTime = Time.time;
            }
        }

        /// <summary>
        /// Toggles visibility of diagnostics overlay.
        /// </summary>
        public void ToggleVisibility()
        {
            isVisible = !isVisible;

            if (overlayPanel != null)
            {
                overlayPanel.SetActive(isVisible);
            }

            if (isVisible)
            {
                UpdateDiagnostics();
            }
        }

        /// <summary>
        /// Updates diagnostic text.
        /// </summary>
        private void UpdateDiagnostics()
        {
            if (diagnosticText == null) return;

            var lines = new System.Text.StringBuilder();

            // Showtime mode
            if (showtimeController != null)
            {
                var state = showtimeController.GetCurrentState();
                lines.AppendLine($"Showtime: {state.Mode}");
            }

            // Presence state
            if (board != null)
            {
                var broadcaster = board.GetComponent<PresenceBroadcaster>();
                var receiver = board.GetComponent<PresenceReceiver>();
                if (broadcaster != null && broadcaster.IsBroadcasting())
                {
                    lines.AppendLine("Presence: Host");
                }
                else if (receiver != null && receiver.IsReceiving())
                {
                    lines.AppendLine("Presence: Client");
                }
                else
                {
                    lines.AppendLine("Presence: Off");
                }
            }

            // Replay state
            if (board != null)
            {
                var replayer = board.GetComponent<BoardSessionReplayer>();
                if (replayer != null)
                {
                    string replayState = "Idle";
                    // Check if replay is active (would need replayer to expose state)
                    // For now, check showtime mode
                    if (showtimeController != null && showtimeController.GetCurrentState().Mode == ShowtimeMode.Replay)
                    {
                        replayState = "Active";
                    }
                    lines.AppendLine($"Replay: {replayState}");
                }
            }

            // Reduce Motion
            if (board != null)
            {
                var tuning = board.GetTuning();
                if (tuning != null)
                {
                    lines.AppendLine($"Reduce Motion: {(tuning.GetReduceMotion() ? "ON" : "OFF")}");
                }
            }

            // Board object count
            if (board != null)
            {
                lines.AppendLine($"Cards: {board.GetCardCount()}");
            }

            // Last sync time (placeholder - would track actual sync)
            lines.AppendLine("Last Sync: N/A");

            diagnosticText.text = lines.ToString();
        }

        /// <summary>
        /// Called on long pinch (would be wired to input system).
        /// </summary>
        public void OnLongPinch()
        {
            ToggleVisibility();
        }
    }
}

