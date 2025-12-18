using UnityEngine;
using TMPro;
using System.Collections;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// ThoughtBoardToast: Shows pin/unpin messages.
    /// Rate-limited, fades in/out, no spam.
    /// </summary>
    public class ThoughtBoardToast : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private TextMeshPro textMesh;
        [SerializeField] private CanvasGroup canvasGroup;

        [Header("Settings")]
        [SerializeField] private float minTimeBetweenToasts = 0.5f; // Rate limiting
        [Header("Tuning")]
        [SerializeField] private LearningBoardTuning tuning;

        private Coroutine currentToastCoroutine;
        private float lastToastTime;

        private void Awake()
        {
            if (textMesh == null)
            {
                textMesh = GetComponentInChildren<TextMeshPro>();
            }

            if (canvasGroup == null)
            {
                canvasGroup = GetComponent<CanvasGroup>();
                if (canvasGroup == null)
                {
                    canvasGroup = gameObject.AddComponent<CanvasGroup>();
                }
            }

            // Get tuning from board if not assigned
            if (tuning == null)
            {
                var board = FindObjectOfType<SpatialLearningBoard>();
                if (board != null)
                {
                    tuning = board.GetTuning();
                }
            }

            // Start hidden
            canvasGroup.alpha = 0f;
            canvasGroup.interactable = false;
            canvasGroup.blocksRaycasts = false;
        }

        /// <summary>
        /// Shows a toast message (rate-limited).
        /// </summary>
        public void ShowToast(string message)
        {
            // Rate limiting
            float timeSinceLastToast = Time.time - lastToastTime;
            if (timeSinceLastToast < minTimeBetweenToasts)
            {
                return; // Ignore spam
            }

            lastToastTime = Time.time;

            // Stop current toast if running
            if (currentToastCoroutine != null)
            {
                StopCoroutine(currentToastCoroutine);
            }

            currentToastCoroutine = StartCoroutine(ShowToastCoroutine(message));
        }

        /// <summary>
        /// Coroutine to show toast with fade in/out (or instant if reduce motion).
        /// </summary>
        private IEnumerator ShowToastCoroutine(string message)
        {
            if (textMesh != null)
            {
                textMesh.text = message;
            }

            bool reduceMotion = tuning != null ? tuning.GetReduceMotion() : true;
            float fadeDuration = reduceMotion ? 0f : (tuning != null ? tuning.toastFadeDuration : 0.3f);
            float displayDuration = tuning != null ? tuning.toastDisplayDuration : 0.8f;

            if (reduceMotion)
            {
                // Instant show
                canvasGroup.alpha = 1f;
                canvasGroup.interactable = true;
                canvasGroup.blocksRaycasts = true;
            }
            else
            {
                // Fade in
                float elapsed = 0f;
                while (elapsed < fadeDuration)
                {
                    elapsed += Time.deltaTime;
                    canvasGroup.alpha = Mathf.Lerp(0f, 1f, elapsed / fadeDuration);
                    yield return null;
                }
                canvasGroup.alpha = 1f;
                canvasGroup.interactable = true;
                canvasGroup.blocksRaycasts = true;
            }

            // Display (shorter if reduce motion)
            yield return new WaitForSeconds(reduceMotion ? displayDuration * 0.5f : displayDuration);

            if (reduceMotion)
            {
                // Instant hide
                canvasGroup.alpha = 0f;
                canvasGroup.interactable = false;
                canvasGroup.blocksRaycasts = false;
            }
            else
            {
                // Fade out
                float elapsed = 0f;
                while (elapsed < fadeDuration)
                {
                    elapsed += Time.deltaTime;
                    canvasGroup.alpha = Mathf.Lerp(1f, 0f, elapsed / fadeDuration);
                    yield return null;
                }
                canvasGroup.alpha = 0f;
                canvasGroup.interactable = false;
                canvasGroup.blocksRaycasts = false;
            }

            currentToastCoroutine = null;
        }

        /// <summary>
        /// Shows "Pinned" message.
        /// </summary>
        public void ShowPinned()
        {
            ShowToast("Pinned");
        }

        /// <summary>
        /// Shows "Unpinned" message.
        /// </summary>
        public void ShowUnpinned()
        {
            ShowToast("Unpinned");
        }
    }
}

