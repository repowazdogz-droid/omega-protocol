using System;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// PresenceStateDto: IDs-only state for presence/audience mirror.
    /// Never contains text content.
    /// </summary>
    [Serializable]
    public class PresenceStateDto
    {
        public string sessionId;
        public string focusedThoughtId;
        public string clusterId;
        public string[] pinnedIds;
        public string spotlightThoughtId;
        public int demoStepIndex;
        public long updatedAtMs;
    }
}
