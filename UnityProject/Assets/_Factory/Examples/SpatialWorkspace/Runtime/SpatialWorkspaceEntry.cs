using UnityEngine;
using Omega.SpatialWorkspace.Learning;

namespace Omega.SpatialWorkspace
{
    /// <summary>
    /// SpatialWorkspaceEntry: Main entry point for the SpatialWorkspace example.
    /// Hooks up the Learning Board system.
    /// </summary>
    public class SpatialWorkspaceEntry : MonoBehaviour
    {
        [Header("Learning Board")]
        [SerializeField] private GameObject spatialLearningBoardPrefab;
        [SerializeField] private ThoughtObjectFeed thoughtObjectFeed;

        private SpatialLearningBoard learningBoard;
        private ThoughtObjectFeed feed;

        private void Start()
        {
            InitializeLearningBoard();
        }

        /// <summary>
        /// Initializes the Learning Board system.
        /// </summary>
        private void InitializeLearningBoard()
        {
            // Instantiate Learning Board if prefab is assigned
            if (spatialLearningBoardPrefab != null)
            {
                var boardObj = Instantiate(spatialLearningBoardPrefab, transform);
                boardObj.name = "SpatialLearningBoard";
                learningBoard = boardObj.GetComponent<SpatialLearningBoard>();
                
                if (learningBoard == null)
                {
                    Debug.LogWarning("SpatialLearningBoard component not found on prefab");
                }
            }

            // Set up ThoughtObjectFeed
            if (thoughtObjectFeed != null)
            {
                feed = thoughtObjectFeed;
            }
            else
            {
                // Try to find existing feed
                feed = FindObjectOfType<ThoughtObjectFeed>();
                if (feed == null)
                {
                    // Create feed component
                    var feedObj = new GameObject("ThoughtObjectFeed");
                    feedObj.transform.SetParent(transform);
                    feed = feedObj.AddComponent<ThoughtObjectFeed>();
                }
            }

            // Ensure feed has reference to board
            if (feed != null && learningBoard != null)
            {
                feed.Board = learningBoard;
            }
        }

        /// <summary>
        /// Manually loads the Learning Board (for testing/hotkeys).
        /// </summary>
        [ContextMenu("Load Learning Board")]
        public void LoadLearningBoard()
        {
            if (learningBoard == null)
            {
                InitializeLearningBoard();
            }

            // Trigger feed to load
            if (feed != null)
            {
                feed.LoadDemo();
            }
        }

        private void Update()
        {
            // Hotkey for testing: Press L to load board
            #if UNITY_EDITOR
            if (Input.GetKeyDown(KeyCode.L))
            {
                LoadLearningBoard();
            }
            #endif
        }
    }
}

