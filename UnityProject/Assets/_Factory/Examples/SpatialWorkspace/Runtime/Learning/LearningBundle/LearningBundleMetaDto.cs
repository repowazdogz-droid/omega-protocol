using System;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// LearningBundleMetaDto: Metadata for exported learning bundle.
    /// </summary>
    [Serializable]
    public class LearningBundleMetaDto
    {
        public string sessionId;
        public string createdAtIso;
        public string version = "0.1";
        public string modeUsed; // Solo, Demo, Replay, Presence
        public bool reduceMotion;
        public string learnerIdHash; // Optional, local only (hashed for privacy)

        /// <summary>
        /// Creates metadata from current board state.
        /// </summary>
        public static LearningBundleMetaDto CreateFromBoard(SpatialLearningBoard board)
        {
            var meta = new LearningBundleMetaDto
            {
                sessionId = "",
                createdAtIso = DateTime.UtcNow.ToString("O"),
                version = "0.1",
                modeUsed = "Solo",
                reduceMotion = false,
                learnerIdHash = null
            };

            if (board != null)
            {
                // Get session ID from recorder
                var recorder = board.GetComponent<BoardSessionRecorder>();
                if (recorder != null)
                {
                    meta.sessionId = recorder.GetSessionId();
                }

                // Get showtime mode
                var showtime = board.GetComponent<ShowtimeController>();
                if (showtime != null)
                {
                    var state = showtime.GetCurrentState();
                    meta.modeUsed = state.Mode.ToString();
                }

                // Get reduce motion setting
                var tuning = board.GetTuning();
                if (tuning != null)
                {
                    meta.reduceMotion = tuning.GetReduceMotion();
                }
            }

            return meta;
        }
    }
}
