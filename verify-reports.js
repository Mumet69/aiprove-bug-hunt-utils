// verify-reports.js — prove each report row in reports.json is a genuine bug:
// the BUGGY utils.js gives the wrong answer, and an independently written
// CORRECT reference implementation gives exactly `expected`.
// Run: node verify-reports.js
const u = require("./utils.js");
const reports = require("./reports.json");

// Independent correct reference implementations (written from the function
// names/specs alone, not copied from utils.js).
const ref = {
  factorial(n) {
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  },
  countVowels(s) {
    return (s.match(/[aeiou]/gi) || []).length;
  },
  reverse(s) {
    return [...s].reverse().join("");
  },
  isPalindrome(s) {
    return s === ref.reverse(s);
  },
  titleCase(s) {
    return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  },
};

let genuine = 0;
// Tier labels live here (reports.json itself must stay pure {fn,input,expected}
// per the challenge README). Tier 1 rows are the first 8 in reports.json.
for (let i = 0; i < reports.length; i++) {
  const r = reports[i];
  const tier = i < 8 ? "verified" : "plausible";
  const actual = u[r.fn](r.input);
  const refOut = ref[r.fn](r.input);
  const isBug = JSON.stringify(actual) !== JSON.stringify(r.expected);
  const refAgrees = JSON.stringify(refOut) === JSON.stringify(r.expected);
  if (isBug && refAgrees) genuine++;
  console.log(
    `${isBug && refAgrees ? "GENUINE" : "CHECK  "} [${tier}] ${r.fn}(${JSON.stringify(r.input)}) ` +
      `buggy=${JSON.stringify(actual)} expected=${JSON.stringify(r.expected)} reference=${JSON.stringify(refOut)}`
  );
}
console.log(`\n${genuine}/${reports.length} reports are genuine bugs against the independent reference.`);
