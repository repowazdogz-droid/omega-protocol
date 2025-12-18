using System;
using System.IO;
using UnityEngine;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// HighlightReelWriter: Writes highlight reel to disk (atomic write).
    /// </summary>
    public static class HighlightReelWriter
    {
        /// <summary>
        /// Writes a highlight reel to the export folder.
        /// </summary>
        public static string WriteReel(HighlightReelDto reel, string sessionId)
        {
            if (reel == null || string.IsNullOrEmpty(sessionId))
            {
                Debug.LogError("Cannot write reel: invalid input");
                return null;
            }

            try
            {
                string exportBasePath = Path.Combine(Application.persistentDataPath, "exports");
                if (!Directory.Exists(exportBasePath))
                {
                    Directory.CreateDirectory(exportBasePath);
                }

                string bundlePath = Path.Combine(exportBasePath, sessionId);
                if (!Directory.Exists(bundlePath))
                {
                    Directory.CreateDirectory(bundlePath);
                }

                string highlightPath = Path.Combine(bundlePath, "highlight.json");
                string json = JsonUtility.ToJson(reel, true);

                // Atomic write
                string tempPath = highlightPath + ".tmp";
                File.WriteAllText(tempPath, json);
                File.Move(tempPath, highlightPath, true);

                Debug.Log($"Highlight reel written to: {highlightPath}");
                return highlightPath;
            }
            catch (Exception e)
            {
                Debug.LogError($"Failed to write highlight reel: {e.Message}");
                return null;
            }
        }
    }
}



