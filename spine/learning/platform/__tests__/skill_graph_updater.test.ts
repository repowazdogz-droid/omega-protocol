/**
 * Skill Graph Updater Tests
 * 
 * Tests for determinism, guardrails, and contract compliance.
 * Per Contract 72: no labeling, no diagnosis, deterministic updates.
 * 
 * Version: 0.1
 */

import { describe, it, expect } from "@jest/globals";
import {
  LearnerProfile,
  LearningSessionObservation,
  AgeBand
} from "../LearnerTypes";
import {
  CognitiveSkillGraph,
  CognitiveSkillId,
  createEmptySkillGraph
} from "../SkillGraphTypes";
import {
  applyObservations,
  SkillGraphUpdateResult
} from "../SkillGraphUpdater";

/**
 * Helper to create a test learner profile
 */
function createTestProfile(
  ageBand: AgeBand = AgeBand.ADULT,
  minor: boolean = false
): LearnerProfile {
  return {
    learnerId: "test-learner-1",
    ageBand,
    safety: {
      minor,
      institutionMode: false
    }
  };
}

/**
 * Helper to create a test observation
 */
function createTestObservation(
  type: LearningSessionObservation["type"],
  strength: number = 0.8,
  skillHint?: string
): LearningSessionObservation {
  return {
    type,
    timestamp: new Date().toISOString(),
    strength,
    sessionId: "test-session-1",
    skillHint
  };
}

