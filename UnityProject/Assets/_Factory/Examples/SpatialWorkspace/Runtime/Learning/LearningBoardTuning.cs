using UnityEngine;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// LearningBoardTuning: Single source of truth for all board comfort, typography, and motion settings.
    /// ScriptableObject for easy tweaking in Unity Editor.
    /// </summary>
    [CreateAssetMenu(fileName = "LearningBoardTuning", menuName = "Omega/Learning Board Tuning")]
    public class LearningBoardTuning : ScriptableObject
    {
        [Header("Board Distance & Scale")]
        [Tooltip("Minimum distance from user (meters)")]
        public float boardDistanceMin = 0.8f;
        [Tooltip("Maximum distance from user (meters)")]
        public float boardDistanceMax = 1.8f;
        [Tooltip("Minimum card scale")]
        public float cardScaleMin = 0.5f;
        [Tooltip("Maximum card scale")]
        public float cardScaleMax = 1.2f;

        [Header("Layout")]
        [Tooltip("Arc layout radius")]
        public float arcRadius = 2f;
        [Tooltip("Arc layout angle (degrees)")]
        public float arcAngle = 90f;
        [Tooltip("Grid spacing")]
        public float gridSpacing = 0.4f;
        [Tooltip("Grid columns")]
        public int gridColumns = 3;

        [Header("Focus Mode")]
        [Tooltip("Distance to bring focused card forward")]
        public float focusDistance = 0.5f;
        [Tooltip("Alpha for dimmed cards in focus mode")]
        [Range(0f, 1f)]
        public float dimAlpha = 0.3f;
        [Tooltip("Transition duration for focus mode (seconds)")]
        public float transitionDuration = 0.3f;

        [Header("Typography")]
        [Tooltip("Maximum characters per line before soft break")]
        public int textMaxLineChars = 50;
        [Tooltip("Maximum lines when collapsed")]
        public int maxLinesCollapsed = 3;
        [Tooltip("Minimum font size")]
        public float fontSizeMin = 12f;
        [Tooltip("Maximum font size")]
        public float fontSizeMax = 24f;
        [Tooltip("Font size based on distance multiplier")]
        public float fontSizeDistanceMultiplier = 0.1f;

        [Header("Motion")]
        [Tooltip("Reduce motion by default (ND-first)")]
        public bool reduceMotionDefault = true;
        [Tooltip("Pulse duration when reduce motion is OFF")]
        public float pulseDuration = 0.1f;
        [Tooltip("Pulse scale when reduce motion is OFF")]
        public float pulseScale = 1.15f;
        [Tooltip("Toast fade duration when reduce motion is OFF")]
        public float toastFadeDuration = 0.3f;
        [Tooltip("Toast display duration")]
        public float toastDisplayDuration = 0.8f;

        [Header("Pinning")]
        [Tooltip("Pinned shelf height")]
        public float pinnedShelfHeight = 1.5f;
        [Tooltip("Pinned shelf curve amount")]
        public float pinnedShelfCurve = 0.2f;
        [Tooltip("Pinned shelf spacing")]
        public float pinnedShelfSpacing = 0.35f;
        [Tooltip("Maximum pinned cards")]
        public int maxPinnedCards = 5;

        [Header("Clusters")]
        [Tooltip("Cluster button spacing")]
        public float clusterButtonSpacing = 0.4f;
        [Tooltip("Cluster button height")]
        public float clusterButtonHeight = 0.1f;

        /// <summary>
        /// Gets the current reduce motion setting (can be overridden by user preference).
        /// </summary>
        public bool GetReduceMotion()
        {
            // TODO: Can read from persisted user preference
            return reduceMotionDefault;
        }

        /// <summary>
        /// Clamps a value between min and max.
        /// </summary>
        public static float Clamp(float value, float min, float max)
        {
            return Mathf.Clamp(value, min, max);
        }
    }
}



