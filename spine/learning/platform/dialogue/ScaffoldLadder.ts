/**
 * Scaffold Ladder
 * 
 * Defines scaffold ladder steps and transition rules per Contract 69.
 * Enforces "no answer dumping" policy through structured progression.
 * 
 * Version: 0.1
 */

import { ScaffoldStep, DialogueState } from "./DialogTypes";

/**
 * Scaffold ladder step definitions with progression rules.
 * Per Contract 69 scaffold ladder principle.
 */
export interface ScaffoldStepDefinition {
  step: ScaffoldStep;
  canAdvanceTo: ScaffoldStep[];
  canRevealSolution: boolean;
  requiresAttempt: boolean;
  requiresHintOrCounterexample: boolean;
}

/**
 * Scaffold ladder configuration.
 * Defines valid transitions and constraints.
 */
const SCAFFOLD_LADDER: Map<ScaffoldStep, ScaffoldStepDefinition> = new Map([
  [ScaffoldStep.ClarifyGoal, {
    step: ScaffoldStep.ClarifyGoal,
    canAdvanceTo: [ScaffoldStep.ElicitPriorKnowledge],
    canRevealSolution: false,
    requiresAttempt: false,
    requiresHintOrCounterexample: false
  }],
  [ScaffoldStep.ElicitPriorKnowledge, {
    step: ScaffoldStep.ElicitPriorKnowledge,
    canAdvanceTo: [ScaffoldStep.AskForAttempt, ScaffoldStep.ClarifyGoal],
    canRevealSolution: false,
    requiresAttempt: false,
    requiresHintOrCounterexample: false
  }],
  [ScaffoldStep.AskForAttempt, {
    step: ScaffoldStep.AskForAttempt,
    canAdvanceTo: [ScaffoldStep.AskForReasoning, ScaffoldStep.OfferHint, ScaffoldStep.ElicitPriorKnowledge],
    canRevealSolution: false,
    requiresAttempt: false,
    requiresHintOrCounterexample: false
  }],
  [ScaffoldStep.AskForReasoning, {
    step: ScaffoldStep.AskForReasoning,
    canAdvanceTo: [ScaffoldStep.OfferHint, ScaffoldStep.OfferCounterexampleOrTest, ScaffoldStep.AskForAttempt],
    canRevealSolution: false,
    requiresAttempt: true,
    requiresHintOrCounterexample: false
  }],
  [ScaffoldStep.OfferHint, {
    step: ScaffoldStep.OfferHint,
    canAdvanceTo: [ScaffoldStep.AskForReasoning, ScaffoldStep.OfferCounterexampleOrTest, ScaffoldStep.RevealMinimalSolution],
    canRevealSolution: false,
    requiresAttempt: true,
    requiresHintOrCounterexample: false
  }],
  [ScaffoldStep.OfferCounterexampleOrTest, {
    step: ScaffoldStep.OfferCounterexampleOrTest,
    canAdvanceTo: [ScaffoldStep.AskForReasoning, ScaffoldStep.OfferHint, ScaffoldStep.RevealMinimalSolution],
    canRevealSolution: false,
    requiresAttempt: true,
    requiresHintOrCounterexample: false
  }],
  [ScaffoldStep.RevealMinimalSolution, {
    step: ScaffoldStep.RevealMinimalSolution,
    canAdvanceTo: [ScaffoldStep.ReflectAndGeneralize],
    canRevealSolution: true,
    requiresAttempt: true,
    requiresHintOrCounterexample: true
  }],
  [ScaffoldStep.ReflectAndGeneralize, {
    step: ScaffoldStep.ReflectAndGeneralize,
    canAdvanceTo: [],
    canRevealSolution: true,
    requiresAttempt: true,
    requiresHintOrCounterexample: false
  }]
]);

/**
 * Checks if a transition from current step to next step is valid.
 */
