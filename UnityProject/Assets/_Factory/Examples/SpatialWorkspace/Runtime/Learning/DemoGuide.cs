using UnityEngine;
using TMPro;
using System.Collections;
using System.Collections.Generic;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// DemoGuide: 5-step guided tour for the learning board.
    /// Each step completes via existing events (card selected, filter changed, pin toggled, prompt shown).
    /// </summary>
    public class DemoGuide : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private SpatialLearningBoard board;
        [SerializeField] private TextMeshPro guideText;
        [SerializeField] private GameObject restartButton;

        [Header("Settings")]
        [SerializeField] private float stepDelay = 0.5f; // Delay before showing next step

        private int currentStep = 0;
        private bool isActive = false;
        private Dictionary<int, bool> stepCompleted = new Dictionary<int, bool>();

        /// <summary>
        /// Gets the current step index (for presence/recording).
        /// </summary>
        public int GetCurrentStepIndex()
        {
            return currentStep;
        }

        private string[] stepMessages = new[]
        {
            "Look at a card and pinch",
            "You're in Focus Mode — pinch again to exit",
            "Tap 'Questions' cluster",
            "Pin one card",
            "Explain it back"
        };

        private void Awake()
        {
            if (board == null)
            {
                board = GetComponent<SpatialLearningBoard>();
            }

            if (guideText == null)
            {
                guideText = GetComponentInChildren<TextMeshPro>();
            }

            // Subscribe to events
            ThoughtCard.OnThoughtCardSelected += OnCardSelected;
            if (board != null)
            {
                // Subscribe to cluster filter changes (via board)
                // Note: We'll check cluster state in Update
            }

            // Hide by default
            if (guideText != null)
            {
                guideText.gameObject.SetActive(false);
            }

            if (restartButton != null)
            {
                restartButton.SetActive(false);
            }
        }

        private void OnDestroy()
        {
            ThoughtCard.OnThoughtCardSelected -= OnCardSelected;
        }

        /// <summary>
        /// Starts the demo guide.
        /// </summary>
        public void StartDemo()
        {
            // Check showtime mode (should be in Demo mode)
            if (board != null)
            {
                var showtime = board.GetComponent<ShowtimeController>();
                if (showtime != null && showtime.GetCurrentState().Mode != ShowtimeMode.Demo)
                {
                    Debug.LogWarning("DemoGuide should only start in Demo mode. Entering Demo mode now.");
                    showtime.EnterShowtime(ShowtimeMode.Demo);
                }
            }

            isActive = true;
            currentStep = 0;
            stepCompleted.Clear();

            if (guideText != null)
            {
                guideText.gameObject.SetActive(true);
            }

            ShowStep(0);
        }

        /// <summary>
        /// Stops the demo guide.
        /// </summary>
        public void StopDemo()
        {
            isActive = false;
            if (guideText != null)
            {
                guideText.gameObject.SetActive(false);
            }
            if (restartButton != null)
            {
                restartButton.SetActive(false);
            }
        }

        /// <summary>
        /// Restarts the demo guide.
        /// </summary>
        public void RestartDemo()
        {
            StopDemo();
            StartCoroutine(RestartAfterDelay());
        }

        private IEnumerator RestartAfterDelay()
        {
            yield return new WaitForSeconds(stepDelay);
            StartDemo();
        }

        /// <summary>
        /// Shows a step message.
        /// </summary>
        private void ShowStep(int stepIndex)
        {
            if (stepIndex < 0 || stepIndex >= stepMessages.Length) return;

            if (guideText != null)
            {
                guideText.text = stepMessages[stepIndex];
            }

            currentStep = stepIndex;

            // Record demo step advanced
            if (board != null)
            {
                var recorder = board.GetComponent<BoardSessionRecorder>();
                if (recorder != null && recorder.IsRecording())
                {
                    recorder.RecordDemoStepAdvanced(stepIndex);
                }
            }
        }

        /// <summary>
        /// Called when a card is selected.
        /// </summary>
        private void OnCardSelected(ThoughtObjectDto obj)
        {
            if (!isActive) return;

            // Step 0: Look at a card and pinch
            if (currentStep == 0 && !stepCompleted.ContainsKey(0))
            {
                stepCompleted[0] = true;
                StartCoroutine(AdvanceToNextStep());
            }
            // Step 1: Pinch again to exit (check if in focus mode)
            else if (currentStep == 1 && !stepCompleted.ContainsKey(1))
            {
                if (board != null)
                {
                    var focusMode = board.GetComponent<FocusMode>();
                    if (focusMode != null && focusMode.IsInFocusMode())
                    {
                        // Second tap on same card exits focus
                        stepCompleted[1] = true;
                        StartCoroutine(AdvanceToNextStep());
                    }
                }
            }
            // Step 3: Pin one card
            else if (currentStep == 3 && !stepCompleted.ContainsKey(3))
            {
                // Check if card is pinned (this happens after pin toggle)
                if (board != null)
                {
                    var pinnedIds = board.GetPinnedIds();
                    if (pinnedIds.Contains(obj.id))
                    {
                        stepCompleted[3] = true;
                        StartCoroutine(AdvanceToNextStep());
                    }
                }
            }
        }

        private void Update()
        {
            if (!isActive) return;

            // Step 2: Tap 'Questions' cluster
            if (currentStep == 2 && !stepCompleted.ContainsKey(2))
            {
                if (board != null)
                {
                    var clusterButtons = board.GetComponent<ClusterButtons>();
                    if (clusterButtons != null)
                    {
                        string currentCluster = clusterButtons.GetCurrentCluster();
                        if (currentCluster == "Questions" || currentCluster == ClusterButtons.ClusterType.Questions.ToString())
                        {
                            stepCompleted[2] = true;
                            StartCoroutine(AdvanceToNextStep());
                        }
                    }
                }
            }

            // Step 4: Explain it back (check if prompt is shown)
            if (currentStep == 4 && !stepCompleted.ContainsKey(4))
            {
                var explainBack = FindObjectOfType<ExplainBackPrompt>();
                if (explainBack != null && explainBack.IsShowing())
                {
                    stepCompleted[4] = true;
                    StartCoroutine(CompleteDemo());
                }
            }
        }

        /// <summary>
        /// Advances to the next step.
        /// </summary>
        private IEnumerator AdvanceToNextStep()
        {
            yield return new WaitForSeconds(stepDelay);
            int nextStep = currentStep + 1;
            if (nextStep < stepMessages.Length)
            {
                ShowStep(nextStep);
            }
            else
            {
                CompleteDemo();
            }
        }

        /// <summary>
        /// Completes the demo.
        /// </summary>
        private IEnumerator CompleteDemo()
        {
            if (guideText != null)
            {
                guideText.text = "Demo complete! You've learned the basics.";
            }

            yield return new WaitForSeconds(2f);

            if (restartButton != null)
            {
                restartButton.SetActive(true);
            }

            isActive = false;
        }

        /// <summary>
        /// Called by restart button.
        /// </summary>
        public void OnRestartButtonPressed()
        {
            RestartDemo();
        }
    }
}

