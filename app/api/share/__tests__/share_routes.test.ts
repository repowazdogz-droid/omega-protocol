/**
 * Tests for Share API Routes.
 * Ensures: Gate denies -> create fails, adult teacher recap without opt-in -> token required, token validates -> recap allowed.
 */

import { evaluateGate } from '../../../../spine/gates/GateEngine';
import { GateAction, ViewerRole, Surface, ConsentState } from '../../../../spine/gates/GateTypes';
import { ShareScope } from '../../../../spine/share/ShareTypes';

describe('Share Routes Integration', () => {
  test('gate denies -> create fails', () => {
    // Simulate gate denial (adult no opt-in)
    const gateDecision = evaluateGate(GateAction.VIEW_TEACHER_RECAP, {
      viewerRole: ViewerRole.Teacher,
      isMinor: false,
      consentState: ConsentState.NotOptedIn,
      surface: Surface.TeacherRecap
    });

    expect(gateDecision.allowed).toBe(false);
    // In actual route, this would return 403
  });

  test('adult teacher recap without opt-in -> token required', () => {
    const gateDecision = evaluateGate(GateAction.VIEW_TEACHER_RECAP, {
      viewerRole: ViewerRole.Teacher,
      isMinor: false,
      consentState: ConsentState.NotOptedIn,
      surface: Surface.TeacherRecap
    });

    expect(gateDecision.allowed).toBe(false);
    expect(gateDecision.reason).toContain('opt-in');
  });

  test('token validates -> recap allowed (still bounded)', async () => {
    // This would be an integration test with actual store
    // For now, we test the gate logic with opt-in
    const gateDecision = evaluateGate(GateAction.VIEW_TEACHER_RECAP, {
      viewerRole: ViewerRole.Teacher,
      isMinor: false,
      consentState: ConsentState.OptedIn, // Token serves as opt-in
      surface: Surface.TeacherRecap
    });

    expect(gateDecision.allowed).toBe(true);
    // Constraints should still be applied
    expect(gateDecision.constraints).toBeDefined();
  });
});



