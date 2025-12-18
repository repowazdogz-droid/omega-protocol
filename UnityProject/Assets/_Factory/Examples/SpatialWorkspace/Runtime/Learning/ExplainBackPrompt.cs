using UnityEngine;
using TMPro;
using System.Collections;
using System.Collections.Generic;
#if UNITY_2022_2_OR_NEWER
using UnityEngine.Networking;
#endif

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// ExplainBackPrompt: Overlay that generates a single short prompt from selected card type.
    /// Never "grades," just guides. Age/ND tuned.
    /// </summary>
    public class ExplainBackPrompt : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private TextMeshPro promptText;
        [SerializeField] private CanvasGroup canvasGroup;
        [SerializeField] private GameObject closeButton;

        [Header("Settings")]
        [SerializeField] private float fadeInDuration = 0.3f;
        [SerializeField] private float fadeOutDuration = 0.3f;

        [Header("HTTP")]
        [SerializeField] private string explainBackUrl = "http://localhost:3000/api/learning/explainBack";
        [SerializeField] private string learnerId = "learner-1";

        private bool isShowing = false;
        private Coroutine fadeCoroutine;

        /// <summary>
        /// Checks if prompt is currently showing.
        /// </summary>
        public bool IsShowing()
        {
            return isShowing;
        }

        private void Awake()
        {
            if (promptText == null)
            {
                promptText = GetComponentInChildren<TextMeshPro>();
            }

            if (canvasGroup == null)
            {
                canvasGroup = GetComponent<CanvasGroup>();
                if (canvasGroup == null)
                {
                    canvasGroup = gameObject.AddComponent<CanvasGroup>();
                }
            }

            // Start hidden
            canvasGroup.alpha = 0f;
            canvasGroup.interactable = false;
            canvasGroup.blocksRaycasts = false;

            if (closeButton != null)
            {
                closeButton.SetActive(false);
            }
        }

        /// <summary>
        /// Shows explain-back prompt for a thought object.
        /// </summary>
        public void ShowPrompt(ThoughtObjectDto thoughtObject)
        {
            if (thoughtObject == null) return;

            // Start fetching prompt from web
            StartCoroutine(FetchAndShowPrompt(thoughtObject));
        }

        /// <summary>
        /// Fetches explain-back prompt from web endpoint and shows it.
        /// </summary>
        private IEnumerator FetchAndShowPrompt(ThoughtObjectDto thoughtObject)
        {
            string url = $"{explainBackUrl}?learnerId={learnerId}&thoughtId={thoughtObject.id}";

            #if UNITY_2022_2_OR_NEWER
            using (var request = UnityWebRequest.Get(url))
            {
                yield return request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    var response = JsonUtility.FromJson<ExplainBackResponse>(request.downloadHandler.text);
                    if (response != null && !string.IsNullOrEmpty(response.prompt))
                    {
                        ShowPromptText(response.prompt);
                    }
                    else
                    {
                        // Fallback: generate prompt locally
                        ShowPromptText(GenerateLocalPrompt(thoughtObject));
                    }
                }
                else
                {
                    // Fallback: generate prompt locally
                    ShowPromptText(GenerateLocalPrompt(thoughtObject));
                }
            }
            #else
            // Fallback for older Unity versions
            ShowPromptText(GenerateLocalPrompt(thoughtObject));
            #endif
        }

        /// <summary>
        /// Shows the prompt text with fade-in.
        /// </summary>
        private void ShowPromptText(string prompt)
        {
            if (promptText != null)
            {
                promptText.text = prompt;
            }

            if (fadeCoroutine != null)
            {
                StopCoroutine(fadeCoroutine);
            }

            fadeCoroutine = StartCoroutine(FadeIn());
            isShowing = true;

            if (closeButton != null)
            {
                closeButton.SetActive(true);
            }
        }

        /// <summary>
        /// Hides the prompt with fade-out.
        /// </summary>
        public void HidePrompt()
        {
            if (!isShowing) return;

            if (fadeCoroutine != null)
            {
                StopCoroutine(fadeCoroutine);
            }

            fadeCoroutine = StartCoroutine(FadeOut());
            isShowing = false;

            if (closeButton != null)
            {
                closeButton.SetActive(false);
            }
        }

        /// <summary>
        /// Fade-in animation (or instant if reduce motion).
        /// </summary>
        private IEnumerator FadeIn()
        {
            bool reduceMotion = tuning != null ? tuning.GetReduceMotion() : true;
            float fadeDuration = reduceMotion ? 0f : (tuning != null ? tuning.toastFadeDuration : 0.3f);

            if (reduceMotion)
            {
                canvasGroup.alpha = 1f;
                canvasGroup.interactable = true;
                canvasGroup.blocksRaycasts = true;
                fadeCoroutine = null;
                yield break;
            }

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
            fadeCoroutine = null;
        }

        /// <summary>
        /// Fade-out animation (or instant if reduce motion).
        /// </summary>
        private IEnumerator FadeOut()
        {
            bool reduceMotion = tuning != null ? tuning.GetReduceMotion() : true;
            float fadeDuration = reduceMotion ? 0f : (tuning != null ? tuning.toastFadeDuration : 0.3f);

            if (reduceMotion)
            {
                canvasGroup.alpha = 0f;
                canvasGroup.interactable = false;
                canvasGroup.blocksRaycasts = false;
                fadeCoroutine = null;
                yield break;
            }

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
            fadeCoroutine = null;
        }

        /// <summary>
        /// Generates a local prompt as fallback (age/ND tuned, calm).
        /// </summary>
        private string GenerateLocalPrompt(ThoughtObjectDto thoughtObject)
        {
            string type = thoughtObject.type;
            string content = thoughtObject.contentText;

            // Age/ND tuned prompts (short, calm, guiding)
            switch (type)
            {
                case "Question":
                    return "Can you explain what this question is asking?";
                case "Example":
                    return "Can you explain this example in your own words?";
                case "LearnerAttempt":
                    return "Can you explain your thinking here?";
                case "Uncertainty":
                    return "What would help you feel more sure about this?";
                case "TutorHint":
                    return "Can you explain what this hint means?";
                case "Evidence":
                    return "Can you explain what this evidence shows?";
                case "Reflection":
                    return "Can you explain what you learned?";
                default:
                    return "Can you explain this in your own words?";
            }
        }

        /// <summary>
        /// Called by close button to hide prompt.
        /// </summary>
        public void OnCloseButtonPressed()
        {
            HidePrompt();
        }
    }

    /// <summary>
    /// Response from explain-back endpoint.
    /// </summary>
    [System.Serializable]
    public class ExplainBackResponse
    {
        public string prompt;
        public string thoughtId;
    }
}

