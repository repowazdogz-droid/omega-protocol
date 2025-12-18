using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// BoardSessionReplayer: Replays a session log deterministically.
    /// Respects reduce-motion tuning.
    /// </summary>
    public class BoardSessionReplayer : MonoBehaviour
    {
        [Header("Settings")]
        [SerializeField] private float playbackSpeed = 1f; // 0.5x, 1x, 2x

        [Header("References")]
        [SerializeField] private SpatialLearningBoard board;
        [SerializeField] private LearningBoardTuning tuning;

        private BoardSessionLogDto currentLog;
        private int currentEventIndex = 0;
        private bool isPlaying = false;
        private bool isPaused = false;
        private Coroutine playbackCoroutine;

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
        /// Loads a log and prepares for replay.
        /// </summary>
        public void LoadLog(BoardSessionLogDto log)
        {
            // Enter Replay mode via showtime controller
            if (board != null)
            {
                var showtime = board.GetComponent<ShowtimeController>();
                if (showtime != null)
                {
                    showtime.EnterShowtime(ShowtimeMode.Replay);
                }
            }

            currentLog = log;
            currentEventIndex = 0;
            Stop();
        }

        /// <summary>
        /// Starts playback.
        /// </summary>
        public void Play()
        {
            if (currentLog == null || currentLog.events == null || currentLog.events.Count == 0)
            {
                Debug.LogWarning("No log loaded to replay");
                return;
            }

            if (isPlaying && !isPaused)
            {
                return; // Already playing
            }

            isPlaying = true;
            isPaused = false;

            if (playbackCoroutine != null)
            {
                StopCoroutine(playbackCoroutine);
            }

            playbackCoroutine = StartCoroutine(PlaybackCoroutine());
        }

        /// <summary>
        /// Pauses playback.
        /// </summary>
        public void Pause()
        {
            isPaused = true;
        }

        /// <summary>
        /// Steps forward one event.
        /// </summary>
        public void StepForward()
        {
            if (currentLog == null || currentLog.events == null) return;

            if (currentEventIndex < currentLog.events.Count)
            {
                var evt = currentLog.events[currentEventIndex];
                ApplyEvent(evt);
                currentEventIndex++;
            }
        }

        /// <summary>
        /// Restarts playback from the beginning.
        /// </summary>
        public void Restart()
        {
            Stop();
            currentEventIndex = 0;
            Play();
        }

        /// <summary>
        /// Stops playback.
        /// </summary>
        public void Stop()
        {
            isPlaying = false;
            isPaused = false;

            if (playbackCoroutine != null)
            {
                StopCoroutine(playbackCoroutine);
                playbackCoroutine = null;
            }

            // Exit Replay mode
            if (board != null)
            {
                var showtime = board.GetComponent<ShowtimeController>();
                if (showtime != null)
                {
                    showtime.ExitShowtime();
                }
            }
        }

        /// <summary>
        /// Sets playback speed.
        /// </summary>
        public void SetPlaybackSpeed(float speed)
        {
            playbackSpeed = Mathf.Clamp(speed, 0.1f, 5f);
        }

        /// <summary>
        /// Playback coroutine.
        /// </summary>
        private IEnumerator PlaybackCoroutine()
        {
            if (currentLog == null || currentLog.events == null) yield break;

            int lastT = 0;

            while (currentEventIndex < currentLog.events.Count)
            {
                if (isPaused)
                {
                    yield return null;
                    continue;
                }

                var evt = currentLog.events[currentEventIndex];
                int delayMs = evt.t - lastT;
                lastT = evt.t;

                // Wait for delay (adjusted by playback speed)
                if (delayMs > 0)
                {
                    float delaySeconds = (delayMs / 1000f) / playbackSpeed;
                    yield return new WaitForSeconds(delaySeconds);
                }

                // Apply event
                ApplyEvent(evt);
                currentEventIndex++;
            }

            // Playback complete
            isPlaying = false;
            playbackCoroutine = null;
        }

        /// <summary>
        /// Applies a single event to the board.
        /// </summary>
        private void ApplyEvent(LogEventDto evt)
        {
            if (board == null) return;

            switch (evt.type)
            {
                case LogEventType.CardSelected:
                    if (!string.IsNullOrEmpty(evt.payload.thoughtId))
                    {
                        board.SelectCardById(evt.payload.thoughtId);
                    }
                    break;

                case LogEventType.FocusEntered:
                    if (!string.IsNullOrEmpty(evt.payload.thoughtId))
                    {
                        board.EnterFocus(evt.payload.thoughtId);
                    }
                    break;

                case LogEventType.FocusExited:
                    board.ExitFocus();
                    break;

                case LogEventType.ClusterChanged:
                    if (!string.IsNullOrEmpty(evt.payload.clusterId))
                    {
                        board.SetCluster(evt.payload.clusterId);
                    }
                    break;

                case LogEventType.PinToggled:
                    if (!string.IsNullOrEmpty(evt.payload.thoughtId))
                    {
                        board.SetPinned(evt.payload.thoughtId, evt.payload.isPinned);
                    }
                    break;

                case LogEventType.ExplainBackShown:
                    if (!string.IsNullOrEmpty(evt.payload.thoughtId))
                    {
                        board.ShowExplainBackFor(evt.payload.thoughtId);
                    }
                    break;

                case LogEventType.SpotlightShown:
                    if (!string.IsNullOrEmpty(evt.payload.thoughtId))
                    {
                        board.ShowSpotlight(evt.payload.thoughtId);
                    }
                    break;

                case LogEventType.SpotlightDismissed:
                    board.DismissSpotlight();
                    break;

                // DemoStepAdvanced is informational only (no board action)
            }
        }
    }
}

