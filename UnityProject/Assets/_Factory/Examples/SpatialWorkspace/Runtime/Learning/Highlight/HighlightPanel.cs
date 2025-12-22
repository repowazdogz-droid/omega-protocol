using UnityEngine;
using TMPro;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// HighlightPanel: ND-first UI for generating and playing highlight reels.
    /// </summary>
    public class HighlightPanel : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private SpatialLearningBoard board;
        [SerializeField] private TextMeshPro statusText;
        [SerializeField] private GameObject makeHighlightButton;
        [SerializeField] private GameObject playHighlightButton;
        [SerializeField] private GameObject exportHighlightButton;
        [SerializeField] private GameObject calmPacingToggle;

        [Header("Settings")]
        [SerializeField] private int targetSeconds = 45;
        [SerializeField] private string infoMessage = "This captures steps you took. It doesn't grade.";

        private HighlightReelDto currentReel;
        private CinematicReplayController replayController;

        private void Awake()
        {
            if (board == null)
            {
                board = GetComponent<SpatialLearningBoard>();
            }

            replayController = GetComponent<CinematicReplayController>();
            if (replayController == null)
            {
                replayController = gameObject.AddComponent<CinematicReplayController>();
            }

            // Set info message
            if (statusText != null)
            {
                statusText.text = infoMessage;
            }

            // Default calm pacing based on reduce-motion
            if (calmPacingToggle != null)
            {
                var tuning = board != null ? board.GetTuning() : null;
                bool reduceMotion = tuning != null ? tuning.GetReduceMotion() : true;
                // Toggle would be set based on reduceMotion (implementation depends on UI framework)
            }
        }

        /// <summary>
        /// Called when "Make Highlight" button is pressed.
        /// </summary>
        public void OnMakeHighlightButtonPressed()
        {
            if (board == null) return;

            currentReel = board.GenerateHighlightReel(targetSeconds);

            if (currentReel != null && currentReel.moments.Count > 0)
            {
                if (statusText != null)
                {
                    statusText.text = $"Created highlight reel with {currentReel.moments.Count} moments ({currentReel.durationMs / 1000f:F1}s)";
                }

                // Enable play and export buttons
                if (playHighlightButton != null)
                {
                    playHighlightButton.SetActive(true);
                }
                if (exportHighlightButton != null)
                {
                    exportHighlightButton.SetActive(true);
                }

                Debug.Log($"Generated highlight reel: {currentReel.moments.Count} moments");
            }
            else
            {
                if (statusText != null)
                {
                    statusText.text = "No moments found to highlight";
                }
            }
        }

        /// <summary>
        /// Called when "Play Highlight" button is pressed.
        /// </summary>
        public void OnPlayHighlightButtonPressed()
        {
            if (currentReel == null || replayController == null)
            {
                if (statusText != null)
                {
                    statusText.text = "No highlight reel to play. Generate one first.";
                }
                return;
            }

            replayController.PlayReel(currentReel);

            if (statusText != null)
            {
                statusText.text = "Playing highlight reel...";
            }
        }

        /// <summary>
        /// Called when "Export Highlight" button is pressed.
        /// </summary>
        public void OnExportHighlightButtonPressed()
        {
            if (currentReel == null || board == null)
            {
                if (statusText != null)
                {
                    statusText.text = "No highlight reel to export. Generate one first.";
                }
                return;
            }

            string exportPath = board.ExportHighlightReel(currentReel);

            if (!string.IsNullOrEmpty(exportPath))
            {
                if (statusText != null)
                {
                    statusText.text = $"Exported to:\n{exportPath}";
                }
            }
            else
            {
                if (statusText != null)
                {
                    statusText.text = "Export failed. Check logs.";
                }
            }
        }
    }
}











