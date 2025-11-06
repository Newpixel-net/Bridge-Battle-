# Bridge Battle Crowd Runner - Development Documentation

## 📋 Document Overview

This repository contains comprehensive development guidelines for creating the **Bridge Battle Crowd Runner** game using Phaser 3 and HTML5.

### **Files Included**

1. **PHASER_IRON_RULES.md** - Base development standards
   - Universal Phaser 3 best practices
   - Performance optimization rules
   - AAA quality standards
   - Read this FIRST before any Phaser development

2. **BRIDGE_BATTLE_DEV_GUIDE.md** - Game-specific implementation guide
   - Complete technical specification
   - Architecture patterns for this specific game
   - Visual reference standards from screenshots
   - Phase-by-phase implementation roadmap

---

## 🎯 How to Use These Documents

### **For Claude Code**

When working on Bridge Battle Crowd Runner:

1. **First Read**: PHASER_IRON_RULES.md
   - Understand the foundational principles
   - Learn the non-negotiable standards
   - Master the core Phaser 3 patterns

2. **Then Read**: BRIDGE_BATTLE_DEV_GUIDE.md
   - Apply the base rules to this specific game
   - Follow the detailed implementation roadmap
   - Use the provided code examples as templates

3. **During Development**:
   - Reference both documents frequently
   - Follow the phase-by-phase roadmap
   - Check the Success Criteria after each phase
   - Consult the Common Pitfalls section when issues arise

### **For Version Control (Git)**

```bash
# Recommended git structure:
project-root/
├── docs/
│   ├── PHASER_IRON_RULES.md           # Base rules
│   ├── BRIDGE_BATTLE_DEV_GUIDE.md     # Game-specific guide
│   └── README.md                       # This file
├── src/                                 # Game source code
├── assets/                              # Game assets
└── index.html                           # Entry point
```

---

## 🚀 Quick Start for Claude Code

### **Starting a New Feature**

```
1. Read relevant section in BRIDGE_BATTLE_DEV_GUIDE.md
2. Check PHASER_IRON_RULES.md for best practices
3. Implement following the provided code examples
4. Test using the Success Criteria checklist
5. Verify performance benchmarks
```

### **Debugging Issues**

```
1. Consult "Common Pitfalls" in BRIDGE_BATTLE_DEV_GUIDE.md
2. Check "Debugging Protocol" for systematic approach
3. Verify against "Error Prevention Rules" in PHASER_IRON_RULES.md
4. Test edge cases thoroughly
```

---

## 🎮 Game Overview

**Bridge Battle Crowd Runner** is a hybrid mathematical runner + auto-shooter where:
- Players control a growing/shrinking squad in tight formation
- Squad automatically shoots obstacles while running forward
- Mathematical gates (+, ×, -) modify squad size
- Strategic decisions balance growth vs. combat power
- Target: AAA mobile game quality with 60 FPS performance

---

## 📊 Development Phases

The BRIDGE_BATTLE_DEV_GUIDE.md breaks development into 7 phases:

1. **Foundation** (Days 1-2): Movement & formation
2. **Math Gates** (Days 3-4): Gate system with perfect arithmetic
3. **Auto-Shooting** (Days 5-6): Continuous fire system
4. **Obstacles** (Days 7-8): Destructible tire stacks
5. **Enemies** (Days 9-10): Enemy formations
6. **Level Design** (Days 11-12): Full level progression
7. **Polish** (Days 13-14): AAA feel and juice

Each phase includes:
- Clear deliverables
- Success criteria
- Code examples
- Testing requirements

---

## ✅ Critical Requirements Checklist

Before considering the game complete:

### **Performance**
- [ ] 60 FPS with 50 squad members
- [ ] 45 FPS with 100 squad members
- [ ] 30 FPS minimum with 200 members
- [ ] No memory leaks over 5-minute session

### **Functionality**
- [ ] Math operations 100% accurate
- [ ] Auto-shooting from all squad members
- [ ] Object pooling for bullets/particles
- [ ] Proper hexagonal formation

### **Visual Quality**
- [ ] Matches reference screenshots
- [ ] Road width fills screen (400px+)
- [ ] Squad counter prominent at bottom center
- [ ] Gates readable from distance
- [ ] Satisfying destruction effects

### **Code Quality**
- [ ] No console errors
- [ ] Proper cleanup in shutdown()
- [ ] Defensive programming throughout
- [ ] Comments explain complex logic

---

## 🛠️ Core Technologies

- **Engine**: Phaser 3
- **Language**: JavaScript (ES6+)
- **Physics**: Arcade Physics
- **Target**: HTML5 (Desktop + Mobile)

---

## 📝 Key Principles

From PHASER_IRON_RULES.md:

1. **Never Downgrade - Only Upgrade**
   - Every change must improve the codebase
   - Preserve all working functionality

2. **AAA Standards**
   - Write production-quality code from day one
   - Performance is non-negotiable

3. **Object Pooling**
   - Mandatory for bullets, particles, enemies
   - Pre-allocate objects, reuse them

4. **Defensive Programming**
   - Check for null/undefined before using
   - Provide fallback values
   - Handle edge cases

5. **Test Before Push**
   - Verify specific bug is fixed
   - Test related systems
   - Check edge cases
   - Monitor performance

---

## 🎯 The North Star

Every decision should move toward a game where:
- Math choices feel meaningful
- Shooting feels powerful
- Growth feels earned
- Replay value is high
- Performance is rock-solid

---

## 📞 Document Maintenance

These documents should be updated:
- When new patterns are discovered
- After solving complex bugs
- When performance optimizations are found
- As best practices evolve

Keep them as living documentation that grows with the project.

---

## 🚦 Development Status Template

Use this to track progress:

```markdown
## Current Phase: [Phase Name]

### Completed
- [x] Item 1
- [x] Item 2

### In Progress
- [ ] Item 3
- [ ] Item 4

### Blockers
- None / [Describe blocker]

### Performance Metrics
- FPS: [X] with [Y] squad members
- Active bullets: [X]
- Memory usage: [X] MB

### Next Steps
1. [Next action]
2. [Next action]
```

---

## 💡 Tips for Claude Code

1. **Always read before coding**: Consult relevant sections BEFORE implementing
2. **Use code examples as templates**: Don't reinvent the wheel
3. **Follow the roadmap**: Phases build on each other properly
4. **Test continuously**: After each feature, verify it works
5. **Check performance early**: Don't wait until the end
6. **Reference screenshots**: Visual standards are in the dev guide
7. **Ask when uncertain**: Better to clarify than to implement incorrectly

---

## 🎮 Remember

> "We're not building a prototype. We're building a publishable, AAA-quality mobile game. Every line of code should reflect that standard."

Now go forth and create something amazing! 🚀
