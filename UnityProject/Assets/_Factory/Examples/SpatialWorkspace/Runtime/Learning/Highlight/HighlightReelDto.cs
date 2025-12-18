using System;
using System.Collections.Generic;
using UnityEngine;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// HighlightReelDto: Data structure for highlight reel (matches schema).
    /// </summary>
    [Serializable]
    public class HighlightReelDto
    {
        public string version = "0.1";
        public string sessionId;
        public string createdAtIso;
        public int durationMs;
        public List<HighlightMomentDto> moments = new List<HighlightMomentDto>();
        public string[] selectedThoughtIds;
        public ReelStyleDto style;
    }

    /// <summary>
    /// HighlightMomentDto: Single moment in the highlight reel.
    /// </summary>
    [Serializable]
    public class HighlightMomentDto
    {
        public int t; // Time in milliseconds from session start
        public string type; // Event type
        public string thoughtId;
        public string clusterId;
        public string caption;
        public string emphasis; // "low", "medium", "high"
        public int holdDurationMs; // How long to hold this moment
    }

    /// <summary>
    /// ReelStyleDto: Styling information for the reel.
    /// </summary>
    [Serializable]
    public class ReelStyleDto
    {
        public bool reduceMotion;
        public string pacing; // "calm" or "normal"
    }

    /// <summary>
    /// Event type constants for highlight moments.
    /// </summary>
    public static class HighlightMomentType
    {
        public const string PinToggled = "PinToggled";
        public const string ExplainBackShown = "ExplainBackShown";
        public const string FocusEntered = "FocusEntered";
        public const string ClusterChanged = "ClusterChanged";
        public const string CardSelected = "CardSelected";
    }

    /// <summary>
    /// Emphasis levels.
    /// </summary>
    public static class EmphasisLevel
    {
        public const string Low = "low";
        public const string Medium = "medium";
        public const string High = "high";
    }
}



