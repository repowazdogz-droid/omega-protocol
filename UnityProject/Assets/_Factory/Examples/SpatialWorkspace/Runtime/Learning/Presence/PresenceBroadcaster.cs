using System;
using System.Collections;
using System.Net;
using System.Net.Sockets;
using System.Text;
using UnityEngine;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// PresenceBroadcaster: Broadcasts board state over LAN via UDP.
    /// Frequency: 4-10 Hz when state changes, or heartbeat every 1s.
    /// </summary>
    public class PresenceBroadcaster : MonoBehaviour
    {
        [Header("Settings")]
        [SerializeField] private int broadcastPort = 12345;
        [SerializeField] private float broadcastFrequency = 8f; // Hz (4-10 range)
        [SerializeField] private float heartbeatInterval = 1f; // seconds

        [Header("References")]
        [SerializeField] private SpatialLearningBoard board;

        private UdpClient udpClient;
        private IPEndPoint broadcastEndPoint;
        private PresenceStateDto lastBroadcastState;
        private Coroutine broadcastCoroutine;
        private bool isBroadcasting = false;

        /// <summary>
        /// Checks if currently broadcasting.
        /// </summary>
        public bool IsBroadcasting()
        {
            return isBroadcasting;
        }

        private void Awake()
        {
            if (board == null)
            {
                board = GetComponent<SpatialLearningBoard>();
            }
        }

        /// <summary>
        /// Starts broadcasting.
        /// </summary>
        public void StartBroadcasting()
        {
            if (isBroadcasting) return;

            try
            {
                udpClient = new UdpClient();
                udpClient.EnableBroadcast = true;
                broadcastEndPoint = new IPEndPoint(IPAddress.Broadcast, broadcastPort);

                isBroadcasting = true;
                lastBroadcastState = null;

                if (broadcastCoroutine != null)
                {
                    StopCoroutine(broadcastCoroutine);
                }
                broadcastCoroutine = StartCoroutine(BroadcastLoop());

                Debug.Log($"Started broadcasting on port {broadcastPort}");
            }
            catch (Exception e)
            {
                Debug.LogError($"Failed to start broadcasting: {e.Message}");
                isBroadcasting = false;
            }
        }

        /// <summary>
        /// Stops broadcasting.
        /// </summary>
        public void StopBroadcasting()
        {
            if (!isBroadcasting) return;

            isBroadcasting = false;

            if (broadcastCoroutine != null)
            {
                StopCoroutine(broadcastCoroutine);
                broadcastCoroutine = null;
            }

            if (udpClient != null)
            {
                udpClient.Close();
                udpClient = null;
            }

            Debug.Log("Stopped broadcasting");
        }

        /// <summary>
        /// Broadcast loop (state changes or heartbeat).
        /// </summary>
        private IEnumerator BroadcastLoop()
        {
            float interval = 1f / broadcastFrequency;
            float lastHeartbeat = 0f;

            while (isBroadcasting)
            {
                var currentState = board != null ? board.GetCurrentPresenceState() : null;

                if (currentState != null)
                {
                    bool stateChanged = lastBroadcastState == null || 
                                       currentState.focusedThoughtId != lastBroadcastState.focusedThoughtId ||
                                       currentState.clusterId != lastBroadcastState.clusterId ||
                                       !ArraysEqual(currentState.pinnedIds, lastBroadcastState.pinnedIds) ||
                                       currentState.spotlightThoughtId != lastBroadcastState.spotlightThoughtId ||
                                       currentState.demoStepIndex != lastBroadcastState.demoStepIndex;

                    bool shouldHeartbeat = (Time.time - lastHeartbeat) >= heartbeatInterval;

                    if (stateChanged || shouldHeartbeat)
                    {
                        BroadcastState(currentState);
                        lastBroadcastState = currentState;
                        if (shouldHeartbeat)
                        {
                            lastHeartbeat = Time.time;
                        }
                    }
                }

                yield return new WaitForSeconds(interval);
            }
        }

        /// <summary>
        /// Broadcasts a state update.
        /// </summary>
        private void BroadcastState(PresenceStateDto state)
        {
            if (udpClient == null || broadcastEndPoint == null) return;

            try
            {
                string json = JsonUtility.ToJson(state);
                byte[] data = Encoding.UTF8.GetBytes(json);
                udpClient.Send(data, data.Length, broadcastEndPoint);
            }
            catch (Exception e)
            {
                Debug.LogWarning($"Failed to broadcast state: {e.Message}");
            }
        }

        /// <summary>
        /// Checks if two string arrays are equal.
        /// </summary>
        private bool ArraysEqual(string[] a, string[] b)
        {
            if (a == null && b == null) return true;
            if (a == null || b == null) return false;
            if (a.Length != b.Length) return false;

            for (int i = 0; i < a.Length; i++)
            {
                if (a[i] != b[i]) return false;
            }
            return true;
        }

        private void OnDestroy()
        {
            StopBroadcasting();
        }
    }
}

