using System;
using System.Collections;
using UnityEngine;
#if UNITY_2022_2_OR_NEWER
using UnityEngine.Networking;
#endif

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// DemoLauncher: Single script to bootstrap and launch a demo session.
    /// Fetches bootstrap from web, configures board, starts demo guide.
    /// </summary>
    public class DemoLauncher : MonoBehaviour
    {
        [Header("Settings")]
        [SerializeField] private string bootstrapUrl = "http://localhost:3000/api/learning/demo/bootstrap";
        [SerializeField] private bool autoStartOnAwake = false;

        [Header("References")]
        [SerializeField] private SpatialLearningBoard board;

        private BootstrapDto currentBootstrap;
        private bool isReady = false;

        private void Awake()
        {
            if (board == null)
            {
                board = GetComponent<SpatialLearningBoard>();
            }

            if (autoStartOnAwake)
            {
                StartCoroutine(LoadBootstrapAndStart());
            }
        }

        /// <summary>
        /// Loads bootstrap and starts demo (public API).
        /// </summary>
        public void StartDemo()
        {
            if (isReady && currentBootstrap != null)
            {
                // Already loaded, just start
                ApplyBootstrapAndStart();
            }
            else
            {
                StartCoroutine(LoadBootstrapAndStart());
            }
        }

        /// <summary>
        /// Loads bootstrap from web and starts demo.
        /// </summary>
        private IEnumerator LoadBootstrapAndStart()
        {
            Debug.Log($"Loading bootstrap from: {bootstrapUrl}");

            #if UNITY_2022_2_OR_NEWER
            using (UnityWebRequest request = UnityWebRequest.Get(bootstrapUrl))
            {
                yield return request.SendWebRequest();

                if (request.result != UnityWebRequest.Result.Success)
                {
                    Debug.LogError($"Failed to load bootstrap: {request.error}");
                    // Fallback: try to load from cache or use defaults
                    LoadBootstrapFromCacheOrDefaults();
                }
                else
                {
                    try
                    {
                        string json = request.downloadHandler.text;
                        currentBootstrap = JsonUtility.FromJson<BootstrapDto>(json);
                        isReady = true;
                        Debug.Log($"Bootstrap loaded: sessionId={currentBootstrap.sessionId}");
                    }
                    catch (Exception e)
                    {
                        Debug.LogError($"Failed to parse bootstrap: {e.Message}");
                        LoadBootstrapFromCacheOrDefaults();
                    }
                }
            }
            #else
            // Fallback for older Unity versions
            LoadBootstrapFromCacheOrDefaults();
            #endif

            if (currentBootstrap != null)
            {
                ApplyBootstrapAndStart();
            }
        }

        /// <summary>
        /// Loads bootstrap from cache or uses defaults.
        /// </summary>
        private void LoadBootstrapFromCacheOrDefaults()
        {
            // Try to load from PlayerPrefs (if stored)
            string cachedJson = PlayerPrefs.GetString("demo:bootstrap", "");
            if (!string.IsNullOrEmpty(cachedJson))
            {
                try
                {
                    currentBootstrap = JsonUtility.FromJson<BootstrapDto>(cachedJson);
                    isReady = true;
                    Debug.Log("Loaded bootstrap from cache");
                    return;
                }
                catch
                {
                    // Ignore parse errors
                }
            }

            // Use defaults
            currentBootstrap = BootstrapDto.CreateDefault();
            isReady = true;
            Debug.Log("Using default bootstrap");
        }

        /// <summary>
        /// Applies bootstrap configuration and starts demo.
        /// </summary>
        private void ApplyBootstrapAndStart()
        {
            if (board == null || currentBootstrap == null)
            {
                Debug.LogError("Cannot start demo: board or bootstrap is null");
                return;
            }

            // Configure board with bootstrap
            board.StartDemoFromBootstrap(currentBootstrap);

            Debug.Log($"Demo started: sessionId={currentBootstrap.sessionId}");
        }

        /// <summary>
        /// Gets current bootstrap (for external access).
        /// </summary>
        public BootstrapDto GetBootstrap()
        {
            return currentBootstrap;
        }

        /// <summary>
        /// Checks if demo is ready to start.
        /// </summary>
        public bool IsReady()
        {
            return isReady;
        }
    }

    /// <summary>
    /// BootstrapDto: Configuration payload from web.
    /// </summary>
    [Serializable]
    public class BootstrapDto
    {
        public string sessionId;
        public string learnerId;
        public string ageBand;
        public string missionId;
        public string topicId;
        public string responseStyleHint;
        public string thoughtObjectsEndpointUrl;
        public string recapUrl;
        public bool calmMode;
        public bool reduceMotion;

        /// <summary>
        /// Creates default bootstrap (offline fallback).
        /// </summary>
        public static BootstrapDto CreateDefault()
        {
            return new BootstrapDto
            {
                sessionId = $"session_{DateTime.UtcNow:yyyyMMddHHmmss}",
                learnerId = $"learner_{DateTime.UtcNow:yyyyMMddHHmmss}",
                ageBand = "10-12",
                missionId = "understand",
                topicId = "math-basics",
                responseStyleHint = "calmMode,oneQuestion,veryShort,calmTone",
                thoughtObjectsEndpointUrl = "http://localhost:3000/api/learning/thoughtObjects",
                recapUrl = "http://localhost:3000/learning/recap",
                calmMode = true,
                reduceMotion = true
            };
        }
    }
}











