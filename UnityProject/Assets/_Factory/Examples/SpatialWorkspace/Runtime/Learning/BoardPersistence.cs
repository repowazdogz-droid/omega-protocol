using System;
using System.IO;
using UnityEngine;
using System.Collections.Generic;
using System.Linq;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// BoardPersistence: Saves and loads board state (pins + ordering).
    /// Atomic write pattern (tmp + replace) for safety.
    /// </summary>
    [Serializable]
    public class BoardState
    {
        public string[] pinnedIds = new string[0];
        public string[] customOrderIds = new string[0];
        public string layoutMode = "Arc";
        public string lastUpdated;
    }

    public static class BoardPersistence
    {
        private static string GetStatePath()
        {
            return Path.Combine(Application.persistentDataPath, "learningBoard.json");
        }

        /// <summary>
        /// Saves board state to disk (atomic write).
        /// </summary>
        public static void SaveBoardState(
            List<string> pinnedIds,
            List<string> customOrderIds,
            SpatialLearningBoard.LayoutMode layoutMode
        )
        {
            try
            {
                var state = new BoardState
                {
                    pinnedIds = pinnedIds.ToArray(),
                    customOrderIds = customOrderIds.ToArray(),
                    layoutMode = layoutMode.ToString(),
                    lastUpdated = DateTime.UtcNow.ToString("O")
                };

                string json = JsonUtility.ToJson(state, true);
                string filePath = GetStatePath();
                string tempPath = filePath + ".tmp";

                // Atomic write: write to temp, then replace
                File.WriteAllText(tempPath, json);
                File.Move(tempPath, filePath, true); // Overwrite if exists
            }
            catch (Exception e)
            {
                Debug.LogError($"Failed to save board state: {e.Message}");
            }
        }

        /// <summary>
        /// Loads board state from disk.
        /// </summary>
        public static BoardState LoadBoardState()
        {
            string filePath = GetStatePath();
            
            if (!File.Exists(filePath))
            {
                return null;
            }

            try
            {
                string json = File.ReadAllText(filePath);
                return JsonUtility.FromJson<BoardState>(json);
            }
            catch (Exception e)
            {
                Debug.LogError($"Failed to load board state: {e.Message}");
                return null;
            }
        }

        /// <summary>
        /// Applies saved state to board (pins + custom order).
        /// Called by SpatialLearningBoard after loading state.
        /// </summary>
        public static void ApplySavedStateToBoard(
            SpatialLearningBoard board,
            ThoughtObjectDto[] objects,
            BoardState savedState
        )
        {
            if (savedState == null || board == null) return;

            // Apply layout mode
            try
            {
                if (System.Enum.TryParse<SpatialLearningBoard.LayoutMode>(savedState.layoutMode, out var layoutMode))
                {
                    board.SetLayoutMode(layoutMode);
                }
            }
            catch
            {
                // Ignore parse errors
            }

            // Create lookup for objects
            var objectLookup = new Dictionary<string, ThoughtObjectDto>();
            foreach (var obj in objects)
            {
                objectLookup[obj.id] = obj;
            }

            // Apply pinned cards (ignore stale ids)
            var validPinnedIds = savedState.pinnedIds
                .Where(id => objectLookup.ContainsKey(id))
                .ToList();

            // Apply custom order (ignore stale ids, add missing at end)
            var validOrderIds = savedState.customOrderIds
                .Where(id => objectLookup.ContainsKey(id))
                .ToList();

            var missingIds = objects
                .Select(obj => obj.id)
                .Where(id => !validOrderIds.Contains(id))
                .ToList();

            var finalOrder = validOrderIds.Concat(missingIds).ToList();

            // Apply to board
            board.ApplySavedState(validPinnedIds, finalOrder);
        }
    }
}

