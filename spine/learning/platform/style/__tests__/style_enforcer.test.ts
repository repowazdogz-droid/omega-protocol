/**
 * Style Enforcer Tests
 * 
 * Tests for style enforcement: calm mode, age bands, tone, length.
 * 
 * Version: 0.1
 */

import { describe, it, expect } from "@jest/globals";
import { applyStyleToTutorTurn } from "../StyleEnforcer";
import { TutorTurnPlan, ScaffoldStep } from "../../dialogue/DialogTypes";
import { TutorMode } from "../../dialogue/DialogTypes";

/**
 * Helper to create a test tutor turn plan
 */
function createTestPlan(): TutorTurnPlan {
  return {
    mode: TutorMode.Socratic,
    message: "Let's think about this step by step. First, what do you already know about this topic? Then, can you explain how you would approach solving this problem? Finally, what questions do you have?",
    questions: [
      "What do you already know about this topic?",
      "How would you approach solving this problem?",
      "What questions do you have?"
    ],
    actions: [],
    shouldRefuse: false,
    nextSuggestedLearnerAction: "Share your thoughts",
    scaffoldStep: ScaffoldStep.ClarifyGoal,
    observations: []
  };
}

describe("StyleEnforcer", () => {
  describe("Calm Mode Enforcement", () => {
    it("should limit to 1 question in calm mode", () => {
      const plan = createTestPlan();
      const styled = applyStyleToTutorTurn(plan, "calm_mode, one_question");
      
      expect(styled.questions.length).toBe(1);
      expect(styled.questions[0]).toBe(plan.questions[0]);
    });
    
    it("should add ND-friendly elements in calm mode", () => {
      const plan = createTestPlan();
      const styled = applyStyleToTutorTurn(plan, "calm_mode");
      
      // Should include permission for uncertainty or break suggestion
      const message = styled.message.toLowerCase();
      expect(
        message.includes("don't know") || 
        message.includes("not sure") || 
        message.includes("pause") ||
        message.includes("break")
      ).toBe(true);
    });
  });
  
  describe("Age Band 6-9", () => {
    it("should shorten message for very_short hint", () => {
      const plan = createTestPlan();
      const styled = applyStyleToTutorTurn(plan, "very_short, one_question, examples_first, playful_tone");
      
      // Message should be significantly shorter
      expect(styled.message.split(/\s+/).length).toBeLessThanOrEqual(60); // ~50 words + buffer
      expect(styled.questions.length).toBe(1);
    });
    
    it("should add example-first framing when requested", () => {
      const plan = createTestPlan();
      const styled = applyStyleToTutorTurn(plan, "examples_first");
      
      const lowerMessage = styled.message.toLowerCase();
      expect(
        lowerMessage.includes("example") || 
        lowerMessage.includes("let's look") ||
        lowerMessage.startsWith("here's")
      ).toBe(true);
    });
    
    it("should add playful tone markers", () => {
      const plan = createTestPlan();
      const styled = applyStyleToTutorTurn(plan, "playful_tone");
      
      // Should have encouraging elements
      const message = styled.message.toLowerCase();
      expect(
        message.includes("!") || 
        message.includes("great") || 
        message.includes("awesome")
      ).toBe(true);
    });
  });
  
  describe("Age Band 10-12", () => {
    it("should allow short messages with one question", () => {
      const plan = createTestPlan();
      const styled = applyStyleToTutorTurn(plan, "short, one_question, examples_first, encouraging_tone");
      
      expect(styled.questions.length).toBe(1);
      expect(styled.message.split(/\s+/).length).toBeLessThanOrEqual(85); // ~75 words + buffer
    });
  });
  
  describe("Age Band 13-15", () => {
    it("should allow medium length with two questions max", () => {
      const plan = createTestPlan();
      const styled = applyStyleToTutorTurn(plan, "medium_length, two_questions_max, critique_friendly");
      
      expect(styled.questions.length).toBeLessThanOrEqual(2);
      expect(styled.message.split(/\s+/).length).toBeLessThanOrEqual(130); // ~120 words + buffer
    });
  });
  
  describe("Adult", () => {
    it("should allow full length with flexible scaffolding", () => {
      const plan = createTestPlan();
      const styled = applyStyleToTutorTurn(plan, "full_length, flexible_scaffolding");
      
      // Should not truncate (or minimal truncation)
      expect(styled.questions.length).toBeGreaterThanOrEqual(2); // Can have multiple questions
    });
    
    it("should allow 2-3 questions depending on profile", () => {
      const plan = createTestPlan();
      const styled = applyStyleToTutorTurn(plan, "full_length");
      
      // Should preserve original questions (up to reasonable limit)
      expect(styled.questions.length).toBeGreaterThanOrEqual(1);
    });
  });
  
  describe("Language Simplification", () => {
    it("should simplify complex words", () => {
      const plan: TutorTurnPlan = {
        ...createTestPlan(),
        message: "Let's understand and demonstrate how to utilize this concept. We need to analyze and synthesize the information."
      };
      
      const styled = applyStyleToTutorTurn(plan, "simple_language");
      
      // Should replace complex words
      expect(styled.message.toLowerCase()).not.toContain("utilize");
      expect(styled.message.toLowerCase()).not.toContain("comprehend");
      expect(styled.message.toLowerCase()).toContain("use");
    });
  });
  
  describe("Determinism", () => {
    it("should produce identical output for identical inputs", () => {
      const plan = createTestPlan();
      const hint = "calm_mode, one_question, short";
      
      const styled1 = applyStyleToTutorTurn(plan, hint);
      const styled2 = applyStyleToTutorTurn(plan, hint);
      
      expect(styled1.message).toBe(styled2.message);
      expect(styled1.questions).toEqual(styled2.questions);
    });
  });
  
  describe("Empty/No Hint", () => {
    it("should return original plan when no hint provided", () => {
      const plan = createTestPlan();
      const styled = applyStyleToTutorTurn(plan, "");
      
      expect(styled).toEqual(plan);
    });
    
    it("should return original plan when hint is undefined", () => {
      const plan = createTestPlan();
      const styled = applyStyleToTutorTurn(plan, undefined as any);
      
      expect(styled).toEqual(plan);
    });
  });
});



