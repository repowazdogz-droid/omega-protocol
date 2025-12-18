using System;
using System.Collections;
using UnityEngine;
#if UNITY_2022_2_OR_NEWER
using UnityEngine.Networking;
#endif

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// PairingClient: Handles pairing with web via pair code.
    /// Fetches bootstrap and applies it to board.
    /// </summary>
    public class PairingClient : MonoBehaviour
    {
        [Header("Settings")]
        [SerializeField] private string pairingBaseUrl = "http://localhost:3000/api/learning/pair";

        [Header("References")]
        [SerializeField] private SpatialLearningBoard board;

        private string currentBaseUrl;

        private PairingBootstrapDto cachedBootstrap;
        private bool isPaired = false;
        private string lastPairCode;
        private string lastError = null;

        private void Awake()
        {
            if (board == null)
            {
                board = GetComponent<SpatialLearningBoard>();
            }

            currentBaseUrl = pairingBaseUrl;
        }

        /// <summary>
        /// Pairs with web using a pair code.
        /// </summary>
        public void PairWithCode(string pairCode)
        {
            if (string.IsNullOrEmpty(pairCode) || pairCode.Length != 6)
            {
                Debug.LogError("Invalid pair code. Must be 6 characters.");
                return;
            }

            lastPairCode = pairCode;
            StartCoroutine(FetchAndApplyBootstrap(pairCode));
        }

        /// <summary>
        /// Sets the base URL for pairing (called from QR scan).
        /// </summary>
        public void SetBaseUrl(string apiBase)
        {
            currentBaseUrl = apiBase;
            PlayerPrefs.SetString("pairing:lastHost", ExtractHostFromUrl(apiBase));
        }

        /// <summary>
        /// Pairs with URL or code (parses and extracts code).
        /// </summary>
        public void PairWithUrl(string urlOrCode)
        {
            var parseResult = QrPairingPayload.Parse(urlOrCode);
            if (!parseResult.Success)
            {
                Debug.LogError($"Failed to parse URL/code: {parseResult.Error}");
                return;
            }

            // Update base URL if provided
            if (!string.IsNullOrEmpty(parseResult.BaseUrl))
            {
                SetBaseUrl($"{parseResult.BaseUrl}/api/learning/pair");
            }

            // Pair with code
            PairWithCode(parseResult.PairCode);
        }

        /// <summary>
        /// Extracts host from URL.
        /// </summary>
        private string ExtractHostFromUrl(string url)
        {
            try
            {
                var uri = new System.Uri(url);
                return $"{uri.Scheme}://{uri.Host}:{uri.Port}";
            }
            catch
            {
                return "http://localhost:3000";
            }
        }

        /// <summary>
        /// Fetches bootstrap from web and applies it.
        /// </summary>
        private IEnumerator FetchAndApplyBootstrap(string pairCode)
        {
            string url = $"{currentBaseUrl}/{pairCode}";

            Debug.Log($"Fetching bootstrap from: {url}");

            #if UNITY_2022_2_OR_NEWER
            using (UnityWebRequest request = UnityWebRequest.Get(url))
            {
                yield return request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    try
                    {
                        string json = request.downloadHandler.text;
                        var response = JsonUtility.FromJson<PairingResponseDto>(json);

                        if (response.bootstrap != null)
                        {
                            // Cache bootstrap
                            cachedBootstrap = response.bootstrap;
                            isPaired = true;

                            // Apply to board
                            ApplyBootstrapToBoard(response.bootstrap);

                            Debug.Log($"Paired successfully: sessionId={response.bootstrap.sessionId}");
                        }
                        else
                        {
                            Debug.LogError("Bootstrap data is null in response");
                        }
                    }
                    catch (Exception e)
                    {
                        Debug.LogError($"Failed to parse bootstrap: {e.Message}");
                    }
                }
                else
                {
                    if (request.responseCode == 404)
                    {
                        lastError = BoardCopy.PAIR_CODE_NOT_FOUND;
                        Debug.LogError("Pair code not found");
                    }
                    else if (request.responseCode == 410)
                    {
                        lastError = BoardCopy.PAIR_CODE_EXPIRED;
                        Debug.LogError("Pair code expired");
                    }
                    else
                    {
                        lastError = BoardCopy.PAIR_CANT_REACH_HOST;
                        Debug.LogError($"Failed to fetch bootstrap: {request.error}");
                    }

                    // Try to use cached bootstrap if available
                    if (cachedBootstrap != null)
                    {
                        Debug.Log("Using cached bootstrap");
                        ApplyBootstrapToBoard(cachedBootstrap);
                    }
                }
            }
            #else
            // Fallback for older Unity versions
            Debug.LogWarning("Pairing requires Unity 2022.2 or newer");
            #endif
        }

        /// <summary>
        /// Applies bootstrap to board.
        /// </summary>
        private void ApplyBootstrapToBoard(PairingBootstrapDto bootstrap)
        {
            if (board == null)
            {
                Debug.LogError("Cannot apply bootstrap: board is null");
                return;
            }

            // Apply bootstrap using board's method
            board.ApplyBootstrap(
                bootstrap.sessionId,
                bootstrap.learnerId,
                bootstrap.thoughtObjectsUrl,
                bootstrap.reduceMotion,
                bootstrap.mode
            );
        }

        /// <summary>
        /// Gets cached bootstrap (for export/recap handoff).
        /// </summary>
        public PairingBootstrapDto GetCachedBootstrap()
        {
            return cachedBootstrap;
        }

        /// <summary>
        /// Checks if currently paired.
        /// </summary>
        public bool IsPaired()
        {
            return isPaired && cachedBootstrap != null;
        }

        /// <summary>
        /// Gets the last pair code used.
        /// </summary>
        public string GetLastPairCode()
        {
            return lastPairCode;
        }
    }

    /// <summary>
    /// PairingResponseDto: Response from pairing endpoint.
    /// </summary>
    [Serializable]
    public class PairingResponseDto
    {
        public string pairCode;
        public string expiresAtIso;
        public PairingBootstrapDto bootstrap;
    }

    /// <summary>
    /// PairingBootstrapDto: Bootstrap data from pairing.
    /// </summary>
    [Serializable]
    public class PairingBootstrapDto
    {
        public string sessionId;
        public string learnerId;
        public string thoughtObjectsUrl;
        public string recapBaseUrl;
        public string mode;
        public bool reduceMotion;
        public string ageBand;
        public string missionId;
        public string topicId;
    }
}

