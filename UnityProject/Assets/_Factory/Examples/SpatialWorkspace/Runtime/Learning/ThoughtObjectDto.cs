using System;
using UnityEngine;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// Data Transfer Object for Thought Objects from the web learning app.
    /// Matches ThoughtObjects.schema.json
    /// </summary>
    [Serializable]
    public class ThoughtObjectDto
    {
        public string id;
        public string type; // "LearnerAttempt", "TutorHint", "Example", "Question", "Evidence", "Uncertainty", "Reflection"
        public string contentText;
        public string source; // "learner", "tutor", "system"
        public string confidence; // "low", "medium", "high", "unknown" (optional)
        public string relatedStepId; // optional
        public string timestampIso;
        public bool ephemeral; // optional, default false

        /// <summary>
        /// Gets the confidence level, defaulting to "unknown" if not set.
        /// </summary>
        public string GetConfidence()
        {
            return string.IsNullOrEmpty(confidence) ? "unknown" : confidence;
        }

        /// <summary>
        /// Checks if this object is marked as uncertain (low or unknown confidence).
        /// </summary>
        public bool IsUncertain()
        {
            var conf = GetConfidence();
            return conf == "low" || conf == "unknown";
        }
    }

    /// <summary>
    /// Container for a list of ThoughtObjects (for JSON deserialization).
    /// </summary>
    [Serializable]
    public class ThoughtObjectListDto
    {
        public ThoughtObjectDto[] objects;
    }
}











