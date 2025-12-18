using System;
using System.Collections;
using System.Net;
using System.Net.Sockets;
using System.Text;
using UnityEngine;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// PresenceReceiver: Receives board state over LAN via UDP.
    /// Applies updates only if same sessionId and newer timestamp.
    /// </summary>
    public class PresenceReceiver : MonoBehaviour
    {
        [Header("Settings")]
        [SerializeField] private int receivePort = 12345;
        [SerializeField] private string expectedSessionId = "";

        [Header("References")]
        [SerializeField] private SpatialLearningBoard board;

        private UdpClient udpClient;
        private IPEndPoint receiveEndPoint;
        private Coroutine receiveCoroutine;
        private bool isReceiving = false;
        private PresenceStateDto lastAppliedState;

        /// <summary>
        /// Checks if currently receiving.
        /// </summary>
        public bool IsReceiving()
        {
            return isReceiving;
        }

        private void Awake()
        {
            if (board == null)
            {
                board = GetComponent<SpatialLearningBoard>();
            }

            receiveEndPoint = new IPEndPoint(IPAddress.Any, receivePort);
        }

        /// <summary>
        /// Starts receiving.
        /// </summary>
        public void StartReceiving()
        {
            if (isReceiving) return;

            try
            {
                udpClient = new UdpClient(receivePort);
                isReceiving = true;
                lastAppliedState = null;

                if (receiveCoroutine != null)
                {
                    StopCoroutine(receiveCoroutine);
                }
                receiveCoroutine = StartCoroutine(ReceiveLoop());

                Debug.Log($"Started receiving on port {receivePort}");
            }
            catch (Exception e)
            {
                Debug.LogError($"Failed to start receiving: {e.Message}");
                isReceiving = false;
            }
        }

        /// <summary>
        /// Stops receiving.
        /// </summary>
        public void StopReceiving()
        {
            if (!isReceiving) return;

            isReceiving = false;

            if (receiveCoroutine != null)
            {
                StopCoroutine(receiveCoroutine);
                receiveCoroutine = null;
            }

            if (udpClient != null)
            {
                udpClient.Close();
                udpClient = null;
            }

            Debug.Log("Stopped receiving");
        }

        /// <summary>
        /// Sets the expected session ID.
        /// </summary>
        public void SetSessionId(string sessionId)
        {
            expectedSessionId = sessionId;
        }

        /// <summary>
        /// Receive loop.
        /// </summary>
        private IEnumerator ReceiveLoop()
        {
            while (isReceiving)
            {
                if (udpClient.Available > 0)
                {
                    try
                    {
                        byte[] data = udpClient.Receive(ref receiveEndPoint);
                        string json = Encoding.UTF8.GetString(data);
                        var state = JsonUtility.FromJson<PresenceStateDto>(json);

                        // Apply only if same sessionId and newer
                        if (state != null && 
                            (string.IsNullOrEmpty(expectedSessionId) || state.sessionId == expectedSessionId) &&
                            state.IsNewerThan(lastAppliedState))
                        {
                            ApplyState(state);
                            lastAppliedState = state;
                        }
                    }
                    catch (Exception e)
                    {
                        Debug.LogWarning($"Failed to receive/parse state: {e.Message}");
                    }
                }

                yield return null; // Check every frame
            }
        }

        /// <summary>
        /// Applies received state to board.
        /// </summary>
        private void ApplyState(PresenceStateDto state)
        {
            if (board == null) return;

            // Apply via board's public API
            board.ApplyPresenceState(state);
        }

        private void OnDestroy()
        {
            StopReceiving();
        }
    }
}

