using UnityEngine;
using TMPro;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// ShowcaseOverlay: Big lower-third captions for showcase.
    /// Projector-readable, reduce-motion aware.
    /// </summary>
    public class ShowcaseOverlay : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private TextMeshPro captionText;
        [SerializeField] private TextMeshPro stepIndicatorText;
        [SerializeField] private UnityEngine.UI.Button stopButton;
        [SerializeField] private UnityEngine.UI.Button restartButton;
        [SerializeField] private GameObject overlayRoot;

        [Header("Settings")]
        [SerializeField] private bool reduceMotion = true;

        private LearningBoardTuning tuning;

        private void Awake()
        {
            if (overlayRoot != null)
            {
                overlayRoot.SetActive(false);
            }

            if (stopButton != null)
            {
                stopButton.onClick.AddListener(OnStopPressed);
            }

            if (restartButton != null)
            {
                restartButton.onClick.AddListener(OnRestartPressed);
            }
        }

        /// <summary>
        /// Shows a showcase step.
        /// </summary>
        public void ShowStep(string caption, int stepNumber, int totalSteps)
        {
            if (overlayRoot != null)
            {
                overlayRoot.SetActive(true);
            }

            if (captionText != null)
            {
                captionText.text = caption ?? "";
            }

            if (stepIndicatorText != null)
            {
                stepIndicatorText.text = $"Step {stepNumber} of {totalSteps}";
            }
        }

        /// <summary>
        /// Shows completion message.
        /// </summary>
        public void ShowComplete()
        {
            if (captionText != null)
            {
                captionText.text = "Showcase complete";
            }

            if (stepIndicatorText != null)
            {
                stepIndicatorText.text = "";
            }
        }

        /// <summary>
        /// Hides overlay.
        /// </summary>
        public void Hide()
        {
            if (overlayRoot != null)
            {
                overlayRoot.SetActive(false);
            }
        }

        /// <summary>
        /// Called when stop button is pressed.
        /// </summary>
        private void OnStopPressed()
        {
            var runner = GetComponent<ShowcaseRunner>();
            if (runner != null)
            {
                runner.StopShowcase();
            }
        }

        /// <summary>
        /// Called when restart button is pressed.
        /// </summary>
        private void OnRestartPressed()
        {
            var runner = GetComponent<ShowcaseRunner>();
            if (runner != null)
            {
                runner.RestartShowcase();
            }
        }

        /// <summary>
        /// Sets tuning reference (for reduce-motion checks).
        /// </summary>
        public void SetTuning(LearningBoardTuning tuningRef)
        {
            tuning = tuningRef;
            if (tuning != null)
            {
                reduceMotion = tuning.GetReduceMotion();
            }
        }
    }
}




