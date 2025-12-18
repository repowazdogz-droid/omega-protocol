using UnityEngine;
using TMPro;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// BoardStatusOverlay: Calm overlay for status, errors, and "what now?".
    /// Respects reduce-motion. ND-first.
    /// </summary>
    public class BoardStatusOverlay : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private TextMeshPro statusText;
        [SerializeField] private TextMeshPro hintText;
        [SerializeField] private UnityEngine.UI.Button primaryButton;
        [SerializeField] private UnityEngine.UI.Button secondaryButton;
        [SerializeField] private GameObject overlayRoot;

        [Header("Settings")]
        [SerializeField] private bool autoHideOnSuccess = true;
        [SerializeField] private float autoHideDelay = 3f;

        private LearningBoardTuning tuning;
        private Coroutine autoHideCoroutine;

        private void Awake()
        {
            if (overlayRoot != null)
            {
                overlayRoot.SetActive(false);
            }
        }

        /// <summary>
        /// Shows status overlay.
        /// </summary>
        public void ShowStatus(
            string statusMessage,
            string hintMessage = null,
            string primaryAction = null,
            System.Action onPrimary = null,
            string secondaryAction = null,
            System.Action onSecondary = null
        )
        {
            if (overlayRoot != null)
            {
                overlayRoot.SetActive(true);
            }

            // Update status text
            if (statusText != null)
            {
                statusText.text = statusMessage ?? "";
            }

            // Update hint text
            if (hintText != null)
            {
                hintText.text = hintMessage ?? "";
                hintText.gameObject.SetActive(!string.IsNullOrEmpty(hintMessage));
            }

            // Update primary button
            if (primaryButton != null)
            {
                var buttonText = primaryButton.GetComponentInChildren<TextMeshPro>();
                if (buttonText != null)
                {
                    buttonText.text = primaryAction ?? "";
                }
                primaryButton.gameObject.SetActive(!string.IsNullOrEmpty(primaryAction));
                primaryButton.onClick.RemoveAllListeners();
                if (onPrimary != null)
                {
                    primaryButton.onClick.AddListener(() => onPrimary());
                }
            }

            // Update secondary button
            if (secondaryButton != null)
            {
                var buttonText = secondaryButton.GetComponentInChildren<TextMeshPro>();
                if (buttonText != null)
                {
                    buttonText.text = secondaryAction ?? "";
                }
                secondaryButton.gameObject.SetActive(!string.IsNullOrEmpty(secondaryAction));
                secondaryButton.onClick.RemoveAllListeners();
                if (onSecondary != null)
                {
                    secondaryButton.onClick.AddListener(() => onSecondary());
                }
            }

            // Auto-hide on success (if enabled)
            if (autoHideOnSuccess && statusMessage.Contains("✓"))
            {
                if (autoHideCoroutine != null)
                {
                    StopCoroutine(autoHideCoroutine);
                }
                autoHideCoroutine = StartCoroutine(AutoHideCoroutine());
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

            if (autoHideCoroutine != null)
            {
                StopCoroutine(autoHideCoroutine);
                autoHideCoroutine = null;
            }
        }

        /// <summary>
        /// Auto-hide coroutine (respects reduce-motion).
        /// </summary>
        private System.Collections.IEnumerator AutoHideCoroutine()
        {
            float delay = autoHideDelay;
            if (tuning != null && tuning.GetReduceMotion())
            {
                delay *= 1.5f; // Longer delay in reduce-motion mode
            }

            yield return new WaitForSeconds(delay);
            Hide();
        }

        /// <summary>
        /// Sets tuning reference (for reduce-motion checks).
        /// </summary>
        public void SetTuning(LearningBoardTuning tuningRef)
        {
            tuning = tuningRef;
        }
    }
}




