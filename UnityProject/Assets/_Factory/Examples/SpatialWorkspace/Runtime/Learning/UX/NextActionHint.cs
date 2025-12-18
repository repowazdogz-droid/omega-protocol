using UnityEngine;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// NextActionHint: Deterministic "what now?" suggestions.
    /// No AI, no randomness. Pure state machine.
    /// </summary>
    public static class NextActionHint
    {
        /// <summary>
        /// Gets the next action suggestion based on board state.
        /// Returns ONE suggestion only.
        /// </summary>
        public static string GetSuggestion(BoardState state)
        {
            if (state == null)
            {
                return BoardCopy.ACTION_START_NEW;
            }

            // Priority 1: Empty board
            if (state.cardCount == 0)
            {
                return BoardCopy.BOARD_EMPTY;
            }

            // Priority 2: No selection
            if (string.IsNullOrEmpty(state.selectedCardId))
            {
                return BoardCopy.ACTION_PICK_CARD;
            }

            // Priority 3: No pins
            if (state.pinnedCount == 0)
            {
                return BoardCopy.ACTION_PIN_THOUGHT;
            }

            // Priority 4: Not in Questions cluster
            if (state.currentClusterId != "Questions")
            {
                return BoardCopy.ACTION_TAP_QUESTIONS;
            }

            // Priority 5: Haven't done explain-back
            if (!state.hasDoneExplainBack)
            {
                return BoardCopy.ACTION_EXPLAIN_BACK;
            }

            // Priority 6: Haven't exported
            if (!state.hasExported)
            {
                return BoardCopy.ACTION_EXPORT_RECAP;
            }

            // Default: Continue
            return BoardCopy.ACTION_CONTINUE;
        }
    }

    /// <summary>
    /// BoardState: Minimal state snapshot for hint generation.
    /// </summary>
    public class BoardState
    {
        public int cardCount;
        public string selectedCardId;
        public int pinnedCount;
        public string currentClusterId;
        public bool hasDoneExplainBack;
        public bool hasExported;
    }
}



