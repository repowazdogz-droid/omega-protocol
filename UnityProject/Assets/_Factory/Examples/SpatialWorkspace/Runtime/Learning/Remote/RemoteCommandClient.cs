using System;
using System.Collections;
using UnityEngine;
#if UNITY_2022_2_OR_NEWER
using UnityEngine.Networking;
#endif

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// RemoteCommandClient: Polls for remote commands from web.
    /// Applies via board public APIs. Deterministic + rate limited.
    /// </summary>
    public class RemoteCommandClient : MonoBehaviour
    {
        [Header("Settings")]
        [SerializeField] private string commandUrl = "http://localhost:3000/api/learning/remoteCommand";
        [SerializeField] private float pollInterval = 1f; // 1s polling
        [SerializeField] private bool enabled = true;

        [Header("References")]
        [SerializeField] private SpatialLearningBoard board;

        private string lastCommandId = null;
        private long lastCommandTimestamp = 0;
        private Coroutine pollCoroutine;
        private string dismissedThoughtId = null;
        private float dismissCooldownUntil = 0f;
        private const float DISMISS_COOLDOWN_SECONDS = 10f;

        private void Start()
        {
            if (board == null)
            {
                board = GetComponent<SpatialLearningBoard>();
            }

            if (enabled)
            {
                pollCoroutine = StartCoroutine(PollCoroutine());
            }
        }

        private void OnDestroy()
        {
            if (pollCoroutine != null)
            {
                StopCoroutine(pollCoroutine);
            }
        }

        /// <summary>
        /// Main poll coroutine.
        /// </summary>
        private IEnumerator PollCoroutine()
        {
            while (true)
            {
                yield return new WaitForSeconds(pollInterval);

                if (board != null && enabled)
                {
                    string sessionId = GetSessionId();
                    if (!string.IsNullOrEmpty(sessionId))
                    {
                        PollCommand(sessionId);
                    }
                }
            }
        }

        /// <summary>
        /// Polls for remote command.
        /// </summary>
        private void PollCommand(string sessionId)
        {
            #if UNITY_2022_2_OR_NEWER
            StartCoroutine(PollCommandCoroutine(sessionId));
            #endif
        }

        /// <summary>
        /// HTTP poll coroutine.
        /// </summary>
        private IEnumerator PollCommandCoroutine(string sessionId)
        {
            #if UNITY_2022_2_OR_NEWER
            string url = $"{commandUrl}?sessionId={sessionId}";
            using (UnityWebRequest request = UnityWebRequest.Get(url))
            {
                yield return request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    try
                    {
                        string json = request.downloadHandler.text;
                        var command = JsonUtility.FromJson<RemoteCommandDto>(json);

                        if (command != null && command.timestampMs > lastCommandTimestamp)
                        {
                            ApplyCommand(command);
                            lastCommandTimestamp = command.timestampMs;
                        }
                    }
                    catch (Exception e)
                    {
                        Debug.LogWarning($"Failed to parse remote command: {e.Message}");
                    }
                }
            }
            #endif
        }

        /// <summary>
        /// Applies remote command.
        /// </summary>
        private void ApplyCommand(RemoteCommandDto command)
        {
            if (board == null) return;

            // Check cooldown for dismissed spotlight
            if (Time.time < dismissCooldownUntil && 
                command.commandType == "spotlight_show" &&
                command.thoughtId == dismissedThoughtId)
            {
                // Ignore repeated show commands for dismissed thought during cooldown
                return;
            }

            switch (command.commandType)
            {
                case "spotlight_show":
                    if (!string.IsNullOrEmpty(command.thoughtId))
                    {
                        board.ShowSpotlight(command.thoughtId);
                        dismissedThoughtId = null; // Reset dismissal tracking
                    }
                    break;

                case "spotlight_dismiss":
                    board.DismissSpotlight();
                    dismissedThoughtId = null;
                    dismissCooldownUntil = 0f;
                    break;
            }
        }

        /// <summary>
        /// Called when learner dismisses spotlight locally.
        /// </summary>
        public void OnLocalDismiss(string thoughtId)
        {
            dismissedThoughtId = thoughtId;
            dismissCooldownUntil = Time.time + DISMISS_COOLDOWN_SECONDS;
        }

        /// <summary>
        /// Gets session ID from board or recorder.
        /// </summary>
        private string GetSessionId()
        {
            if (board != null)
            {
                var recorder = board.GetComponent<BoardSessionRecorder>();
                if (recorder != null)
                {
                    return recorder.GetSessionId();
                }
            }
            return PlayerPrefs.GetString("pairing:sessionId", "");
        }

        /// <summary>
        /// Enables/disables command polling.
        /// </summary>
        public void SetEnabled(bool value)
        {
            enabled = value;
            if (!enabled && pollCoroutine != null)
            {
                StopCoroutine(pollCoroutine);
                pollCoroutine = null;
            }
            else if (enabled && pollCoroutine == null)
            {
                pollCoroutine = StartCoroutine(PollCoroutine());
            }
        }
    }

    /// <summary>
    /// RemoteCommandDto: Remote command from web.
    /// </summary>
    [Serializable]
    public class RemoteCommandDto
    {
        public string sessionId;
        public string learnerId;
        public string commandType;
        public string thoughtId;
        public long timestampMs;
        public string version;
    }
}




