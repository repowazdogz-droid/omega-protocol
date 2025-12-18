/**
 * In-Memory Store Tests
 * 
 * Tests for bounded storage behavior, FIFO eviction, and storage limits.
 * 
 * Version: 0.1
 */

import { describe, it, expect } from "@jest/globals";
import { InMemoryLearningStore } from "../InMemoryLearningStore";
import { StoredSessionRecord, StoredLearnerState } from "../StoreTypes";
import { AgeBand } from "../../LearnerTypes";
import { createEmptySkillGraph } from "../../SkillGraphTypes";

describe("InMemoryLearningStore", () => {
  describe("Bounded Storage", () => {
    it("should enforce max sessions per learner", () => {
      const store = new InMemoryLearningStore();
      const learnerId = "test-learner-1";
      
      // Add more than MAX_SESSIONS_PER_LEARNER (200) sessions
      for (let i = 0; i < 250; i++) {
        const record: StoredSessionRecord = {
          sessionId: `session-${i}`,
          learnerId,
          goal: {
            subject: "test",
            topic: "test",
            objective: "test"
          },
          tutorTurns: [],
          observations: [],
          sessionTrace: {
            timestampIso: new Date().toISOString(),
            inputsHash: "test",
            contractsVersion: "0.1",
            sessionId: `session-${i}`,
            learnerId,
            refusals: [],
            notes: [],
            turnCount: 0,
            assessmentGenerated: false,
            skillUpdatesCount: 0
          },
          createdAtIso: new Date().toISOString()
        };
        store.appendSession(record);
      }
      
      const sessions = store.listSessions(learnerId);
      expect(sessions.length).toBeLessThanOrEqual(200);
    });
    
    it("should enforce max turns per session", () => {
      const store = new InMemoryLearningStore();
      const record: StoredSessionRecord = {
        sessionId: "test-session",
        learnerId: "test-learner",
        goal: {
          subject: "test",
          topic: "test",
          objective: "test"
        },
        tutorTurns: Array(100).fill(null).map((_, i) => ({
          turnNumber: i + 1,
          tutorMessage: `Message ${i}`,
          tutorQuestions: [],
          scaffoldStep: "ClarifyGoal" as any,
          timestamp: new Date().toISOString()
        })),
        observations: [],
        sessionTrace: {
          timestampIso: new Date().toISOString(),
          inputsHash: "test",
          contractsVersion: "0.1",
          sessionId: "test-session",
          learnerId: "test-learner",
          refusals: [],
          notes: [],
          turnCount: 100,
          assessmentGenerated: false,
          skillUpdatesCount: 0
        },
        createdAtIso: new Date().toISOString()
      };
      
      store.appendSession(record);
      const retrieved = store.getSession("test-session");
      
      expect(retrieved?.tutorTurns.length).toBeLessThanOrEqual(50);
    });
    
    it("should enforce max observations per session", () => {
      const store = new InMemoryLearningStore();
      const record: StoredSessionRecord = {
        sessionId: "test-session",
        learnerId: "test-learner",
        goal: {
          subject: "test",
          topic: "test",
          objective: "test"
        },
        tutorTurns: [],
        observations: Array(300).fill(null).map((_, i) => ({
          type: "StatedUncertainty" as any,
          timestamp: new Date().toISOString(),
          strength: 0.8,
          sessionId: "test-session"
        })),
        sessionTrace: {
          timestampIso: new Date().toISOString(),
          inputsHash: "test",
          contractsVersion: "0.1",
          sessionId: "test-session",
          learnerId: "test-learner",
          refusals: [],
          notes: [],
          turnCount: 0,
          assessmentGenerated: false,
          skillUpdatesCount: 0
        },
        createdAtIso: new Date().toISOString()
      };
      
      store.appendSession(record);
      const retrieved = store.getSession("test-session");
      
      expect(retrieved?.observations.length).toBeLessThanOrEqual(200);
    });
  });
  
  describe("FIFO Eviction", () => {
    it("should remove oldest sessions when limit exceeded", () => {
      const store = new InMemoryLearningStore();
      const learnerId = "test-learner";
      
      // Add sessions
      for (let i = 0; i < 250; i++) {
        const record: StoredSessionRecord = {
          sessionId: `session-${i}`,
          learnerId,
          goal: {
            subject: "test",
            topic: "test",
            objective: "test"
          },
          tutorTurns: [],
          observations: [],
          sessionTrace: {
            timestampIso: new Date().toISOString(),
            inputsHash: "test",
            contractsVersion: "0.1",
            sessionId: `session-${i}`,
            learnerId,
            refusals: [],
            notes: [],
            turnCount: 0,
            assessmentGenerated: false,
            skillUpdatesCount: 0
          },
          createdAtIso: new Date().toISOString()
        };
        store.appendSession(record);
      }
      
      const sessions = store.listSessions(learnerId);
      
      // Oldest sessions (session-0 through session-49) should be removed
      expect(store.getSession("session-0")).toBeUndefined();
      expect(store.getSession("session-49")).toBeUndefined();
      
      // Newest sessions should still exist
      expect(store.getSession("session-200")).toBeDefined();
      expect(store.getSession("session-249")).toBeDefined();
    });
  });
  
  describe("Learner State Storage", () => {
    it("should save and retrieve learner state", () => {
      const store = new InMemoryLearningStore();
      const state: StoredLearnerState = {
        learnerProfile: {
          learnerId: "test-learner",
          ageBand: AgeBand.ADULT,
          safety: {
            minor: false,
            institutionMode: false
          }
        },
        skillGraph: createEmptySkillGraph("test-learner"),
        version: "0.1"
      };
      
      store.saveLearnerState(state);
      const retrieved = store.getLearnerState("test-learner");
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.learnerProfile.learnerId).toBe("test-learner");
      expect(retrieved?.skillGraph.learnerId).toBe("test-learner");
    });
    
    it("should return undefined for non-existent learner", () => {
      const store = new InMemoryLearningStore();
      const retrieved = store.getLearnerState("non-existent");
      
      expect(retrieved).toBeUndefined();
    });
  });
  
  describe("Session Listing", () => {
    it("should list sessions ordered by creation time (newest first)", () => {
      const store = new InMemoryLearningStore();
      const learnerId = "test-learner";
      
      // Add sessions in order
      for (let i = 0; i < 5; i++) {
        const record: StoredSessionRecord = {
          sessionId: `session-${i}`,
          learnerId,
          goal: {
            subject: "test",
            topic: "test",
            objective: "test"
          },
          tutorTurns: [],
          observations: [],
          sessionTrace: {
            timestampIso: new Date().toISOString(),
            inputsHash: "test",
            contractsVersion: "0.1",
            sessionId: `session-${i}`,
            learnerId,
            refusals: [],
            notes: [],
            turnCount: 0,
            assessmentGenerated: false,
            skillUpdatesCount: 0
          },
          createdAtIso: new Date().toISOString()
        };
        store.appendSession(record);
      }
      
      const sessions = store.listSessions(learnerId);
      
      // Should be ordered newest first
      expect(sessions[0].sessionId).toBe("session-4");
      expect(sessions[4].sessionId).toBe("session-0");
    });
    
    it("should respect limit parameter", () => {
      const store = new InMemoryLearningStore();
      const learnerId = "test-learner";
      
      // Add 10 sessions
      for (let i = 0; i < 10; i++) {
        const record: StoredSessionRecord = {
          sessionId: `session-${i}`,
          learnerId,
          goal: {
            subject: "test",
            topic: "test",
            objective: "test"
          },
          tutorTurns: [],
          observations: [],
          sessionTrace: {
            timestampIso: new Date().toISOString(),
            inputsHash: "test",
            contractsVersion: "0.1",
            sessionId: `session-${i}`,
            learnerId,
            refusals: [],
            notes: [],
            turnCount: 0,
            assessmentGenerated: false,
            skillUpdatesCount: 0
          },
          createdAtIso: new Date().toISOString()
        };
        store.appendSession(record);
      }
      
      const sessions = store.listSessions(learnerId, 5);
      
      expect(sessions.length).toBe(5);
    });
  });
});



