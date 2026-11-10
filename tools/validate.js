// 数据校验：node tools/validate.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const topicFiles = fs.readdirSync(path.join(root, 'assets/data'))
  .filter(f => /^topics-.*\.js$/.test(f)).sort()
  .map(f => 'assets/data/' + f);
const files = ['assets/data/core.js'].concat(topicFiles);

const ctx = { window: {}, console };
vm.createContext(ctx);
for (const f of files) {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
}

const B = ctx.window.BSCT;
const topics = B.TOPICS;
const han = s => (s.match(/[\u4e00-\u9fa5]/g) || []).length;
const clean = s => s.replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, '');
const bigrams = s => {
  const c = clean(s), out = [];
  for (let i = 0; i < c.length - 1; i++) out.push(c.slice(i, i + 2));
  return out;
};
const sim = (a, b) => {
  const A = new Set(bigrams(a)), B = new Set(bigrams(b));
  let inter = 0;
  A.forEach(x => { if (B.has(x)) inter++; });
  const jac = inter / (A.size + B.size - inter || 1);
  const cont = inter / (Math.min(A.size, B.size) || 1);
  return Math.max(jac, cont * 0.82);
};

const errors = [];
const warns = [];
const ids = new Set();
const titles = new Set();

console.log('题目总数:', topics.length);
console.log('方向分布:');
const byField = {};
topics.forEach(t => { byField[t.field] = (byField[t.field] || 0) + 1; });
Object.entries(byField).forEach(([k, v]) => console.log('  ' + k.padEnd(8) + v));

let maxPast = { sim: 0 };
for (const t of topics) {
  const h = han(t.title);
  if (h > 25) errors.push(`标题超过 25 字 (${h}): ${t.title}`);
  if (h < 10) warns.push(`标题偏短 (${h}): ${t.title}`);
  if (/基于\s*(Java|Python|C\+\+|C语言|C#|Go|PHP|JavaScript|Node\.?js|Vue|Spring)/i.test(t.title)) {
    errors.push(`以语言命名: ${t.title}`);
  }
  if (!B.FIELDS[t.field]) errors.push(`未知方向 ${t.field}: ${t.id}`);
  if (!B.TYPE_LABELS[t.type]) errors.push(`未知类型 ${t.type}: ${t.id}`);
  if (ids.has(t.id)) errors.push(`重复 id: ${t.id}`);
  ids.add(t.id);
  if (titles.has(t.title)) errors.push(`重复标题: ${t.title}`);
  titles.add(t.title);
  if (t.features.length !== 4) warns.push(`${t.id} 功能数 ${t.features.length}`);
  if (t.steps.length < 4) warns.push(`${t.id} 阶段数 ${t.steps.length}`);
  if (t.design.length < 3) warns.push(`${t.id} 设计要点 ${t.design.length}`);
  for (const k of t.skills) if (!B.SKILLS[k]) errors.push(`未知技能 ${k}: ${t.id}`);
  for (const p of B.PAST) {
    const s = sim(t.title, p.t);
    if (s > maxPast.sim) maxPast = { sim: s, topic: t.title, past: p.t };
    if (s >= 0.5) errors.push(`与往届高度雷同 (${(s * 100).toFixed(0)}%): ${t.title} ↔ ${p.t}`);
    else if (s >= 0.35) warns.push(`与往届较像 (${(s * 100).toFixed(0)}%): ${t.title} ↔ ${p.t}`);
  }
}

console.log('\n最大往届相似度:', (maxPast.sim * 100).toFixed(1) + '%', '|', maxPast.topic, '↔', maxPast.past);
console.log('标题字数范围:', Math.min(...topics.map(t => han(t.title))), '-', Math.max(...topics.map(t => han(t.title))));
console.log('\n错误', errors.length, '警告', warns.length);
errors.forEach(e => console.log('  [E]', e));
warns.forEach(w => console.log('  [W]', w));
process.exit(errors.length ? 1 : 0);
