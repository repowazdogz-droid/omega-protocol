using System.Collections.Generic;
using UnityEngine;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// StabilityGuard: Prevents accidental chaos.
    /// Debounce rapid taps, prevent loops, lock transitions during animations.
    /// ND-safe defaults.
    /// </summary>
    public class StabilityGuard : MonoBehaviour
    {
        [Header("Debounce Settings")]
        [SerializeField] private float debounceWindow = 0.25f; // 250ms default
        [SerializeField] private float animationLockWindow = 0.1f; // Lock during animations

        [Header("ND-Safe Defaults")]
        [SerializeField] private bool preventRapidFocus = true;
        [SerializeField] private bool preventPinSpam = true;
        [SerializeField] private bool preventClusterThrashing = true;

        private Dictionary<string, float> lastActionTimes = new Dictionary<string, float>();
        private Dictionary<string, bool> actionLocks = new Dictionary<string, bool>();
        private float lastAnimationTime = 0f;

        /// <summary>
        /// Checks if an action can be processed (debounced + locked).
        /// </summary>
        public bool CanProcess(string actionId)
        {
            if (string.IsNullOrEmpty(actionId)) return false;

            // Check if locked
            if (actionLocks.ContainsKey(actionId) && actionLocks[actionId])
            {
                return false;
            }

            // Check debounce window
            if (lastActionTimes.ContainsKey(actionId))
            {
                float timeSinceLastAction = Time.time - lastActionTimes[actionId];
                if (timeSinceLastAction < debounceWindow)
                {
                    return false; // Too soon
                }
            }

            // Check animation lock
            if (Time.time - lastAnimationTime < animationLockWindow)
            {
                return false; // Animation in progress
            }

            // Check specific preventions
            if (preventRapidFocus && (actionId == "focus" || actionId == "enterfocus" || actionId == "exitfocus"))
            {
                if (lastActionTimes.ContainsKey("focus") && Time.time - lastActionTimes["focus"] < debounceWindow * 2f)
                {
                    return false; // Prevent focus loops
                }
            }

            if (preventPinSpam && (actionId == "pin" || actionId == "togglepin"))
            {
                if (lastActionTimes.ContainsKey("pin") && Time.time - lastActionTimes["pin"] < debounceWindow * 1.5f)
                {
                    return false; // Prevent pin spam
                }
            }

            if (preventClusterThrashing && (actionId == "cluster" || actionId == "clusterchange"))
            {
                if (lastActionTimes.ContainsKey("cluster") && Time.time - lastActionTimes["cluster"] < debounceWindow * 2f)
                {
                    return false; // Prevent cluster thrashing
                }
            }

            return true;
        }

        /// <summary>
        /// Records that an action was processed.
        /// </summary>
        public void RecordAction(string actionId)
        {
            if (string.IsNullOrEmpty(actionId)) return;

            lastActionTimes[actionId] = Time.time;

            // Also record generic types for prevention checks
            if (actionId.Contains("focus"))
            {
                lastActionTimes["focus"] = Time.time;
            }
            if (actionId.Contains("pin"))
            {
                lastActionTimes["pin"] = Time.time;
            }
            if (actionId.Contains("cluster"))
            {
                lastActionTimes["cluster"] = Time.time;
            }
        }

        /// <summary>
        /// Locks an action (prevents processing).
        /// </summary>
        public void LockAction(string actionId, bool locked)
        {
            if (string.IsNullOrEmpty(actionId)) return;

            actionLocks[actionId] = locked;
        }

        /// <summary>
        /// Records that an animation started.
        /// </summary>
        public void RecordAnimationStart()
        {
            lastAnimationTime = Time.time;
        }

        /// <summary>
        /// Clears all locks and debounce timers (for reset).
        /// </summary>
        public void Clear()
        {
            lastActionTimes.Clear();
            actionLocks.Clear();
            lastAnimationTime = 0f;
        }

        /// <summary>
        /// Checks if currently locked (for diagnostics).
        /// </summary>
        public bool IsLocked(string actionId)
        {
            return actionLocks.ContainsKey(actionId) && actionLocks[actionId];
        }
    }
}




