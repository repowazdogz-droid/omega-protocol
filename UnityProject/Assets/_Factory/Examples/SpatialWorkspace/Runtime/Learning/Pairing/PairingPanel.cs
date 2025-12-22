using UnityEngine;
using TMPro;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// PairingPanel: ND-first UI for entering pair code.
    /// </summary>
    public class PairingPanel : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private PairingClient pairingClient;
        [SerializeField] private TMP_InputField codeInput;
        [SerializeField] private UnityEngine.UI.Button pairButton;
        [SerializeField] private TextMeshPro statusText;

        [Header("Settings")]
        [SerializeField] private string defaultHostUrl = "http://localhost:3000";

        private void Awake()
        {
            if (pairingClient == null)
            {
                pairingClient = GetComponent<PairingClient>();
            }

            // Load last host URL from PlayerPrefs
            string lastHost = PlayerPrefs.GetString("pairing:lastHost", defaultHostUrl);
            if (pairingClient != null)
            {
                // PairingClient would need a method to set base URL
                // For now, we'll store it
                PlayerPrefs.SetString("pairing:lastHost", lastHost);
            }
        }

        /// <summary>
        /// Called when pair button is pressed.
        /// </summary>
        public void OnPairButtonPressed()
        {
            if (pairingClient == null || codeInput == null)
            {
                Debug.LogError("PairingClient or codeInput is null");
                return;
            }

            string code = codeInput.text?.Trim().ToUpper();
            if (string.IsNullOrEmpty(code) || code.Length != 6)
            {
                UpdateStatus("Invalid code. Must be 6 characters.", false);
                return;
            }

            UpdateStatus("Pairing...", true);
            pairButton.interactable = false;

            pairingClient.PairWithCode(code);

            // Check pairing status after a delay
            Invoke(nameof(CheckPairingStatus), 2f);
        }

        /// <summary>
        /// Checks pairing status and updates UI.
        /// </summary>
        private void CheckPairingStatus()
        {
            if (pairingClient == null)
            {
                UpdateStatus("Pairing client not found", false);
                return;
            }

            if (pairingClient.IsPaired())
            {
                UpdateStatus("Paired ✓", true);
                // Disable input after successful pairing
                if (codeInput != null)
                {
                    codeInput.interactable = false;
                }
            }
            else
            {
                UpdateStatus("Pairing failed. Check code and host.", false);
                pairButton.interactable = true;
            }
        }

        /// <summary>
        /// Updates status text.
        /// </summary>
        private void UpdateStatus(string message, bool isSuccess)
        {
            if (statusText != null)
            {
                statusText.text = message;
                statusText.color = isSuccess ? Color.green : Color.red;
            }
        }

        /// <summary>
        /// Called when code input changes (for validation).
        /// </summary>
        public void OnCodeInputChanged(string value)
        {
            // Auto-uppercase and limit to 6 characters
            if (codeInput != null)
            {
                string upper = value.ToUpper();
                if (upper.Length > 6)
                {
                    upper = upper.Substring(0, 6);
                }
                codeInput.text = upper;
            }
        }
    }
}











