import fs from "fs";
import path from "path";

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, acc);
    else if (p.endsWith(".tsx") || p.endsWith(".ts")) acc.push(p);
  }
  return acc;
}

const MAP = [
  ["#F5F3EC", "#292638"],
  ["#FAF6E9", "#292638"],
  ["#A7B8B0", "#898494"],
  ["#9EB0A8", "#898494"],
  ["#9FB3A9", "#A58ADD"],
  ["#F0D788", "#A58ADD"],
  ["#F8E49E", "#A58ADD"],
  ["#F6E2A8", "#A58ADD"],
  ["#FBEFC4", "#A58ADD"],
  ["#E5C158", "#7956C8"],
  ["#D4AF37", "#7956C8"],
  ["#C9B072", "#7956C8"],
  ["#06120D", "#FFFFFF"],
  ["#07110E", "#FFFFFF"],
  ["#0D1D17", "#FFFFFF"],
  ["#0B1C16", "#FAF8F3"],
  ["#0B1510", "#FAF8F3"],
  ["#071913", "#FAF8F3"],
  ["#0A2E22", "#F3EFFC"],
  ["#040807", "#FAF8F3"],
  ["#030505", "#FAF8F3"],
  ["#060A09", "#FAF8F3"],
  ["#050B09", "#FAF8F3"],
  ["#10201A", "#292638"],
  ["#16261E", "#292638"],
  ["#10B981", "#7956C8"],
  ["#34D399", "#A58ADD"],
  ["#6EE7B7", "#C9B6F2"],
  ["#38BDF8", "#7956C8"],
  ["#BAE6FD", "#C9B6F2"],
  ["#0E4B38", "#7956C8"],
  ["#061A14", "#F3EFFC"],
  ["#0B3A2A", "#E4D9F7"],
  ["#1A1607", "#F3EFFC"],
  ["#F7FFFB", "#FFFFFF"],
  ["#25D366", "#7956C8"],
  ["#128C7E", "#5B3AA6"],
];

const files = walk("src");
let changed = 0;

for (const file of files) {
  const original = fs.readFileSync(file, "utf8");
  let next = original;
  for (const [from, to] of MAP) {
    next = next.split(from).join(to);
  }
  if (next !== original) {
    fs.writeFileSync(file, next);
    changed++;
  }
}

console.log(`re-themed files: ${changed}`);
