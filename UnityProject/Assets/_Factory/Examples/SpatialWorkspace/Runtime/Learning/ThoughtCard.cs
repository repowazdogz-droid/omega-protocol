using UnityEngine;
using TMPro;
using System;
using System.Collections;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// ThoughtCard component for rendering a ThoughtObject in 3D space.
    /// No UI system dependency - uses TextMeshPro if available, fallback otherwise.
    /// Interactable via existing pointer events.
    /// </summary>
    [RequireComponent(typeof(Collider))]
    public class ThoughtCard : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private TextMeshPro textMesh;
        [SerializeField] private GameObject iconObject;
        [SerializeField] private Renderer cardRenderer;
        [SerializeField] private Renderer outlineRenderer;

        [Header("Visual States")]
        [SerializeField] private Color normalColor = Color.white;
        [SerializeField] private Color uncertainColor = new Color(1f, 0.95f, 0.8f); // Light yellow
        [SerializeField] private Color selectedColor = new Color(0.8f, 0.9f, 1f); // Light blue
        [SerializeField] private Color hoverColor = new Color(0.95f, 0.95f, 1f); // Subtle blue tint
        [SerializeField] private float outlineWidth = 0.02f;

        [Header("Animation")]
        [SerializeField] private AnimationCurve pulseCurve = AnimationCurve.EaseInOut(0f, 0f, 1f, 0f); // Start and end at 0, peak at middle

        [Header("Typography")]
        [SerializeField] private bool isExpanded = false;
        [SerializeField] private string collapsedText = "";
        [SerializeField] private string fullText = "";

        [Header("Tuning")]
        [SerializeField] private LearningBoardTuning tuning;

        private ThoughtObjectDto data;
        private bool isSelected;
        private bool isUncertain;
        private bool isHovered;
        private MaterialPropertyBlock propertyBlock;
        private Vector3 originalScale;
        private Coroutine pulseCoroutine;

        // Event published to RoomOS bus
        public static event Action<ThoughtObjectDto> OnThoughtCardSelected;

        private void Awake()
        {
            propertyBlock = new MaterialPropertyBlock();
            originalScale = transform.localScale;
            
            // Auto-find TextMeshPro if not assigned
            if (textMesh == null)
            {
                textMesh = GetComponentInChildren<TextMeshPro>();
            }

            // Auto-find renderer if not assigned
            if (cardRenderer == null)
            {
                cardRenderer = GetComponent<Renderer>();
            }

            // Auto-find outline renderer (child object)
            if (outlineRenderer == null)
            {
                var outlineObj = transform.Find("Outline");
                if (outlineObj != null)
                {
                    outlineRenderer = outlineObj.GetComponent<Renderer>();
                }
            }
        }

        /// <summary>
        /// Initialize the card with ThoughtObject data.
        /// </summary>
        public void Initialize(ThoughtObjectDto thoughtObject, LearningBoardTuning tuningAsset = null)
        {
            data = thoughtObject;
            isUncertain = thoughtObject.IsUncertain();
            tuning = tuningAsset;

            // Store full text
            fullText = thoughtObject.contentText;

            // Process text: clamp line length, collapse if needed
            if (textMesh != null)
            {
                ProcessText();
            }
            else
            {
                // Fallback: use GameObject name
                gameObject.name = $"ThoughtCard_{thoughtObject.type}_{thoughtObject.id}";
            }

            // Set icon by type (if iconObject exists)
            if (iconObject != null)
            {
                SetIconByType(thoughtObject.type);
            }

            // Update visual state
            UpdateVisualState();
        }

        /// <summary>
        /// Processes text: clamps line length, creates collapsed version.
        /// </summary>
        private void ProcessText()
        {
            if (textMesh == null || string.IsNullOrEmpty(fullText)) return;

            int maxChars = tuning != null ? tuning.textMaxLineChars : 50;
            int maxLines = tuning != null ? tuning.maxLinesCollapsed : 3;

            // Clamp line length (insert soft breaks)
            string clampedText = ClampLineLength(fullText, maxChars);

            // Create collapsed version
            string[] lines = clampedText.Split('\n');
            if (lines.Length > maxLines)
            {
                collapsedText = string.Join("\n", lines, 0, maxLines) + "...";
            }
            else
            {
                collapsedText = clampedText;
            }

            // Set initial text (collapsed by default)
            isExpanded = false;
            UpdateTextDisplay();
        }

        /// <summary>
        /// Clamps line length by inserting soft breaks.
        /// </summary>
        private string ClampLineLength(string text, int maxChars)
        {
            if (string.IsNullOrEmpty(text)) return text;

            string[] lines = text.Split('\n');
            System.Text.StringBuilder result = new System.Text.StringBuilder();

            foreach (string line in lines)
            {
                if (line.Length <= maxChars)
                {
                    result.AppendLine(line);
                }
                else
                {
                    // Break long lines at word boundaries
                    int start = 0;
                    while (start < line.Length)
                    {
                        int end = Mathf.Min(start + maxChars, line.Length);
                        if (end < line.Length)
                        {
                            // Try to break at word boundary
                            int lastSpace = line.LastIndexOf(' ', end - 1, end - start);
                            if (lastSpace > start)
                            {
                                end = lastSpace + 1;
                            }
                        }
                        result.AppendLine(line.Substring(start, end - start));
                        start = end;
                    }
                }
            }

            return result.ToString().TrimEnd();
        }

        /// <summary>
        /// Updates text display (collapsed or expanded).
        /// </summary>
        private void UpdateTextDisplay()
        {
            if (textMesh == null) return;

            textMesh.text = isExpanded ? fullText : collapsedText;

            // Auto font sizing based on distance and content length
            if (tuning != null)
            {
                float distance = Vector3.Distance(transform.position, Camera.main != null ? Camera.main.transform.position : Vector3.zero);
                float baseSize = tuning.fontSizeMin + (tuning.fontSizeMax - tuning.fontSizeMin) * (1f / (1f + distance * tuning.fontSizeDistanceMultiplier));
                textMesh.fontSize = Mathf.Clamp(baseSize, tuning.fontSizeMin, tuning.fontSizeMax);
            }
        }

        /// <summary>
        /// Toggles expanded/collapsed state (called on second tap).
        /// </summary>
        public void ToggleExpanded()
        {
            isExpanded = !isExpanded;
            UpdateTextDisplay();
        }

        /// <summary>
        /// Sets icon based on thought object type.
        /// </summary>
        private void SetIconByType(string type)
        {
            // Simple icon representation (can be replaced with actual sprites/models)
            // For now, just enable/disable or scale based on type
            if (iconObject != null)
            {
                iconObject.SetActive(true);
                // Icon visual representation would go here
            }
        }

        /// <summary>
        /// Updates visual state (color, outline) based on selection, hover, and uncertainty.
        /// </summary>
        private void UpdateVisualState()
        {
            if (cardRenderer == null) return;

            Color targetColor = normalColor;
            if (isSelected)
            {
                targetColor = selectedColor;
            }
            else if (isHovered)
            {
                targetColor = hoverColor;
            }
            else if (isUncertain)
            {
                targetColor = uncertainColor;
            }

            cardRenderer.GetPropertyBlock(propertyBlock);
            propertyBlock.SetColor("_Color", targetColor);
            cardRenderer.SetPropertyBlock(propertyBlock);

            // Update outline for uncertainty
            if (outlineRenderer != null)
            {
                outlineRenderer.GetPropertyBlock(propertyBlock);
                if (isUncertain)
                {
                    propertyBlock.SetFloat("_OutlineWidth", outlineWidth);
                    propertyBlock.SetColor("_OutlineColor", Color.yellow);
                }
                else
                {
                    propertyBlock.SetFloat("_OutlineWidth", 0f);
                }
                outlineRenderer.SetPropertyBlock(propertyBlock);
            }
        }

        /// <summary>
        /// Called when pointer enters (hover).
        /// Can be called by XR interaction system or custom pointer events.
        /// </summary>
        public void OnPointerEnter()
        {
            isHovered = true;
            UpdateVisualState();
        }

        /// <summary>
        /// Called when pointer exits (unhover).
        /// Can be called by XR interaction system or custom pointer events.
        /// </summary>
        public void OnPointerExit()
        {
            isHovered = false;
            UpdateVisualState();
        }

        /// <summary>
        /// Called when primary action is triggered (pinch/click).
        /// Can be called by XR interaction system or custom pointer events.
        /// </summary>
        public void OnPrimaryDown()
        {
            OnSelect();
        }

        /// <summary>
        /// Called when card is selected (via pointer events).
        /// </summary>
        public void OnSelect()
        {
            isSelected = true;
            UpdateVisualState();

            // Trigger selection feedback (pulse or subtle highlight based on reduce motion)
            bool reduceMotion = tuning != null ? tuning.GetReduceMotion() : true;
            if (reduceMotion)
            {
                // Subtle highlight instead of pulse
                StartCoroutine(SubtleHighlight());
            }
            else
            {
                // Full pulse animation
                if (pulseCoroutine != null)
                {
                    StopCoroutine(pulseCoroutine);
                }
                pulseCoroutine = StartCoroutine(SelectionPulse());
            }

            // Publish event to RoomOS bus
            OnThoughtCardSelected?.Invoke(data);
        }

        /// <summary>
        /// Subtle highlight for reduce motion mode (outline/brightness change).
        /// </summary>
        private IEnumerator SubtleHighlight()
        {
            float duration = 0.15f;
            float elapsed = 0f;
            Color originalColor = normalColor;

            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                float t = elapsed / duration;
                float intensity = Mathf.Lerp(1f, 1.2f, Mathf.Sin(t * Mathf.PI));

                if (cardRenderer != null)
                {
                    cardRenderer.GetPropertyBlock(propertyBlock);
                    propertyBlock.SetColor("_Color", originalColor * intensity);
                    cardRenderer.SetPropertyBlock(propertyBlock);
                }

                yield return null;
            }

            // Restore original
            if (cardRenderer != null)
            {
                cardRenderer.GetPropertyBlock(propertyBlock);
                propertyBlock.SetColor("_Color", originalColor);
                cardRenderer.SetPropertyBlock(propertyBlock);
            }
        }

        /// <summary>
        /// Selection pulse animation (0.08-0.12s).
        /// Scales up then back down using animation curve.
        /// </summary>
        private IEnumerator SelectionPulse()
        {
            float elapsed = 0f;
            while (elapsed < pulseDuration)
            {
                elapsed += Time.deltaTime;
                float t = Mathf.Clamp01(elapsed / pulseDuration);
                // Curve should go: 0 -> 1 -> 0 (up then down)
                float curveValue = pulseCurve.Evaluate(t);
                float scale = Mathf.Lerp(1f, pulseScale, curveValue);
                transform.localScale = originalScale * scale;
                yield return null;
            }
            transform.localScale = originalScale;
            pulseCoroutine = null;
        }

        /// <summary>
        /// Called when card is deselected.
        /// </summary>
        public void OnDeselect()
        {
            isSelected = false;
            UpdateVisualState();
        }

        /// <summary>
        /// Toggle uncertainty state (for "I'm unsure" interaction).
        /// </summary>
        public void ToggleUncertainty()
        {
            isUncertain = !isUncertain;
            UpdateVisualState();
        }

        /// <summary>
        /// Gets the ThoughtObject data.
        /// </summary>
        public ThoughtObjectDto GetData()
        {
            return data;
        }

        /// <summary>
        /// Gets the thought ID (stable, reliable).
        /// </summary>
        public string GetThoughtId()
        {
            return data != null ? data.id : null;
        }
    }
}

