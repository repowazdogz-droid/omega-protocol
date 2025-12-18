using UnityEngine;
using TMPro;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// QrScanPanel: ND-first UI for QR scanning.
    /// </summary>
    public class QrScanPanel : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private QrScanController scanController;
        [SerializeField] private PairingPanel manualPairingPanel;
        [SerializeField] private UnityEngine.UI.Button scanButton;
        [SerializeField] private UnityEngine.UI.Button manualCodeButton;
        [SerializeField] private TextMeshPro statusText;
        [SerializeField] private TextMeshPro hostText;
        [SerializeField] private TextMeshPro sessionText;

        private void Awake()
        {
            if (scanController == null)
            {
                scanController = GetComponent<QrScanController>();
            }

            if (scanButton != null)
            {
                scanButton.onClick.AddListener(OnScanButtonPressed);
            }

            if (manualCodeButton != null)
            {
                manualCodeButton.onClick.AddListener(OnManualCodeButtonPressed);
            }

            UpdateHostDisplay();
        }

        private void Update()
        {
            // Update session display if paired
            if (sessionText != null)
            {
                var pairingClient = GetComponent<PairingClient>();
                if (pairingClient != null && pairingClient.IsPaired())
                {
                    var bootstrap = pairingClient.GetCachedBootstrap();
                    if (bootstrap != null)
                    {
                        sessionText.text = $"Session: {bootstrap.sessionId.Substring(0, Mathf.Min(12, bootstrap.sessionId.Length))}...";
                    }
                }
                else
                {
                    sessionText.text = "";
                }
            }
        }

        /// <summary>
        /// Called when scan button is pressed.
        /// </summary>
        public void OnScanButtonPressed()
        {
            if (scanController == null)
            {
                Debug.LogError("Scan controller not found");
                return;
            }

            if (scanController.IsScanning())
            {
                scanController.StopScanning();
                if (scanButton != null)
                {
                    // Update button text would go here if needed
                }
            }
            else
            {
                scanController.StartScanning();
                if (scanButton != null)
                {
                    // Update button text would go here if needed
                }
            }
        }

        /// <summary>
        /// Called when manual code button is pressed.
        /// </summary>
        public void OnManualCodeButtonPressed()
        {
            if (manualPairingPanel != null)
            {
                manualPairingPanel.gameObject.SetActive(true);
                gameObject.SetActive(false);
            }
        }

        /// <summary>
        /// Sets status text.
        /// </summary>
        public void SetStatus(string message, bool isSuccess)
        {
            if (statusText != null)
            {
                statusText.text = message;
                statusText.color = isSuccess ? Color.green : Color.white;
            }
        }

        /// <summary>
        /// Updates host display.
        /// </summary>
        private void UpdateHostDisplay()
        {
            if (hostText != null)
            {
                string lastHost = PlayerPrefs.GetString("pairing:lastHost", "http://localhost:3000");
                hostText.text = $"Host: {lastHost}";
            }
        }
    }
}




