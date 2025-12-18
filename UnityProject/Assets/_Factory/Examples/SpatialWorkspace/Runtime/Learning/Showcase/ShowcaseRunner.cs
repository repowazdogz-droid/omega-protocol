using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// ShowcaseRunner: Deterministic showcase execution.
    /// Uses only board public APIs. Respects reduce-motion. Skips missing targets safely.
    /// </summary>
    public class ShowcaseRunner : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private SpatialLearningBoard board;
        [SerializeField] private ShowcaseReel reel;
        [SerializeField] private ShowcaseOverlay overlay;

        private int currentStepIndex = 0;
        private bool isRunning = false;
        private Coroutine runCoroutine;
        private LearningBoardTuning tuning;

        private void Awake()
        {
            if (board == null)
            {
                board = GetComponent<SpatialLearningBoard>();
            }

            if (overlay == null)
            {
                overlay = GetComponent<ShowcaseOverlay>();
            }

            tuning = board != null ? board.GetTuning() : null;
        }

        /// <summary>
        /// Starts showcase with specified reel.
        /// </summary>
        public void StartShowcase(ShowcaseReel showcaseReel)
        {
            if (isRunning)
            {
                StopShowcase();
            }

            reel = showcaseReel;
            if (reel == null || reel.steps == null || reel.steps.Count == 0)
            {
                Debug.LogError("Cannot start showcase: invalid reel");
                return;
            }

            currentStepIndex = 0;
            isRunning = true;

            // Enter Showcase mode (via ShowtimeController)
            var showtime = board != null ? board.GetComponent<ShowtimeController>() : null;
            if (showtime != null)
            {
                showtime.EnterShowtime(ShowtimeMode.Demo); // Or ShowtimeMode.Showcase if added
            }

            runCoroutine = StartCoroutine(RunShowcaseCoroutine());
        }

        /// <summary>
        /// Stops showcase.
        /// </summary>
        public void StopShowcase()
        {
            isRunning = false;

            if (runCoroutine != null)
            {
                StopCoroutine(runCoroutine);
                runCoroutine = null;
            }

            if (overlay != null)
            {
                overlay.Hide();
            }

            // Exit Showcase mode
            var showtime = board != null ? board.GetComponent<ShowtimeController>() : null;
            if (showtime != null)
            {
                showtime.ExitShowtime();
            }
        }

        /// <summary>
        /// Restarts showcase from beginning.
        /// </summary>
        public void RestartShowcase()
        {
            if (reel != null)
            {
                StopShowcase();
                StartShowcase(reel);
            }
        }

        /// <summary>
        /// Main showcase coroutine.
        /// </summary>
        private IEnumerator RunShowcaseCoroutine()
        {
            if (reel == null || board == null) yield break;

            bool reduceMotion = tuning != null ? tuning.GetReduceMotion() : true;
            float transitionDuration = reduceMotion ? 0.1f : 0.3f;

            for (int i = 0; i < reel.steps.Count && isRunning; i++)
            {
                currentStepIndex = i;
                var step = reel.steps[i];

                // Show caption
                if (overlay != null)
                {
                    overlay.ShowStep(step.caption, i + 1, reel.steps.Count);
                }

                // Wait for transition
                yield return new WaitForSeconds(transitionDuration);

                // Execute action
                ExecuteStep(step);

                // Hold duration (longer in reduce-motion)
                float holdDuration = step.durationSeconds;
                if (reduceMotion)
                {
                    holdDuration *= 1.2f; // 20% longer in reduce-motion
                }
                yield return new WaitForSeconds(holdDuration);
            }

            // Showcase complete
            isRunning = false;
            if (overlay != null)
            {
                overlay.ShowComplete();
            }
        }

        /// <summary>
        /// Executes a showcase step.
        /// </summary>
        private void ExecuteStep(ShowcaseStep step)
        {
            if (board == null) return;

            string targetId = null;

            // Get target ID if needed
            if (step.action != ShowcaseAction.None && 
                step.action != ShowcaseAction.SetCluster &&
                step.action != ShowcaseAction.DismissSpotlight &&
                step.action != ShowcaseAction.ExportBundle)
            {
                if (!string.IsNullOrEmpty(step.thoughtId))
                {
                    targetId = step.thoughtId;
                }
                else
                {
                    targetId = PickTarget(step.targetHint);
                }
            }

            // Execute action
            switch (step.action)
            {
                case ShowcaseAction.None:
                    // Just show caption
                    break;

                case ShowcaseAction.SelectCard:
                    if (!string.IsNullOrEmpty(targetId))
                    {
                        board.SelectCardById(targetId);
                    }
                    break;

                case ShowcaseAction.EnterFocus:
                    if (!string.IsNullOrEmpty(targetId))
                    {
                        board.EnterFocus(targetId);
                    }
                    break;

                case ShowcaseAction.SetCluster:
                    if (!string.IsNullOrEmpty(step.clusterId))
                    {
                        board.SetCluster(step.clusterId);
                    }
                    break;

                case ShowcaseAction.PinCard:
                    if (!string.IsNullOrEmpty(targetId))
                    {
                        board.SetPinned(targetId, true);
                    }
                    break;

                case ShowcaseAction.ShowExplainBack:
                    if (!string.IsNullOrEmpty(targetId))
                    {
                        board.ShowExplainBackFor(targetId);
                    }
                    break;

                case ShowcaseAction.ShowSpotlight:
                    if (!string.IsNullOrEmpty(targetId))
                    {
                        board.ShowSpotlight(targetId);
                    }
                    break;

                case ShowcaseAction.DismissSpotlight:
                    board.DismissSpotlight();
                    break;

                case ShowcaseAction.ExportBundle:
                    board.ExportBundle();
                    break;
            }
        }

        /// <summary>
        /// Picks a target card deterministically based on hint.
        /// Priority: pinned → questions → uncertain → examples → attempts → any
        /// </summary>
        private string PickTarget(ShowcaseTargetHint hint)
        {
            if (board == null) return null;

            // Get all thought objects (would need board API)
            // For now, return null (board would need to expose GetThoughtObjectIds())
            // This is a placeholder - actual implementation would query board state

            // Priority order
            switch (hint)
            {
                case ShowcaseTargetHint.Pinned:
                    // Try to get pinned IDs first
                    var pinnedIds = board.GetPinnedIds();
                    if (pinnedIds != null && pinnedIds.Count > 0)
                    {
                        return pinnedIds[0]; // Deterministic: first pinned
                    }
                    goto case ShowcaseTargetHint.Questions;

                case ShowcaseTargetHint.Questions:
                    // Would filter by type "Question"
                    goto case ShowcaseTargetHint.Any;

                case ShowcaseTargetHint.Uncertain:
                    // Would filter by type "Uncertainty"
                    goto case ShowcaseTargetHint.Any;

                case ShowcaseTargetHint.Examples:
                    // Would filter by type "Example"
                    goto case ShowcaseTargetHint.Any;

                case ShowcaseTargetHint.Attempts:
                    // Would filter by type "LearnerAttempt"
                    goto case ShowcaseTargetHint.Any;

                case ShowcaseTargetHint.Any:
                default:
                    // Return first available card ID
                    // Placeholder - would need board.GetCardIds()
                    return null;
            }
        }

        /// <summary>
        /// Checks if showcase is running.
        /// </summary>
        public bool IsRunning()
        {
            return isRunning;
        }

        /// <summary>
        /// Gets current step index.
        /// </summary>
        public int GetCurrentStepIndex()
        {
            return currentStepIndex;
        }
    }
}




