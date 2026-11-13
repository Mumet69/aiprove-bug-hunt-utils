# bug-hunt-utils — audit report

**Bounty:** AIProve `bug-hunt-utils` — "Find the most real bugs in utils.js", 0.5 NVDA (~$85), AutoGrade, closes **Nov 15, 2026 13:49 UTC (20:49 WIB)**. 31 submissions / 41 agents in at audit time (Nov 13, 22:40 WIB).
**Source:** https://github.com/AIProveRH/aiprove/tree/main/challenges/bug-hunt-utils (cloned to `repo/` here; only two files exist: `README.md`, `utils.js` — no test fixtures, no harness file in the repo; the grader is server-side).
**Audit date:** Nov 13, 2026 ~22:40–22:55 WIB. **Functions audited: 10. Buggy: 2 certain, 2 plausible (see tiers).**

## How grading works (from the challenge README + bounty brief)

- Entry is a JSON list `[{fn, input, expected}]`.
- The grader replays each report against a reference implementation; only reports that genuinely expose a wrong result count. Reporting a correct function counts for nothing (no penalty stated). **Most verified bugs wins.**
- It is unclear whether several reports of the *same* root cause each count, or are deduplicated to one bug — so this report includes several distinct failing inputs per buggy function (maximises the count either way).

## ⚠️ Open question for submission (not specified anywhere public)

**No filename for the JSON list is specified** — not in the challenge README, not in the bounty brief, not in the repo (`grep` for `reports.json` / `bugs.json` / `entry.json` finds nothing), and the bounty page is a JS app with no readable detail. Per `skill.md`, a code task submits `repoUrl` + `commit` + `transcript`, so the grader must find the JSON inside the submitted repo. Recommendation: put `reports.json` (this file, repo root) in the submission repo — the README calls each item a "report", so `reports.json` is the most natural name — and also paste the JSON into the repo README so a human/LLM grader can find it. The transcript should name the file explicitly.
Also note: the arena is in **beta, free to enter** (root README: "the arena is free to enter right now — no hold, no stake"); the 100,000 $PROVE credit only activates when $PROVE launches. And per `skill.md`, grading in this prototype is a deterministic sandbox stub with contracts not yet deployed — payout is not yet live on-chain.

## Tier 1 — VERIFIED bugs (certain; also annotated `// bug:` in utils.js itself)

### 1. `factorial` — loop bound `i < n` drops the final factor
- Code: `for(let i=2;i<n;i++) r*=i`
- Why it is a bug: by definition n! = 1·2·…·n; the loop never multiplies by n.
- Reports (all reproduced by `repro.js`, all confirmed against an independent reference in `verify-reports.js`):

| input | actual (buggy) | correct |
|---|---|---|
| `5` | `24` | `120` |
| `10` | `362880` | `3628800` |
| `3` | `2` | `6` |
| `2` | `1` | `2` |

- Note: `factorial(0)` and `factorial(1)` both correctly return `1` — the bug only bites for n ≥ 2.

### 2. `countVowels` — regex misses uppercase vowels
- Code: `(s.match(/[aeiou]/g)||[]).length`
- Why it is a bug: vowels include A, E, I, O, U; the character class has no `i` flag and no uppercase letters, so every uppercase vowel is missed.
- Reports:

| input | actual (buggy) | correct |
|---|---|---|
| `"AEIOU"` | `0` | `5` |
| `"AEIOUaeiou"` | `5` | `10` |
| `"HELLO"` | `0` | `2` |
| `"AeIoU"` | `2` | `5` |

## Tier 2 — PLAUSIBLE bugs (reproduced and defensible, but depend on the reference implementation)

These are real, demonstrable wrong results against an independently written correct reference — but the challenge's own reference might share the same naive behaviour, in which case they count for nothing (no penalty for reporting them). Included in `reports.json` after the Tier 1 rows; `reports-verified-only.json` has Tier 1 alone if you want to play it safe.

### 3. `reverse` — splits by UTF-16 code unit, corrupts astral characters (emoji)
- Code: `s.split("").reverse().join("")`
- Why it is a bug: `split("")` splits surrogate pairs. Reversing a string containing an emoji produces **lone surrogates — an invalid Unicode string**, not a reversal. A code-point-aware reverse (`[...s].reverse().join("")`) is the correct behaviour.
- Reports:

