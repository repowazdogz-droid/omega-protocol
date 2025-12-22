/**
 * Session Orchestrator Tests
 * 
 * Tests for determinism, refusal propagation, skill updates, and assessment generation.
 * 
 * Version: 0.1
 */

import { describe, it, expect } from "vitest";
import {
  createSessionState,
  runLearningSession
} from "../SessionOrchestrator";
import {
  LearningSessionRequest
} from "../SessionTypes";
import { TutorMode } from "../../dialogue/DialogTypes";
import { AssessmentType } from "../../assessment/AssessmentTypes";
import { AgeBand } from "../../LearnerTypes";
import { createEmptySkillGraph } from "../../SkillGraphTypes";

/**
 * Helper to create a test session request
 */
function createTestRequest(
  utterance?: string,
  requestedAssessment?: AssessmentType | null
): LearningSessionRequest {
  return {
    sessionId: "test-session-1",
    learner: {
      learnerId: "test-learner-1",
      ageBand: AgeBand.ADULT,
      safety: {
        minor: false,
        institutionMode: false
      }
    },
    goal: {
      subject: "mathematics",
      topic: "fractions",
      objective: "understand how to add fractions"
    },
    mode: TutorMode.Socratic,
    utterance,
    requestedAssessment
  };
}

describe("SessionOrchestrator", () => {
  describe("Determinism", () => {
    it("should produce identical outputs for identical inputs", () => {
      const request1 = createTestRequest("I want to learn about fractions");
      const request2 = createTestRequest("I want to learn about fractions");
      
      const output1 = runLearningSession(request1);
      const output2 = runLearningSession(request2);
      
      expect(output1.sessionTrace.inputsHash).toBe(output2.sessionTrace.inputsHash);
      expect(output1.tutorTurn.message).toBe(output2.tutorTurn.message);
      expect(output1.observations.length).toBe(output2.observations.length);
    });
    
    it("should produce same result when called multiple times", () => {
      const request = createTestRequest("I want to learn about fractions");
      
      const output1 = runLearningSession(request);
      const output2 = runLearningSession(request);
      
      expect(output1.sessionTrace.inputsHash).toBe(output2.sessionTrace.inputsHash);
      expect(output1.tutorTurn.scaffoldStep).toBe(output2.tutorTurn.scaffoldStep);
    });
  });
  
  describe("Refusal Propagation", () => {
    it("should propagate dialogue refusal to output", () => {
      // Create request that will trigger refusal (e.g., age band restriction)
      const request: LearningSessionRequest = {
        sessionId: "test-session-refusal",
        learner: {
          learnerId: "test-learner-minor",
          ageBand: AgeBand.SIX_TO_NINE,
          safety: {
            minor: true,
            institutionMode: false
          }
        },
        goal: {
          subject: "test",
          topic: "test",
          objective: "test"
        },
        mode: TutorMode.Examiner, // Examiner mode blocked for 6-9 without teacher
        contextFlags: {
          isTeacherPresent: false
        }
      };
      
      const output = runLearningSession(request);
      
      expect(output.tutorTurn.shouldRefuse).toBe(true);
      expect(output.sessionTrace.refusals.length).toBeGreaterThan(0);
    });
    
    it("should not update skill graph when dialogue refuses", () => {
      const request: LearningSessionRequest = {
        sessionId: "test-session-refusal",
        learner: {
          learnerId: "test-learner-minor",
          ageBand: AgeBand.SIX_TO_NINE,
          safety: {
            minor: true,
            institutionMode: false
          }
        },
        goal: {
          subject: "test",
          topic: "test",
          objective: "test"
        },
        mode: TutorMode.Examiner,
        contextFlags: {
          isTeacherPresent: false
        },
        utterance: "test"
      };
      
      const previousGraph = createEmptySkillGraph("test-learner-minor");
      const output = runLearningSession(request, previousGraph);
      
      // Skill graph should not be updated when refused
      expect(output.skillGraphDelta.updates.length).toBe(0);
      expect(output.skillGraphDelta.newGraph).toBe(previousGraph);
    });
    
    it("should not generate assessment when dialogue refuses", () => {
      const request: LearningSessionRequest = {
        sessionId: "test-session-refusal",
        learner: {
          learnerId: "test-learner-minor",
          ageBand: AgeBand.SIX_TO_NINE,
          safety: {
            minor: true,
            institutionMode: false
          }
        },
        goal: {
          subject: "test",
          topic: "test",
          objective: "test"
        },
        mode: TutorMode.Examiner,
        contextFlags: {
          isTeacherPresent: false
        },
        requestedAssessment: AssessmentType.CritiqueAIAnswer
      };
      
      const output = runLearningSession(request);
      
      expect(output.tutorTurn.shouldRefuse).toBe(true);
      expect(output.assessment).toBeUndefined();
    });
  });
  
  describe("Skill Updates", () => {
    it("should update skill graph when observations exist", () => {
      const request = createTestRequest("I'm not sure about this, can you clarify?");
      const previousGraph = createEmptySkillGraph("test-learner-1");
      
      const output = runLearningSession(request, previousGraph);
      
      // Should have observations
      expect(output.observations.length).toBeGreaterThan(0);
      
      // Should update skill graph if not refused
      if (!output.tutorTurn.shouldRefuse) {
        expect(output.skillGraphDelta.updates.length).toBeGreaterThan(0);
        expect(output.skillGraphDelta.newGraph).not.toBe(previousGraph);
      }
    });
    
    it("should not update skill graph when no observations", () => {
      const request = createTestRequest(); // No utterance
      const previousGraph = createEmptySkillGraph("test-learner-1");
      
      const output = runLearningSession(request, previousGraph);
      
      // No observations from empty utterance
      expect(output.observations.length).toBe(0);
      expect(output.skillGraphDelta.updates.length).toBe(0);
    });
    
    it("should track skill updates in session trace", () => {
      const request = createTestRequest("I think the answer is X because of Y");
      const previousGraph = createEmptySkillGraph("test-learner-1");
      
      const output = runLearningSession(request, previousGraph);
      
      if (output.skillGraphDelta.updates.length > 0) {
        expect(output.sessionTrace.skillUpdatesCount).toBe(output.skillGraphDelta.updates.length);
        expect(output.sessionTrace.notes.some(note => note.includes("Skill updates"))).toBe(true);
      }
    });
  });
  
  describe("Assessment Generation", () => {
    it("should generate assessment when requested and allowed", () => {
      const request = createTestRequest(
        "I want to learn about fractions",
        AssessmentType.CritiqueAIAnswer
      );
      
      const output = runLearningSession(request);
      
      if (!output.tutorTurn.shouldRefuse) {
        expect(output.assessment).toBeDefined();
        expect(output.assessment?.type).toBe(AssessmentType.CritiqueAIAnswer);
        expect(output.sessionTrace.assessmentGenerated).toBe(true);
      }
    });
    
    it("should not generate assessment when not requested", () => {
      const request = createTestRequest("I want to learn about fractions");
      
      const output = runLearningSession(request);
      
      expect(output.assessment).toBeUndefined();
      expect(output.sessionTrace.assessmentGenerated).toBe(false);
    });
    
    it("should not generate assessment when dialogue refuses", () => {
      const request: LearningSessionRequest = {
        sessionId: "test-session",
        learner: {
          learnerId: "test-learner",
          ageBand: AgeBand.SIX_TO_NINE,
          safety: {
            minor: true,
            institutionMode: false
          }
        },
        goal: {
          subject: "test",
          topic: "test",
          objective: "test"
        },
        mode: TutorMode.Examiner,
        contextFlags: {
          isTeacherPresent: false
        },
        requestedAssessment: AssessmentType.CritiqueAIAnswer
      };
      
      const output = runLearningSession(request);
      
      expect(output.tutorTurn.shouldRefuse).toBe(true);
      expect(output.assessment).toBeUndefined();
    });
    
    it("should respect age band restrictions for assessment", () => {
      const request: LearningSessionRequest = {
        sessionId: "test-session",
        learner: {
          learnerId: "test-learner",
          ageBand: AgeBand.SIX_TO_NINE,
          safety: {
            minor: true,
            institutionMode: false
          }
        },
        goal: {
          subject: "test",
          topic: "test",
          objective: "test"
        },
        mode: TutorMode.Socratic,
        contextFlags: {
          isHighStakes: true,
          isTeacherPresent: false
        },
        requestedAssessment: AssessmentType.OralReasoning
      };
      
      const output = runLearningSession(request);
      
      // Assessment should be refused due to age band restriction
      if (output.assessment) {
        expect(output.assessment.shouldRefuse).toBe(true);
      }
    });
  });
  
  describe("Session Trace", () => {
    it("should include all required trace fields", () => {
      const request = createTestRequest("test utterance");
      const output = runLearningSession(request);
      
      expect(output.sessionTrace.timestampIso).toBeDefined();
      expect(output.sessionTrace.inputsHash).toBeDefined();
      expect(output.sessionTrace.contractsVersion).toBe("0.1");
      expect(output.sessionTrace.sessionId).toBe(request.sessionId);
      expect(output.sessionTrace.learnerId).toBe(request.learner.learnerId);
      expect(Array.isArray(output.sessionTrace.refusals)).toBe(true);
      expect(Array.isArray(output.sessionTrace.notes)).toBe(true);
      expect(typeof output.sessionTrace.turnCount).toBe("number");
      expect(typeof output.sessionTrace.assessmentGenerated).toBe("boolean");
      expect(typeof output.sessionTrace.skillUpdatesCount).toBe("number");
    });
    
    it("should generate deterministic inputsHash", () => {
      const request1 = createTestRequest("test");
      const request2 = createTestRequest("test");
      
      const output1 = runLearningSession(request1);
      const output2 = runLearningSession(request2);
      
      expect(output1.sessionTrace.inputsHash).toBe(output2.sessionTrace.inputsHash);
    });
    
    it("should track refusals in trace", () => {
      const request: LearningSessionRequest = {
        sessionId: "test-session",
        learner: {
          learnerId: "test-learner",
          ageBand: AgeBand.SIX_TO_NINE,
          safety: {
            minor: true,
            institutionMode: false
          }
        },
        goal: {
          subject: "test",
          topic: "test",
          objective: "test"
        },
        mode: TutorMode.Examiner,
        contextFlags: {
          isTeacherPresent: false
        }
      };
      
      const output = runLearningSession(request);
      
      if (output.tutorTurn.shouldRefuse) {
        expect(output.sessionTrace.refusals.length).toBeGreaterThan(0);
      }
    });
  });
  
  describe("Dialogue State Persistence", () => {
    it("should return updated dialogue state for next turn", () => {
      const request = createTestRequest("I want to learn about fractions");
      const output = runLearningSession(request);
      
      expect(output.dialogueState).toBeDefined();
      expect(output.dialogueState?.sessionId).toBe(request.sessionId);
      expect(output.dialogueState?.turnCount).toBeGreaterThan(0);
    });
    
    it("should use previous dialogue state when provided", () => {
      const request1 = createTestRequest("I want to learn about fractions");
      const output1 = runLearningSession(request1);
      
      const request2 = createTestRequest("I know some basics", AssessmentType.TeachBack);
      const output2 = runLearningSession(request2, undefined, output1.dialogueState);
      
      // Should continue from previous state
      expect(output2.dialogueState?.turnCount).toBeGreaterThan(output1.dialogueState?.turnCount || 0);
    });
  });
});




