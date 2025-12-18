using UnityEngine;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// BoardCopy: Single source of truth for all user-facing copy.
    /// ND-first, calm, clear. No randomness, no AI-generated text.
    /// </summary>
    public static class BoardCopy
    {
        // ========== Pairing ==========
        public const string PAIR_SCAN_QR = "Scan QR";
        public const string PAIR_ENTER_CODE = "Enter code instead";
        public const string PAIR_PAIRED = "Paired ✓";
        public const string PAIR_PAIRING = "Pairing...";
        public const string PAIR_CODE_EXPIRED = "Code expired";
        public const string PAIR_CODE_NOT_FOUND = "Code not found";
        public const string PAIR_CANT_REACH_HOST = "Can't reach host";
        public const string PAIR_PAIRED_OFFLINE = "Paired (offline) ✓";
        public const string PAIR_INVALID_CODE = "Invalid code. Must be 6 characters.";

        // ========== Offline ==========
        public const string OFFLINE_SHOWING_LAST = "Offline: showing last board";
        public const string OFFLINE_CANT_LOAD = "Can't load. Check connection.";

        // ========== Replay ==========
        public const string REPLAY_MODE = "Replay mode: you can watch, not change";
        public const string REPLAY_PLAYING = "Playing replay...";
        public const string REPLAY_PAUSED = "Replay paused";
        public const string REPLAY_COMPLETE = "Replay complete";

        // ========== Presence ==========
        public const string PRESENCE_SHARED = "Shared: focus/pins/filters only (no text)";
        public const string PRESENCE_HOST = "You're hosting";
        public const string PRESENCE_CLIENT = "Connected to host";

        // ========== Export ==========
        public const string EXPORT_COMPLETE = "Exported ✓";
        public const string EXPORT_RECAP_LINK = "Open recap link";
        public const string EXPORT_FAILED = "Export failed. Try again.";

        // ========== Board States ==========
        public const string BOARD_EMPTY = "No thoughts yet";
        public const string BOARD_LOADING = "Loading thoughts...";
        public const string BOARD_LOADED = "Thoughts loaded";
        public const string BOARD_ERROR = "Can't load thoughts";

        // ========== Actions ==========
        public const string ACTION_PICK_CARD = "Pick one card";
        public const string ACTION_TAP_QUESTIONS = "Tap Questions";
        public const string ACTION_PIN_THOUGHT = "Pin one thought";
        public const string ACTION_EXPLAIN_BACK = "Explain it back";
        public const string ACTION_EXPORT_RECAP = "Export recap";
        public const string ACTION_CONTINUE = "Continue";
        public const string ACTION_START_NEW = "Start new";

        // ========== Trust Messages ==========
        public const string TRUST_NO_GRADES = "This doesn't grade you";
        public const string TRUST_STOP_ANYTIME = "You can stop anytime";
        public const string TRUST_SHARED_IDS_ONLY = "What's shared: IDs only (no text)";
        public const string TRUST_YOU_CONTROL = "You're in control";
        public const string TRUST_NO_LABELS = "No labels, no diagnosis";

        // ========== Errors ==========
        public const string ERROR_GENERIC = "Something went wrong";
        public const string ERROR_RETRY = "Try again";
        public const string ERROR_GO_BACK = "Go back";
        public const string ERROR_CONTACT_SUPPORT = "Need help? Check docs.";

        /// <summary>
        /// Gets pairing status message.
        /// </summary>
        public static string GetPairingStatus(bool isPaired, bool isOffline, string error = null)
        {
            if (isPaired)
            {
                return isOffline ? PAIR_PAIRED_OFFLINE : PAIR_PAIRED;
            }

            if (!string.IsNullOrEmpty(error))
            {
                if (error.Contains("expired"))
                {
                    return PAIR_CODE_EXPIRED;
                }
                if (error.Contains("not found") || error.Contains("404"))
                {
                    return PAIR_CODE_NOT_FOUND;
                }
                if (error.Contains("reach") || error.Contains("network"))
                {
                    return PAIR_CANT_REACH_HOST;
                }
            }

            return PAIR_PAIRING;
        }

        /// <summary>
        /// Gets showtime mode message.
        /// </summary>
        public static string GetShowtimeMessage(string mode)
        {
            switch (mode?.ToLower())
            {
                case "replay":
                    return REPLAY_MODE;
                case "presence":
                    return PRESENCE_SHARED;
                case "demo":
                    return "Demo mode";
                default:
                    return "";
            }
        }
    }
}



