// 为 150 个题目生成带具体技术的 2—3 个表述
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const ctx = { window: {} };
vm.createContext(ctx);
const files = ['assets/data/core.js'].concat(
  fs.readdirSync(path.join(root, 'assets/data'))
    .filter(f => /^topics-.*\.js$/.test(f)).sort()
    .map(f => 'assets/data/' + f)
);
for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
const topics = ctx.window.BSCT.TOPICS;

const TECH = {
  'llm-course-rag': 'RAG',
  'llm-lab-agent': 'LangGraph与工具调用',
  'llm-thesis-format': '规则引擎',
  'llm-heritage-graphrag': 'GraphRAG',
  'llm-accessibility': '多模态大模型',
  'llm-textbook-tutor': '多模态大模型',
  'llm-code-review': '代码静态分析',
  'llm-contract': '条款分类',
  'llm-meeting': '语音转写',
  'llm-policy': 'RAG',
  'llm-review-absa': 'BERT',
  'llm-triage': '规则引擎',
  'llm-negotiation': '大语言模型',
  'llm-question-gen': '大语言模型',
  'llm-campus-voice': '语音识别',

  'ai-weld-defect': 'YOLOv8与注意力机制',
  'ai-crop-disease': '多光谱影像',
  'ai-signal-timing': '强化学习',
  'ai-secondhand-rec': '知识图谱',
  'ai-dialect-asr': 'Whisper',
  'ai-insulator': 'YOLOv8',
  'ai-rehab': 'MediaPipe',
  'ai-stress': '可穿戴生理信号',
  'ai-air-quality': '图神经网络',
  'ai-sales-forecast': 'LightGBM',
  'ai-remote-sensing': '孪生网络',
  'ai-bearing': '原型网络',
  'ai-text-similarity': 'BERT',
  'ai-person-reid': '度量学习',
  'ai-skin-lesion': 'U-Net',

  'web-lab-booking': 'Spring Boot与Vue',
  'web-homestay': 'Spring Boot与Vue',
  'web-timebank': 'Spring Boot与Vue',
  'web-tender': 'Spring Boot与Vue',
  'web-accreditation': 'Spring Boot与Vue',
  'web-parcel': 'Spring Boot与微信小程序',
  'web-textbook': 'Spring Boot与微信小程序',
  'web-groupbuy': 'Spring Boot与微信小程序',
  'web-inspection': 'Spring Boot与微信小程序',
  'web-ats': 'Spring Boot与Vue',
  'web-agri-supply': 'Spring Boot与微信小程序',
  'web-nursing': 'Spring Boot与微信小程序',
  'web-consumables': 'Spring Boot与Vue',
  'web-sports-meet': 'Spring Boot与微信小程序',

  'mobile-farm-adopt': '微信小程序与云开发',
  'mobile-sport-checkin': '微信小程序与Redis',
  'mobile-medication': '微信小程序',
  'mobile-shared-parking': '微信小程序与信用分',
  'mobile-canteen': '微信小程序',
  'mobile-pet': '微信小程序',
  'mobile-recycle': '微信小程序',
  'mobile-ar-guide': '图像识别与云开发',
  'mobile-housemate': '微信小程序',
  'mobile-fitness': 'MediaPipe',
  'mobile-bus': '微信小程序与TTS',

  'net-multilink': 'Mininet与策略路由',
  'net-cache-consistency': 'Redis与Canal',
  'net-trace-rootcause': 'OpenTelemetry',
  'net-k8s-scheduler': 'Kubernetes',
  'net-ipv6': 'NAT64',
  'net-sdn': 'OpenFlow与Ryu',
  'net-edge-offload': '边缘计算与强化学习',
  'net-blockchain-evidence': 'Hyperledger Fabric',
  'net-canary': 'Istio与Envoy',
  'net-topology': 'SNMP与LLDP',
  'net-file-transfer': '分片传输与断点续传',

  'iot-balcony': 'ESP32与MQTT',
  'iot-helmet': 'YOLO与边缘计算',
  'iot-dorm-power': 'STM32',
  'iot-aquaculture': 'STM32与LoRa',
  'iot-dorm-access': 'ESP32与RFID',
  'iot-ebike-charge': 'STM32与电流检测',
  'iot-cold-chain': 'ESP32与LoRa',
  'iot-streetlight': 'ESP32与LoRa',
  'iot-soil': 'STM32与LoRa',
  'iot-fall': '雷达点云',
  'iot-chemical-cabinet': 'ESP32与传感器',

  'sec-login-anomaly': '行为基线与图分析',
  'sec-photo-watermark': 'DCT与DWT',
  'sec-did': '区块链与可验证凭证',
  'sec-phishing': '邮件特征与机器学习',
  'sec-license': '代码指纹与SPDX',
  'sec-weakpass': '资产测绘与Nmap',
  'sec-malware-traffic': '加密流量与深度学习',
  'sec-federated': '差分隐私',
  'sec-deepfake': '频域与时序特征',
  'sec-password-manager': 'Argon2与k-匿名',
  'sec-ics-anomaly': 'Modbus与序列模型',
  'sec-masking': 'NER与规则匹配',

  'data-street-flow': '时空数据与PostGIS',
  'data-campus-carbon': '碳排放核算与情景模拟',
  'data-digital-twin': 'Three.js与WebSocket',
  'data-job-graph': 'Neo4j与图嵌入',
  'data-library': '关联规则与聚类',
  'data-grade-warning': '机器学习与过程性考核',
  'data-life-circle': 'GIS与等时圈',
  'data-campus-sentiment': 'BERTopic',
  'data-county-logistics': '时空数据与轨迹分析',
  'data-pv': 'LightGBM',
  'data-flu': '时序异常检测',

  'hci-tv-voice': '语音识别',
  'hci-kids-blocks': 'Blockly',
  'hci-haptic-nav': 'ESP32与触觉反馈',
  'hci-eye-reading': 'WebGazer',
  'hci-gesture-meeting': 'MediaPipe',
  'hci-elder-speaker': '语音识别与大模型',
  'hci-attention': 'MediaPipe与表情识别',
  'hci-screen-light': '环境光传感',
  'hci-vr-training': 'Unity与XR',
  'hci-input': '大语言模型与拼音纠错',
  'hci-cockpit': 'MediaPipe与视线估计',
  'hci-kiosk': 'Figma与可用性测试',

  'media-projection': 'OpenCV与投影映射',
  'media-light': '音频分析与WS2812',
  'media-subtitle': 'Whisper与FFmpeg',
  'media-picturebook': 'Vue与GSAP',
  'media-dance': 'MediaPipe与DTW',
  'media-museum': '微信小程序与AR',

  'llm-interview': '大语言模型与追问策略',
  'llm-product-copy': '多模态大模型',
  'llm-essay-feedback': '大语言模型',
  'llm-schedule-agent': '大语言模型与工具调用',
  'llm-legal-summary': '大语言模型',

  'ai-safety-vest': 'YOLO',
  'ai-bird': '迁移学习与MobileNet',
  'ai-library-count': 'LSTM',
  'ai-old-photo': 'GAN',
  'ai-waste': 'MobileNet',
  'ai-formula-ocr': '序列识别与LaTeX',

  'web-lostfound': '图像特征与向量检索',
  'web-court-booking': 'Spring Boot与并发控制',
  'web-repair': 'Spring Boot与派单算法',
  'web-award': 'Spring Boot与规则校验',
  'web-vaccine': 'Spring Boot与批次追溯',

  'mobile-campus-tour': '微信小程序与蓝牙定位',
  'mobile-pet-lost': '微信小程序与地理围栏',
  'mobile-carpool': '微信小程序与路线匹配',
  'mobile-swap': '微信小程序与信用分',

  'net-wireguard': 'WireGuard',
  'net-alert': 'Prometheus与告警聚合',
  'net-dns': 'DNS日志与机器学习',

  'iot-fishtank': 'ESP32与MQTT',
  'iot-pet-feeder': 'ESP32与称重传感',
  'iot-fire': 'STM32与多传感融合',

  'sec-captcha': '行为轨迹与机器学习',
  'sec-permission': 'Androguard与静态分析',
  'sec-qr': '页面特征与URL分析',

  'data-canteen': '消费数据与LightGBM',
  'data-bike': '时空聚类与DBSCAN',
  'data-parcel': 'LightGBM'
};

