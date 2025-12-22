# Omega Spatial — Versioning Rules

## System Name
**Omega Spatial**

## Current Version
**v1.0** (pack system infrastructure: v1.1)

---

## Version Semantics

### Patch Version (v1.0.x)
**What it includes:**
- Bug fixes (crashes, incorrect display, broken interactions)
- Typo corrections in UI copy
- Minor visual polish that does not change behavior
- Documentation clarifications

**What it does NOT include:**
- New rooms
- New interactions
- New features
- Behavior changes
- Trust language changes

**Example:** v1.0.1 fixes a crash when selecting certain elements.

---

### Minor Version (v1.x)
**What it includes:**
- New rooms (added to gallery)
- New presets (within existing rooms)
- UI improvements that don't change core interactions
- Expanded demo scripts or runbooks

**What it does NOT include:**
- Changes to existing room behavior
- Changes to trust language
- New interaction types
- Breaking changes to existing rooms

**Example:** v1.1 adds a new room (e.g., "UncertaintyRoom") to the gallery.

---

### Major Version (v2.0)
**What it includes:**
- Breaking changes to existing rooms
- Changes to trust language
- New interaction types
- Changes to core interaction contract
- Architectural changes that affect room behavior

**What it requires:**
- Explicit justification
- Updated freeze manifests
- Migration path (if applicable)
- Updated demo runbooks

**Example:** v2.0 adds motion/simulation capabilities (would violate v1.0 freeze).

---

## Demo Targeting Rule

**Explicit rule:** All demos must target a frozen version.

- Conference demos: "Omega Spatial v1.0"
- Documentation: "As of v1.0..."
- Presentations: "This is v1.0, which is frozen."

**Rationale:** Prevents confusion about capabilities and ensures consistent messaging.

---

## Version Freeze Policy

**v1.0 is frozen:**
- All rooms are locked (see room-level `V1_LOCK.md` files)
- All interactions are locked
- All trust language is locked
- All demo behaviors are locked

**To create v1.1:**
1. Define what new room/feature is being added
2. Create new lock files for new rooms
3. Update `FREEZE_MANIFEST.md`
4. Update version badge to v1.1

**To create v2.0:**
1. Explicitly justify breaking changes
2. Update all lock files
3. Create migration documentation
4. Update `FREEZE_MANIFEST.md`
5. Update version badge to v2.0

---

## Version Display

The version must be visible in:
- Gallery footer (always)
- About modals (optional but recommended)
- Documentation headers

**Format:** "Omega Spatial v1.0"

---

**Change Policy:** This versioning document is itself frozen. Changes require explicit review.

