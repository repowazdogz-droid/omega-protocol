/**
 * Visibility Filters Tests
 * 
 * Tests for minor vs adult behavior, parent/teacher visibility, adult privacy,
 * deterministic filtering, and bounded storage behavior.
 * 
 * Version: 0.1
 */

import { describe, it, expect } from "vitest";
import {
  getVisibilityPolicy,
  filterSessionForViewer,
  filterLearnerStateForViewer
} from "../VisibilityFilters";
import {
  StoredSessionRecord,
  StoredLearnerState,
  ViewerRole
} from "../StoreTypes";
import { AgeBand } from "../../LearnerTypes";
import { createEmptySkillGraph } from "../../SkillGraphTypes";
import { KernelRunRecord } from "../../../kernels/surfaces/learning/KernelSurfaceTypes";

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

/**
 * Helper to create a test session record
 */
function createTestSessionRecord(learnerId: string): StoredSessionRecord {
  return {
    sessionId: "test-session-1",
    learnerId,
    goal: {
      subject: "mathematics",
      topic: "fractions",
      objective: "understand how to add fractions"
    },
    tutorTurns: [
      {
        turnNumber: 1,
        tutorMessage: "What are you trying to learn?",
        tutorQuestions: ["What are you trying to learn?"],
        scaffoldStep: "ClarifyGoal" as any,
        timestamp: new Date().toISOString()
      }
    ],
    observations: [],
    sessionTrace: {
      timestampIso: new Date().toISOString(),
      inputsHash: "test-hash",
      contractsVersion: "0.1",
      sessionId: "test-session-1",
      learnerId,
      refusals: [],
      notes: [],
      turnCount: 1,
      assessmentGenerated: false,
      skillUpdatesCount: 0
    },
    createdAtIso: new Date().toISOString()
  };
}

