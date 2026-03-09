# Test Coverage Analysis

## Current Coverage Summary

| File            | Statements | Branches | Functions | Lines   | Status     |
|-----------------|-----------|----------|-----------|---------|------------|
| **types.js**    | 100%      | 100%     | 100%      | 100%    | Excellent  |
| **moves.js**    | 100%      | 100%     | 100%      | 100%    | Excellent  |
| **damage.js**   | 73.3%     | 75%      | 50%       | 72.4%   | Needs Work |
| **pokemon.js**  | 70.5%     | 57.1%    | 71.4%     | 73.2%   | Needs Work |
| **teambuilder.js** | 53.2% | 52.3%   | 66.7%     | 52.4%   | Poor       |
| **battle.js**   | 0%        | 0%       | 0%        | 0%      | Untested   |
| **Overall**     | 70.9%     | 62.0%    | 71.4%     | 71.4%   |            |

## Detailed Gap Analysis

### 1. `battle.js` — 0% Coverage (CRITICAL)

The entire `Battle` class has **zero test coverage**. This is the most critical gap since it contains the core game loop. The following areas need tests:

#### High Priority
- **`executeTurn()`** — The main turn execution flow, including action ordering and sequential execution
- **`determineOrder()`** — Priority move ordering, speed ties, and switch-goes-first logic
- **`executeMove()`** — Move execution including accuracy checks, protect interaction, damage application, and logging
- **`applyMoveEffects()`** — Status application, stat modification, healing, protect, and hazard-setting effects from moves
- **`switchPokemon()`** — Switching logic including stat reset, volatile status clearing, and entry hazard application

#### Medium Priority
- **`applyEntryHazards()`** — Stealth Rock damage, Toxic Spikes poison/absorption by poison types
- **`applyEndOfTurnEffects()`** — Burn/poison/toxic residual damage, weather countdown, protect removal
- **`checkWinCondition()`** — Win/loss/draw detection when all Pokemon on a side faint
- **`checkFainted()`** — Faint logging for both players
- **`setWeather()`** and **`getBattleState()`** — Weather setting and state serialization

#### Suggested Test Scenarios
```
- Two Pokemon attack each other in a basic turn
- Priority move (Quick Attack) goes before a slower Pokemon
- Switch action goes before attack action
- Protect blocks an incoming attack
- Status moves apply effects correctly
- Stealth Rock damages Pokemon on switch-in
- Toxic Spikes poisons on switch-in (and is absorbed by poison types)
- Burn/poison/toxic deal correct end-of-turn damage
- Battle ends when all Pokemon on one side faint
- Battle correctly reports a draw when both sides faint simultaneously
- Speed ties are resolved (test determinism with mocked Math.random)
```

---

### 2. `teambuilder.js` — 52.4% Line Coverage (POOR)

#### Untested: `validateTeam()` (lines 98-137)
The `validateTeam` function is completely untested. It contains important validation logic:

- **EV total validation** — Ensures total EVs don't exceed 510
- **Individual EV cap** — Ensures no single stat exceeds 252 EVs
- **IV range validation** — Ensures IVs are between 0 and 31
- **Level validation** — Ensures level is between 1 and 100

#### Suggested Tests
```
- Valid team passes validation
- Team with >510 total EVs fails validation
- Team with >252 EVs in a single stat fails
- Team with out-of-range IVs fails
- Team with invalid level (0, 101) fails
- Empty team fails validation
- Team with >6 Pokemon fails
- Multiple validation errors are reported together
```

---

### 3. `pokemon.js` — 73.2% Line Coverage (NEEDS WORK)

#### Untested: `getEffectiveStat()` for accuracy/evasion (lines 100, 102)
The accuracy and evasion stat modifier branches are not tested. These use different formulas than combat stats.

#### Untested: `canMove()` (lines 153-186)
The `canMove()` method has complex branching for different status conditions and volatile statuses:

- Paralysis chance (25% to fail)
- Freeze (20% thaw chance)
- Sleep (33% wake chance)
- Confusion self-hit (33% chance)
- Flinch prevents action

#### Suggested Tests
```
- getEffectiveStat returns correct values for accuracy modifiers
- getEffectiveStat returns correct values for evasion modifiers
- canMove returns false for fainted Pokemon
- canMove handles paralysis (mock Math.random for determinism)
- canMove handles freeze with thaw chance
- canMove handles sleep with wake chance
- canMove handles confusion
- canMove handles flinch (and removes it after check)
- getHpPercentage returns correct percentage
- clearStatus resets status to null
- resetStatModifiers zeroes all modifiers
```

#### Untested: Type immunities for poison/toxic
The test for poison/steel type immunity to poison status is not covered.

---

### 4. `damage.js` — 72.4% Line Coverage (NEEDS WORK)

#### Untested: Physical damage path (lines 12-13)
Only special moves are tested. Physical moves (which use attack/defense instead of specialAttack/specialDefense) are never exercised.

#### Untested: Burn penalty (line 21)
The burn halving physical attack damage branch is never tested.

#### Untested: `calculateRecoilDamage()` and `calculateConfusionDamage()` (lines 56-63)
These two utility functions have 0% coverage — they exist but are never called in tests.

#### Suggested Tests
```
- Physical move uses attack/defense stats
- Burn reduces physical move damage by 50%
- Burn does NOT reduce special move damage
- calculateRecoilDamage returns correct fraction of damage dealt
- calculateRecoilDamage returns at least 1
- calculateConfusionDamage uses level, attack, and defense correctly
- Damage is always at least 1 (even with resistances)
- Type immunity (0x effectiveness) results in 0 damage
```

---

## Priority Recommendations

### Tier 1 — Critical (add immediately)
1. **Battle class tests** — This is the core of the application and has 0% coverage. Start with `executeTurn`, `executeMove`, and `checkWinCondition`.
2. **`validateTeam()` tests** — Data validation is a common source of bugs and is completely untested.

### Tier 2 — Important (add soon)
3. **Physical damage calculation** — Only special moves are tested; physical moves use a different stat pair.
4. **Burn damage penalty** — An important battle mechanic that modifies damage output.
5. **`canMove()` tests with mocked randomness** — Status-blocking logic is branchy and error-prone.
6. **`calculateRecoilDamage` / `calculateConfusionDamage`** — Exported functions with 0% coverage.

### Tier 3 — Nice to Have
7. **Accuracy/evasion stat modifier formulas** — Different from standard stat modifiers.
8. **Edge cases for stat stages at boundaries** (+6/-6 with large stage changes)
9. **Integration tests** — Full multi-turn battle scenarios testing interactions between systems.
10. **`getHpPercentage`**, **`clearStatus`**, **`resetStatModifiers`** — Simple but untested utility methods.

### Testing Infrastructure Improvements
- **Mock `Math.random()`** — Many mechanics rely on randomness (crits, accuracy, status procs, paralysis/freeze/sleep checks). Tests should use `jest.spyOn(Math, 'random')` for deterministic results.
- **Add test helpers** — Create shared factory functions for common Pokemon/team/battle setups to reduce duplication across test files.
- **Set a coverage threshold** — Add to `package.json`:
  ```json
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
  ```
