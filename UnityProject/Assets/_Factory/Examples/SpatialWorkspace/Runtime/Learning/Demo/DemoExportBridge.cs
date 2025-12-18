using System;
using System.Collections;
using UnityEngine;
#if UNITY_2022_2_OR_NEWER
using UnityEngine.Networking;
#endif

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// DemoExportBridge: Pings web after export to auto-import bundle.
    /// Shows toast with recap URL.
    /// </summary>
    public class DemoExportBridge : MonoBehaviour
    {
        [Header("Settings")]
        [SerializeField] private string importLatestUrl = "http://localhost:3000/api/learning/demo/importLatest";
        [SerializeField] private bool autoImportOnExport = true;

        [Header("References")]
        [SerializeField] private SpatialLearningBoard board;
        [SerializeField] private ThoughtBoardToast toast;

        private void Awake()
        {
            if (board == null)
            {
                board = GetComponent<SpatialLearningBoard>();
            }

            if (toast == null)
            {
                toast = FindObjectOfType<ThoughtBoardToast>();
            }

            // Subscribe to export completed event
            SpatialLearningBoard.OnExportCompleted += OnExportCompleted;
        }

        private void OnDestroy()
        {
            SpatialLearningBoard.OnExportCompleted -= OnExportCompleted;
        }

        /// <summary>
        /// Called when export completes (hooked from board).
        /// </summary>
        public void OnExportCompleted(string exportPath, string sessionId)
        {
            if (!autoImportOnExport) return;

            StartCoroutine(ImportAndShowRecap(exportPath, sessionId));
        }

        /// <summary>
        /// Imports bundle to web and shows recap URL.
        /// </summary>
        private IEnumerator ImportAndShowRecap(string exportPath, string sessionId)
        {
            Debug.Log($"Export completed: {exportPath}. Importing to web...");

            #if UNITY_2022_2_OR_NEWER
            // Get bootstrap to find sessionId
            var launcher = GetComponent<DemoLauncher>();
            string actualSessionId = sessionId;
            if (launcher != null && launcher.GetBootstrap() != null)
            {
                actualSessionId = launcher.GetBootstrap().sessionId;
            }

            // Call import endpoint
            var form = new WWWForm();
            form.AddField("exportPath", exportPath);
            form.AddField("sessionId", actualSessionId);

            using (UnityWebRequest request = UnityWebRequest.Post(importLatestUrl, form))
            {
                yield return request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    try
                    {
                        string json = request.downloadHandler.text;
                        var result = JsonUtility.FromJson<ImportResult>(json);

                        if (result.success)
                        {
                            string message = $"Recap ready on web: {result.recapUrl}";
                            Debug.Log(message);

                            if (toast != null)
                            {
                                toast.ShowCustom(message);
                            }

                            // Also log to console for easy copy
                            Debug.Log($"Recap URL: {result.recapUrl}");
                        }
                    }
                    catch (Exception e)
                    {
                        Debug.LogWarning($"Failed to parse import result: {e.Message}");
                        ShowFallbackMessage(sessionId);
                    }
                }
                else
                {
                    Debug.LogWarning($"Failed to import to web: {request.error}");
                    ShowFallbackMessage(sessionId);
                }
            }
            #else
            // Fallback for older Unity versions
            ShowFallbackMessage(sessionId);
            #endif
        }

        /// <summary>
        /// Shows fallback message if import fails.
        /// </summary>
        private void ShowFallbackMessage(string sessionId)
        {
            string message = $"Export complete. Import bundle manually or visit /learning/recap/{sessionId}";
            Debug.Log(message);

            if (toast != null)
            {
                toast.ShowCustom(message);
            }
        }

        /// <summary>
        /// Import result DTO.
        /// </summary>
        [Serializable]
        private class ImportResult
        {
            public bool success;
            public string sessionId;
            public string recapUrl;
            public string message;
        }
    }
}

