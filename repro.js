// repro.js — probe every function in utils.js with normal + edge inputs.
// Run: node repro.js
// Prints actual output for each case so a human can judge actual vs correct.
const u = require("./utils.js");

function show(fn, input, actual) {
  console.log(`${fn}(${JSON.stringify(input)}) => ${JSON.stringify(actual)}`);
}

console.log("--- factorial (annotated bug: i<n drops n) ---");
[0, 1, 2, 3, 5, 10].forEach((n) => show("factorial", n, u.factorial(n)));
console.log("correct: 0!=1, 1!=1, 2!=2, 3!=6, 5!=120, 10!=3628800");

console.log("\n--- countVowels (annotated bug: misses uppercase) ---");
["AEIOU", "Hello World", "AEIOUaeiou", "bcdfg", "", "AeIoU"].forEach((s) =>
  show("countVowels", s, u.countVowels(s))
);
console.log('correct: "AEIOU"=5, "Hello World"=3, "AEIOUaeiou"=10, "bcdfg"=0, ""=0, "AeIoU"=5');

console.log("\n--- reverse (unicode probe) ---");
["abc", "", "a", "😀a", "a😀b", "é", "ab😀", "hello"].forEach((s) =>
  show("reverse", s, u.reverse(s))
);
console.log('correct (code-point aware): "😀a"="a😀", "a😀b"="b😀a", "ab😀"="😀ba"');

console.log("\n--- isPalindrome ---");
["racecar", "Racecar", "madam", "hello", "😀😀", "😀a😀", ""].forEach((s) =>
  show("isPalindrome", s, u.isPalindrome(s))
);

console.log("\n--- titleCase ---");
["hello world", "HELLO WORLD", "don't", "hello-world", "hELLO wORLD", "hello_world", "123abc", "it's a test", "a b c"].forEach((s) =>
  show("titleCase", s, u.titleCase(s))
);
console.log('naive-regex expectation: "HELLO WORLD" stays "HELLO WORLD"; lowercase-first expectation: "Hello World"');

console.log("\n--- sum / max / average ---");
show("sum", [1, 2, 3], u.sum([1, 2, 3]));
show("sum", [], u.sum([]));
show("sum", [0.1, 0.2], u.sum([0.1, 0.2]));
show("max", [1, 5, 3], u.max([1, 5, 3]));
show("max", [-1, -5], u.max([-1, -5]));
show("max", [5], u.max([5]));
show("max", [], u.max([]));
show("average", [1, 2, 3], u.average([1, 2, 3]));
show("average", [5], u.average([5]));
show("average", [], u.average([]));

console.log("\n--- clamp / unique ---");
show("clamp", [5, 0, 10], u.clamp(5, 0, 10));
show("clamp", [-1, 0, 10], u.clamp(-1, 0, 10));
show("clamp", [15, 0, 10], u.clamp(15, 0, 10));
show("clamp", [0, 0, 10], u.clamp(0, 0, 10));
show("clamp", [10, 0, 10], u.clamp(10, 0, 10));
show("unique", [1, 1, 2, 2, 3], u.unique([1, 1, 2, 2, 3]));
show("unique", [NaN, NaN], u.unique([NaN, NaN]));
show("unique", [-0, 0], u.unique([-0, 0]));
show("unique", ["a", "a", "b"], u.unique(["a", "a", "b"]));

console.log("\n--- SUMMARY of confirmed mismatches ---");
const checks = [
  { fn: "factorial", input: 5, actual: u.factorial(5), expected: 120 },
  { fn: "factorial", input: 2, actual: u.factorial(2), expected: 2 },
  { fn: "factorial", input: 3, actual: u.factorial(3), expected: 6 },
  { fn: "countVowels", input: "AEIOU", actual: u.countVowels("AEIOU"), expected: 5 },
  { fn: "countVowels", input: "HELLO", actual: u.countVowels("HELLO"), expected: 2 },
  { fn: "countVowels", input: "AeIoU", actual: u.countVowels("AeIoU"), expected: 5 },
];
let fails = 0;
for (const c of checks) {
  const ok = JSON.stringify(c.actual) === JSON.stringify(c.expected);
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"} ${c.fn}(${JSON.stringify(c.input)}) actual=${JSON.stringify(c.actual)} expected=${JSON.stringify(c.expected)}`);
}
console.log(`confirmed failing checks: ${fails}/${checks.length}`);
