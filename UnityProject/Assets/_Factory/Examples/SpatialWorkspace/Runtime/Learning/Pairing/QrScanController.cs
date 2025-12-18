using System;
using System.Collections;
using UnityEngine;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// QrScanController: Handles QR code scanning (Vision Pro / iOS camera + Editor fallback).
    /// No per-frame allocations, polls at small cadence.
    /// </summary>
    public class QrScanController : MonoBehaviour
    {
        [Header("Settings")]
        [SerializeField] private float scanInterval = 0.5f; // Poll every 0.5s (not per-frame)
        [SerializeField] private bool autoStartScanning = false;

        [Header("References")]
        [SerializeField] private PairingClient pairingClient;
        [SerializeField] private QrScanPanel scanPanel;

        private bool isScanning = false;
        private Coroutine scanCoroutine;
        private string lastScannedCode = null;

        // For Editor fallback: paste text
        private string editorPasteBuffer = "";

        private void Awake()
        {
            if (pairingClient == null)
            {
                pairingClient = GetComponent<PairingClient>();
            }

            if (scanPanel == null)
            {
                scanPanel = GetComponent<QrScanPanel>();
            }

            if (autoStartScanning)
            {
                StartScanning();
            }
        }

        /// <summary>
        /// Starts QR scanning.
        /// </summary>
        public void StartScanning()
        {
            if (isScanning)
            {
                return;
            }

            isScanning = true;
            scanCoroutine = StartCoroutine(ScanCoroutine());

            if (scanPanel != null)
            {
                scanPanel.SetStatus("Scanning...", false);
            }
        }

        /// <summary>
        /// Stops QR scanning.
        /// </summary>
        public void StopScanning()
        {
            isScanning = false;

            if (scanCoroutine != null)
            {
                StopCoroutine(scanCoroutine);
                scanCoroutine = null;
            }

            if (scanPanel != null)
            {
                scanPanel.SetStatus("Scan stopped", false);
            }
        }

        /// <summary>
        /// Scanning coroutine (polls at interval, not per-frame).
        /// </summary>
        private IEnumerator ScanCoroutine()
        {
            while (isScanning)
            {
                yield return new WaitForSeconds(scanInterval);

                // Try to scan QR code
                string qrText = TryScanQrCode();

                if (!string.IsNullOrEmpty(qrText) && qrText != lastScannedCode)
                {
                    lastScannedCode = qrText;
                    OnQrCodeDetected(qrText);
                }
            }
        }

        /// <summary>
        /// Attempts to scan QR code (device camera or Editor fallback).
        /// </summary>
        private string TryScanQrCode()
        {
            #if UNITY_EDITOR
            // Editor fallback: check for paste buffer
            if (!string.IsNullOrEmpty(editorPasteBuffer))
            {
                string result = editorPasteBuffer;
                editorPasteBuffer = ""; // Clear after use
                return result;
            }
            return null;
            #else
            // Device: use camera + QR decoder
            // For now, we'll use a simple approach that can be extended with ZXing or similar
            // This is a placeholder - actual implementation would use camera frames
            return null;
            #endif
        }

        /// <summary>
        /// Called when QR code is detected.
        /// </summary>
        private void OnQrCodeDetected(string qrText)
        {
            Debug.Log($"QR code detected: {qrText}");

            // Parse QR payload
            var parseResult = QrPairingPayload.Parse(qrText);

            if (!parseResult.Success)
            {
                if (scanPanel != null)
                {
                    scanPanel.SetStatus($"Invalid QR: {parseResult.Error}", false);
                }
                return;
            }

            // Update base URL if provided
            if (pairingClient != null && !string.IsNullOrEmpty(parseResult.BaseUrl))
            {
                pairingClient.SetBaseUrl($"{parseResult.BaseUrl}/api/learning/pair");
            }

            // Stop scanning
            StopScanning();

            // Update status
            if (scanPanel != null)
            {
                scanPanel.SetStatus("Pairing...", false);
            }

            // Pair with code
            if (pairingClient != null)
            {
                pairingClient.PairWithCode(parseResult.PairCode);
            }

            // Check pairing status after delay
            Invoke(nameof(CheckPairingStatus), 2f);
        }

        /// <summary>
        /// Checks pairing status and updates UI.
        /// </summary>
        private void CheckPairingStatus()
        {
            if (pairingClient == null)
            {
                if (scanPanel != null)
                {
                    scanPanel.SetStatus("Pairing client not found", false);
                }
                return;
            }

            if (pairingClient.IsPaired())
            {
                if (scanPanel != null)
                {
                    scanPanel.SetStatus("Paired ✓", true);
                }
            }
            else
            {
                if (scanPanel != null)
                {
                    scanPanel.SetStatus("Pairing failed. Try again.", false);
                }
            }
        }

        /// <summary>
        /// Editor fallback: Paste QR text (for testing).
        /// </summary>
        public void PasteQrText(string qrText)
        {
            #if UNITY_EDITOR
            editorPasteBuffer = qrText;
            #endif
        }

        /// <summary>
        /// Checks if currently scanning.
        /// </summary>
        public bool IsScanning()
        {
            return isScanning;
        }
    }
}



