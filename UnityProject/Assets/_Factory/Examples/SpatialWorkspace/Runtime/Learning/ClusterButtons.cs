using UnityEngine;
using System.Collections.Generic;
using System.Linq;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// ClusterButtons: One-tap clusters for grouping related thoughts.
    /// "Questions", "Examples", "Attempts", "Uncertainty", "All"
    /// Deterministic cluster ordering.
    /// </summary>
    public class ClusterButtons : MonoBehaviour
    {
        [Header("Cluster Settings")]
        [SerializeField] private Vector3 buttonPosition = new Vector3(0f, -1.5f, 0f);

        [Header("References")]
        [SerializeField] private SpatialLearningBoard board;
        [SerializeField] private GameObject clusterButtonPrefab;
        [SerializeField] private LearningBoardTuning tuning;

        private List<ClusterButton> buttons = new List<ClusterButton>();
        private string currentCluster = "All";

        public enum ClusterType
        {
            All,
            Questions,
            Examples,
            Attempts,
            Uncertainty,
            Hints,
            Reflections
        }

        private void Awake()
        {
            if (board == null)
            {
                board = GetComponent<SpatialLearningBoard>();
            }

            // Get tuning from board if not assigned
            if (tuning == null && board != null)
            {
                tuning = board.GetTuning();
            }

            CreateClusterButtons();
        }

        /// <summary>
        /// Creates cluster buttons in space.
        /// </summary>
        private void CreateClusterButtons()
        {
            var clusterTypes = new[]
            {
                ClusterType.All,
                ClusterType.Questions,
                ClusterType.Examples,
                ClusterType.Attempts,
                ClusterType.Uncertainty
            };

            float buttonSpacing = tuning != null ? tuning.clusterButtonSpacing : 0.4f;
            float totalWidth = (clusterTypes.Length - 1) * buttonSpacing;
            float startX = -totalWidth * 0.5f;

            for (int i = 0; i < clusterTypes.Length; i++)
            {
                var buttonObj = new GameObject($"ClusterButton_{clusterTypes[i]}");
                buttonObj.transform.SetParent(transform);
                buttonObj.transform.localPosition = buttonPosition + new Vector3(startX + (i * buttonSpacing), 0f, 0f);

                var button = buttonObj.AddComponent<ClusterButton>();
                button.Initialize(clusterTypes[i], this);

                buttons.Add(button);
            }
        }

        /// <summary>
        /// Called when a cluster button is pressed.
        /// </summary>
        public void OnClusterSelected(ClusterType clusterType)
        {
            currentCluster = clusterType.ToString();
            
            if (board != null)
            {
                board.FilterByCluster(clusterType);

                // Record event
                var recorder = board.GetComponent<BoardSessionRecorder>();
                if (recorder != null && recorder.IsRecording())
                {
                    recorder.RecordClusterChanged(currentCluster);
                }
            }

            // Update button states
            foreach (var button in buttons)
            {
                button.SetSelected(button.GetClusterType() == clusterType);
            }
        }

        /// <summary>
        /// Gets the current cluster filter.
        /// </summary>
        public string GetCurrentCluster()
        {
            return currentCluster;
        }

        /// <summary>
        /// Gets the current cluster ID (for presence/recording).
        /// </summary>
        public string GetCurrentClusterId()
        {
            return currentCluster;
        }
    }

    /// <summary>
    /// Individual cluster button component.
    /// </summary>
    public class ClusterButton : MonoBehaviour
    {
        private ClusterButtons.ClusterType clusterType;
        private ClusterButtons parent;
        private bool isSelected = false;
        private Renderer buttonRenderer;
        private MaterialPropertyBlock propertyBlock;

        public void Initialize(ClusterButtons.ClusterType type, ClusterButtons parentComponent)
        {
            clusterType = type;
            parent = parentComponent;
            propertyBlock = new MaterialPropertyBlock();

            // Create simple button visual
            var buttonObj = GameObject.CreatePrimitive(PrimitiveType.Cube);
            buttonObj.transform.SetParent(transform);
            buttonObj.transform.localPosition = Vector3.zero;
            buttonObj.transform.localScale = new Vector3(0.3f, 0.1f, 0.05f);
            buttonObj.name = "ButtonVisual";

            buttonRenderer = buttonObj.GetComponent<Renderer>();
            UpdateVisualState();

            // Add collider for interaction
            var collider = buttonObj.GetComponent<Collider>();
            if (collider == null)
            {
                collider = buttonObj.AddComponent<BoxCollider>();
            }

            // Set button name for identification
            gameObject.name = $"ClusterButton_{type}";
        }

        /// <summary>
        /// Called when button is pressed (via pointer events).
        /// </summary>
        public void OnButtonPressed()
        {
            if (parent != null)
            {
                parent.OnClusterSelected(clusterType);
            }
        }

        /// <summary>
        /// Sets the selected state of the button.
        /// </summary>
        public void SetSelected(bool selected)
        {
            isSelected = selected;
            UpdateVisualState();
        }

        /// <summary>
        /// Updates visual state based on selection.
        /// </summary>
        private void UpdateVisualState()
        {
            if (buttonRenderer != null)
            {
                buttonRenderer.GetPropertyBlock(propertyBlock);
                propertyBlock.SetColor("_Color", isSelected ? Color.cyan : Color.gray);
                buttonRenderer.SetPropertyBlock(propertyBlock);
            }
        }

        /// <summary>
        /// Gets the cluster type of this button.
        /// </summary>
        public ClusterButtons.ClusterType GetClusterType()
        {
            return clusterType;
        }
    }
}

