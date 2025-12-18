/**
 * Turn Planner Tests
 * 
 * Tests for determinism, no answer dumping, age band gating, and bounded history.
 * Per Contract 69: Socratic Dialogue Protocol.
 * 
 * Version: 0.1
 */

import { describe, it, expect } from "@jest/globals";
import {
  createDialogueState,
  planNextTurn
} from "../TurnPlanner";
import {
  TutorMode,
  ScaffoldStep,
  RefusalReason,
  ContextFlags
} from "../DialogTypes";
import { AgeBand } from "../../LearnerTypes";

/**
 * Helper to create a test learner profile
 */
function createTestProfile(
  ageBand: AgeBand = AgeBand.ADULT,
  minor: boolean = false
) {
  return {
    learnerId: "test-learner-1",
    ageBand,
    safety: {
      minor,
      institutionMode: false
    }
  };
}

describe("TurnPlanner", () => {
  describe("Determinism", () => {
    it("should produce identical outputs for identical inputs", () => {
      const state1 = createDialogueState(
        "session-1",
        createTestProfile(),
        TutorMode.Socratic,
        "fractions",
        "understand how to add fractions"
      );
      
      const state2 = createDialogueState(
        "session-1",
        createTestProfile(),
        TutorMode.Socratic,
        "fractions",
        "understand how to add fractions"
      );
      
      const result1 = planNextTurn(state1);
      const result2 = planNextTurn(state2);
      
      expect(result1.plan.message).toBe(result2.plan.message);
      expect(result1.plan.questions).toEqual(result2.plan.questions);
      expect(result1.plan.scaffoldStep).toBe(result2.plan.scaffoldStep);
      expect(result1.plan.shouldRefuse).toBe(result2.plan.shouldRefuse);
    });
    
    it("should produce same result when called multiple times with same state", () => {
      const state = createDialogueState(
        "session-1",
        createTestProfile(),
        TutorMode.Socratic,
        "fractions",
        "understand how to add fractions"
      );
      
      const result1 = planNextTurn(state);
      const result2 = planNextTurn(state);
      
      expect(result1.plan.message).toBe(result2.plan.message);
      expect(result1.plan.scaffoldStep).toBe(result2.plan.scaffoldStep);
    });
  });
  
  describe("No Answer Dumping", () => {
    it("should not reveal solution at ClarifyGoal step", () => {
      const state = createDialogueState(
        "session-1",
        createTestProfile(),
        TutorMode.Socratic,
        "fractions",
        "understand how to add fractions"
      );
      
      const result = planNextTurn(state);
      
      expect(result.plan.scaffoldStep).not.toBe(ScaffoldStep.RevealMinimalSolution);
      expect(result.plan.message.toLowerCase()).not.toContain("solution");
      expect(result.plan.message.toLowerCase()).not.toContain("answer");
    });
    
    it("should not reveal solution without learner attempt", () => {
      const state = createDialogueState(
        "session-1",
        createTestProfile(),
        TutorMode.Socratic,
        "fractions",
        "understand how to add fractions"
      );
      
      state.currentStep = ScaffoldStep.AskForAttempt;
      state.hasMadeAttempt = false;
      
      // Learner requests solution without attempting
      const result = planNextTurn(state, "just tell me the answer");
      
      expect(result.plan.scaffoldStep).not.toBe(ScaffoldStep.RevealMinimalSolution);
      expect(result.plan.shouldRefuse).toBe(false);
      // Should offer hint instead
      expect(result.plan.actions.some(a => a.type === "offer_hint")).toBe(true);
    });
    
    it("should require attempt before revealing solution", () => {
      const state = createDialogueState(
        "session-1",
        createTestProfile(),
        TutorMode.Socratic,
        "fractions",
        "understand how to add fractions"
      );
      
      state.currentStep = ScaffoldStep.OfferHint;
      state.hasMadeAttempt = true;
      state.hintsOffered = 1;
      
      // Learner requests solution after attempt and hint
      const result = planNextTurn(state, "i've tried, can you tell me the solution?");
      
      // Should be able to reveal solution now
      expect(result.plan.scaffoldStep).toBe(ScaffoldStep.RevealMinimalSolution);
    });
    
    it("should require hint or counterexample before revealing solution", () => {
      const state = createDialogueState(
        "session-1",
        createTestProfile(),
        TutorMode.Socratic,
        "fractions",
        "understand how to add fractions"
      );
      
      state.currentStep = ScaffoldStep.AskForReasoning;
      state.hasMadeAttempt = true;
      state.hintsOffered = 0;
      state.counterexamplesOffered = 0;
      
      // Learner requests solution without hint/counterexample
      const result = planNextTurn(state, "tell me the answer");
      
      // Should offer hint first, not reveal solution
      expect(result.plan.scaffoldStep).toBe(ScaffoldStep.OfferHint);
      expect(result.plan.actions.some(a => a.type === "offer_hint")).toBe(true);
    });
  });
  
  describe("Age Band Guardrails", () => {
    it("should block Examiner mode for ages 6-9 without teacher", () => {
      const state = createDialogueState(
        "session-1",
        createTestProfile(AgeBand.SIX_TO_NINE, true),
        TutorMode.Examiner,
        "math",
        "test understanding"
      );
      
      state.contextFlags = {};
      
      const result = planNextTurn(state);
      
      expect(result.plan.shouldRefuse).toBe(true);
      expect(result.plan.refusalReason).toBe(RefusalReason.AgeBandRestriction);
    });
    
    it("should allow Examiner mode for ages 6-9 with teacher present", () => {
      const state = createDialogueState(
        "session-1",
        createTestProfile(AgeBand.SIX_TO_NINE, true),
        TutorMode.Examiner,
        "math",
        "test understanding"
      );
      
      state.contextFlags = { isTeacherPresent: true };
      
      const result = planNextTurn(state);
      
      expect(result.plan.shouldRefuse).toBe(false);
    });
    
    it("should block high stakes assessment for minors without teacher", () => {
      const state = createDialogueState(
        "session-1",
        createTestProfile(AgeBand.TEN_TO_TWELVE, true),
        TutorMode.Socratic,
        "test",
        "assessment"
      );
      
      state.contextFlags = {
        isHighStakesAssessment: true,
        isTeacherPresent: false
      };
      
      const result = planNextTurn(state);
      
      expect(result.plan.shouldRefuse).toBe(true);
      expect(result.plan.refusalReason).toBe(RefusalReason.HighStakesCheatingAttempt);
    });
    
    it("should allow high stakes assessment for minors with teacher", () => {
      const state = createDialogueState(
        "session-1",
        createTestProfile(AgeBand.TEN_TO_TWELVE, true),
        TutorMode.Socratic,
        "test",
        "assessment"
      );
      
      state.contextFlags = {
        isHighStakesAssessment: true,
        isTeacherPresent: true
      };
      
      const result = planNextTurn(state);
      
      expect(result.plan.shouldRefuse).toBe(false);
    });
  });
  
  describe("Bounded History", () => {
    it("should limit history to MAX_HISTORY_TURNS", () => {
      const state = createDialogueState(
        "session-1",
        createTestProfile(),
        TutorMode.Socratic,
        "topic",
        "goal"
      );
      
      // Fill history with more than MAX_HISTORY_TURNS (20)
      for (let i = 0; i < 25; i++) {
        state.history.push({
          turnNumber: i + 1,
          tutorMessage: `Message ${i}`,
          tutorQuestions: [],
          scaffoldStep: ScaffoldStep.ClarifyGoal,
          timestamp: new Date().toISOString()
        });
        state.turnCount = i + 1;
      }
      
      const result = planNextTurn(state, "test");
      
      // History should be clamped to MAX_HISTORY_TURNS
      expect(result.newState.history.length).toBeLessThanOrEqual(20);
    });
    
    it("should preserve most recent turns when history is full", () => {
      const state = createDialogueState(
        "session-1",
        createTestProfile(),
        TutorMode.Socratic,
        "topic",
        "goal"
      );
      
      // Fill history
      for (let i = 0; i < 25; i++) {
        state.history.push({
          turnNumber: i + 1,
          tutorMessage: `Message ${i}`,
          tutorQuestions: [],
          scaffoldStep: ScaffoldStep.ClarifyGoal,
          timestamp: new Date().toISOString()
        });
        state.turnCount = i + 1;
      }
      
      const lastMessage = state.history[state.history.length - 1].tutorMessage;
      const result = planNextTurn(state, "test");
      
      // Most recent turn should be preserved
      expect(result.newState.history[result.newState.history.length - 2].tutorMessage)
        .toBe(lastMessage);
    });
  });
  
  describe("Observation Generation", () => {
    it("should generate observations from learner utterance", () => {
      const state = createDialogueState(
        "session-1",
        createTestProfile(),
        TutorMode.Socratic,
        "topic",
        "goal"
      );
      
      const result = planNextTurn(state, "I'm not sure about this, can you clarify?");
      
      expect(result.observations.length).toBeGreaterThan(0);
      expect(result.observations.some(o => o.type === "StatedUncertainty")).toBe(true);
      expect(result.observations.some(o => o.type === "AskedClarifyingQuestion")).toBe(true);
    });
    
    it("should generate observations compatible with L2", () => {
      const state = createDialogueState(
        "session-1",
        createTestProfile(),
        TutorMode.Socratic,
        "topic",
        "goal"
      );
      
      const result = planNextTurn(state, "I think the answer is X because of Y");
      
      expect(result.observations.length).toBeGreaterThan(0);
      result.observations.forEach(obs => {
        expect(obs.type).toBeDefined();
        expect(obs.timestamp).toBeDefined();
        expect(obs.strength).toBeGreaterThanOrEqual(0);
        expect(obs.strength).toBeLessThanOrEqual(1);
        expect(obs.sessionId).toBe("session-1");
      });
    });
  });
  
  describe("Scaffold Step Progression", () => {
    it("should start at ClarifyGoal", () => {
      const state = createDialogueState(
        "session-1",
        createTestProfile(),
        TutorMode.Socratic,
        "topic",
        "goal"
      );
      
      expect(state.currentStep).toBe(ScaffoldStep.ClarifyGoal);
    });
    
    it("should progress through scaffold steps", () => {
      const state = createDialogueState(
        "session-1",
        createTestProfile(),
        TutorMode.Socratic,
        "fractions",
        "understand addition"
      );
      
      // First turn: should be at ClarifyGoal
      let result = planNextTurn(state);
      expect(result.plan.scaffoldStep).toBe(ScaffoldStep.ClarifyGoal);
      
      // After goal clarification, should progress
      result = planNextTurn(result.newState, "I want to learn how to add fractions");
      expect(result.plan.scaffoldStep).toBe(ScaffoldStep.ElicitPriorKnowledge);
    });
  });
  
  describe("Uncertainty Handling", () => {
    it("should include uncertainty notes when uncertainties exist", () => {
      const state = createDialogueState(
        "session-1",
        createTestProfile(),
        TutorMode.Socratic,
        "topic",
        "goal"
      );
      
      state.uncertainties = ["uncertain about X", "not sure about Y"];
      
      const result = planNextTurn(state);
      
      expect(result.plan.uncertaintyNotes).toBeDefined();
      expect(result.plan.uncertaintyNotes?.length).toBe(2);
    });
    
    it("should include uncertainty markers in message", () => {
      const state = createDialogueState(
        "session-1",
        createTestProfile(),
        TutorMode.Socratic,
        "topic",
        "goal"
      );
      
      state.uncertainties = ["uncertain about X"];
      
      const result = planNextTurn(state);
      
      expect(result.plan.message).toContain("uncertain");
    });
  });
});



