using UnityEngine;
using TMPro;
using System.IO;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// ExportPanel: ND-safe UI for exporting learning bundles.
    /// </summary>
    public class ExportPanel : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private SpatialLearningBoard board;
        [SerializeField] private TextMeshPro statusText;
        [SerializeField] private GameObject exportButton;
        [SerializeField] private GameObject openFolderButton;

        [Header("Settings")]
        [SerializeField] private string exportMessage = "This saves what happened. It doesn't grade.";

        private void Awake()
        {
            if (board == null)
            {
                board = GetComponent<SpatialLearningBoard>();
            }

            // Hide open folder button on device (Editor only)
            #if !UNITY_EDITOR
            if (openFolderButton != null)
            {
                openFolderButton.SetActive(false);
            }
            #endif

            // Set status message
            if (statusText != null)
            {
                statusText.text = exportMessage;
            }
        }

        /// <summary>
        /// Called when export button is pressed.
        /// </summary>
        public void OnExportButtonPressed()
        {
            if (board == null) return;

            string exportPath = board.ExportBundle();

            if (!string.IsNullOrEmpty(exportPath))
            {
                if (statusText != null)
                {
                    statusText.text = $"Exported to:\n{exportPath}";
                }

                Debug.Log($"Learning bundle exported: {exportPath}");
            }
            else
            {
                if (statusText != null)
                {
                    statusText.text = "Export failed. Check logs.";
                }

                Debug.LogError("Failed to export learning bundle");
            }
        }

        /// <summary>
        /// Called when open folder button is pressed (Editor only).
        /// </summary>
        public void OnOpenFolderButtonPressed()
        {
            #if UNITY_EDITOR
            string exportBasePath = Path.Combine(Application.persistentDataPath, "exports");
            if (Directory.Exists(exportBasePath))
            {
                UnityEditor.EditorUtility.RevealInFinder(exportBasePath);
            }
            else
            {
                Debug.LogWarning($"Export directory does not exist: {exportBasePath}");
            }
            #endif
        }
    }
}
