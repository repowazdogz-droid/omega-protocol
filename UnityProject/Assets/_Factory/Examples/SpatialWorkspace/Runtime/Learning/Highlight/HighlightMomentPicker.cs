using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// HighlightMomentPicker: Deterministic "editor" that selects moments from a session log.
    /// No randomness, no time-based logic, stable ordering.
    /// </summary>
    public static class HighlightMomentPicker
    {
        // Priority order for moment selection
        private static readonly string[] MomentPriority = new string[]
        {
            HighlightMomentType.PinToggled,
            HighlightMomentType.ExplainBackShown,
            HighlightMomentType.FocusEntered,
            HighlightMomentType.ClusterChanged,
            HighlightMomentType.CardSelected
        };

        // Minimum spacing between moments (milliseconds)
        private const int MIN_SPACING_CALM = 1500;
        private const int MIN_SPACING_NORMAL = 900;

        // Max moments
        private const int MAX_MOMENTS = 12;

        // Hold durations (milliseconds)
        private const int HOLD_DURATION_CALM_LOW = 3000;
        private const int HOLD_DURATION_CALM_MEDIUM = 4000;
        private const int HOLD_DURATION_CALM_HIGH = 5000;
        private const int HOLD_DURATION_NORMAL_LOW = 2000;
        private const int HOLD_DURATION_NORMAL_MEDIUM = 2500;
        private const int HOLD_DURATION_NORMAL_HIGH = 3000;

        /// <summary>
        /// Generates a highlight reel from a session log.
        /// </summary>
        public static HighlightReelDto GenerateReel(
            BoardSessionLogDto sessionLog,
            LearningBoardTuning tuning,
            int targetSeconds = 45
        )
        {
            if (sessionLog == null || sessionLog.events == null || sessionLog.events.Count == 0)
            {
                return CreateEmptyReel(sessionLog?.sessionId ?? "unknown");
            }

            bool reduceMotion = tuning != null ? tuning.GetReduceMotion() : true;
            string pacing = reduceMotion ? "calm" : "normal";
            int minSpacing = reduceMotion ? MIN_SPACING_CALM : MIN_SPACING_NORMAL;

            // Select moments in priority order
            var selectedMoments = new List<HighlightMomentDto>();
            var selectedThoughtIds = new HashSet<string>();
            int lastMomentTime = -minSpacing; // Allow first moment at t=0

            // Group events by priority
            var eventsByPriority = sessionLog.events
                .Where(e => MomentPriority.Contains(e.type))
                .OrderBy(e => Array.IndexOf(MomentPriority, e.type))
                .ThenBy(e => e.t)
                .ToList();

            foreach (var evt in eventsByPriority)
            {
                // Check spacing
                if (evt.t - lastMomentTime < minSpacing)
                {
                    continue; // Too close to previous moment
                }

                // Check max moments
                if (selectedMoments.Count >= MAX_MOMENTS)
                {
                    break;
                }

                // Create moment
                var moment = CreateMoment(evt, pacing);
                if (moment != null)
                {
                    selectedMoments.Add(moment);
                    lastMomentTime = evt.t;

                    // Track thought IDs
                    if (!string.IsNullOrEmpty(moment.thoughtId))
                    {
                        selectedThoughtIds.Add(moment.thoughtId);
                    }
                }
            }

            // Calculate total duration
            int totalDuration = 0;
            if (selectedMoments.Count > 0)
            {
                totalDuration = selectedMoments.Last().t + selectedMoments.Last().holdDurationMs;
            }

            // If reduce-motion, ensure we have fewer moments and longer holds
            if (reduceMotion && selectedMoments.Count > 8)
            {
                selectedMoments = selectedMoments.Take(8).ToList();
                // Recalculate duration
                if (selectedMoments.Count > 0)
                {
                    totalDuration = selectedMoments.Last().t + selectedMoments.Last().holdDurationMs;
                }
            }

            return new HighlightReelDto
            {
                version = "0.1",
                sessionId = sessionLog.sessionId,
                createdAtIso = DateTime.UtcNow.ToString("O"),
                durationMs = totalDuration,
                moments = selectedMoments,
                selectedThoughtIds = selectedThoughtIds.ToArray(),
                style = new ReelStyleDto
                {
                    reduceMotion = reduceMotion,
                    pacing = pacing
                }
            };
        }

        /// <summary>
        /// Creates a highlight moment from a log event.
        /// </summary>
        private static HighlightMomentDto CreateMoment(LogEventDto evt, string pacing)
        {
            string caption = GetCaption(evt);
            if (string.IsNullOrEmpty(caption))
            {
                return null;
            }

            string emphasis = GetEmphasis(evt);
            int holdDuration = GetHoldDuration(emphasis, pacing);

            var moment = new HighlightMomentDto
            {
                t = evt.t,
                type = evt.type,
                thoughtId = evt.payload?.thoughtId,
                clusterId = evt.payload?.clusterId,
                caption = caption,
                emphasis = emphasis,
                holdDurationMs = holdDuration
            };

            return moment;
        }

        /// <summary>
        /// Gets a human-readable caption for an event.
        /// </summary>
        private static string GetCaption(LogEventDto evt)
        {
            switch (evt.type)
            {
                case HighlightMomentType.PinToggled:
                    if (evt.payload?.isPinned == true)
                    {
                        return "Pinned a thought";
                    }
                    return null; // Don't highlight unpins

                case HighlightMomentType.ExplainBackShown:
                    return "Explained it back";

                case HighlightMomentType.FocusEntered:
                    return "Focused on a thought";

                case HighlightMomentType.ClusterChanged:
                    // Only highlight meaningful cluster changes
                    if (!string.IsNullOrEmpty(evt.payload?.clusterId) && 
                        evt.payload.clusterId != "All")
                    {
                        return $"Filtered to {evt.payload.clusterId}";
                    }
                    return null;

                case HighlightMomentType.CardSelected:
                    return "Selected a thought";

                default:
                    return null;
            }
        }

        /// <summary>
        /// Gets emphasis level for an event.
        /// </summary>
        private static string GetEmphasis(LogEventDto evt)
        {
            switch (evt.type)
            {
                case HighlightMomentType.PinToggled:
                case HighlightMomentType.ExplainBackShown:
                    return EmphasisLevel.High;

                case HighlightMomentType.FocusEntered:
                    return EmphasisLevel.Medium;

                default:
                    return EmphasisLevel.Low;
            }
        }

        /// <summary>
        /// Gets hold duration based on emphasis and pacing.
        /// </summary>
        private static int GetHoldDuration(string emphasis, string pacing)
        {
            bool isCalm = pacing == "calm";

            switch (emphasis)
            {
                case EmphasisLevel.High:
                    return isCalm ? HOLD_DURATION_CALM_HIGH : HOLD_DURATION_NORMAL_HIGH;

                case EmphasisLevel.Medium:
                    return isCalm ? HOLD_DURATION_CALM_MEDIUM : HOLD_DURATION_NORMAL_MEDIUM;

                case EmphasisLevel.Low:
                default:
                    return isCalm ? HOLD_DURATION_CALM_LOW : HOLD_DURATION_NORMAL_LOW;
            }
        }

        /// <summary>
        /// Creates an empty reel (fallback).
        /// </summary>
        private static HighlightReelDto CreateEmptyReel(string sessionId)
        {
            return new HighlightReelDto
            {
                version = "0.1",
                sessionId = sessionId,
                createdAtIso = DateTime.UtcNow.ToString("O"),
                durationMs = 0,
                moments = new List<HighlightMomentDto>(),
                selectedThoughtIds = new string[0],
                style = new ReelStyleDto
                {
                    reduceMotion = true,
                    pacing = "calm"
                }
            };
        }
    }
}



