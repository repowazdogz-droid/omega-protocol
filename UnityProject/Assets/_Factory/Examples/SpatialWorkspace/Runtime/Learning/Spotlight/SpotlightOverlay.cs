using UnityEngine;
using TMPro;
using System.Collections;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// SpotlightOverlay: Dismissible spotlight for teacher guidance.
    /// Brings card forward slightly OR adds calm outline halo (tuning-driven).
    /// </summary>
    public class SpotlightOverlay : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private SpatialLearningBoard board;
        [SerializeField] private TextMeshPro labelText;
        [SerializeField] private GameObject dismissButton;
        [SerializeField] private LearningBoardTuning tuning;

        [Header("Visual")]
        [SerializeField] private float spotlightDistance = 0.3f; // How much to bring card forward
        [SerializeField] private Color spotlightColor = new Color(1f, 0.9f, 0.7f); // Warm highlight
        [SerializeField] private float outlineWidth = 0.05f;

        private ThoughtCard spotlightedCard;
        private Vector3 originalPosition;
        private MaterialPropertyBlock propertyBlock;
        private bool isActive = false;

        private void Awake()
        {
            if (board == null)
            {
                board = GetComponent<SpatialLearningBoard>();
            }

            if (tuning == null && board != null)
            {
                tuning = board.GetTuning();
            }

            propertyBlock = new MaterialPropertyBlock();

            if (labelText != null)
            {
                labelText.text = "Spotlight";
                labelText.gameObject.SetActive(false);
            }

            if (dismissButton != null)
            {
                dismissButton.SetActive(false);
            }
        }

        /// <summary>
        /// Shows spotlight on a card.
        /// </summary>
        public void ShowSpotlight(string thoughtId)
        {
            if (board == null || string.IsNullOrEmpty(thoughtId)) return;

            var card = board.GetCardById(thoughtId);
            if (card == null) return;

            // Dismiss previous if any
            if (isActive && spotlightedCard != null)
            {
                DismissSpotlight();
            }

            spotlightedCard = card;
            isActive = true;
            originalPosition = card.transform.localPosition;

            // Bring card forward slightly (or add outline halo)
            bool reduceMotion = tuning != null ? tuning.GetReduceMotion() : true;
            if (reduceMotion)
            {
                // Use outline halo instead of movement
                AddOutlineHalo(card);
            }
            else
            {
                // Bring forward
                Vector3 forward = (transform.position - card.transform.position).normalized;
                if (forward.magnitude < 0.01f)
                {
                    forward = -card.transform.forward;
                }
                card.transform.localPosition = originalPosition + forward.normalized * spotlightDistance;
            }

            // Show label and dismiss button
            if (labelText != null)
            {
                labelText.gameObject.SetActive(true);
            }

            if (dismissButton != null)
            {
                dismissButton.SetActive(true);
            }
        }

        /// <summary>
        /// Dismisses the spotlight.
        /// </summary>
        public void DismissSpotlight()
        {
            if (!isActive) return;

            if (spotlightedCard != null)
            {
                // Restore position
                spotlightedCard.transform.localPosition = originalPosition;

                // Remove outline halo
                RemoveOutlineHalo(spotlightedCard);
            }

            spotlightedCard = null;
            isActive = false;

            // Hide label and dismiss button
            if (labelText != null)
            {
                labelText.gameObject.SetActive(false);
            }

            if (dismissButton != null)
            {
                dismissButton.SetActive(false);
            }
        }

        /// <summary>
        /// Checks if spotlight is active.
        /// </summary>
        public bool IsActive()
        {
            return isActive;
        }

        /// <summary>
        /// Gets the currently spotlighted thought ID.
        /// </summary>
        public string GetSpotlightedThoughtId()
        {
            if (spotlightedCard != null)
            {
                var data = spotlightedCard.GetData();
                return data != null ? data.id : null;
            }
            return null;
        }

        /// <summary>
        /// Adds outline halo to card.
        /// </summary>
        private void AddOutlineHalo(ThoughtCard card)
        {
            var renderer = card.GetComponent<Renderer>();
            if (renderer != null)
            {
                renderer.GetPropertyBlock(propertyBlock);
                propertyBlock.SetFloat("_OutlineWidth", outlineWidth);
                propertyBlock.SetColor("_OutlineColor", spotlightColor);
                renderer.SetPropertyBlock(propertyBlock);
            }
        }

        /// <summary>
        /// Removes outline halo from card.
        /// </summary>
        private void RemoveOutlineHalo(ThoughtCard card)
        {
            var renderer = card.GetComponent<Renderer>();
            if (renderer != null)
            {
                renderer.GetPropertyBlock(propertyBlock);
                propertyBlock.SetFloat("_OutlineWidth", 0f);
                renderer.SetPropertyBlock(propertyBlock);
            }
        }

        /// <summary>
        /// Called by dismiss button.
        /// </summary>
        public void OnDismissButtonPressed()
        {
            DismissSpotlight();

            // Notify board (which will broadcast if host)
            if (board != null)
            {
                board.DismissSpotlight();
            }
        }
    }
}











