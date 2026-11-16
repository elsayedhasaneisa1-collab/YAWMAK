import fs from "fs";
import path from "path";

const roots = ["src", "scripts"];
const extraFiles = ["public/manifest.json", "public/sw.js", ".env.example", "README.md"];

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

const files = [
  ...roots.flatMap((r) => (fs.existsSync(r) ? walk(r) : [])),
  ...extraFiles.filter((f) => fs.existsSync(f)),
];

const PHRASES = [
  ["احتفظ بنسخ احتياطية منتظمة من أعمالك المهمة.", "احتفظ بنسخ احتياطية منتظمة من أعمالك المهمة."],
  ["الحساب الرسمي لإدارة منصة يومك.", "الحساب الرسمي لإدارة منصة يومك."],
  ["منصة يومك اليومية لتنظيم المهام والتركيز والملاحظات.", "منصة يومك اليومية لتنظيم المهام والتركيز والملاحظات."],
  ["تمت إضافة العمل إلى الأرشيف", "تمت إضافة العمل إلى الأرشيف"],
  ["عرض هذه الصفحة للعامة (اختياري)", "عرض هذه الصفحة للعامة (اختياري)"],
  ["أرشيف المبادرات والإنجازات", "أرشيف المبادرات والإنجازات"],
  ["حدود التخزين والبيانات", "حدود التخزين والبيانات"],
  ["دعاء عام للبركة والعمل الصالح", "دعاء عام للبركة والعمل الصالح"],
  ["دعاء عام مأثور المعنى", "دعاء عام مأثور المعنى"],
  ["اجعل له دعاءً لا ينقطع", "اجعل له دعاءً لا ينقطع"],
  ["يومك… ببساطة وترتيب", "يومك… ببساطة وترتيب"],
  ["أرشيف الإنجازات", "أرشيف الإنجازات"],
  ["تعذر جلب السجل", "تعذر جلب السجل"],
  ["تعذر الحفظ", "تعذر الحفظ"],
  ["بطاقة تصميم", "بطاقة تصميم"],
  ["مجتمع هادف", "مجتمع هادف"],
  ["الإنجازات", "الإنجازات"],
  ["عطاء لا يتوقف", "عطاء لا يتوقف"],
  ["مشاركة جماعية", "مشاركة جماعية"],
  ["أرشيفي الشخصي", "أرشيفي الشخصي"],
  ["أعمالك", "أعمالك"],
  ["السجل", "السجل"],
  ["أرشيفي", "أرشيفي"],
  ["يومك", "يومك"],
];

const TOKENS = [
  ["YAWMAK", "YAWMAK"],
  ["Yawmak", "Yawmak"],
  ["yawmak", "yawmak"],
];

let changed = 0;

for (const file of files) {
  const original = fs.readFileSync(file, "utf8");
  let next = original;
  for (const [from, to] of PHRASES) next = next.split(from).join(to);
  for (const [from, to] of TOKENS) next = next.split(from).join(to);
  if (next !== original) {
    fs.writeFileSync(file, next);
    changed++;
  }
}

const renameMap = [];
function renameDeep(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) renameDeep(p);
    else if (/yawmak/i.test(entry.name)) {
      const target = path.join(dir, entry.name.replace(/yawmak/gi, (m) => (m === "YAWMAK" ? "YAWMAK" : m[0] === "A" ? "Yawmak" : "yawmak")));
      fs.renameSync(p, target);
      renameMap.push(`${p} -> ${target}`);
    }
  }
}

for (const root of roots) {
  if (fs.existsSync(root)) renameDeep(root);
}

const publicImages = "public/images";
if (fs.existsSync(publicImages)) {
  for (const entry of fs.readdirSync(publicImages)) {
    if (/yawmak/i.test(entry)) {
      const src = path.join(publicImages, entry);
      const target = path.join(publicImages, entry.replace(/yawmak/gi, "yawmak"));
      fs.renameSync(src, target);
      renameMap.push(`${src} -> ${target}`);
    }
  }
}

console.log(`files updated: ${changed}`);
console.log(`renames: ${renameMap.length}`);
for (const r of renameMap) console.log("  " + r);
