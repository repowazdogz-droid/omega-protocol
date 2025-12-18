using System;
using System.IO;
using System.Linq;
using UnityEngine;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// LearningBundleWriter: Collects and writes learning bundle to disk.
    /// Atomic writes, no per-frame allocations.
    /// </summary>
    public class LearningBundleWriter : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private SpatialLearningBoard board;

        private void Awake()
        {
            if (board == null)
            {
                board = GetComponent<SpatialLearningBoard>();
            }
        }

        /// <summary>
        /// Writes a complete learning bundle.
        /// Returns the export path.
        /// </summary>
        public string WriteBundle()
        {
            if (board == null)
            {
                Debug.LogError("Board reference is null");
                return null;
            }

            // Get session ID
            string sessionId = "unknown";
            var recorder = board.GetComponent<BoardSessionRecorder>();
            if (recorder != null)
            {
                sessionId = recorder.GetSessionId();
                if (string.IsNullOrEmpty(sessionId))
                {
                    sessionId = $"session_{DateTime.UtcNow:yyyyMMddHHmmss}";
                }
            }
            else
            {
                sessionId = $"session_{DateTime.UtcNow:yyyyMMddHHmmss}";
            }

            // Create export directory
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

            try
            {
                // 1. Save session log (if recording)
                if (recorder != null && recorder.IsRecording())
                {
                    recorder.StopRecording();
                    recorder.Save();
                }

                // Load session log
                var sessionLog = recorder != null ? recorder.Load() : null;
                if (sessionLog != null)
                {
                    string sessionLogPath = Path.Combine(bundlePath, "sessionlog.json");
                    string sessionLogJson = JsonUtility.ToJson(sessionLog, true);
                    WriteAtomic(sessionLogPath, sessionLogJson);
                }

                // 2. Save board state (pins, custom order, layout)
                var pinnedIds = board.GetPinnedIds();
                var customOrderIds = board.GetCustomOrderIds();
                var layoutMode = board.GetLayoutMode();
                
                if (pinnedIds != null || customOrderIds != null)
                {
                    var boardState = new BoardStateDto
                    {
                        pinnedIds = pinnedIds != null ? pinnedIds.ToArray() : new string[0],
                        customOrderIds = customOrderIds != null ? customOrderIds.ToArray() : new string[0],
                        layoutMode = layoutMode.ToString()
                    };
                    
                    string boardStatePath = Path.Combine(bundlePath, "learningBoard.json");
                    string boardStateJson = JsonUtility.ToJson(boardState, true);
                    WriteAtomic(boardStatePath, boardStateJson);
                }

                // 3. Save thought objects (current board objects)
                var thoughtObjects = GetCurrentThoughtObjects();
                if (thoughtObjects != null && thoughtObjects.Length > 0)
                {
                    string thoughtObjectsPath = Path.Combine(bundlePath, "thoughtObjects.json");
                    var wrapper = new ThoughtObjectsWrapper { objects = thoughtObjects };
                    string thoughtObjectsJson = JsonUtility.ToJson(wrapper, true);
                    WriteAtomic(thoughtObjectsPath, thoughtObjectsJson);
                }

                // 4. Save metadata
                var meta = LearningBundleMetaDto.CreateFromBoard(board);
                meta.sessionId = sessionId;
                string metaPath = Path.Combine(bundlePath, "meta.json");
                string metaJson = JsonUtility.ToJson(meta, true);
                WriteAtomic(metaPath, metaJson);

                // 5. Save highlight reel if available
                var highlightReel = board.GenerateHighlightReel(45);
                if (highlightReel != null && highlightReel.moments != null && highlightReel.moments.Count > 0)
                {
                    string highlightPath = Path.Combine(bundlePath, "highlight.json");
                    string highlightJson = JsonUtility.ToJson(highlightReel, true);
                    WriteAtomic(highlightPath, highlightJson);
                }

                Debug.Log($"Learning bundle exported to: {bundlePath}");

                // Notify export completed (for DemoExportBridge)
                if (board != null)
                {
                    board.NotifyExportCompleted(bundlePath, sessionId);
                }

                // Notify export bundle completed (for RecapHandoff)
                if (board != null)
                {
                    board.NotifyExportBundleCompleted(sessionId);
                }

                return bundlePath;
            }
            catch (Exception e)
            {
                Debug.LogError($"Failed to write learning bundle: {e.Message}");
                return null;
            }
        }

        /// <summary>
        /// Gets current thought objects from board.
        /// </summary>
        private ThoughtObjectDto[] GetCurrentThoughtObjects()
        {
            if (board == null) return null;

            var allCards = board.GetAllCards();
            if (allCards == null || allCards.Count == 0) return null;

            var objects = new ThoughtObjectDto[allCards.Count];
            for (int i = 0; i < allCards.Count; i++)
            {
                if (allCards[i] != null)
                {
                    objects[i] = allCards[i].GetData();
                }
            }

            return objects;
        }

        /// <summary>
        /// Writes a file atomically (tmp → replace).
        /// </summary>
        private void WriteAtomic(string filePath, string content)
        {
            string tempPath = filePath + ".tmp";
            File.WriteAllText(tempPath, content);
            File.Move(tempPath, filePath, true);
        }

        /// <summary>
        /// Wrapper for JSON serialization of thought objects array.
        /// </summary>
        [Serializable]
        private class ThoughtObjectsWrapper
        {
            public ThoughtObjectDto[] objects;
        }

        /// <summary>
        /// Board state DTO for export.
        /// </summary>
        [Serializable]
        private class BoardStateDto
        {
            public string[] pinnedIds;
            public string[] customOrderIds;
            public string layoutMode;
        }
    }
}
