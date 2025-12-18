using System;
using System.IO;
using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
#if UNITY_2022_2_OR_NEWER
using UnityEngine.Networking;
#else
using System.Net;
#endif

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// ThoughtObjectFeed: Import pipeline for ThoughtObjects.
    /// Supports EditorDemo (hardcoded), File (persistentDataPath), and Http (live sync).
    /// </summary>
    public class ThoughtObjectFeed : MonoBehaviour
    {
        public enum FeedMode
        {
            EditorDemo,
            File,
            Http
        }

        [Header("Feed Settings")]
        [SerializeField] private FeedMode feedMode = FeedMode.EditorDemo;
        [SerializeField] private string fileName = "thoughtObjects.json";
        [SerializeField] private float pollInterval = 1f; // seconds (max 1s)

        [Header("HTTP Settings")]
        [SerializeField] private string httpUrl = "http://localhost:3000/api/learning/thoughtObjects";
        [SerializeField] private string learnerId = "learner-1";

        [Header("References")]
        [SerializeField] private SpatialLearningBoard board;

        /// <summary>
        /// Public property to set board reference (for SpatialWorkspaceEntry).
        /// </summary>
        public SpatialLearningBoard Board
        {
            get => board;
            set => board = value;
        }

        private string filePath;
        private DateTime lastFileWriteTime;
        private Coroutine pollCoroutine;
        private string lastHttpHash = string.Empty;
        private string cacheFilePath;
        private ThoughtObjectDto[] cachedObjects;

        // Status tracking
        private long lastSuccessAtMs = 0;
        private string lastError = null;
        private bool isOfflineFallbackActive = false;

        private void Start()
        {
            filePath = Path.Combine(Application.persistentDataPath, fileName);
            cacheFilePath = Path.Combine(Application.persistentDataPath, "thoughtObjects_cache.json");

            // Load cache if available
            LoadCache();

            switch (feedMode)
            {
                case FeedMode.EditorDemo:
                    LoadEditorDemo();
                    break;
                case FeedMode.File:
                    LoadFromFile();
                    // Start polling in Editor
                    #if UNITY_EDITOR
                    if (pollCoroutine == null)
                    {
                        pollCoroutine = StartCoroutine(PollFileChanges());
                    }
                    #endif
                    break;
                case FeedMode.Http:
                    LoadFromHttp();
                    // Start HTTP polling (Editor + device)
                    if (pollCoroutine == null)
                    {
                        pollCoroutine = StartCoroutine(PollHttpChanges());
                    }
                    break;
            }
        }

        /// <summary>
        /// Loads hardcoded demo data for testing.
        /// </summary>
        private void LoadEditorDemo()
        {
            var demoObjects = CreateDemoThoughtObjects();
            UpdateBoard(demoObjects);
        }

        /// <summary>
        /// Creates demo ThoughtObjects for testing.
        /// </summary>
        private ThoughtObjectDto[] CreateDemoThoughtObjects()
        {
            return new ThoughtObjectDto[]
            {
                new ThoughtObjectDto
                {
                    id = "demo-1",
                    type = "Question",
                    contentText = "What is the first step in solving this problem?",
                    source = "tutor",
                    confidence = "medium",
                    timestampIso = DateTime.UtcNow.AddMinutes(-10).ToString("O"),
                    ephemeral = false
                },
                new ThoughtObjectDto
                {
                    id = "demo-2",
                    type = "TutorHint",
                    contentText = "Try breaking it down into smaller parts",
                    source = "tutor",
                    confidence = "high",
                    timestampIso = DateTime.UtcNow.AddMinutes(-8).ToString("O"),
                    ephemeral = false
                },
                new ThoughtObjectDto
                {
                    id = "demo-3",
                    type = "LearnerAttempt",
                    contentText = "I think we need to add the numbers first",
                    source = "learner",
                    confidence = "medium",
                    timestampIso = DateTime.UtcNow.AddMinutes(-5).ToString("O"),
                    ephemeral = false
                },
                new ThoughtObjectDto
                {
                    id = "demo-4",
                    type = "Example",
                    contentText = "For instance, 2 + 3 = 5",
                    source = "tutor",
                    confidence = "high",
                    timestampIso = DateTime.UtcNow.AddMinutes(-3).ToString("O"),
                    ephemeral = false
                },
                new ThoughtObjectDto
                {
                    id = "demo-5",
                    type = "Uncertainty",
                    contentText = "I'm not sure about this step",
                    source = "learner",
                    confidence = "low",
                    timestampIso = DateTime.UtcNow.AddMinutes(-1).ToString("O"),
                    ephemeral = false
                },
                new ThoughtObjectDto
                {
                    id = "demo-6",
                    type = "Evidence",
                    contentText = "The formula shows that x = 5",
                    source = "learner",
                    confidence = "medium",
                    timestampIso = DateTime.UtcNow.ToString("O"),
                    ephemeral = false
                },
                new ThoughtObjectDto
                {
                    id = "demo-7",
                    type = "Reflection",
                    contentText = "I learned that breaking problems into steps helps",
                    source = "learner",
                    confidence = "high",
                    timestampIso = DateTime.UtcNow.ToString("O"),
                    ephemeral = false
                },
                new ThoughtObjectDto
                {
                    id = "demo-8",
                    type = "Question",
                    contentText = "Can you explain why that works?",
                    source = "learner",
                    confidence = "medium",
                    timestampIso = DateTime.UtcNow.ToString("O"),
                    ephemeral = false
                },
                new ThoughtObjectDto
                {
                    id = "demo-9",
                    type = "TutorHint",
                    contentText = "Think about what happens when you combine like terms",
                    source = "tutor",
                    confidence = "high",
                    timestampIso = DateTime.UtcNow.ToString("O"),
                    ephemeral = false
                },
                new ThoughtObjectDto
                {
                    id = "demo-10",
                    type = "Example",
                    contentText = "Like 3x + 2x = 5x",
                    source = "tutor",
                    confidence = "high",
                    timestampIso = DateTime.UtcNow.ToString("O"),
                    ephemeral = false
                }
            };
        }

        /// <summary>
        /// Loads ThoughtObjects from a JSON file.
        /// </summary>
        private void LoadFromFile()
        {
            if (!File.Exists(filePath))
            {
                Debug.LogWarning($"ThoughtObjects file not found: {filePath}");
                return;
            }

            try
            {
                string json = File.ReadAllText(filePath);
                // Try parsing as array first, then as wrapper object
                ThoughtObjectDto[] objects;
                if (json.TrimStart().StartsWith("["))
                {
                    // Direct array
                    objects = JsonUtility.FromJson<ThoughtObjectDto[]>(json);
                }
                else
                {
                    // Wrapper object with "objects" array
                    // Unity JsonUtility doesn't support nested arrays well, so we parse manually
                    // Look for "objects" key and extract array
                    int objectsStart = json.IndexOf("\"objects\"");
                    if (objectsStart >= 0)
                    {
                        int arrayStart = json.IndexOf('[', objectsStart);
                        int arrayEnd = json.LastIndexOf(']');
                        if (arrayStart >= 0 && arrayEnd > arrayStart)
                        {
                            string arrayJson = json.Substring(arrayStart, arrayEnd - arrayStart + 1);
                            objects = JsonUtility.FromJson<ThoughtObjectDto[]>(arrayJson);
                        }
                    }
                    if (objects == null)
                    {
                        // Fallback: try parsing as direct array
                        objects = JsonUtility.FromJson<ThoughtObjectDto[]>(json);
                    }
                }
                
                if (objects != null && objects.Length > 0)
                {
                    UpdateBoard(objects);
                    lastFileWriteTime = File.GetLastWriteTime(filePath);
                    lastSuccessAtMs = (long)(DateTime.UtcNow - new DateTime(1970, 1, 1)).TotalMilliseconds;
                    lastError = null;
                    isOfflineFallbackActive = false;
                }
                else
                {
                    Debug.LogError("Failed to parse ThoughtObjects JSON or array is empty");
                }
            }
            catch (Exception e)
            {
                Debug.LogError($"Error loading ThoughtObjects from file: {e.Message}");
            }
        }

        /// <summary>
        /// Polls file for changes (Editor only, max 1s interval).
        /// </summary>
        private IEnumerator PollFileChanges()
        {
            while (true)
            {
                yield return new WaitForSeconds(Mathf.Max(1f, pollInterval));

                if (File.Exists(filePath))
                {
                    var currentWriteTime = File.GetLastWriteTime(filePath);
                    if (currentWriteTime != lastFileWriteTime)
                    {
                        LoadFromFile();
                    }
                }
            }
        }

        /// <summary>
        /// Loads ThoughtObjects from HTTP endpoint.
        /// </summary>
        private void LoadFromHttp()
        {
            string url = $"{httpUrl}?learnerId={learnerId}";
            
            #if UNITY_2022_2_OR_NEWER
            StartCoroutine(LoadFromHttpCoroutine(url));
            #else
            // Fallback for older Unity versions
            Debug.LogWarning("HTTP loading requires Unity 2022.2 or newer. Use File mode instead.");
            #endif
        }

        /// <summary>
        /// Coroutine to load ThoughtObjects from HTTP.
        /// </summary>
        private IEnumerator LoadFromHttpCoroutine(string url)
        {
            #if UNITY_2022_2_OR_NEWER
            using (var request = UnityWebRequest.Get(url))
            {
                yield return request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    string json = request.downloadHandler.text;
                    string hash = ComputeHash(json);

                    // Only update if hash changed (deterministic check)
                    if (hash != lastHttpHash)
                    {
                        lastHttpHash = hash;
                        ParseAndUpdateBoard(json);
                        // Save to cache
                        SaveCache(json);
                        lastSuccessAtMs = (long)(DateTime.UtcNow - new DateTime(1970, 1, 1)).TotalMilliseconds;
                        lastError = null;
                        isOfflineFallbackActive = false;
                    }
                }
                else
                {
                    lastError = request.error;
                    Debug.LogWarning($"Failed to load ThoughtObjects from HTTP: {request.error}");
                    // Try to load from cache
                    LoadCacheAndShowOfflineToast();
                    isOfflineFallbackActive = true;
                }
            }
            #else
            // Fallback for older Unity versions
            WWW www = new WWW(url);
            yield return www;

            if (string.IsNullOrEmpty(www.error))
            {
                string hash = ComputeHash(www.text);
                if (hash != lastHttpHash)
                {
                    lastHttpHash = hash;
                    ParseAndUpdateBoard(www.text);
                    // Save to cache
                    SaveCache(www.text);
                }
            }
            else
            {
                Debug.LogWarning($"Failed to load ThoughtObjects from HTTP: {www.error}");
                // Try to load from cache
                LoadCacheAndShowOfflineToast();
            }
            #endif
        }

        /// <summary>
        /// Saves JSON to cache file.
        /// </summary>
        private void SaveCache(string json)
        {
            try
            {
                File.WriteAllText(cacheFilePath, json);
            }
            catch (Exception e)
            {
                Debug.LogWarning($"Failed to save cache: {e.Message}");
            }
        }

        /// <summary>
        /// Loads cache from file.
        /// </summary>
        private void LoadCache()
        {
            if (!File.Exists(cacheFilePath)) return;

            try
            {
                string json = File.ReadAllText(cacheFilePath);
                ParseAndUpdateBoard(json);
                cachedObjects = ParseObjects(json);
            }
            catch (Exception e)
            {
                Debug.LogWarning($"Failed to load cache: {e.Message}");
            }
        }

        /// <summary>
        /// Loads cache and shows offline toast.
        /// </summary>
        private void LoadCacheAndShowOfflineToast()
        {
            if (File.Exists(cacheFilePath))
            {
                LoadCache();
                isOfflineFallbackActive = true;
                // Show offline toast (if toast component exists)
                var toast = FindObjectOfType<ThoughtBoardToast>();
                if (toast != null)
                {
                    toast.ShowToast(BoardCopy.OFFLINE_SHOWING_LAST);
                }
            }
            else
            {
                isOfflineFallbackActive = false;
            }
        }

        /// <summary>
        /// Parses JSON into ThoughtObjectDto array.
        /// </summary>
        private ThoughtObjectDto[] ParseObjects(string json)
        {
            try
            {
                ThoughtObjectDto[] objects;
                if (json.TrimStart().StartsWith("["))
                {
                    objects = JsonUtility.FromJson<ThoughtObjectDto[]>(json);
                }
                else
                {
                    var listDto = JsonUtility.FromJson<ThoughtObjectListDto>(json);
                    objects = listDto?.objects;
                }
                return objects;
            }
            catch
            {
                return null;
            }
        }

        /// <summary>
        /// Polls HTTP endpoint for changes (max 1s interval).
        /// </summary>
        private IEnumerator PollHttpChanges()
        {
            while (true)
            {
                yield return new WaitForSeconds(Mathf.Max(1f, pollInterval));
                LoadFromHttp();
            }
        }

        /// <summary>
        /// Computes a simple hash of the JSON string for change detection.
        /// </summary>
        private string ComputeHash(string text)
        {
            using (var sha256 = SHA256.Create())
            {
                byte[] hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(text));
                return Convert.ToBase64String(hashBytes);
            }
        }

        /// <summary>
        /// Parses JSON and updates the board.
        /// </summary>
        private void ParseAndUpdateBoard(string json)
        {
            try
            {
                ThoughtObjectDto[] objects;
                if (json.TrimStart().StartsWith("["))
                {
                    objects = JsonUtility.FromJson<ThoughtObjectDto[]>(json);
                }
                else
                {
                    var listDto = JsonUtility.FromJson<ThoughtObjectListDto>(json);
                    objects = listDto?.objects;
                }

                if (objects != null && objects.Length > 0)
                {
                    UpdateBoard(objects);
                }
            }
            catch (Exception e)
            {
                Debug.LogError($"Error parsing ThoughtObjects JSON: {e.Message}");
            }
        }

        /// <summary>
        /// Updates the board with new ThoughtObjects.
        /// </summary>
        private void UpdateBoard(ThoughtObjectDto[] objects)
        {
            if (board != null)
            {
                board.UpdateBoard(objects);
            }
            else
            {
                // Try to find board if not assigned
                board = FindObjectOfType<SpatialLearningBoard>();
                if (board != null)
                {
                    board.UpdateBoard(objects);
                }
                else
                {
                    Debug.LogWarning("SpatialLearningBoard not assigned to ThoughtObjectFeed and not found in scene");
                }
            }
        }

        /// <summary>
        /// Manually reload from file (for testing).
        /// </summary>
        [ContextMenu("Reload from File")]
        public void ReloadFromFile()
        {
            if (feedMode == FeedMode.File)
            {
                LoadFromFile();
            }
        }

        /// <summary>
        /// Manually load demo data (for testing).
        /// </summary>
        [ContextMenu("Load Demo Data")]
        public void LoadDemo()
        {
            LoadEditorDemo();
        }

        // ========== Status API ==========

        /// <summary>
        /// Gets last successful load timestamp (milliseconds since epoch).
        /// </summary>
        public long GetLastSuccessAtMs()
        {
            return lastSuccessAtMs;
        }

        /// <summary>
        /// Gets last error message (if any).
        /// </summary>
        public string GetLastError()
        {
            return lastError;
        }

        /// <summary>
        /// Checks if offline fallback is active.
        /// </summary>
        public bool IsOfflineFallbackActive()
        {
            return isOfflineFallbackActive;
        }

        /// <summary>
        /// Sets HTTP URL and learner ID (for demo bootstrap).
        /// </summary>
        public void SetHttpConfig(string url, string learnerIdValue)
        {
            httpUrl = url;
            learnerId = learnerIdValue;
            
            // If already in Http mode, reload
            if (feedMode == FeedMode.Http)
            {
                LoadFromHttp();
            }
        }

        /// <summary>
        /// Sets feed mode (for demo bootstrap).
        /// </summary>
        public void SetFeedMode(FeedMode mode)
        {
            feedMode = mode;
            
            // Reload based on new mode
            switch (feedMode)
            {
                case FeedMode.EditorDemo:
                    LoadEditorDemo();
                    break;
                case FeedMode.File:
                    LoadFromFile();
                    break;
                case FeedMode.Http:
                    LoadFromHttp();
                    if (pollCoroutine == null)
                    {
                        pollCoroutine = StartCoroutine(PollHttpChanges());
                    }
                    break;
            }
        }
    }
}

