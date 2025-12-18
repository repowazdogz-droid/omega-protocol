using UnityEngine;
using TMPro;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// RecapHandoff: Shows recap URL and QR after export.
    /// </summary>
    public class RecapHandoff : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private SpatialLearningBoard board;
        [SerializeField] private PairingClient pairingClient;
        [SerializeField] private TextMeshPro recapUrlText;
        [SerializeField] private GameObject qrDisplay; // Optional QR display
        [SerializeField] private ThoughtBoardToast toast;

        [Header("Settings")]
        [SerializeField] private bool showQR = true; // V0.1: can disable QR if library not available

        private void Awake()
        {
            if (board == null)
            {
                board = GetComponent<SpatialLearningBoard>();
            }

            if (pairingClient == null)
            {
                pairingClient = GetComponent<PairingClient>();
            }

            if (toast == null)
            {
                toast = FindObjectOfType<ThoughtBoardToast>();
            }

            // Subscribe to export bundle completed event
            SpatialLearningBoard.OnExportBundleCompleted += OnExportBundleCompleted;
        }

        private void OnDestroy()
        {
            SpatialLearningBoard.OnExportBundleCompleted -= OnExportBundleCompleted;
        }

        /// <summary>
        /// Called when export bundle completes.
        /// </summary>
        private void OnExportBundleCompleted(string sessionId)
        {
            // Build recap URL
            string recapUrl = BuildRecapUrl(sessionId);

            if (string.IsNullOrEmpty(recapUrl))
            {
                Debug.LogWarning("Cannot build recap URL: no bootstrap or sessionId");
                return;
            }

            // Show recap URL
            ShowRecapUrl(recapUrl);

            // Show QR if enabled (v0.1: simple text, QR can be added later)
            if (showQR && qrDisplay != null)
            {
                // TODO: Generate QR code texture
                // For v0.1, we'll just show the URL
            }
        }

        /// <summary>
        /// Builds recap URL from bootstrap or sessionId.
        /// </summary>
        private string BuildRecapUrl(string sessionId)
        {
            // Try to get recap base URL from pairing client
            if (pairingClient != null && pairingClient.IsPaired())
            {
                var bootstrap = pairingClient.GetCachedBootstrap();
                if (bootstrap != null && !string.IsNullOrEmpty(bootstrap.recapBaseUrl))
                {
                    return $"{bootstrap.recapBaseUrl}/{sessionId}";
                }
            }

            // Fallback: use default host
            string defaultHost = PlayerPrefs.GetString("pairing:lastHost", "http://localhost:3000");
            return $"{defaultHost}/learning/recap/{sessionId}";
        }

        /// <summary>
        /// Shows recap URL in UI.
        /// </summary>
        private void ShowRecapUrl(string url)
        {
            // Show in text field
            if (recapUrlText != null)
            {
                recapUrlText.text = url;
            }

            // Show toast
            if (toast != null)
            {
                toast.ShowCustom($"Recap ready: {url}\n(This is a recap link - no grades)");
            }

            // Log for easy copy
            Debug.Log($"Recap URL: {url}");
            Debug.Log("This is a recap link (no grades).");
        }

        /// <summary>
        /// Copies recap URL to clipboard (Editor only, or via system clipboard API if available).
        /// </summary>
        public void CopyRecapUrl()
        {
            if (recapUrlText != null && !string.IsNullOrEmpty(recapUrlText.text))
            {
                // Unity doesn't have built-in clipboard, but we can log it
                Debug.Log($"Recap URL (copy this): {recapUrlText.text}");
                
                // In Editor, we can use EditorGUIUtility.systemCopyBuffer
                #if UNITY_EDITOR
                UnityEditor.EditorGUIUtility.systemCopyBuffer = recapUrlText.text;
                Debug.Log("URL copied to clipboard (Editor only)");
                #endif
            }
        }
    }
}