describe("VisibilityFilters", () => {
  describe("Minor vs Adult Behavior", () => {
    it("should allow parent access for minors", () => {
      const profile = createTestProfile(AgeBand.SIX_TO_NINE, true);
      const policy = getVisibilityPolicy(profile);
      
      expect(policy.isMinor).toBe(true);
      expect(policy.parentCanView).toBe(true);
    });
    
    it("should deny parent access for adults by default", () => {
      const profile = createTestProfile(AgeBand.ADULT, false);
      const policy = getVisibilityPolicy(profile);
      
      expect(policy.isMinor).toBe(false);
      expect(policy.parentCanView).toBe(false);
    });
    
    it("should allow teacher access for minors", () => {
      const profile = createTestProfile(AgeBand.TEN_TO_TWELVE, true);
      const policy = getVisibilityPolicy(profile);
      
      expect(policy.teacherCanView).toBe(true);
    });
    
    it("should deny teacher access for adults by default", () => {
      const profile = createTestProfile(AgeBand.ADULT, false);
      const policy = getVisibilityPolicy(profile);
      
      expect(policy.teacherCanView).toBe(false);
    });
    
    it("should allow teacher access for adults if opted-in", () => {
      const profile = createTestProfile(AgeBand.ADULT, false);
      const policy = getVisibilityPolicy(profile, true);
      
      expect(policy.teacherCanView).toBe(true);
    });
  });
  
  describe("Parent/Teacher Visibility for Minors", () => {
    it("should allow parent to view minor's session", () => {
      const profile = createTestProfile(AgeBand.SIX_TO_NINE, true);
      const policy = getVisibilityPolicy(profile);
      const record = createTestSessionRecord(profile.learnerId);
      
      const filtered = filterSessionForViewer(record, "Parent", policy);
      
      expect(filtered.sessionId).toBe(record.sessionId);
      expect(filtered.tutorTurns.length).toBeGreaterThan(0);
      expect(filtered.visibilityNote).toBeUndefined();
    });
    
    it("should allow teacher to view minor's session", () => {
      const profile = createTestProfile(AgeBand.TEN_TO_TWELVE, true);
      const policy = getVisibilityPolicy(profile);
      const record = createTestSessionRecord(profile.learnerId);
      
      const filtered = filterSessionForViewer(record, "Teacher", policy);
      
      expect(filtered.sessionId).toBe(record.sessionId);
      expect(filtered.tutorTurns.length).toBeGreaterThan(0);
      expect(filtered.visibilityNote).toBeUndefined();
    });
    
    it("should allow parent to view minor's learner state", () => {
      const profile = createTestProfile(AgeBand.SIX_TO_NINE, true);
      const policy = getVisibilityPolicy(profile);
      const state: StoredLearnerState = {
        learnerProfile: profile,
        skillGraph: createEmptySkillGraph(profile.learnerId),
        version: "0.1"
      };
      
      const filtered = filterLearnerStateForViewer(state, "Parent", policy);
      
      expect(filtered.learnerProfile.learnerId).toBe(profile.learnerId);
      expect(filtered.skillGraph).toBeDefined();
      expect(filtered.visibilityNote).toBeUndefined();
    });
  });
  
  describe("Adult Privacy Default", () => {
    it("should deny parent access to adult's session", () => {
      const profile = createTestProfile(AgeBand.ADULT, false);
      const policy = getVisibilityPolicy(profile);
      const record = createTestSessionRecord(profile.learnerId);
      
      const filtered = filterSessionForViewer(record, "Parent", policy);
      
      expect(filtered.tutorTurns.length).toBe(0);
      expect(filtered.observations.length).toBe(0);
      expect(filtered.visibilityNote).toBe("Access denied for this role");
    });
    
    it("should deny teacher access to adult's session by default", () => {
      const profile = createTestProfile(AgeBand.ADULT, false);
      const policy = getVisibilityPolicy(profile);
      const record = createTestSessionRecord(profile.learnerId);
      
      const filtered = filterSessionForViewer(record, "Teacher", policy);
      
      expect(filtered.tutorTurns.length).toBe(0);
      expect(filtered.visibilityNote).toBe("Access denied for this role");
    });
    
    it("should allow teacher access to adult's session if opted-in", () => {
      const profile = createTestProfile(AgeBand.ADULT, false);
      const policy = getVisibilityPolicy(profile, true);
      const record = createTestSessionRecord(profile.learnerId);
      
      const filtered = filterSessionForViewer(record, "Teacher", policy);
      
      expect(filtered.sessionId).toBe(record.sessionId);
      expect(filtered.tutorTurns.length).toBeGreaterThan(0);
      expect(filtered.visibilityNote).toBeUndefined();
    });
    
    it("should always allow learner to view their own session", () => {
      const profile = createTestProfile(AgeBand.ADULT, false);
      const policy = getVisibilityPolicy(profile);
      const record = createTestSessionRecord(profile.learnerId);
      
      const filtered = filterSessionForViewer(record, "Learner", policy);
      
      expect(filtered.sessionId).toBe(record.sessionId);
      expect(filtered.tutorTurns.length).toBeGreaterThan(0);
      expect(filtered.visibilityNote).toBeUndefined();
    });
  });
  
  describe("Deterministic Filtering", () => {
    it("should produce identical filtered output for identical inputs", () => {
      const profile = createTestProfile(AgeBand.SIX_TO_NINE, true);
      const policy = getVisibilityPolicy(profile);
      const record = createTestSessionRecord(profile.learnerId);
      
      const filtered1 = filterSessionForViewer(record, "Parent", policy);
      const filtered2 = filterSessionForViewer(record, "Parent", policy);
      
      expect(filtered1.sessionId).toBe(filtered2.sessionId);
      expect(filtered1.tutorTurns.length).toBe(filtered2.tutorTurns.length);
      expect(filtered1.observations.length).toBe(filtered2.observations.length);
    });
  });
  
  describe("Internal Mechanics Hiding", () => {
    it("should hide internal refusal reasons", () => {
      const profile = createTestProfile(AgeBand.ADULT, false);
      const policy = getVisibilityPolicy(profile);
      const record = createTestSessionRecord(profile.learnerId);
      
      // Add internal refusal reason
      record.sessionTrace.refusals = [
        "AgeBandRestriction",
        "internal_system_error",
        "system_guardrail_triggered"
      ];
      
      const filtered = filterSessionForViewer(record, "Learner", policy);
      
      expect(filtered.sessionTrace.refusals).not.toContain("internal_system_error");
      expect(filtered.sessionTrace.refusals).not.toContain("system_guardrail_triggered");
      expect(filtered.sessionTrace.refusals).toContain("AgeBandRestriction");
    });
    
    it("should hide internal notes", () => {
      const profile = createTestProfile(AgeBand.ADULT, false);
      const policy = getVisibilityPolicy(profile);
      const record = createTestSessionRecord(profile.learnerId);
      
      // Add internal notes
      record.sessionTrace.notes = [
        "Skill updates: 2 skills updated",
        "internal_debug_info",
        "system_prompt_internal"
      ];
      
      const filtered = filterSessionForViewer(record, "Learner", policy);
      
      expect(filtered.sessionTrace.notes).not.toContain("internal_debug_info");
      expect(filtered.sessionTrace.notes).not.toContain("system_prompt_internal");
      expect(filtered.sessionTrace.notes).toContain("Skill updates: 2 skills updated");
    });
  });

  describe("Kernel Runs Visibility", () => {
    function createTestKernelRun(learnerId: string): KernelRunRecord {
      return {
        runId: 'run_1',
        kernelId: 'test_kernel',
        adapterId: 'test_adapter',
        learnerId,
        createdAtIso: new Date().toISOString(),
        inputHash: 'hash_1',
        decision: {
          outcomeId: 'S1',
          label: 'Continue',
          confidence: 'High',
          rationale: 'Test rationale'
        },
        claims: [],
        trace: [
          {
            id: 'node_1',
            type: 'Decision',
            label: 'Decision Made',
            description: 'Decision S1 selected',
            timestamp: new Date().toISOString()
          }
        ]
      };
    }

    it("should allow parent to view minor's kernel runs", () => {
      const profile = createTestProfile(AgeBand.SIX_TO_NINE, true);
      const policy = getVisibilityPolicy(profile);
      const state: StoredLearnerState = {
        learnerProfile: profile,
        skillGraph: createEmptySkillGraph(profile.learnerId),
        version: "0.1",
        kernelRuns: [createTestKernelRun(profile.learnerId)]
      };

      const filtered = filterLearnerStateForViewer(state, "Parent", policy);

      expect(filtered.kernelRuns).toBeDefined();
      expect(filtered.kernelRuns?.length).toBe(1);
      expect(filtered.visibilityNote).toBeUndefined();
    });

    it("should allow teacher to view minor's kernel runs", () => {
      const profile = createTestProfile(AgeBand.TEN_TO_TWELVE, true);
      const policy = getVisibilityPolicy(profile);
      const state: StoredLearnerState = {
        learnerProfile: profile,
        skillGraph: createEmptySkillGraph(profile.learnerId),
        version: "0.1",
        kernelRuns: [createTestKernelRun(profile.learnerId)]
      };

      const filtered = filterLearnerStateForViewer(state, "Teacher", policy);

      expect(filtered.kernelRuns).toBeDefined();
      expect(filtered.kernelRuns?.length).toBe(1);
      expect(filtered.visibilityNote).toBeUndefined();
    });

    it("should deny teacher access to adult's kernel runs by default", () => {
      const profile = createTestProfile(AgeBand.ADULT, false);
      const policy = getVisibilityPolicy(profile);
      const state: StoredLearnerState = {
        learnerProfile: profile,
        skillGraph: createEmptySkillGraph(profile.learnerId),
        version: "0.1",
        kernelRuns: [createTestKernelRun(profile.learnerId)]
      };

      const filtered = filterLearnerStateForViewer(state, "Teacher", policy);

      expect(filtered.kernelRuns).toBeUndefined();
      expect(filtered.visibilityNote).toBe("Access denied for this role");
    });

    it("should allow teacher access to adult's kernel runs if opted-in", () => {
      const profile = createTestProfile(AgeBand.ADULT, false);
      const policy = getVisibilityPolicy(profile, true);
      const state: StoredLearnerState = {
        learnerProfile: profile,
        skillGraph: createEmptySkillGraph(profile.learnerId),
        version: "0.1",
        kernelRuns: [createTestKernelRun(profile.learnerId)]
      };

      const filtered = filterLearnerStateForViewer(state, "Teacher", policy);

      expect(filtered.kernelRuns).toBeDefined();
      expect(filtered.kernelRuns?.length).toBe(1);
      expect(filtered.visibilityNote).toBeUndefined();
    });

    it("should filter out internal/system markers from kernel run traces", () => {
      const profile = createTestProfile(AgeBand.SIX_TO_NINE, true);
      const policy = getVisibilityPolicy(profile);
      const run = createTestKernelRun(profile.learnerId);
      run.trace.push({
        id: 'node_2',
        type: 'Policy',
        label: 'Internal System Check',
        description: 'System internal validation',
        timestamp: new Date().toISOString()
      });

      const state: StoredLearnerState = {
        learnerProfile: profile,
        skillGraph: createEmptySkillGraph(profile.learnerId),
        version: "0.1",
        kernelRuns: [run]
      };

      const filtered = filterLearnerStateForViewer(state, "Parent", policy);

      expect(filtered.kernelRuns).toBeDefined();
      if (filtered.kernelRuns && filtered.kernelRuns.length > 0) {
        const filteredTrace = filtered.kernelRuns[0].trace;
        const hasInternal = filteredTrace.some(node => 
          node.label.toLowerCase().includes('internal') || 
          node.description.toLowerCase().includes('internal')
        );
        expect(hasInternal).toBe(false);
      }
    });
  });
});