const EXTRA = {
  'net-file-transfer': '基于分片传输的大文件断点续传系统设计',
  'data-campus-carbon': '基于情景模拟的校园碳排放核算系统'
};

const REST = {
  'llm-course-rag': '课程问答系统设计与实现',
  'sec-deepfake': '深度伪造检测与溯源方法研究',
  'ai-weld-defect': '焊缝缺陷检测方法研究'
};

const han = s => (s.match(/[\u4e00-\u9fa5]/g) || []).length;

function stripPrefix(title) {
  let m = title.match(/^面向(.+?)的(.+)$/);
  if (m) return { rest: m[2].trim(), scene: m[1].trim() };
  m = title.match(/^基于(.+?)的(.+)$/);
  if (m) return { rest: m[2].trim(), scene: '' };
  m = title.match(/^融合(.+?)的(.+)$/);
  if (m) return { rest: m[2].trim(), scene: '' };
  return { rest: title.trim(), scene: '' };
}

function bigrams(s) {
  const c = s.replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, '');
  const out = [];
  for (let i = 0; i < c.length - 1; i++) out.push(c.slice(i, i + 2));
  return out;
}

const used = new Set();
const out = {};
const preview = [];

for (const t of topics) {
  const tech = TECH[t.id] || '';
  const parsed = stripPrefix(t.title);
  const scene = parsed.scene;
  const rest = REST[t.id] || parsed.rest;
  let restBased = rest;
  if (tech.indexOf('微信小程序') > -1) restBased = rest.replace(/小程序/g, '系统');

  const based = tech ? `基于${tech}的${restBased}` : '';
  let oriented = scene ? t.title : '';
  const fixed = withSuffix(t.title) || t.title;
  if (oriented && fixed.indexOf(oriented) === 0 && fixed !== oriented) oriented = '';
  const validSuffix = /(设计|实现|研究|验证|应用|开发)$/.test(rest);
  const plain = (rest !== t.title && validSuffix) ? rest : '';

  const list = [];
  const push = (x) => {
    if (!x || han(x) > 25 || used.has(x) || list.indexOf(x) > -1) return;
    list.push(x); used.add(x);
  };

  const techInOriented = oriented && bigrams(tech).some(g => oriented.indexOf(g) > -1);

  function withSuffix(title) {
    if (/(设计|实现|研究|验证|应用|开发)$/.test(title)) return '';
    if (/(生成|预测|识别|检测|分割|分类|推荐|调度|优化)$/.test(title)) {
      return t.type === 'algorithm' ? title + '方法研究' : title + '系统设计与实现';
    }
    return title + '设计与实现';
  }

  const candidates = (t.field === 'mobile' || !techInOriented)
    ? [based, oriented, fixed, plain]
    : [oriented, based, fixed, plain];
  candidates.forEach(push);
  if (EXTRA[t.id]) push(EXTRA[t.id]);
  if (!list.length) push(t.title);
  out[t.id] = list.slice(0, 3);
  preview.push(`## ${t.id}\n  1) ${list[0]}\n  2) ${list[1] || '-'}\n  3) ${list[2] || '-'}`);
}

const header = '/* 全部题目的题目表述（技术栈优先，自动生成 + 人工校对） */\nwindow.BSCT = window.BSCT || {};\nwindow.BSCT.TITLE_OVERRIDES = ';
fs.writeFileSync(path.join(root, 'assets/data/title-variants.js'),
  header + JSON.stringify(out, null, 2) + ';\n\nif (window.BSCT && window.BSCT.applyVariants) {\n  window.BSCT.applyVariants(window.BSCT.TITLE_OVERRIDES);\n}\n', 'utf8');

fs.writeFileSync(path.join(root, 'tools/title-variants-preview.txt'), preview.join('\n'), 'utf8');
console.log('generated', Object.keys(out).length, 'topics');
