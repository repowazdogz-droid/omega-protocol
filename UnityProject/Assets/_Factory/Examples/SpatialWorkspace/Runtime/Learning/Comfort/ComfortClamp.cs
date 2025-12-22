using UnityEngine;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// ComfortClamp: Absolute safety net for comfort parameters.
    /// Clamps board distance, focus pull, card scale, motion duration, text size.
    /// Uses LearningBoardTuning as input.
    /// </summary>
    public static class ComfortClamp
    {
        // Absolute safety bounds (hard limits, never exceeded)
        private const float MIN_BOARD_DISTANCE = 0.5f; // meters
        private const float MAX_BOARD_DISTANCE = 3.0f; // meters
        private const float MIN_FOCUS_DISTANCE = 0.1f; // meters
        private const float MAX_FOCUS_DISTANCE = 1.0f; // meters
        private const float MIN_CARD_SCALE = 0.3f;
        private const float MAX_CARD_SCALE = 2.0f;
        private const float MIN_MOTION_DURATION = 0.05f; // seconds
        private const float MAX_MOTION_DURATION = 1.0f; // seconds
        private const float MIN_FONT_SIZE = 8f;
        private const float MAX_FONT_SIZE = 48f;

        /// <summary>
        /// Clamps board distance to safe range.
        /// </summary>
        public static float ClampBoardDistance(float distance)
        {
            return Mathf.Clamp(distance, MIN_BOARD_DISTANCE, MAX_BOARD_DISTANCE);
        }

        /// <summary>
        /// Clamps focus pull-forward distance to safe range.
        /// </summary>
        public static float ClampFocusDistance(float distance)
        {
            return Mathf.Clamp(distance, MIN_FOCUS_DISTANCE, MAX_FOCUS_DISTANCE);
        }

        /// <summary>
        /// Clamps card scale to safe range.
        /// </summary>
        public static float ClampCardScale(float scale)
        {
            return Mathf.Clamp(scale, MIN_CARD_SCALE, MAX_CARD_SCALE);
        }

        /// <summary>
        /// Clamps motion duration to safe range.
        /// </summary>
        public static float ClampMotionDuration(float duration)
        {
            return Mathf.Clamp(duration, MIN_MOTION_DURATION, MAX_MOTION_DURATION);
        }

        /// <summary>
        /// Clamps font size to safe range.
        /// </summary>
        public static float ClampFontSize(float size)
        {
            return Mathf.Clamp(size, MIN_FONT_SIZE, MAX_FONT_SIZE);
        }

        /// <summary>
        /// Clamps tuning values to safe ranges (applies to LearningBoardTuning).
        /// </summary>
        public static void ClampTuning(LearningBoardTuning tuning)
        {
            if (tuning == null) return;

            // Clamp board distance
            tuning.boardDistanceMin = ClampBoardDistance(tuning.boardDistanceMin);
            tuning.boardDistanceMax = ClampBoardDistance(tuning.boardDistanceMax);
            if (tuning.boardDistanceMax < tuning.boardDistanceMin)
            {
                tuning.boardDistanceMax = tuning.boardDistanceMin;
            }

            // Clamp card scale
            tuning.cardScaleMin = ClampCardScale(tuning.cardScaleMin);
            tuning.cardScaleMax = ClampCardScale(tuning.cardScaleMax);
            if (tuning.cardScaleMax < tuning.cardScaleMin)
            {
                tuning.cardScaleMax = tuning.cardScaleMin;
            }

            // Clamp focus distance
            tuning.focusDistance = ClampFocusDistance(tuning.focusDistance);

            // Clamp transition duration
            tuning.transitionDuration = ClampMotionDuration(tuning.transitionDuration);

            // Clamp font sizes
            tuning.fontSizeMin = ClampFontSize(tuning.fontSizeMin);
            tuning.fontSizeMax = ClampFontSize(tuning.fontSizeMax);
            if (tuning.fontSizeMax < tuning.fontSizeMin)
            {
                tuning.fontSizeMax = tuning.fontSizeMin;
            }

            // Clamp pulse duration
            tuning.pulseDuration = ClampMotionDuration(tuning.pulseDuration);

            // Clamp toast durations
            tuning.toastFadeDuration = ClampMotionDuration(tuning.toastFadeDuration);
            tuning.toastDisplayDuration = Mathf.Clamp(tuning.toastDisplayDuration, 0.1f, 3.0f);
        }
    }
}











