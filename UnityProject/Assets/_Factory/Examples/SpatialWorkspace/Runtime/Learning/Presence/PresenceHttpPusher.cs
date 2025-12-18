using System;
using System.Collections;
using UnityEngine;
#if UNITY_2022_2_OR_NEWER
using UnityEngine.Networking;
#endif

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// PresenceHttpPusher: Sends presence state to web via HTTP.
    /// IDs-only, rate-limited, backoff on failure.
    /// </summary>
    public class PresenceHttpPusher : MonoBehaviour
    {
        [Header("Settings")]
        [SerializeField] private string pushUrl = "http://localhost:3000/api/learning/presence/state";
        [SerializeField] private float pushInterval = 0.25f; // 4 Hz max
        [SerializeField] private float heartbeatInterval = 1f; // 1s heartbeat
        [SerializeField] private bool enabled = true;

        [Header("References")]
        [SerializeField] private SpatialLearningBoard board;

        private PresenceStateDto lastPushedState;
        private Coroutine pushCoroutine;
        private float lastPushTime = 0f;
        private int consecutiveFailures = 0;
        private float backoffDelay = 0f;

        private void Start()
        {
            if (board == null)
            {
                board = GetComponent<SpatialLearningBoard>();
            }

            if (enabled)
            {
                pushCoroutine = StartCoroutine(PushCoroutine());
            }
        }

        private void OnDestroy()
        {
            if (pushCoroutine != null)
            {
                StopCoroutine(pushCoroutine);
            }
        }

        /// <summary>
        /// Main push coroutine (rate-limited).
        /// </summary>
        private IEnumerator PushCoroutine()
        {
            while (true)
            {
                float delay = pushInterval;

                // Apply backoff if failures
                if (consecutiveFailures > 0)
                {
                    delay = Mathf.Max(delay, backoffDelay);
                    backoffDelay = Mathf.Min(backoffDelay * 2f, 5f); // Max 5s backoff
                }
                else
                {
                    backoffDelay = 0f;
                }

                yield return new WaitForSeconds(delay);

                if (board != null && enabled)
                {
                    var currentState = board.GetCurrentPresenceState();
                    if (currentState != null && HasStateChanged(currentState))
                    {
                        PushState(currentState);
                    }
                    else if (Time.time - lastPushTime > heartbeatInterval)
                    {
                        // Heartbeat even if no change
                        PushState(currentState);
                    }
                }
            }
        }

        /// <summary>
        /// Checks if state has changed.
        /// </summary>
        private bool HasStateChanged(PresenceStateDto state)
        {
            if (lastPushedState == null) return true;

            return state.focusedThoughtId != lastPushedState.focusedThoughtId ||
                   state.clusterId != lastPushedState.clusterId ||
                   state.spotlightThoughtId != lastPushedState.spotlightThoughtId ||
                   !ArraysEqual(state.pinnedIds, lastPushedState.pinnedIds);
        }

        /// <summary>
        /// Compares two string arrays.
        /// </summary>
        private bool ArraysEqual(string[] a, string[] b)
        {
            if (a == null && b == null) return true;
            if (a == null || b == null) return false;
            if (a.Length != b.Length) return false;

            for (int i = 0; i < a.Length; i++)
            {
                if (a[i] != b[i]) return false;
            }
            return true;
        }

        /// <summary>
        /// Pushes state to web.
        /// </summary>
        private void PushState(PresenceStateDto state)
        {
            if (state == null) return;

            #if UNITY_2022_2_OR_NEWER
            StartCoroutine(PushStateCoroutine(state));
            #endif
        }

        /// <summary>
        /// HTTP push coroutine.
        /// </summary>
        private IEnumerator PushStateCoroutine(PresenceStateDto state)
        {
            #if UNITY_2022_2_OR_NEWER
            string json = JsonUtility.ToJson(state);
            using (UnityWebRequest request = UnityWebRequest.Post(pushUrl, json, "application/json"))
            {
                yield return request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    lastPushedState = state;
                    lastPushTime = Time.time;
                    consecutiveFailures = 0;
                    backoffDelay = 0f;
                }
                else
                {
                    consecutiveFailures++;
                    // No spam logs - only log every 10th failure
                    if (consecutiveFailures % 10 == 0)
                    {
                        Debug.LogWarning($"Presence push failed ({consecutiveFailures} consecutive): {request.error}");
                    }
                }
            }
            #endif
        }

        /// <summary>
        /// Enables/disables pusher.
        /// </summary>
        public void SetEnabled(bool value)
        {
            enabled = value;
            if (!enabled && pushCoroutine != null)
            {
                StopCoroutine(pushCoroutine);
                pushCoroutine = null;
            }
            else if (enabled && pushCoroutine == null)
            {
                pushCoroutine = StartCoroutine(PushCoroutine());
            }
        }
    }
}



