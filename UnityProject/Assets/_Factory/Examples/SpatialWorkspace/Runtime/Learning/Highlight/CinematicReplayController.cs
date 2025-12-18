using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// CinematicReplayController: Plays highlight reel with cinematic timing.
    /// Respects XR-06 Showtime and reduce-motion tuning.
    /// </summary>
    public class CinematicReplayController : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private SpatialLearningBoard board;
        [SerializeField] private LearningBoardTuning tuning;

        private HighlightReelDto currentReel;
        private Coroutine playbackCoroutine;
        private bool isPlaying = false;

        private void Awake()
        {
            if (board == null)
            {
                board = GetComponent<SpatialLearningBoard>();
            }

            if (tuning == null && board != null)
            {
                tuning = board.GetTuning();
            }
        }

        /// <summary>
        /// Plays a highlight reel.
        /// </summary>
        public void PlayReel(HighlightReelDto reel)
        {
            if (reel == null || reel.moments == null || reel.moments.Count == 0)
            {
                Debug.LogWarning("Cannot play empty reel");
                return;
            }

            // Enter Replay mode (XR-06 Showtime)
            var showtime = board != null ? board.GetComponent<ShowtimeController>() : null;
            if (showtime != null)
            {
                showtime.EnterShowtime(ShowtimeMode.Replay);
            }

            currentReel = reel;
            isPlaying = true;

            if (playbackCoroutine != null)
            {
                StopCoroutine(playbackCoroutine);
            }

            playbackCoroutine = StartCoroutine(PlaybackCoroutine());
        }

        /// <summary>
        /// Stops playback.
        /// </summary>
        public void Stop()
        {
            isPlaying = false;

            if (playbackCoroutine != null)
            {
                StopCoroutine(playbackCoroutine);
                playbackCoroutine = null;
            }

            // Exit Replay mode
            var showtime = board != null ? board.GetComponent<ShowtimeController>() : null;
            if (showtime != null)
            {
                showtime.ExitShowtime();
            }
        }

        /// <summary>
        /// Checks if currently playing.
        /// </summary>
        public bool IsPlaying()
        {
            return isPlaying;
        }

        /// <summary>
        /// Playback coroutine.
        /// </summary>
        private IEnumerator PlaybackCoroutine()
        {
            if (currentReel == null || board == null) yield break;

            bool reduceMotion = currentReel.style != null ? currentReel.style.reduceMotion : true;
            float transitionDuration = reduceMotion ? 0.1f : 0.3f;

            int lastMomentTime = 0;

            foreach (var moment in currentReel.moments)
            {
                if (!isPlaying) break;

                // Wait for delay since last moment
                int delayMs = moment.t - lastMomentTime;
                if (delayMs > 0)
                {
                    yield return new WaitForSeconds(delayMs / 1000f);
                }

                // Apply moment action
                ApplyMoment(moment);

                // Hold duration
                yield return new WaitForSeconds(moment.holdDurationMs / 1000f);

                lastMomentTime = moment.t + moment.holdDurationMs;
            }

            // Playback complete
            isPlaying = false;
            playbackCoroutine = null;

            // Exit Replay mode
            var showtime = board.GetComponent<ShowtimeController>();
            if (showtime != null)
            {
                showtime.ExitShowtime();
            }
        }

        /// <summary>
        /// Applies a moment action to the board.
        /// </summary>
        private void ApplyMoment(HighlightMomentDto moment)
        {
            if (board == null) return;

            switch (moment.type)
            {
                case HighlightMomentType.CardSelected:
                    if (!string.IsNullOrEmpty(moment.thoughtId))
                    {
                        board.SelectCardById(moment.thoughtId);
                    }
                    break;

                case HighlightMomentType.FocusEntered:
                    if (!string.IsNullOrEmpty(moment.thoughtId))
                    {
                        board.EnterFocus(moment.thoughtId);
                    }
                    break;

                case HighlightMomentType.ClusterChanged:
                    if (!string.IsNullOrEmpty(moment.clusterId))
                    {
                        board.SetCluster(moment.clusterId);
                    }
                    break;

                case HighlightMomentType.PinToggled:
                    if (!string.IsNullOrEmpty(moment.thoughtId))
                    {
                        board.SetPinned(moment.thoughtId, true);
                    }
                    break;

                case HighlightMomentType.ExplainBackShown:
                    if (!string.IsNullOrEmpty(moment.thoughtId))
                    {
                        board.ShowExplainBackFor(moment.thoughtId);
                    }
                    break;
            }
        }
    }
}




