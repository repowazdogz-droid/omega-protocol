using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using TMPro;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// FocusMode: Brings one card forward, dims others, reduces cognitive load (ND-first).
    /// Exit with second tap or "Back" affordance.
    /// </summary>
    public class FocusMode : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private SpatialLearningBoard board;
        [SerializeField] private GameObject backButton; // Optional "Back" affordance
        [SerializeField] private LearningBoardTuning tuning;

        private ThoughtCard focusedCard;
        private List<ThoughtCard> allCards = new List<ThoughtCard>();
        private Dictionary<ThoughtCard, Vector3> originalPositions = new Dictionary<ThoughtCard, Vector3>();
        private Dictionary<ThoughtCard, float> originalAlphas = new Dictionary<ThoughtCard, float>();
        private bool isInFocusMode = false;
        private Coroutine transitionCoroutine;

        private void Awake()
        {
            if (board == null)
            {
                board = GetComponent<SpatialLearningBoard>();
            }

            // Create back button if not assigned
            if (backButton == null)
            {
                var backObj = new GameObject("BackButton");
                backObj.transform.SetParent(transform);
                backObj.transform.localPosition = new Vector3(0f, -1f, 0f);
                backObj.transform.localRotation = Quaternion.identity;
                
                // Create button visual
                var buttonVisual = GameObject.CreatePrimitive(PrimitiveType.Cube);
                buttonVisual.transform.SetParent(backObj.transform);
                buttonVisual.transform.localPosition = Vector3.zero;
                buttonVisual.transform.localScale = new Vector3(0.3f, 0.1f, 0.05f);
                buttonVisual.name = "ButtonVisual";
                
                // Add text label (optional, requires TextMeshPro setup)
                // var textObj = new GameObject("Label");
                // textObj.transform.SetParent(backObj.transform);
                // var textMesh = textObj.AddComponent<TextMeshPro>();
                // textMesh.text = "Back";
                // textMesh.fontSize = 24;
                
                backButton = backObj;
            }

            if (backButton != null)
            {
                backButton.SetActive(false);
            }
        }

        /// <summary>
        /// Enters focus mode for a specific card.
        /// </summary>
        public void EnterFocusMode(ThoughtCard card)
        {
            if (card == null) return;

            // If already focused on this card, exit focus mode
            if (isInFocusMode && focusedCard == card)
            {
                ExitFocusMode();
                return;
            }

            // Exit any existing focus first
            if (isInFocusMode && focusedCard != null)
            {
                ExitFocusMode();
            }

            // Get all cards from board
            allCards = board.GetAllCards();

            // Store original positions and alphas
            foreach (var c in allCards)
            {
                if (!originalPositions.ContainsKey(c))
                {
                    originalPositions[c] = c.transform.localPosition;
                }
                if (!originalAlphas.ContainsKey(c))
                {
                    originalAlphas[c] = GetCardAlpha(c);
                }
            }

            focusedCard = card;
            isInFocusMode = true;

            // Show back button
            if (backButton != null)
            {
                backButton.SetActive(true);
            }

            // Notify board for recording
            if (board != null)
            {
                var data = card.GetData();
                if (data != null)
                {
                    var recorder = board.GetComponent<BoardSessionRecorder>();
                    if (recorder != null && recorder.IsRecording())
                    {
                        recorder.RecordFocusEntered(data.id);
                    }
                }
            }

            // Record animation start for stability guard
            if (board != null)
            {
                var stabilityGuard = board.GetComponent<StabilityGuard>();
                if (stabilityGuard != null)
                {
                    stabilityGuard.RecordAnimationStart();
                }
            }

            // Start transition
            if (transitionCoroutine != null)
            {
                StopCoroutine(transitionCoroutine);
            }
            transitionCoroutine = StartCoroutine(TransitionToFocus());
        }

        /// <summary>
        /// Exits focus mode, restoring all cards.
        /// </summary>
        public void ExitFocusMode()
        {
            if (!isInFocusMode) return;

            isInFocusMode = false;

            // Hide back button
            if (backButton != null)
            {
                backButton.SetActive(false);
            }

            // Notify board for recording
            if (board != null)
            {
                var recorder = board.GetComponent<BoardSessionRecorder>();
                if (recorder != null && recorder.IsRecording())
                {
                    recorder.RecordFocusExited();
                }
            }

            // Record animation start for stability guard
            if (board != null)
            {
                var stabilityGuard = board.GetComponent<StabilityGuard>();
                if (stabilityGuard != null)
                {
                    stabilityGuard.RecordAnimationStart();
                }
            }

            // Start transition back
            if (transitionCoroutine != null)
            {
                StopCoroutine(transitionCoroutine);
            }
            transitionCoroutine = StartCoroutine(TransitionFromFocus());

            focusedCard = null;
        }

        /// <summary>
        /// Transitions to focus mode (smooth animation or immediate if reduce motion).
        /// </summary>
        private IEnumerator TransitionToFocus()
        {
            bool reduceMotion = tuning != null ? tuning.GetReduceMotion() : true;
            float duration = reduceMotion ? 0.1f : (tuning != null ? tuning.transitionDuration : 0.3f);
            float focusDist = tuning != null ? tuning.focusDistance : 0.5f;
            float dimAlpha = tuning != null ? tuning.dimAlpha : 0.3f;
            float pushBack = 0.2f; // Fixed push back distance

            // Clamp for comfort
            duration = ComfortClamp.ClampMotionDuration(duration);
            focusDist = ComfortClamp.ClampFocusDistance(focusDist);

            if (reduceMotion)
            {
                // Immediate transition
                foreach (var card in allCards)
                {
                    if (card == null) continue;

                    if (card == focusedCard)
                    {
                        Vector3 forward = (transform.position - card.transform.position).normalized;
                        if (forward.magnitude < 0.01f)
                        {
                            forward = -card.transform.forward;
                        }
                        card.transform.localPosition = originalPositions[card] + forward.normalized * focusDist;
                    }
                    else
                    {
                        Vector3 back = (card.transform.position - transform.position).normalized;
                        if (back.magnitude < 0.01f)
                        {
                            back = card.transform.forward;
                        }
                        card.transform.localPosition = originalPositions[card] + back.normalized * pushBack;
                        SetCardAlpha(card, dimAlpha);
                    }
                }
                yield break;
            }

            float elapsed = 0f;

            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                float t = Mathf.Clamp01(elapsed / transitionDuration);
                float smoothT = Mathf.SmoothStep(0f, 1f, t);

                foreach (var card in allCards)
                {
                    if (card == null) continue;

                    Vector3 targetPos = originalPositions[card];
                    float targetAlpha = originalAlphas[card];

                    if (card == focusedCard)
                    {
                        // Bring focused card forward (toward camera/user)
                        Vector3 forward = (transform.position - card.transform.position).normalized;
                        if (forward.magnitude < 0.01f)
                        {
                            forward = -card.transform.forward; // Fallback direction
                        }
                        targetPos = originalPositions[card] + forward.normalized * focusDist;
                    }
                    else
                    {
                        // Push other cards back and dim
                        Vector3 back = (card.transform.position - transform.position).normalized;
                        if (back.magnitude < 0.01f)
                        {
                            back = card.transform.forward; // Fallback direction
                        }
                        targetPos = originalPositions[card] + back.normalized * pushBack;
                        targetAlpha = dimAlpha;
                    }

                    // Smooth interpolation
                    card.transform.localPosition = Vector3.Lerp(originalPositions[card], targetPos, smoothT);
                    SetCardAlpha(card, Mathf.Lerp(originalAlphas[card], targetAlpha, smoothT));
                }

                yield return null;
            }

            // Ensure final state
            foreach (var card in allCards)
            {
                if (card == null) continue;

                float focusDist = tuning != null ? tuning.focusDistance : 0.5f;
                float dimAlpha = tuning != null ? tuning.dimAlpha : 0.3f;
                float pushBack = 0.2f;

                if (card == focusedCard)
                {
                    Vector3 forward = (transform.position - card.transform.position).normalized;
                    if (forward.magnitude < 0.01f)
                    {
                        forward = -card.transform.forward;
                    }
                    card.transform.localPosition = originalPositions[card] + forward.normalized * focusDist;
                }
                else
                {
                    Vector3 back = (card.transform.position - transform.position).normalized;
                    if (back.magnitude < 0.01f)
                    {
                        back = card.transform.forward;
                    }
                    card.transform.localPosition = originalPositions[card] + back.normalized * pushBack;
                    SetCardAlpha(card, dimAlpha);
                }
            }

            transitionCoroutine = null;
        }

        /// <summary>
        /// Transitions from focus mode back to normal (smooth animation).
        /// </summary>
        private IEnumerator TransitionFromFocus()
        {
            float elapsed = 0f;
            Dictionary<ThoughtCard, Vector3> currentPositions = new Dictionary<ThoughtCard, Vector3>();
            Dictionary<ThoughtCard, float> currentAlphas = new Dictionary<ThoughtCard, float>();

            foreach (var card in allCards)
            {
                if (card != null)
                {
                    currentPositions[card] = card.transform.localPosition;
                    currentAlphas[card] = GetCardAlpha(card);
                }
            }

            while (elapsed < transitionDuration)
            {
                elapsed += Time.deltaTime;
                float t = Mathf.Clamp01(elapsed / transitionDuration);
                float smoothT = Mathf.SmoothStep(0f, 1f, t);

                foreach (var card in allCards)
                {
                    if (card == null) continue;

                    card.transform.localPosition = Vector3.Lerp(currentPositions[card], originalPositions[card], smoothT);
                    SetCardAlpha(card, Mathf.Lerp(currentAlphas[card], originalAlphas[card], smoothT));
                }

                yield return null;
            }

            // Ensure final state
            foreach (var card in allCards)
            {
                if (card != null)
                {
                    card.transform.localPosition = originalPositions[card];
                    SetCardAlpha(card, originalAlphas[card]);
                }
            }

            transitionCoroutine = null;
        }

        /// <summary>
        /// Gets the alpha value of a card (for dimming).
        /// </summary>
        private float GetCardAlpha(ThoughtCard card)
        {
            var renderer = card.GetComponent<Renderer>();
            if (renderer != null && renderer.material != null)
            {
                Color color = renderer.material.color;
                return color.a;
            }
            return 1f;
        }

        /// <summary>
        /// Sets the alpha value of a card (for dimming).
        /// </summary>
        private void SetCardAlpha(ThoughtCard card, float alpha)
        {
            var renderer = card.GetComponent<Renderer>();
            if (renderer != null)
            {
                MaterialPropertyBlock block = new MaterialPropertyBlock();
                renderer.GetPropertyBlock(block);
                Color color = block.GetColor("_Color");
                if (color == Color.clear || color.a == 0f)
                {
                    color = Color.white;
                }
                color.a = alpha;
                block.SetColor("_Color", color);
                renderer.SetPropertyBlock(block);
            }

            // Also dim text if TextMeshPro is present
            var textMesh = card.GetComponentInChildren<TMPro.TextMeshPro>();
            if (textMesh != null)
            {
                Color textColor = textMesh.color;
                textColor.a = alpha;
                textMesh.color = textColor;
            }
        }

        /// <summary>
        /// Checks if currently in focus mode.
        /// </summary>
        public bool IsInFocusMode()
        {
            return isInFocusMode;
        }

        /// <summary>
        /// Gets the currently focused card.
        /// </summary>
        public ThoughtCard GetFocusedCard()
        {
            return focusedCard;
        }

        /// <summary>
        /// Gets the focused thought ID (for presence/recording).
        /// </summary>
        public string GetFocusedId()
        {
            if (focusedCard != null)
            {
                var data = focusedCard.GetData();
                return data != null ? data.id : null;
            }
            return null;
        }

        /// <summary>
        /// Checks if currently in focus mode.
        /// </summary>
        public bool IsFocused()
        {
            return isInFocusMode;
        }

        /// <summary>
        /// Called by back button to exit focus mode.
        /// </summary>
        public void OnBackButtonPressed()
        {
            ExitFocusMode();
        }
    }
}