describe("SkillGraphUpdater", () => {
  describe("Determinism", () => {
    it("should produce identical outputs for identical inputs", () => {
      const profile = createTestProfile();
      const graph1 = createEmptySkillGraph("test-learner-1");
      const graph2 = createEmptySkillGraph("test-learner-1");
      
      const observations: LearningSessionObservation[] = [
        createTestObservation("StatedUncertainty", 0.8),
        createTestObservation("ProvidedEvidence", 0.9),
        createTestObservation("CorrectedSelf", 0.7)
      ];
      
      const result1 = applyObservations(profile, graph1, observations);
      const result2 = applyObservations(profile, graph2, observations);
      
      // Check that skill states are identical
      expect(result1.graph.skills.size).toBe(result2.graph.skills.size);
      
      result1.graph.skills.forEach((state1, skillId) => {
        const state2 = result2.graph.skills.get(skillId);
        expect(state2).toBeDefined();
        expect(state1.exposures).toBe(state2!.exposures);
        expect(state1.confidenceBand).toBe(state2!.confidenceBand);
        expect(state1.recentSignals.length).toBe(state2!.recentSignals.length);
      });
      
      // Check that audit entries are identical
      expect(result1.audit.length).toBe(result2.audit.length);
      result1.audit.forEach((entry1, index) => {
        const entry2 = result2.audit[index];
        expect(entry1.skillId).toBe(entry2.skillId);
        expect(entry1.action).toBe(entry2.action);
        expect(entry1.newState.exposures).toBe(entry2.newState.exposures);
        expect(entry1.newState.confidenceBand).toBe(entry2.newState.confidenceBand);
      });
    });
    
    it("should produce same result when called multiple times with same inputs", () => {
      const profile = createTestProfile();
      const graph = createEmptySkillGraph("test-learner-1");
      
      const observations: LearningSessionObservation[] = [
        createTestObservation("StatedUncertainty", 0.8)
      ];
      
      const result1 = applyObservations(profile, graph, observations);
      const result2 = applyObservations(profile, graph, observations);
      
      // Should produce identical results
      expect(result1.graph.skills.get(CognitiveSkillId.UncertaintyHandling)?.exposures)
        .toBe(result2.graph.skills.get(CognitiveSkillId.UncertaintyHandling)?.exposures);
    });
  });
  
  describe("Guardrails - No Labeling", () => {
    it("should not create labels like 'smart', 'dumb', 'gifted', 'struggling'", () => {
      const profile = createTestProfile();
      const graph = createEmptySkillGraph("test-learner-1");
      
      const observations: LearningSessionObservation[] = [
        createTestObservation("StatedUncertainty", 0.8),
        createTestObservation("ProvidedEvidence", 0.9)
      ];
      
      const result = applyObservations(profile, graph, observations);
      
      // Check audit entries don't contain prohibited labels
      const auditText = JSON.stringify(result.audit);
      const prohibitedLabels = ["smart", "dumb", "gifted", "struggling", "lazy", "bad student"];
      
      prohibitedLabels.forEach(label => {
        expect(auditText.toLowerCase()).not.toContain(label.toLowerCase());
      });
      
      // Check that skill states don't contain labels
      graph.skills.forEach((state) => {
        const stateText = JSON.stringify(state);
        prohibitedLabels.forEach(label => {
          expect(stateText.toLowerCase()).not.toContain(label.toLowerCase());
        });
      });
    });
    
    it("should not create personality judgments", () => {
      const profile = createTestProfile();
      const graph = createEmptySkillGraph("test-learner-1");
      
      const observations: LearningSessionObservation[] = [
        createTestObservation("CorrectedSelf", 0.7)
      ];
      
      const result = applyObservations(profile, graph, observations);
      
      // Check audit doesn't contain personality judgments
      const auditText = JSON.stringify(result.audit);
      const prohibitedJudgments = ["lazy", "unmotivated", "careless", "inattentive"];
      
      prohibitedJudgments.forEach(judgment => {
        expect(auditText.toLowerCase()).not.toContain(judgment.toLowerCase());
      });
    });
  });
  
  describe("Guardrails - No Diagnosis", () => {
    it("should not diagnose learning disabilities or conditions", () => {
      const profile = createTestProfile();
      const graph = createEmptySkillGraph("test-learner-1");
      
      const observations: LearningSessionObservation[] = [
        createTestObservation("StatedUncertainty", 0.8),
        createTestObservation("CorrectedSelf", 0.7)
      ];
      
      const result = applyObservations(profile, graph, observations);
      
      // Check audit doesn't contain diagnostic terms
      const auditText = JSON.stringify(result.audit);
      const diagnosticTerms = [
        "adhd", "autism", "dyslexia", "dyscalculia",
        "learning disability", "disorder", "condition",
        "deficit", "impairment"
      ];
      
      diagnosticTerms.forEach(term => {
        expect(auditText.toLowerCase()).not.toContain(term.toLowerCase());
      });
    });
  });
  
  describe("Bounded State", () => {
    it("should clamp recentSignals array to MAX_RECENT_SIGNALS", () => {
      const profile = createTestProfile();
      const graph = createEmptySkillGraph("test-learner-1");
      
      // Create more observations than MAX_RECENT_SIGNALS (20)
      const observations: LearningSessionObservation[] = [];
      for (let i = 0; i < 25; i++) {
        observations.push(createTestObservation("StatedUncertainty", 0.8));
      }
      
      const result = applyObservations(profile, graph, observations);
      const state = result.graph.skills.get(CognitiveSkillId.UncertaintyHandling);
      
      expect(state).toBeDefined();
      expect(state!.recentSignals.length).toBeLessThanOrEqual(20);
      expect(state!.exposures).toBe(25); // Exposures should still increment
    });
  });
  
  describe("Confidence Band Computation", () => {
    it("should start with Low confidence for new skills", () => {
      const profile = createTestProfile();
      const graph = createEmptySkillGraph("test-learner-1");
      
      const state = graph.skills.get(CognitiveSkillId.UncertaintyHandling);
      expect(state?.confidenceBand).toBe("Low");
    });
    
    it("should upgrade to Medium confidence with sufficient exposures and signals", () => {
      const profile = createTestProfile();
      const graph = createEmptySkillGraph("test-learner-1");
      
      // Add 5 observations (exposures >= 3, signal density >= 0.5)
      const observations: LearningSessionObservation[] = [];
      for (let i = 0; i < 5; i++) {
        observations.push(createTestObservation("StatedUncertainty", 0.8));
      }
      
      const result = applyObservations(profile, graph, observations);
      const state = result.graph.skills.get(CognitiveSkillId.UncertaintyHandling);
      
      expect(state?.confidenceBand).toBe("Medium");
      expect(state?.exposures).toBe(5);
    });
    
    it("should upgrade to High confidence with many exposures and high signal density", () => {
      const profile = createTestProfile();
      const graph = createEmptySkillGraph("test-learner-1");
      
      // Add 15 observations (exposures >= 10, signal density >= 0.7)
      const observations: LearningSessionObservation[] = [];
      for (let i = 0; i < 15; i++) {
        observations.push(createTestObservation("StatedUncertainty", 0.8));
      }
      
      const result = applyObservations(profile, graph, observations);
      const state = result.graph.skills.get(CognitiveSkillId.UncertaintyHandling);
      
      expect(state?.confidenceBand).toBe("High");
      expect(state?.exposures).toBe(15);
    });
  });
  
  describe("Age Band Restrictions", () => {
    it("should persist fewer signals for younger learners (6-9)", () => {
      const profile = createTestProfile(AgeBand.SIX_TO_NINE, true);
      const graph = createEmptySkillGraph("test-learner-1");
      
      const observations: LearningSessionObservation[] = [
        createTestObservation("StatedUncertainty", 0.3), // Low strength, should be filtered
        createTestObservation("ProvidedEvidence", 0.6), // High strength, should persist
        createTestObservation("CorrectedSelf", 0.4) // Low strength, should be filtered
      ];
      
      const result = applyObservations(profile, graph, observations);
      
      // Only the high-strength observation should persist
      const uncertaintyState = result.graph.skills.get(CognitiveSkillId.UncertaintyHandling);
      const evidenceState = result.graph.skills.get(CognitiveSkillId.EvidenceUse);
      const errorState = result.graph.skills.get(CognitiveSkillId.ErrorCorrection);
      
      expect(uncertaintyState?.exposures).toBe(0); // Filtered out
      expect(evidenceState?.exposures).toBe(1); // Persisted
      expect(errorState?.exposures).toBe(0); // Filtered out
    });
    
    it("should persist all signals for adult learners", () => {
      const profile = createTestProfile(AgeBand.ADULT, false);
      const graph = createEmptySkillGraph("test-learner-1");
      
      const observations: LearningSessionObservation[] = [
        createTestObservation("StatedUncertainty", 0.3), // Low strength, but should persist for adults
        createTestObservation("ProvidedEvidence", 0.6)
      ];
      
      const result = applyObservations(profile, graph, observations);
      
      const uncertaintyState = result.graph.skills.get(CognitiveSkillId.UncertaintyHandling);
      const evidenceState = result.graph.skills.get(CognitiveSkillId.EvidenceUse);
      
      expect(uncertaintyState?.exposures).toBe(1); // Persisted for adults
      expect(evidenceState?.exposures).toBe(1); // Persisted
    });
  });
  
  describe("Audit Trail", () => {
    it("should create audit entries explaining all updates", () => {
      const profile = createTestProfile();
      const graph = createEmptySkillGraph("test-learner-1");
      
      const observations: LearningSessionObservation[] = [
        createTestObservation("StatedUncertainty", 0.8)
      ];
      
      const result = applyObservations(profile, graph, observations);
      
      expect(result.audit.length).toBeGreaterThan(0);
      
      const auditEntry = result.audit[0];
      expect(auditEntry.skillId).toBe(CognitiveSkillId.UncertaintyHandling);
      expect(auditEntry.action).toContain("Added signal");
      expect(auditEntry.reason).toBeDefined();
      expect(auditEntry.previousState).toBeDefined();
      expect(auditEntry.newState).toBeDefined();
    });
    
    it("should explain confidence band changes in audit", () => {
      const profile = createTestProfile();
      const graph = createEmptySkillGraph("test-learner-1");
      
      // Add enough observations to trigger confidence band upgrade
      const observations: LearningSessionObservation[] = [];
      for (let i = 0; i < 5; i++) {
        observations.push(createTestObservation("StatedUncertainty", 0.8));
      }
      
      const result = applyObservations(profile, graph, observations);
      
      // Find audit entry for confidence band change
      const bandChangeEntry = result.audit.find(
        entry => entry.action.includes("Updated confidence band")
      );
      
      expect(bandChangeEntry).toBeDefined();
      expect(bandChangeEntry?.reason).toContain("Confidence band changed");
    });
  });
  
  describe("No Scores or Grades", () => {
    it("should not produce scores, grades, or ranks", () => {
      const profile = createTestProfile();
      const graph = createEmptySkillGraph("test-learner-1");
      
      const observations: LearningSessionObservation[] = [
        createTestObservation("StatedUncertainty", 0.8),
        createTestObservation("ProvidedEvidence", 0.9)
      ];
      
      const result = applyObservations(profile, graph, observations);
      
      // Check that no scores, grades, or ranks exist
      const resultText = JSON.stringify(result);
      const prohibitedTerms = ["score", "grade", "rank", "percentile", "iq"];
      
      prohibitedTerms.forEach(term => {
        expect(resultText.toLowerCase()).not.toContain(term.toLowerCase());
      });
      
      // Verify skill states don't contain scores
      result.graph.skills.forEach((state) => {
        const stateText = JSON.stringify(state);
        expect(stateText).not.toContain("score");
        expect(stateText).not.toContain("grade");
        expect(stateText).not.toContain("rank");
      });
    });
  });
});



