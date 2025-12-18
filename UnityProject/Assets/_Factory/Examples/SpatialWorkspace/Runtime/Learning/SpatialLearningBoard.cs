using System.Collections.Generic;
using UnityEngine;
using System.Linq;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// Spatial Learning Board Renderer.
    /// Accepts a list of ThoughtObjectDto and layouts them in 3D space.
    /// Supports arc/grid layout, pinning, uncertainty visualization.
    /// Deterministic ordering by id.
    /// </summary>
    public class SpatialLearningBoard : MonoBehaviour
    {
        [Header("Layout Settings")]
        [SerializeField] private LayoutMode layoutMode = LayoutMode.Arc;

        [Header("Tuning")]
        [SerializeField] private LearningBoardTuning tuning;

        [Header("Prefabs")]
        [SerializeField] private GameObject thoughtCardPrefab;

        [Header("Pinning")]
        [SerializeField] private Transform pinnedContainer;
        [SerializeField] private GameObject pinnedLabel; // Optional "PINNED" label

        [Header("Toast")]
        [SerializeField] private ThoughtBoardToast toast;

        [Header("Focus Mode")]
        [SerializeField] private FocusMode focusMode;

        [Header("Clusters")]
        [SerializeField] private ClusterButtons clusterButtons;

        [Header("Explain Back")]
        [SerializeField] private ExplainBackPrompt explainBackPrompt;

        [Header("Demo Guide")]
        [SerializeField] private DemoGuide demoGuide;

        [Header("Session Log")]
        [SerializeField] private BoardSessionRecorder recorder;
        [SerializeField] private BoardSessionReplayer replayer;

        [Header("Presence")]
        [SerializeField] private bool enablePresence = false;
        [SerializeField] private bool isHost = false;
        [SerializeField] private PresenceBroadcaster broadcaster;
        [SerializeField] private PresenceReceiver receiver;

        [Header("Spotlight")]
        [SerializeField] private SpotlightOverlay spotlight;

        [Header("Showtime & Stability")]
        [SerializeField] private ShowtimeController showtimeController;
        [SerializeField] private StabilityGuard stabilityGuard;
        [SerializeField] private BoardDiagnosticsOverlay diagnostics;

        private List<ThoughtCard> activeCards = new List<ThoughtCard>();
        private List<ThoughtCard> pinnedCards = new List<ThoughtCard>();
        private Dictionary<string, ThoughtCard> cardLookup = new Dictionary<string, ThoughtCard>();
        private List<string> pinnedIds = new List<string>();
        private List<string> customOrderIds = new List<string>();
        private ClusterButtons.ClusterType currentCluster = ClusterButtons.ClusterType.All;
        private List<ThoughtCard> filteredCards = new List<ThoughtCard>();

        public enum LayoutMode
        {
            Arc,
            Grid
        }

        private void Awake()
        {
            // Create pinned container if not assigned
            if (pinnedContainer == null)
            {
                var pinnedObj = new GameObject("PinnedCards");
                pinnedObj.transform.SetParent(transform);
                pinnedObj.transform.localPosition = Vector3.zero;
                pinnedContainer = pinnedObj.transform;
            }

            // Create pinned label if not assigned
            if (pinnedLabel == null)
            {
                var labelObj = new GameObject("PinnedLabel");
                labelObj.transform.SetParent(pinnedContainer);
                labelObj.transform.localPosition = new Vector3(0f, pinnedShelfHeight + 0.3f, 0f);
                labelObj.transform.localRotation = Quaternion.identity;
                // Label would be created with TextMeshPro component in actual setup
                pinnedLabel = labelObj;
            }

            // Find toast if not assigned
            if (toast == null)
            {
                toast = FindObjectOfType<ThoughtBoardToast>();
            }

            // Find or create focus mode
            if (focusMode == null)
            {
                focusMode = GetComponent<FocusMode>();
                if (focusMode == null)
                {
                    focusMode = gameObject.AddComponent<FocusMode>();
                }
            }

            // Find or create cluster buttons
            if (clusterButtons == null)
            {
                clusterButtons = GetComponent<ClusterButtons>();
                if (clusterButtons == null)
                {
                    clusterButtons = gameObject.AddComponent<ClusterButtons>();
                }
            }

            // Find explain-back prompt
            if (explainBackPrompt == null)
            {
                explainBackPrompt = FindObjectOfType<ExplainBackPrompt>();
            }

            // Find or create demo guide
            if (demoGuide == null)
            {
                demoGuide = GetComponent<DemoGuide>();
                if (demoGuide == null)
                {
                    demoGuide = gameObject.AddComponent<DemoGuide>();
                }
            }

            // Find or create recorder
            if (recorder == null)
            {
                recorder = GetComponent<BoardSessionRecorder>();
                if (recorder == null)
                {
                    recorder = gameObject.AddComponent<BoardSessionRecorder>();
                }
            }

            // Find or create replayer
            if (replayer == null)
            {
                replayer = GetComponent<BoardSessionReplayer>();
                if (replayer == null)
                {
                    replayer = gameObject.AddComponent<BoardSessionReplayer>();
                }
            }

            // Find or create spotlight
            if (spotlight == null)
            {
                spotlight = GetComponent<SpotlightOverlay>();
                if (spotlight == null)
                {
                    spotlight = gameObject.AddComponent<SpotlightOverlay>();
                }
            }

            // Find or create showtime controller
            if (showtimeController == null)
            {
                showtimeController = GetComponent<ShowtimeController>();
                if (showtimeController == null)
                {
                    showtimeController = gameObject.AddComponent<ShowtimeController>();
                }
            }

            // Find or create stability guard
            if (stabilityGuard == null)
            {
                stabilityGuard = GetComponent<StabilityGuard>();
                if (stabilityGuard == null)
                {
                    stabilityGuard = gameObject.AddComponent<StabilityGuard>();
                }
            }

            // Find or create diagnostics overlay
            if (diagnostics == null)
            {
                diagnostics = GetComponent<BoardDiagnosticsOverlay>();
                if (diagnostics == null)
                {
                    diagnostics = gameObject.AddComponent<BoardDiagnosticsOverlay>();
                }
            }

            // Clamp tuning values for safety
            if (tuning != null)
            {
                ComfortClamp.ClampTuning(tuning);
            }

            // Setup presence (if enabled) - but respect showtime
            // Presence should be entered via ShowtimeController.EnterShowtime(ShowtimeMode.Presence)
            // This auto-setup is for backward compatibility
            if (enablePresence && (showtimeController == null || showtimeController.GetCurrentState().Mode == ShowtimeMode.Off))
            {
                // Auto-enter Presence mode if enabled
                if (showtimeController != null)
                {
                    showtimeController.EnterShowtime(ShowtimeMode.Presence);
                }
                else
                {
                    // Fallback: setup directly (not recommended)
                    if (isHost)
                    {
                        if (broadcaster == null)
                        {
                            broadcaster = GetComponent<PresenceBroadcaster>();
                            if (broadcaster == null)
                            {
                                broadcaster = gameObject.AddComponent<PresenceBroadcaster>();
                            }
                        }
                        broadcaster.StartBroadcasting();
                    }
                    else
                    {
                        if (receiver == null)
                        {
                            receiver = GetComponent<PresenceReceiver>();
                            if (receiver == null)
                            {
                                receiver = gameObject.AddComponent<PresenceReceiver>();
                            }
                        }
                        receiver.StartReceiving();
                    }
                }
            }

            // Subscribe to card selection events
            ThoughtCard.OnThoughtCardSelected += HandleCardSelected;

            // Load saved state
            LoadSavedState();
        }

        private void OnDestroy()
        {
            ThoughtCard.OnThoughtCardSelected -= HandleCardSelected;
        }

        /// <summary>
        /// Updates the board with a new list of ThoughtObjects.
        /// Deterministic: same object list → same layout.
        /// Applies saved state (pins + custom order) after baseline sort.
        /// </summary>
        public void UpdateBoard(ThoughtObjectDto[] thoughtObjects)
        {
            if (thoughtObjects == null || thoughtObjects.Length == 0)
            {
                ClearBoard();
                return;
            }

            // Sort deterministically by id (baseline)
            var sortedObjects = thoughtObjects.OrderBy(obj => obj.id).ToArray();

            // Remove cards that are no longer in the list
            var currentIds = new HashSet<string>(sortedObjects.Select(obj => obj.id));
            var cardsToRemove = activeCards.Where(card => !currentIds.Contains(card.GetData().id)).ToList();
            foreach (var card in cardsToRemove)
            {
                RemoveCard(card);
            }

            // Update or create cards
            for (int i = 0; i < sortedObjects.Length; i++)
            {
                var obj = sortedObjects[i];
                if (cardLookup.ContainsKey(obj.id))
                {
                    // Update existing card
                    cardLookup[obj.id].Initialize(obj);
                }
                else
                {
                    // Create new card
                    CreateCard(obj, i);
                }
            }

            // Apply saved state (pins + custom order) - will be applied after cards are created
            // State is already loaded in Awake()

            // Apply saved state (pins + custom order) after cards are created
            if (pinnedIds.Count > 0 || customOrderIds.Count > 0)
            {
                ApplySavedState(pinnedIds, customOrderIds);
            }

            // Update layout
            UpdateLayout();
        }

        /// <summary>
        /// Applies saved state (pins + custom order).
        /// </summary>
        public void ApplySavedState(List<string> savedPinnedIds, List<string> savedCustomOrderIds)
        {
            // Update pinned cards
            pinnedIds = savedPinnedIds.Where(id => cardLookup.ContainsKey(id)).ToList();
            foreach (var card in activeCards)
            {
                var cardId = card.GetData().id;
                bool shouldBePinned = pinnedIds.Contains(cardId);
                bool isCurrentlyPinned = pinnedCards.Contains(card);

                if (shouldBePinned && !isCurrentlyPinned)
                {
                    PinCard(card, false); // Don't show toast on load
                }
                else if (!shouldBePinned && isCurrentlyPinned)
                {
                    UnpinCard(card, false); // Don't show toast on load
                }
            }

            // Update custom order
            customOrderIds = savedCustomOrderIds.Where(id => cardLookup.ContainsKey(id)).ToList();
        }

        /// <summary>
        /// Creates a new ThoughtCard for the given ThoughtObject.
        /// </summary>
        private void CreateCard(ThoughtObjectDto obj, int index)
        {
            if (thoughtCardPrefab == null)
            {
                Debug.LogError("ThoughtCard prefab not assigned!");
                return;
            }

            var cardObj = Instantiate(thoughtCardPrefab, transform);
            cardObj.name = $"ThoughtCard_{obj.type}_{obj.id}";

            var card = cardObj.GetComponent<ThoughtCard>();
            if (card == null)
            {
                card = cardObj.AddComponent<ThoughtCard>();
            }

            card.Initialize(obj, tuning);
            activeCards.Add(card);
            cardLookup[obj.id] = card;
        }

        /// <summary>
        /// Removes a card from the board.
        /// </summary>
        private void RemoveCard(ThoughtCard card)
        {
            var data = card.GetData();
            activeCards.Remove(card);
            cardLookup.Remove(data.id);
            Destroy(card.gameObject);
        }

        /// <summary>
        /// Filters cards by cluster type.
        /// </summary>
        public void FilterByCluster(ClusterButtons.ClusterType clusterType)
        {
            currentCluster = clusterType;
            UpdateLayout();
        }

        /// <summary>
        /// Gets all cards (for FocusMode).
        /// </summary>
        public List<ThoughtCard> GetAllCards()
        {
            return new List<ThoughtCard>(activeCards);
        }

        /// <summary>
        /// Updates the layout of all cards based on current layout mode.
        /// Uses custom order if available, otherwise sorts by id.
        /// Applies cluster filter (hides cards that don't match).
        /// </summary>
        private void UpdateLayout()
        {
            // Filter out pinned cards from layout
            var cardsToLayout = activeCards.Where(card => !pinnedCards.Contains(card)).ToList();

            // Apply cluster filter (hide cards that don't match)
            if (currentCluster != ClusterButtons.ClusterType.All)
            {
                var filtered = FilterByClusterType(cardsToLayout, currentCluster);
                // Hide cards that don't match the filter
                foreach (var card in cardsToLayout)
                {
                    bool shouldShow = filtered.Contains(card);
                    card.gameObject.SetActive(shouldShow);
                }
                cardsToLayout = filtered;
            }
            else
            {
                // Show all cards
                foreach (var card in cardsToLayout)
                {
                    card.gameObject.SetActive(true);
                }
            }

            // Apply custom order if available
            if (customOrderIds.Count > 0)
            {
                var orderedCards = new List<ThoughtCard>();
                var unorderedCards = new List<ThoughtCard>();

                // Add cards in custom order
                foreach (var id in customOrderIds)
                {
                    if (cardLookup.ContainsKey(id) && !pinnedCards.Contains(cardLookup[id]))
                    {
                        orderedCards.Add(cardLookup[id]);
                    }
                }

                // Add any remaining cards
                foreach (var card in cardsToLayout)
                {
                    if (!orderedCards.Contains(card))
                    {
                        unorderedCards.Add(card);
                    }
                }

                cardsToLayout = orderedCards.Concat(unorderedCards).ToList();
            }
            else
            {
                // Default: sort by id
                cardsToLayout = cardsToLayout.OrderBy(card => card.GetData().id).ToList();
            }

            if (layoutMode == LayoutMode.Arc)
            {
                LayoutArc(cardsToLayout);
            }
            else
            {
                LayoutGrid(cardsToLayout);
            }

            // Store filtered cards for reference
            filteredCards = cardsToLayout;
        }

        /// <summary>
        /// Filters cards by cluster type (deterministic).
        /// </summary>
        private List<ThoughtCard> FilterByClusterType(List<ThoughtCard> cards, ClusterButtons.ClusterType clusterType)
        {
            switch (clusterType)
            {
                case ClusterButtons.ClusterType.Questions:
                    return cards.Where(c => c.GetData().type == "Question").ToList();
                case ClusterButtons.ClusterType.Examples:
                    return cards.Where(c => c.GetData().type == "Example").ToList();
                case ClusterButtons.ClusterType.Attempts:
                    return cards.Where(c => c.GetData().type == "LearnerAttempt").ToList();
                case ClusterButtons.ClusterType.Uncertainty:
                    return cards.Where(c => c.GetData().type == "Uncertainty" || c.GetData().IsUncertain()).ToList();
                case ClusterButtons.ClusterType.Hints:
                    return cards.Where(c => c.GetData().type == "TutorHint").ToList();
                case ClusterButtons.ClusterType.Reflections:
                    return cards.Where(c => c.GetData().type == "Reflection").ToList();
                default:
                    return cards;
            }
        }

        /// <summary>
        /// Layouts cards in an arc.
        /// </summary>
        private void LayoutArc(List<ThoughtCard> cards)
        {
            if (cards.Count == 0) return;

            float arcRadius = tuning != null ? tuning.arcRadius : 2f;
            float arcAngle = tuning != null ? tuning.arcAngle : 90f;

            float angleStep = arcAngle / Mathf.Max(1, cards.Count - 1);
            float startAngle = -arcAngle / 2f;

            for (int i = 0; i < cards.Count; i++)
            {
                float angle = startAngle + (angleStep * i);
                float rad = angle * Mathf.Deg2Rad;

                Vector3 position = new Vector3(
                    Mathf.Sin(rad) * arcRadius,
                    0f,
                    Mathf.Cos(rad) * arcRadius
                );

                cards[i].transform.localPosition = position;
                cards[i].transform.LookAt(transform.position);
            }
        }

        /// <summary>
        /// Layouts cards in a grid.
        /// </summary>
        private void LayoutGrid(List<ThoughtCard> cards)
        {
            if (cards.Count == 0) return;

            int gridColumns = tuning != null ? tuning.gridColumns : 3;
            float gridSpacing = tuning != null ? tuning.gridSpacing : 0.4f;

            int row = 0;
            int col = 0;

            for (int i = 0; i < cards.Count; i++)
            {
                Vector3 position = new Vector3(
                    (col - (gridColumns - 1) * 0.5f) * gridSpacing,
                    -row * gridSpacing,
                    0f
                );

                cards[i].transform.localPosition = position;
                cards[i].transform.rotation = Quaternion.identity;

                col++;
                if (col >= gridColumns)
                {
                    col = 0;
                    row++;
                }
            }
        }

        /// <summary>
        /// Handles card selection event (for focus mode + explain-back).
        /// </summary>
        private void HandleCardSelected(ThoughtObjectDto obj)
        {
            if (cardLookup.ContainsKey(obj.id))
            {
                var card = cardLookup[obj.id];

                // Record event
                if (recorder != null && recorder.IsRecording())
                {
                    recorder.OnCardSelected(obj);
                }

                // If in focus mode and same card, exit focus
                if (focusMode != null && focusMode.IsInFocusMode() && focusMode.GetFocusedCard() == card)
                {
                    ExitFocus();
                    if (explainBackPrompt != null)
                    {
                        explainBackPrompt.HidePrompt();
                    }
                }
                else
                {
                    // Exit any existing focus first
                    if (focusMode != null && focusMode.IsInFocusMode())
                    {
                        ExitFocus();
                    }

                    // Enter focus mode for new card
                    EnterFocus(obj.id);

                    // Show explain-back prompt
                    if (explainBackPrompt != null)
                    {
                        explainBackPrompt.ShowPrompt(obj);
                    }

                    // Record explain-back shown
                    if (recorder != null && recorder.IsRecording())
                    {
                        recorder.RecordExplainBackShown(obj.id);
                    }
                }
            }
        }

        /// <summary>
        /// Toggles pin state of a card.
        /// </summary>
        public void TogglePin(ThoughtCard card, bool showToast = true)
        {
            if (pinnedCards.Contains(card))
            {
                UnpinCard(card, showToast);
            }
            else
            {
                PinCard(card, showToast);
            }
        }

        /// <summary>
        /// Pins a card to the shelf.
        /// </summary>
        private void PinCard(ThoughtCard card, bool showToast)
        {
            int maxPinnedCards = tuning != null ? tuning.maxPinnedCards : 5;
            if (pinnedCards.Count >= maxPinnedCards)
            {
                return; // At limit
            }

            pinnedCards.Add(card);
            var cardId = card.GetData().id;
            if (!pinnedIds.Contains(cardId))
            {
                pinnedIds.Add(cardId);
            }

            card.transform.SetParent(pinnedContainer);
            UpdatePinnedShelfLayout();

            if (showToast && toast != null)
            {
                toast.ShowPinned();
            }

            // Record event
            if (recorder != null && recorder.IsRecording())
            {
                recorder.RecordPinToggled(cardId, true);
            }

            SaveBoardState();
            UpdateLayout();
        }

        /// <summary>
        /// Unpins a card from the shelf.
        /// </summary>
        private void UnpinCard(ThoughtCard card, bool showToast)
        {
            pinnedCards.Remove(card);
            var cardId = card.GetData().id;
            pinnedIds.Remove(cardId);

            card.transform.SetParent(transform);
            UpdatePinnedShelfLayout();

            if (showToast && toast != null)
            {
                toast.ShowUnpinned();
            }

            // Record event
            if (recorder != null && recorder.IsRecording())
            {
                recorder.RecordPinToggled(cardId, false);
            }

            SaveBoardState();
            UpdateLayout();
        }

        /// <summary>
        /// Updates the pinned shelf layout (curved row above board).
        /// </summary>
        private void UpdatePinnedShelfLayout()
        {
            if (pinnedCards.Count == 0) return;

            float pinnedShelfHeight = tuning != null ? tuning.pinnedShelfHeight : 1.5f;
            float pinnedShelfCurve = tuning != null ? tuning.pinnedShelfCurve : 0.2f;
            float pinnedShelfSpacing = tuning != null ? tuning.pinnedShelfSpacing : 0.35f;

            float totalWidth = (pinnedCards.Count - 1) * pinnedShelfSpacing;
            float startX = -totalWidth * 0.5f;

            for (int i = 0; i < pinnedCards.Count; i++)
            {
                float x = startX + (i * pinnedShelfSpacing);
                // Add slight curve (parabolic) - cards in center are slightly higher
                float centerOffset = (i - (pinnedCards.Count - 1) * 0.5f);
                float curveOffset = pinnedShelfCurve * centerOffset * centerOffset;
                float y = pinnedShelfHeight + curveOffset;

                pinnedCards[i].transform.localPosition = new Vector3(x, y, 0f);
                pinnedCards[i].transform.localRotation = Quaternion.identity;
            }
        }

        /// <summary>
        /// Sets the layout mode.
        /// </summary>
        public void SetLayoutMode(LayoutMode mode)
        {
            layoutMode = mode;
        }

        /// <summary>
        /// Gets the current layout mode.
        /// </summary>
        public LayoutMode GetLayoutMode()
        {
            return layoutMode;
        }

        /// <summary>
        /// Saves board state to disk.
        /// </summary>
        private void SaveBoardState()
        {
            BoardPersistence.SaveBoardState(pinnedIds, customOrderIds, layoutMode);
        }

        /// <summary>
        /// Loads saved board state from disk.
        /// </summary>
        private void LoadSavedState()
        {
            var savedState = BoardPersistence.LoadBoardState();
            if (savedState != null)
            {
                pinnedIds = new List<string>(savedState.pinnedIds);
                customOrderIds = new List<string>(savedState.customOrderIds);
                
                // Apply layout mode
                try
                {
                    if (System.Enum.TryParse<LayoutMode>(savedState.layoutMode, out var mode))
                    {
                        layoutMode = mode;
                    }
                }
                catch
                {
                    // Ignore parse errors
                }
            }
        }

        /// <summary>
        /// Gets current pinned card IDs (for persistence).
        /// </summary>
        public List<string> GetPinnedIds()
        {
            return new List<string>(pinnedIds);
        }

        /// <summary>
        /// Gets current custom order IDs (for persistence).
        /// </summary>
        public List<string> GetCustomOrderIds()
        {
            return new List<string>(customOrderIds);
        }

        /// <summary>
        /// Updates custom order (for future drag-and-drop reordering).
        /// </summary>
        public void SetCustomOrder(List<string> orderedIds)
        {
            customOrderIds = orderedIds.Where(id => cardLookup.ContainsKey(id)).ToList();
            SaveBoardState();
            UpdateLayout();
        }

        /// <summary>
        /// Clears all cards from the board.
        /// </summary>
        public void ClearBoard()
        {
            foreach (var card in activeCards)
            {
                if (card != null)
                {
                    Destroy(card.gameObject);
                }
            }
            activeCards.Clear();
            pinnedCards.Clear();
            cardLookup.Clear();
        }

        /// <summary>
        /// Gets the number of active cards.
        /// </summary>
        public int GetCardCount()
        {
            return activeCards.Count;
        }

        // ========== Public API for Recorder/Replayer/Presence ==========

        /// <summary>
        /// Gets a card by thought ID.
        /// </summary>
        public ThoughtCard GetCardById(string thoughtId)
        {
            if (string.IsNullOrEmpty(thoughtId) || !cardLookup.ContainsKey(thoughtId))
            {
                return null;
            }
            return cardLookup[thoughtId];
        }

        /// <summary>
        /// Selects a card by ID (public API for replay).
        /// </summary>
        public void SelectCardById(string thoughtId)
        {
            // Showtime check
            if (showtimeController != null && !showtimeController.IsActionAllowed("select"))
            {
                return; // Not allowed in current mode
            }

            // Stability check
            if (stabilityGuard != null && !stabilityGuard.CanProcess("select"))
            {
                return; // Debounced or locked
            }

            if (cardLookup.ContainsKey(thoughtId))
            {
                var card = cardLookup[thoughtId];
                var data = card.GetData();
                
                if (stabilityGuard != null)
                {
                    stabilityGuard.RecordAction("select");
                }

                HandleCardSelected(data);
            }
        }

        /// <summary>
        /// Sets cluster filter (public API for replay).
        /// </summary>
        public void SetCluster(string clusterId)
        {
            // Showtime check
            if (showtimeController != null && !showtimeController.IsActionAllowed("cluster"))
            {
                return; // Not allowed in current mode
            }

            // Stability check
            if (stabilityGuard != null && !stabilityGuard.CanProcess("cluster"))
            {
                return; // Debounced or locked
            }

            if (clusterButtons != null)
            {
                if (System.Enum.TryParse<ClusterButtons.ClusterType>(clusterId, out var clusterType))
                {
                    if (stabilityGuard != null)
                    {
                        stabilityGuard.RecordAction("cluster");
                    }

                    clusterButtons.OnClusterSelected(clusterType);
                }
            }
        }

        /// <summary>
        /// Sets pinned state for a card (public API for replay).
        /// </summary>
        public void SetPinned(string thoughtId, bool isPinned)
        {
            // Showtime check
            if (showtimeController != null && !showtimeController.IsActionAllowed("pin"))
            {
                return; // Not allowed in current mode
            }

            // Stability check
            if (stabilityGuard != null && !stabilityGuard.CanProcess("pin"))
            {
                return; // Debounced or locked
            }

            if (cardLookup.ContainsKey(thoughtId))
            {
                var card = cardLookup[thoughtId];
                bool currentlyPinned = pinnedCards.Contains(card);

                if (isPinned && !currentlyPinned)
                {
                    if (stabilityGuard != null)
                    {
                        stabilityGuard.RecordAction("pin");
                    }

                    PinCard(card, false); // Don't show toast on replay
                }
                else if (!isPinned && currentlyPinned)
                {
                    if (stabilityGuard != null)
                    {
                        stabilityGuard.RecordAction("pin");
                    }

                    UnpinCard(card, false); // Don't show toast on replay
                }
            }
        }

        /// <summary>
        /// Toggles pinned state (helper).
        /// </summary>
        public void TogglePinned(string thoughtId)
        {
            // Showtime check
            if (showtimeController != null && !showtimeController.IsActionAllowed("pin"))
            {
                return; // Not allowed in current mode
            }

            // Stability check
            if (stabilityGuard != null && !stabilityGuard.CanProcess("togglepin"))
            {
                return; // Debounced or locked
            }

            if (cardLookup.ContainsKey(thoughtId))
            {
                var card = cardLookup[thoughtId];
                bool isPinned = pinnedCards.Contains(card);

                if (stabilityGuard != null)
                {
                    stabilityGuard.RecordAction("togglepin");
                }

                SetPinned(thoughtId, !isPinned);
            }
        }

        /// <summary>
        /// Shows explain-back for a card (public API for replay).
        /// </summary>
        public void ShowExplainBackFor(string thoughtId)
        {
            // Showtime check
            if (showtimeController != null && !showtimeController.IsActionAllowed("explainback"))
            {
                return; // Not allowed in current mode
            }

            // Stability check
            if (stabilityGuard != null && !stabilityGuard.CanProcess("explainback"))
            {
                return; // Debounced or locked
            }

            if (cardLookup.ContainsKey(thoughtId) && explainBackPrompt != null)
            {
                var card = cardLookup[thoughtId];
                var data = card.GetData();

                if (stabilityGuard != null)
                {
                    stabilityGuard.RecordAction("explainback");
                }

                explainBackPrompt.ShowPrompt(data);
            }
        }

        /// <summary>
        /// Enters focus mode for a card (public API for replay).
        /// </summary>
        public void EnterFocus(string thoughtId)
        {
            // Showtime check
            if (showtimeController != null && !showtimeController.IsActionAllowed("select"))
            {
                return; // Not allowed in current mode
            }

            // Stability check
            if (stabilityGuard != null && !stabilityGuard.CanProcess("enterfocus"))
            {
                return; // Debounced or locked
            }

            if (cardLookup.ContainsKey(thoughtId) && focusMode != null)
            {
                var card = cardLookup[thoughtId];

                if (stabilityGuard != null)
                {
                    stabilityGuard.RecordAction("enterfocus");
                    stabilityGuard.RecordAnimationStart(); // Lock during animation
                }

                focusMode.EnterFocusMode(card);
            }
        }

        /// <summary>
        /// Exits focus mode (public API for replay).
        /// </summary>
        public void ExitFocus()
        {
            // Showtime check (exit is usually allowed)
            // Stability check
            if (stabilityGuard != null && !stabilityGuard.CanProcess("exitfocus"))
            {
                return; // Debounced or locked
            }

            if (focusMode != null)
            {
                if (stabilityGuard != null)
                {
                    stabilityGuard.RecordAction("exitfocus");
                    stabilityGuard.RecordAnimationStart(); // Lock during animation
                }

                focusMode.ExitFocusMode();
            }
        }

        /// <summary>
        /// Shows spotlight on a card (public API for replay/presence).
        /// </summary>
        public void ShowSpotlight(string thoughtId)
        {
            // Showtime check
            if (showtimeController != null && !showtimeController.IsActionAllowed("spotlight"))
            {
                return; // Not allowed in current mode
            }

            // Stability check
            if (stabilityGuard != null && !stabilityGuard.CanProcess("spotlight"))
            {
                return; // Debounced or locked
            }

            if (spotlight != null)
            {
                if (stabilityGuard != null)
                {
                    stabilityGuard.RecordAction("spotlight");
                }

                spotlight.ShowSpotlight(thoughtId);
            }

            // Record if recording
            if (recorder != null && recorder.IsRecording())
            {
                recorder.RecordSpotlightShown(thoughtId);
            }
        }

        /// <summary>
        /// Dismisses spotlight (public API for replay/presence).
        /// Learner always retains exit control.
        /// </summary>
        public void DismissSpotlight()
        {
            // Dismissal is always allowed (learner control)
            // No showtime check for dismissal

            // Stability check (light)
            if (stabilityGuard != null && !stabilityGuard.CanProcess("dismissspotlight"))
            {
                return; // Debounced or locked
            }

            if (spotlight != null)
            {
                if (stabilityGuard != null)
                {
                    stabilityGuard.RecordAction("dismissspotlight");
                }

                spotlight.DismissSpotlight();
            }

            // Record if recording
            if (recorder != null && recorder.IsRecording())
            {
                recorder.RecordSpotlightDismissed();
            }

            // Broadcast if host
            if (enablePresence && isHost && broadcaster != null)
            {
                // State will be broadcast on next update
            }
        }

        /// <summary>
        /// Gets current presence state (for broadcasting).
        /// </summary>
        public PresenceStateDto GetCurrentPresenceState()
        {
            string sessionId = recorder != null ? recorder.GetSessionId() : "default";
            var state = PresenceStateDto.CreateDefault(sessionId);

            // Get focused card
            if (focusMode != null && focusMode.IsInFocusMode())
            {
                var focusedCard = focusMode.GetFocusedCard();
                if (focusedCard != null)
                {
                    var data = focusedCard.GetData();
                    if (data != null)
                    {
                        state.focusedThoughtId = data.id;
                    }
                }
            }

            // Get cluster
            if (clusterButtons != null)
            {
                state.clusterId = clusterButtons.GetCurrentCluster();
            }

            // Get pinned IDs
            state.pinnedIds = pinnedIds.ToArray();

            // Get demo step
            if (demoGuide != null)
            {
                state.demoStepIndex = demoGuide.GetCurrentStepIndex();
            }

            // Get spotlight
            if (spotlight != null && spotlight.IsActive())
            {
                state.spotlightThoughtId = spotlight.GetSpotlightedThoughtId();
            }

            state.updatedAtMs = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

            return state;
        }

        /// <summary>
        /// Applies presence state (client-side, from network).
        /// </summary>
        public void ApplyPresenceState(PresenceStateDto state)
        {
            if (state == null) return;

            // Apply focus
            if (!string.IsNullOrEmpty(state.focusedThoughtId))
            {
                EnterFocus(state.focusedThoughtId);
            }
            else
            {
                ExitFocus();
            }

            // Apply cluster
            if (!string.IsNullOrEmpty(state.clusterId))
            {
                SetCluster(state.clusterId);
            }

            // Apply pins
            if (state.pinnedIds != null)
            {
                // Unpin all first
                var currentPinned = new List<string>(pinnedIds);
                foreach (var id in currentPinned)
                {
                    if (!System.Array.Exists(state.pinnedIds, x => x == id))
                    {
                        SetPinned(id, false);
                    }
                }

                // Pin new ones
                foreach (var id in state.pinnedIds)
                {
                    if (!pinnedIds.Contains(id))
                    {
                        SetPinned(id, true);
                    }
                }
            }

            // Apply spotlight (but allow local dismissal)
            // Host authoritative, but learner can dismiss locally
            if (!string.IsNullOrEmpty(state.spotlightThoughtId))
            {
                if (spotlight == null || !spotlight.IsActive() || spotlight.GetSpotlightedThoughtId() != state.spotlightThoughtId)
                {
                    // Only apply if showtime allows
                    if (showtimeController == null || showtimeController.IsActionAllowed("spotlight"))
                    {
                        ShowSpotlight(state.spotlightThoughtId);
                    }
                }
            }
            else
            {
                if (spotlight != null && spotlight.IsActive())
                {
                    // Only dismiss if it matches (don't dismiss if user dismissed locally)
                    // This allows learner to override
                }
            }
        }

        /// <summary>
        /// Gets the showtime controller (for external access).
        /// </summary>
        public ShowtimeController GetShowtimeController()
        {
            return showtimeController;
        }

        /// <summary>
        /// Gets the stability guard (for external access).
        /// </summary>
        public StabilityGuard GetStabilityGuard()
        {
            return stabilityGuard;
        }

        /// <summary>
        /// Gets the layout mode (for export).
        /// </summary>
        public LayoutMode GetLayoutMode()
        {
            return layoutMode;
        }

        /// <summary>
        /// Gets all thought objects from the board (for export).
        /// </summary>
        public List<ThoughtObjectDto> GetAllThoughtObjects()
        {
            var objects = new List<ThoughtObjectDto>();
            foreach (var card in activeCards)
            {
                if (card != null)
                {
                    var data = card.GetData();
                    if (data != null)
                    {
                        objects.Add(data);
                    }
                }
            }
            return objects;
        }

        /// <summary>
        /// Exports a learning bundle.
        /// Returns the export path, or null if failed.
        /// </summary>
        public string ExportBundle()
        {
            var writer = GetComponent<LearningBundleWriter>();
            if (writer == null)
            {
                writer = gameObject.AddComponent<LearningBundleWriter>();
            }

            // Ensure recorder has saved
            if (recorder != null && recorder.IsRecording())
            {
                recorder.StopRecording();
                recorder.Save();
            }

            return writer.WriteBundle();
        }

        // ========== Highlight Reel API ==========

        /// <summary>
        /// Generates a highlight reel from the current session log.
        /// </summary>
        public HighlightReelDto GenerateHighlightReel(int targetSeconds = 45)
        {
            var recorder = GetComponent<BoardSessionRecorder>();
            if (recorder == null)
            {
                Debug.LogWarning("No recorder found. Cannot generate highlight reel.");
                return null;
            }

            var sessionLog = recorder.Load();
            if (sessionLog == null)
            {
                Debug.LogWarning("No session log found. Record a session first.");
                return null;
            }

            return HighlightMomentPicker.GenerateReel(sessionLog, tuning, targetSeconds);
        }

        /// <summary>
        /// Plays a highlight reel.
        /// </summary>
        public void PlayHighlightReel(HighlightReelDto reel)
        {
            var controller = GetComponent<CinematicReplayController>();
            if (controller == null)
            {
                controller = gameObject.AddComponent<CinematicReplayController>();
            }

            controller.PlayReel(reel);
        }

        /// <summary>
        /// Exports a highlight reel to the bundle folder.
        /// </summary>
        public string ExportHighlightReel(HighlightReelDto reel)
        {
            if (reel == null)
            {
                Debug.LogError("Cannot export null reel");
                return null;
            }

            string sessionId = reel.sessionId;
            if (string.IsNullOrEmpty(sessionId))
            {
                var recorder = GetComponent<BoardSessionRecorder>();
                if (recorder != null)
                {
                    sessionId = recorder.GetSessionId();
                }
            }

            if (string.IsNullOrEmpty(sessionId))
            {
                Debug.LogError("Cannot export reel: no session ID");
                return null;
            }

            return HighlightReelWriter.WriteReel(reel, sessionId);
        }

        // ========== Demo Bootstrap API ==========

        /// <summary>
        /// Starts demo from bootstrap configuration.
        /// </summary>
        public void StartDemoFromBootstrap(BootstrapDto bootstrap)
        {
            if (bootstrap == null)
            {
                Debug.LogError("Cannot start demo: bootstrap is null");
                return;
            }

            // Enter Demo mode (XR-06 Showtime)
            if (showtimeController != null)
            {
                showtimeController.EnterShowtime(ShowtimeMode.Demo);
            }

            // Configure reduce-motion if requested
            // Note: LearningBoardTuning is a ScriptableObject, so we can't modify it directly
            // Instead, we'll respect it when generating highlights and during playback
            // The tuning asset's reduceMotion setting is read-only at runtime

            // Configure ThoughtObjectFeed HTTP mode if URL provided
            var feed = GetComponent<ThoughtObjectFeed>();
            if (feed != null && !string.IsNullOrEmpty(bootstrap.thoughtObjectsEndpointUrl))
            {
                feed.SetFeedMode(ThoughtObjectFeed.FeedMode.Http);
                feed.SetHttpConfig(bootstrap.thoughtObjectsEndpointUrl, bootstrap.learnerId);
            }

            // Start demo guide (if available)
            var demoGuide = GetComponent<DemoGuide>();
            if (demoGuide != null)
            {
                demoGuide.StartDemo();
            }

            // Store bootstrap for export bridge
            PlayerPrefs.SetString("demo:bootstrap", JsonUtility.ToJson(bootstrap));
            PlayerPrefs.SetString("demo:recapUrl", bootstrap.recapUrl);

            Debug.Log($"Demo started from bootstrap: sessionId={bootstrap.sessionId}");
        }

        /// <summary>
        /// Event: Export completed (for DemoExportBridge).
        /// </summary>
        public static event System.Action<string, string> OnExportCompleted;

        /// <summary>
        /// Internal: Notifies export completion.
        /// </summary>
        public void NotifyExportCompleted(string exportPath, string sessionId)
        {
            OnExportCompleted?.Invoke(exportPath, sessionId);
        }

        // ========== Bootstrap API (for Pairing) ==========

        /// <summary>
        /// Applies bootstrap configuration (for pairing).
        /// </summary>
        public void ApplyBootstrap(
            string sessionId,
            string learnerId,
            string thoughtObjectsUrl,
            bool reduceMotion,
            string showtimeMode
        )
        {
            if (string.IsNullOrEmpty(sessionId) || string.IsNullOrEmpty(learnerId))
            {
                Debug.LogError("Cannot apply bootstrap: sessionId or learnerId is null");
                return;
            }

            // Enter showtime mode
            if (showtimeController != null)
            {
                ShowtimeMode mode = ShowtimeMode.Solo;
                try
                {
                    mode = (ShowtimeMode)System.Enum.Parse(typeof(ShowtimeMode), showtimeMode, true);
                }
                catch
                {
                    // Default to Solo if parsing fails
                    mode = ShowtimeMode.Solo;
                }
                showtimeController.EnterShowtime(mode);
            }

            // Configure ThoughtObjectFeed HTTP mode
            var feed = GetComponent<ThoughtObjectFeed>();
            if (feed != null && !string.IsNullOrEmpty(thoughtObjectsUrl))
            {
                feed.SetFeedMode(ThoughtObjectFeed.FeedMode.Http);
                feed.SetHttpConfig(thoughtObjectsUrl, learnerId);
            }

            // Store sessionId for recorder/replayer/export
            var recorder = GetComponent<BoardSessionRecorder>();
            if (recorder != null)
            {
                // Recorder would need a method to set sessionId
                // For now, we'll store it in PlayerPrefs
                PlayerPrefs.SetString("pairing:sessionId", sessionId);
            }

            // Store reduce-motion preference (used by highlight generation, etc.)
            PlayerPrefs.SetInt("pairing:reduceMotion", reduceMotion ? 1 : 0);

            Debug.Log($"Bootstrap applied: sessionId={sessionId}, learnerId={learnerId}, mode={showtimeMode}");
        }

        /// <summary>
        /// Event: Export bundle completed (fires when XR-07 export succeeds).
        /// </summary>
        public static event System.Action<string /*sessionId*/> OnExportBundleCompleted;

        /// <summary>
        /// Internal: Notifies export bundle completion.
        /// </summary>
        public void NotifyExportBundleCompleted(string sessionId)
        {
            OnExportBundleCompleted?.Invoke(sessionId);
        }

        // ========== QR Pairing Entry Points ==========

        /// <summary>
        /// Pairs from QR payload (called from QR scan).
        /// </summary>
        public void PairFromQrPayload(string qrText)
        {
            var parseResult = QrPairingPayload.Parse(qrText);
            if (!parseResult.Success)
            {
                Debug.LogError($"Failed to parse QR payload: {parseResult.Error}");
                return;
            }

            var pairingClient = GetComponent<PairingClient>();
            if (pairingClient == null)
            {
                Debug.LogError("PairingClient not found");
                return;
            }

            // Update base URL if provided
            if (!string.IsNullOrEmpty(parseResult.BaseUrl))
            {
                pairingClient.SetBaseUrl($"{parseResult.BaseUrl}/api/learning/pair");
            }

            // Pair with code
            pairingClient.PairWithCode(parseResult.PairCode);
        }

        // ========== Status Overlay Integration ==========

        private BoardStatusOverlay statusOverlay;

        /// <summary>
        /// Initializes and wires up status overlay.
        /// </summary>
        private void InitializeStatusOverlay()
        {
            if (statusOverlay == null)
            {
                statusOverlay = GetComponent<BoardStatusOverlay>();
                if (statusOverlay == null)
                {
                    statusOverlay = gameObject.AddComponent<BoardStatusOverlay>();
                }
            }

            if (statusOverlay != null && tuning != null)
            {
                statusOverlay.SetTuning(tuning);
            }
        }

        /// <summary>
        /// Updates status overlay based on current state.
        /// </summary>
        public void UpdateStatusOverlay()
        {
            if (statusOverlay == null)
            {
                InitializeStatusOverlay();
            }

            if (statusOverlay == null) return;

            // Get current state
            var feed = GetComponent<ThoughtObjectFeed>();
            var pairingClient = GetComponent<PairingClient>();
            var showtime = showtimeController != null ? showtimeController.GetCurrentState() : null;

            // Build status message
            string statusMessage = "";
            string hintMessage = "";
            string primaryAction = null;
            string secondaryAction = null;

            // Check pairing status
            if (pairingClient != null)
            {
                bool isPaired = pairingClient.IsPaired();
                string error = pairingClient.GetLastError();
                bool isOffline = feed != null && feed.IsOfflineFallbackActive();
                statusMessage = BoardCopy.GetPairingStatus(isPaired, isOffline, error);
            }

            // Check showtime mode
            if (showtime != null && showtime.Mode != ShowtimeMode.Off)
            {
                string modeMsg = BoardCopy.GetShowtimeMessage(showtime.Mode.ToString());
                if (!string.IsNullOrEmpty(modeMsg))
                {
                    statusMessage = string.IsNullOrEmpty(statusMessage) ? modeMsg : $"{statusMessage} | {modeMsg}";
                }
            }

            // Check feed status
            if (feed != null)
            {
                if (feed.IsOfflineFallbackActive())
                {
                    statusMessage = BoardCopy.OFFLINE_SHOWING_LAST;
                }
                else if (!string.IsNullOrEmpty(feed.GetLastError()))
                {
                    statusMessage = BoardCopy.BOARD_ERROR;
                    primaryAction = BoardCopy.ERROR_RETRY;
                }
            }

            // Get next action hint
            var boardState = new BoardState
            {
                cardCount = GetCardCount(),
                selectedCardId = GetSelectedCardId(),
                pinnedCount = GetPinnedIds()?.Count ?? 0,
                currentClusterId = GetCurrentClusterId(),
                hasDoneExplainBack = HasDoneExplainBack(),
                hasExported = HasExported()
            };
            hintMessage = NextActionHint.GetSuggestion(boardState);

            // Show overlay
            statusOverlay.ShowStatus(
                statusMessage,
                hintMessage,
                primaryAction,
                () => { /* Retry action */ },
                secondaryAction,
                null
            );
        }

        // Placeholder methods (would be implemented based on actual board state)
        private string GetSelectedCardId() { return null; }
        private string GetCurrentClusterId() { return "All"; }
        private bool HasDoneExplainBack() { return false; }
        private bool HasExported() { return false; }

        // ========== Showcase API ==========

        [Header("Showcase")]
        [SerializeField] private bool enableShowcase = true;
        [SerializeField] private ShowcaseRunner showcaseRunner;
        [SerializeField] private ShowcaseOverlay showcaseOverlay;
        [SerializeField] private ShowcasePanel showcasePanel;

        /// <summary>
        /// Starts showcase with default reel.
        /// </summary>
        public void StartShowcase(int durationSeconds = 75)
        {
            if (!enableShowcase)
            {
                Debug.LogWarning("Showcase is disabled");
                return;
            }

            if (showcaseRunner == null)
            {
                showcaseRunner = GetComponent<ShowcaseRunner>();
                if (showcaseRunner == null)
                {
                    showcaseRunner = gameObject.AddComponent<ShowcaseRunner>();
                }
            }

            var reel = ShowcaseReel.CreateDefault();
            reel.targetDurationSeconds = durationSeconds;
            showcaseRunner.StartShowcase(reel);
        }

        /// <summary>
        /// Stops showcase.
        /// </summary>
        public void StopShowcase()
        {
            if (showcaseRunner != null)
            {
                showcaseRunner.StopShowcase();
            }
        }

        /// <summary>
        /// Gets current presence state (for HTTP pusher).
        /// </summary>
        public PresenceStateDto GetCurrentPresenceState()
        {
            var recorder = GetComponent<BoardSessionRecorder>();
            string sessionId = recorder != null ? recorder.GetSessionId() : "";

            var pinnedList = GetPinnedIds();
            string[] pinnedArray = pinnedList != null ? pinnedList.ToArray() : new string[0];

            return new PresenceStateDto
            {
                sessionId = sessionId,
                focusedThoughtId = GetSelectedCardId(),
                clusterId = GetCurrentClusterId(),
                pinnedIds = pinnedArray,
                spotlightThoughtId = GetCurrentSpotlightId(),
                updatedAtMs = (long)(System.DateTime.UtcNow - new System.DateTime(1970, 1, 1)).TotalMilliseconds
            };
        }

        // Placeholder methods for presence state
        private string GetCurrentSpotlightId() { return null; }
    }
}


