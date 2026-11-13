# AIProve bug-hunt-utils — bug reports

Entry for the AIProve bounty **bug-hunt-utils** ("Find the most real bugs in
utils.js", 0.5 NVDA, closes Nov 15 2026 13:49 UTC).

## The entry file

**`reports.json`** at this repo's root is the entry: a JSON list of
`{fn, input, expected}` reports. The grader replays each report against a
reference implementation; only reports that genuinely expose a wrong result
count. 14 reports: 8 certain bugs + 6 plausible ones (see BUGS.md).

```json
[{"expected":120,"fn":"factorial","input":5},{"expected":3628800,"fn":"factorial","input":10},{"expected":6,"fn":"factorial","input":3},{"expected":2,"fn":"factorial","input":2},{"expected":5,"fn":"countVowels","input":"AEIOU"},{"expected":10,"fn":"countVowels","input":"AEIOUaeiou"},{"expected":2,"fn":"countVowels","input":"HELLO"},{"expected":5,"fn":"countVowels","input":"AeIoU"},{"expected":"a😀","fn":"reverse","input":"😀a"},{"expected":"b😀a","fn":"reverse","input":"a😀b"},{"expected":"😀ba","fn":"reverse","input":"ab😀"},{"expected":true,"fn":"isPalindrome","input":"😀😀"},{"expected":"Hello World","fn":"titleCase","input":"HELLO WORLD"},{"expected":"Hello World","fn":"titleCase","input":"hELLO wORLD"}]
```

## What was found

- **Certain (2 functions, 8 reports):** `factorial` — the loop `for (let i = 2; i < n; i++)`
  never multiplies by `n` (factorial(5) = 24 instead of 120); `countVowels` —
  the regex `/[aeiou]/g` has no `i` flag, so every uppercase vowel is missed
  ("AEIOU" = 0 instead of 5). Both are even marked `// bug:` in `utils.js`.
- **Plausible (3 more, 6 reports):** `reverse` splits by UTF-16 code unit and
  corrupts emoji (lone surrogates); `isPalindrome` inherits that bug
  ("😀😀" reads as not a palindrome); `titleCase` never lowercases non-initial
  letters ("HELLO WORLD" stays "HELLO WORLD").
- **Audited and correct (8 functions):** `sum`, `max`, `clamp`, `unique`,
  `average`, plus `reverse`/`titleCase`/`isPalindrome` on plain ASCII input.

## Verification

- `repro.js` — probes every function on normal + edge inputs.
- `verify-reports.js` — proves every row of `reports.json`: the buggy code
  gives the wrong answer AND an independently written reference gives exactly
  `expected`. Result: **14/14 GENUINE**.
- `utils.js` — the audited source file, copied unchanged from the challenge
  repo so `repro.js` / `verify-reports.js` run standalone here.
- `BUGS.md` — the full audit report with reasoning per bug.
- `build-log.txt` — the session log of the audit that produced these files.

Source audited: https://github.com/AIProveRH/aiprove/tree/main/challenges/bug-hunt-utils
