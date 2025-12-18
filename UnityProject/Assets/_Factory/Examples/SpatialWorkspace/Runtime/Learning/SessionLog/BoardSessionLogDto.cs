using System;
using System.Collections.Generic;
using UnityEngine;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// BoardSessionLogDto: Data structure for session log (matches schema).
    /// </summary>
    [Serializable]
    public class BoardSessionLogDto
    {
        public string sessionId;
        public string version = "0.1";
        public string startedAtIso;
        public List<LogEventDto> events = new List<LogEventDto>();
    }

    /// <summary>
    /// LogEventDto: Single event in the session log.
    /// </summary>
    [Serializable]
    public class LogEventDto
    {
        public int t; // Milliseconds since session start
        public string type; // Event type enum
        public LogEventPayload payload;
    }

    /// <summary>
    /// LogEventPayload: Event-specific payload (polymorphic via JSON).
    /// </summary>
    [Serializable]
    public class LogEventPayload
    {
        // CardSelected, FocusEntered, ExplainBackShown, SpotlightShown
        public string thoughtId;

        // ClusterChanged
        public string clusterId;

        // PinToggled
        public bool isPinned;

        // DemoStepAdvanced
        public int stepIndex;
    }

    /// <summary>
    /// Event type constants.
    /// </summary>
    public static class LogEventType
    {
        public const string CardSelected = "CardSelected";
        public const string FocusEntered = "FocusEntered";
        public const string FocusExited = "FocusExited";
        public const string ClusterChanged = "ClusterChanged";
        public const string PinToggled = "PinToggled";
        public const string ExplainBackShown = "ExplainBackShown";
        public const string DemoStepAdvanced = "DemoStepAdvanced";
        public const string SpotlightShown = "SpotlightShown";
        public const string SpotlightDismissed = "SpotlightDismissed";
    }
}