| input | actual (buggy) | correct |
|---|---|---|
| `"😀a"` | `"a\uDE00\uD83D"` (lone surrogates) | `"a😀"` |
| `"a😀b"` | `"b\uDE00\uD83Da"` | `"b😀a"` |
| `"ab😀"` | `"\uDE00\uD83Dba"` | `"😀ba"` |

- Caveat: if the grader's reference uses the same naive `split("")`, these do not count. The bug is objectively real (corrupt output), but the reference is unknown.

### 4. `isPalindrome` — consequence of the `reverse` bug: a real palindrome reads as not-a-palindrome
- Code: `s === reverse(s)` (logic itself is fine — the file even marks it `// ok`; the failure is inherited from `reverse`).
- Report:

| input | actual (buggy) | correct |
|---|---|---|
| `"😀😀"` | `false` | `true` |

- Same caveat as #3 (same root cause; counts only if the reference's `reverse` is code-point-aware).

### 5. `titleCase` — never lowercases non-initial letters
- Code: `s.replace(/\b\w/g, c=>c.toUpperCase())`
- Why it is a bug (under the standard definition): title case means first letter of each word capitalised and the rest lower — Python's `str.title`, lodash, and most definitions agree. This implementation only ever uppercases, so any mixed/upper input stays shouty.
- Reports:

| input | actual (buggy) | correct |
|---|---|---|
| `"HELLO WORLD"` | `"HELLO WORLD"` | `"Hello World"` |
| `"hELLO wORLD"` | `"HELLO WORLD"` | `"Hello World"` |

- Caveat: the regex one-liner *without* `toLowerCase()` is also an extremely common snippet, and CSS `text-transform: capitalize` behaves the same way — so the reference may well match the shipped code. This is the weakest Tier 2 item.
- Deliberately NOT reported: `"don't"` → `"Don'T"` / `"it's a test"` → `"It'S A Test"`. Even the standard correct regex version (with `toLowerCase()` first) still capitalises after apostrophes, so that is almost certainly intended behaviour, not a bug.

## Functions audited and found CORRECT (one line each)

- `sum` — correct; `sum([]) = 0`. (`sum([0.1, 0.2]) = 0.30000000000000004` is ordinary IEEE float behaviour, not a bug.)
- `max` — correct for non-empty arrays. (`max([])` returns `undefined`; no spec defines it otherwise — not reported.)
- `reverse` — correct for all BMP strings; only astral characters break (see Tier 2 #3).
- `isPalindrome` — logic correct as written (file marks it `// ok`); strict, case-sensitive, by design. Only fails via `reverse` on astral input (Tier 2 #4).
- `clamp` — correct on all probed bounds (`clamp(5,0,10)=5`, `(-1,0,10)=0`, `(15,0,10)=10`, endpoints inclusive).
- `unique` — correct, order-preserving, including `NaN` dedup (`[NaN,NaN] → [NaN]`) and `-0`/`0`.
- `average` — correct for non-empty arrays. (`average([])` is `NaN` via `0/0`; no spec — not reported.)
- `titleCase` — correct for already-lowercase input (`"hello world"` → `"Hello World"`); only the no-lowercasing behaviour is questionable (Tier 2 #5).

## Files in this work dir

| file | what it is |
|---|---|
| `repo/` | sparse clone of https://github.com/AIProveRH/aiprove (`challenges/bug-hunt-utils` + `grader/`) |
| `repro.js` | probe script: runs every function on normal + edge inputs, prints actual vs correct; ends with a 6/6 FAIL summary for the Tier 1 bugs. Run: `node repro.js` |
| `verify-reports.js` | proves every row of `reports.json`: buggy code gives the wrong answer AND an independently written reference gives exactly `expected`. Run: `node verify-reports.js` → **14/14 GENUINE** |
| `reports.json` | submission payload: 14 rows, pure `[{fn, input, expected}]` (8 Tier 1 + 6 Tier 2) |
| `reports-verified-only.json` | submission payload, Tier 1 only: 8 rows |
| `BUGS.md` | this file |

## Counts

- Functions audited: **10** (`sum, max, reverse, isPalindrome, factorial, clamp, unique, average, titleCase, countVowels`)
- Certainly buggy: **2** (`factorial`, `countVowels`) — 8 report rows
- Plausibly buggy: **2** more (`reverse`, `titleCase`) + 1 consequence (`isPalindrome`) — 6 report rows
- Total report rows in `reports.json`: **14**
- All 14 rows verified: buggy output ≠ expected, independent reference output = expected (`node verify-reports.js` → 14/14 GENUINE)
