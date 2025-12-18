using System;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// ShowtimeMode: Central authority for what mode the board is in.
    /// </summary>
    public enum ShowtimeMode
    {
        Off,        // No restrictions (default)
        Demo,       // Guided, limited interactions
        Replay,     // Playback only
        Presence,   // Host/client synced
        Solo        // Full local control
    }

    /// <summary>
    /// ShowtimeState: Central authority deciding what is allowed right now.
    /// </summary>
    [Serializable]
    public class ShowtimeState
    {
        public ShowtimeMode Mode = ShowtimeMode.Off;
        public bool AllowPin = true;
        public bool AllowClusterChange = true;
        public bool AllowExplainBack = true;
        public bool AllowSpotlight = true;
        public bool AllowFreeSelection = true;
        public bool AllowRecording = true;

        /// <summary>
        /// Creates a state for a given mode with appropriate rules.
        /// </summary>
        public static ShowtimeState CreateForMode(ShowtimeMode mode)
        {
            var state = new ShowtimeState { Mode = mode };

            switch (mode)
            {
                case ShowtimeMode.Off:
                    // Everything allowed
                    state.AllowPin = true;
                    state.AllowClusterChange = true;
                    state.AllowExplainBack = true;
                    state.AllowSpotlight = true;
                    state.AllowFreeSelection = true;
                    state.AllowRecording = true;
                    break;

                case ShowtimeMode.Demo:
                    // Guided, limited interactions
                    state.AllowPin = true; // But debounced
                    state.AllowClusterChange = true; // But debounced
                    state.AllowExplainBack = true;
                    state.AllowSpotlight = false; // No spotlight in demo
                    state.AllowFreeSelection = true;
                    state.AllowRecording = false; // No recording during demo
                    break;

                case ShowtimeMode.Replay:
                    // Playback only - no local mutations
                    state.AllowPin = false;
                    state.AllowClusterChange = false;
                    state.AllowExplainBack = false;
                    state.AllowSpotlight = false;
                    state.AllowFreeSelection = false;
                    state.AllowRecording = false;
                    break;

                case ShowtimeMode.Presence:
                    // Host authoritative
                    state.AllowPin = true; // But may be overridden by host
                    state.AllowClusterChange = true; // But may be overridden by host
                    state.AllowExplainBack = true;
                    state.AllowSpotlight = true; // Host can spotlight
                    state.AllowFreeSelection = true;
                    state.AllowRecording = false; // No recording during presence
                    break;

                case ShowtimeMode.Solo:
                    // Full local control
                    state.AllowPin = true;
                    state.AllowClusterChange = true;
                    state.AllowExplainBack = true;
                    state.AllowSpotlight = true;
                    state.AllowFreeSelection = true;
                    state.AllowRecording = true;
                    break;
            }

            return state;
        }

        /// <summary>
        /// Checks if an action is allowed.
        /// </summary>
        public bool IsActionAllowed(string action)
        {
            switch (action.ToLower())
            {
                case "pin":
                case "togglepin":
                    return AllowPin;
                case "cluster":
                case "clusterchange":
                    return AllowClusterChange;
                case "explainback":
                    return AllowExplainBack;
                case "spotlight":
                    return AllowSpotlight;
                case "select":
                case "selection":
                    return AllowFreeSelection;
                case "record":
                case "recording":
                    return AllowRecording;
                default:
                    return true; // Unknown actions allowed by default
            }
        }
    }
}




