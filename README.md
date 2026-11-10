# 毕设选题参谋

面向计算机类本科毕业设计的选题推荐与规范自检工具。回答四个问题，得到符合学院选题规范、可直接写进开题报告的题目方案；也可以直接浏览题目库，或把已经想好的题目丢进自检。

纯前端、零依赖、可离线：双击 `index.html` 就能用，数据只存在本机浏览器里。

## 打开方式

- **直接双击 `index.html`**（推荐）。所有脚本都是普通 `<script>`，`file://` 下也能正常运行。
- 或起一个静态服务器：`python -m http.server 8080`，访问 `http://localhost:8080`。
  用 `http://` 打开时还能把页面「添加到主屏幕」，以独立窗口运行（`manifest.webmanifest`）。

## 功能

| 页面 | 说明 |
| --- | --- |
| 首页 `#/home` | 三种典型画像一键体验、流程说明、题目示例 |
| 选题测评 `#/match` | 四步问卷：基础情况 → 兴趣方向 → 项目经历 → 导师与约束 |
| 匹配结果 `#/result` | 按方向 / 技能 / 经历关键词 / 导师方向 / 难度偏好排序，可筛选与换一批 |
| 题目库 `#/library` | 100 个题目，按方向筛选、关键词搜索 |
| 题目详情 `#/topic/:id` | 功能拆解、技术栈、架构、设计要点、实施排期、方案对比、风险 |
| 题目自检 `#/check` | 字数、语言命名、结构完整度、与 18 个往届题目相似度、空泛词 |
| 选题规则 `#/guide` | 五条硬规则的落地解释、往届优秀题目与可借鉴点、时间线与论文章节建议 |
| 我的收藏 `#/saved` | 备选题目对比 |

每个题目详情页可以生成导师私信、收藏，导出则分三种粒度：

- **单题选题说明**：详情页或结果卡片的「导出」，Markdown 含摘要、主要功能、技术栈、架构、设计要点、排期与自检；
- **本页 6 个备选**：匹配结果页的「导出本页方案」，一份文件对比 6 个题目的功能与技术总结；
- **收藏清单**：收藏页的「导出备选清单」，把备选题汇总成一份。

导师私信按「主要功能 / 实现技术 / 与现有方案对比 / 工作量 / 自检结果」组织，复制即可发。

## 题目库

100 题，覆盖 8 个方向：大模型与智能体（15）、机器学习与视觉（15）、Web 与行业系统（14）、移动端与小程序（11）、网络与分布式（11）、嵌入式与物联网（11）、信息安全与隐私（12）、数据与可视化（11）。

选题规则已内建：

- 题目汉字数 ≤ 25（当前 16—22 字）；
- 不以「基于 Java / Python…」命名；
- 每题包含 4 个功能模块、3—4 个设计要点、5 个实施阶段、与现有方案的对比、难点与风险；
- 与上一届 18 个校级优秀题目做相似度比对，最高 32.8%，低于 35% 的提醒阈值；100 题两两之间也没有高度雷同。

## 目录

```
index.html                  页面骨架
assets/style.css            全部样式（含响应式与打印样式）
assets/app.js               路由、匹配算法、自检、文案生成
assets/data/core.js         方向 / 技能 / 场景 / 往届题目
assets/data/topics-*.js     100 个题目（按方向分八个文件）
assets/icon.svg             图标
manifest.webmanifest        PWA 清单
tools/validate.js           题目数据校验
tools/e2e.html              端到端交互测试（同源 iframe 驱动）
tools/metrics.html          390px 布局溢出检测
tools/mobile.html           手机尺寸预览
```

## 校验与测试

```bash
node tools/validate.js
```

检查题目数量、方向分布、标题字数、语言命名、重复 id / 标题、字段完整性、与往届题目的相似度。

交互测试（需要 Edge / Chrome）：

```powershell
& 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe' `
  --headless=new --disable-gpu --allow-file-access-from-files `
  --window-size=1360,900 --virtual-time-budget=12000 --dump-dom `
  "file:///<项目路径>/tools/e2e.html" | Select-String 'TOTAL'
```

覆盖：首屏、问卷四步、必填拦截、结果页、类型筛选、详情、收藏、私信弹窗、自检、题目库搜索、收藏页、规则页。

## 加题目 / 改方向

在 `assets/data/topics-*.js` 里追加一个对象即可，字段参考已有题目：

```js
{
  id: 'llm-xxx', title: '面向……的设计与实现',
  field: 'llm', type: 'system', difficulty: 3, weeks: 12, hardware: false,
  tags: [], skills: [], keywords: [],
  oneLine: '', problem: '', features: [{ t: '', d: '' }],
  stack: [], arch: '', design: [], steps: [{ w: '', t: '', d: '' }],
  compare: '', hard: [], thesis: [], pitch: ''
}
```

方向、技能、场景在 `core.js` 里扩展；`app.js` 的 `rankTopics` 负责打分，`analyzeTitle` 负责自检。

## 说明

- 题目、工作量与排期是示例，提交前请和指导教师确认数据、设备与场地是否可得。
- 往届题目仅用于相似度比对，不代表最终查重结论。
- 当前是网页版。若要打包成 Android APK，可用 Capacitor / TWA 套壳（需本机 Android SDK），无需改动现有代码。
