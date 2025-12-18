using System;
using System.Collections.Generic;
using UnityEngine;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// ShowcaseReel: ScriptableObject defining showcase steps.
    /// Ordered steps with captions, actions, and optional target hints.
    /// </summary>
    [CreateAssetMenu(fileName = "ShowcaseReel", menuName = "Omega/Learning Showcase Reel")]
    public class ShowcaseReel : ScriptableObject
    {
        [Header("Reel Settings")]
        [Tooltip("Total duration target (seconds)")]
        public int targetDurationSeconds = 75;

        [Header("Steps")]
        public List<ShowcaseStep> steps = new List<ShowcaseStep>();

        /// <summary>
        /// Creates default 75s showcase reel.
        /// </summary>
        public static ShowcaseReel CreateDefault()
        {
            var reel = ScriptableObject.CreateInstance<ShowcaseReel>();
            reel.targetDurationSeconds = 75;
            reel.steps = new List<ShowcaseStep>
            {
                new ShowcaseStep
                {
                    caption = "Thoughts become objects.",
                    action = ShowcaseAction.None,
                    durationSeconds = 3
                },
                new ShowcaseStep
                {
                    caption = "Select a question",
                    action = ShowcaseAction.SelectCard,
                    targetHint = ShowcaseTargetHint.Questions,
                    durationSeconds = 4
                },
                new ShowcaseStep
                {
                    caption = "Focus on it",
                    action = ShowcaseAction.EnterFocus,
                    durationSeconds = 5
                },
                new ShowcaseStep
                {
                    caption = "Filter to questions",
                    action = ShowcaseAction.SetCluster,
                    clusterId = "Questions",
                    durationSeconds = 4
                },
                new ShowcaseStep
                {
                    caption = "Pin one thought",
                    action = ShowcaseAction.PinCard,
                    targetHint = ShowcaseTargetHint.Pinned,
                    durationSeconds = 4
                },
                new ShowcaseStep
                {
                    caption = "Explain it back",
                    action = ShowcaseAction.ShowExplainBack,
                    durationSeconds = 6
                },
                new ShowcaseStep
                {
                    caption = "Teacher spotlight",
                    action = ShowcaseAction.ShowSpotlight,
                    durationSeconds = 4
                },
                new ShowcaseStep
                {
                    caption = "Dismiss spotlight",
                    action = ShowcaseAction.DismissSpotlight,
                    durationSeconds = 3
                },
                new ShowcaseStep
                {
                    caption = "Export recap",
                    action = ShowcaseAction.ExportBundle,
                    durationSeconds = 5
                }
            };
            return reel;
        }
    }

    /// <summary>
    /// ShowcaseStep: Single step in the showcase.
    /// </summary>
    [Serializable]
    public class ShowcaseStep
    {
        public string caption;
        public ShowcaseAction action;
        public ShowcaseTargetHint targetHint = ShowcaseTargetHint.Any;
        public string clusterId;
        public string thoughtId; // Optional explicit target
        public int durationSeconds = 4;
    }

    /// <summary>
    /// ShowcaseAction: Action to perform.
    /// </summary>
    public enum ShowcaseAction
    {
        None,
        SelectCard,
        EnterFocus,
        SetCluster,
        PinCard,
        ShowExplainBack,
        ShowSpotlight,
        DismissSpotlight,
        ExportBundle
    }

    /// <summary>
    /// ShowcaseTargetHint: How to pick a target card.
    /// </summary>
    public enum ShowcaseTargetHint
    {
        Any,
        Pinned,
        Questions,
        Uncertain,
        Examples,
        Attempts
    }
}




