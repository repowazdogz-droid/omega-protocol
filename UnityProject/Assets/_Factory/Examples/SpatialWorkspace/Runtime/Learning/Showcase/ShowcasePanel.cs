using UnityEngine;
using TMPro;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// ShowcasePanel: ND-first UI for starting showcase.
    /// </summary>
    public class ShowcasePanel : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private ShowcaseRunner runner;
        [SerializeField] private ShowcaseReel reel60s;
        [SerializeField] private ShowcaseReel reel90s;
        [SerializeField] private UnityEngine.UI.Button start60sButton;
        [SerializeField] private UnityEngine.UI.Button start90sButton;
        [SerializeField] private UnityEngine.UI.Button stopButton;
        [SerializeField] private UnityEngine.UI.Button restartButton;
        [SerializeField] private TextMeshPro statusText;

        private void Awake()
        {
            if (runner == null)
            {
                runner = GetComponent<ShowcaseRunner>();
            }

            if (start60sButton != null)
            {
                start60sButton.onClick.AddListener(() => StartShowcase(60));
            }

            if (start90sButton != null)
            {
                start90sButton.onClick.AddListener(() => StartShowcase(90));
            }

            if (stopButton != null)
            {
                stopButton.onClick.AddListener(OnStopPressed);
            }

            if (restartButton != null)
            {
                restartButton.onClick.AddListener(OnRestartPressed);
            }

            UpdateButtonStates();
        }

        private void Update()
        {
            UpdateButtonStates();
        }

        /// <summary>
        /// Starts showcase with specified duration.
        /// </summary>
        private void StartShowcase(int durationSeconds)
        {
            if (runner == null)
            {
                Debug.LogError("ShowcaseRunner not found");
                return;
            }

            ShowcaseReel reel = durationSeconds <= 60 ? reel60s : reel90s;
            if (reel == null)
            {
                // Create default reel
                reel = ShowcaseReel.CreateDefault();
                reel.targetDurationSeconds = durationSeconds;
            }

            runner.StartShowcase(reel);

            if (statusText != null)
            {
                statusText.text = $"Running {durationSeconds}s showcase...";
            }
        }

        /// <summary>
        /// Called when stop button is pressed.
        /// </summary>
        private void OnStopPressed()
        {
            if (runner != null)
            {
                runner.StopShowcase();
            }

            if (statusText != null)
            {
                statusText.text = "Showcase stopped";
            }
        }

        /// <summary>
        /// Called when restart button is pressed.
        /// </summary>
        private void OnRestartPressed()
        {
            if (runner != null)
            {
                runner.RestartShowcase();
            }

            if (statusText != null)
            {
                statusText.text = "Showcase restarted";
            }
        }

        /// <summary>
        /// Updates button states based on runner status.
        /// </summary>
        private void UpdateButtonStates()
        {
            bool isRunning = runner != null && runner.IsRunning();

            if (start60sButton != null)
            {
                start60sButton.interactable = !isRunning;
            }

            if (start90sButton != null)
            {
                start90sButton.interactable = !isRunning;
            }

            if (stopButton != null)
            {
                stopButton.interactable = isRunning;
            }

            if (restartButton != null)
            {
                restartButton.interactable = isRunning;
            }
        }
    }
}