export function canTransitionTo(
  currentStep: ScaffoldStep,
  nextStep: ScaffoldStep
): boolean {
  const current = SCAFFOLD_LADDER.get(currentStep);
  if (!current) return false;
  
  return current.canAdvanceTo.includes(nextStep);
}

/**
 * Checks if solution can be revealed at the current step.
 * Per Contract 69: solution can only be revealed if:
 * 1. Learner has made an attempt, AND
 * 2. Either:
 *    - System has offered hint/counterexample at least once, OR
 *    - Learner explicitly requested solution AND system has tried hint/counterexample
 */
export function canRevealSolution(
  state: DialogueState
): boolean {
  const current = SCAFFOLD_LADDER.get(state.currentStep);
  if (!current) return false;
  
  // Must be at a step that allows solution revelation
  if (!current.canRevealSolution) return false;
  
  // Must have made an attempt
  if (!state.hasMadeAttempt) return false;
  
  // Must have offered hint or counterexample at least once
  if (state.hintsOffered === 0 && state.counterexamplesOffered === 0) {
    // Exception: if learner explicitly requested solution AND we've tried scaffolding
    if (state.hasRequestedSolution && 
        (state.currentStep === ScaffoldStep.OfferHint || 
         state.currentStep === ScaffoldStep.OfferCounterexampleOrTest)) {
      return true;
    }
    return false;
  }
  
  return true;
}

/**
 * Determines the next scaffold step based on current state and learner response.
 * Enforces ladder rules: never skip more than one rung.
 */
export function determineNextStep(
  state: DialogueState,
  learnerResponse: string
): ScaffoldStep {
  const current = SCAFFOLD_LADDER.get(state.currentStep);
  if (!current) return state.currentStep;
  
  // Analyze learner response to determine next step
  const responseLower = learnerResponse.toLowerCase();
  
  // If learner explicitly requests solution
  if (responseLower.includes("solution") || 
      responseLower.includes("answer") || 
      responseLower.includes("tell me")) {
    state.hasRequestedSolution = true;
    
    // Can only reveal if conditions are met
    if (canRevealSolution(state)) {
      return ScaffoldStep.RevealMinimalSolution;
    }
    // Otherwise, offer hint or counterexample if not already done
    if (state.hintsOffered === 0) {
      return ScaffoldStep.OfferHint;
    }
    if (state.counterexamplesOffered === 0) {
      return ScaffoldStep.OfferCounterexampleOrTest;
    }
  }
  
  // If learner makes an attempt (provides reasoning or answer)
  if (responseLower.length > 20 && 
      (responseLower.includes("because") || 
       responseLower.includes("think") || 
       responseLower.includes("reason") ||
       responseLower.includes("try"))) {
    state.hasMadeAttempt = true;
    
    // Progress to reasoning or hint based on current step
    if (state.currentStep === ScaffoldStep.AskForAttempt) {
      return ScaffoldStep.AskForReasoning;
    }
    if (state.currentStep === ScaffoldStep.AskForReasoning) {
      // Offer hint if not done, otherwise counterexample
      if (state.hintsOffered === 0) {
        return ScaffoldStep.OfferHint;
      }
      return ScaffoldStep.OfferCounterexampleOrTest;
    }
  }
  
  // If learner asks clarifying question, stay at current step or go back
  if (responseLower.includes("?") || 
      responseLower.includes("what") || 
      responseLower.includes("how") ||
      responseLower.includes("why")) {
    // Stay at current step to address clarification
    return state.currentStep;
  }
  
  // Default progression: advance one step if possible
  if (current.canAdvanceTo.length > 0) {
    const nextStep = current.canAdvanceTo[0];
    if (canTransitionTo(state.currentStep, nextStep)) {
      return nextStep;
    }
  }
  
  // Stay at current step if no valid transition
  return state.currentStep;
}

/**
 * Gets scaffold step definition.
 */
export function getScaffoldStepDefinition(step: ScaffoldStep): ScaffoldStepDefinition | undefined {
  return SCAFFOLD_LADDER.get(step);
}




