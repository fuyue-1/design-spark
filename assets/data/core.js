/* 基础配置：方向、技能、场景、往届题目 */
(function () {
  const FIELDS = {
    llm:    { name: '大模型与智能体', short: '大模型',   icon: 'spark',   desc: 'RAG · Agent · 多模态问答', color: '#5b5bd6' },
    ai:     { name: '机器学习与视觉', short: '机器学习', icon: 'activity', desc: '检测 · 识别 · 预测 · 推荐', color: '#0e8b80' },
    web:    { name: 'Web 与行业系统', short: 'Web系统',  icon: 'layout',  desc: '全栈业务系统与平台', color: '#2b6cb0' },
    mobile: { name: '移动端与小程序', short: '移动端',   icon: 'phone',   desc: '小程序 · App · 跨端应用', color: '#a86400' },
    net:    { name: '网络与分布式',   short: '网络分布式', icon: 'network', desc: '云原生 · 调度 · 可观测', color: '#7c5cd6' },
    iot:    { name: '嵌入式与物联网', short: '嵌入式',   icon: 'cpu',     desc: '软硬结合 · 传感与控制', color: '#c05621' },
    sec:    { name: '信息安全与隐私', short: '安全',     icon: 'shield',  desc: '检测 · 认证 · 水印 · 合规', color: '#bd3a2f' },
    data:   { name: '数据与可视化',   short: '数据可视化', icon: 'chart',  desc: '分析 · 图谱 · 数字孪生', color: '#2c7a7b' }
  };

  const SKILLS = {
    python: 'Python',
    java: 'Java',
    js: 'JavaScript',
    ts: 'TypeScript',
    go: 'Go',
    cpp: 'C / C++',
    sql: 'SQL 与数据库',
    vue: 'Vue / React',
    spring: 'Spring Boot',
    fastapi: 'FastAPI / Django',
    torch: 'PyTorch',
    cv: 'OpenCV',
    llm: '大模型 API',
    rag: 'RAG / 向量检索',
    agent: 'Agent / 工具调用',
    android: 'Android',
    mini: '微信小程序',
    embed: '嵌入式开发',
    pcb: '电路与硬件',
    docker: 'Docker / K8s',
    netdev: '网络协议与配置',
    sec: '安全攻防基础',
    viz: '数据可视化',
    three: 'Three.js / WebGL',
    asr: '语音处理',
    gis: 'GIS / 地图'
  };

  const SKILL_ORDER = Object.keys(SKILLS);

  const MAJORS = [
    '计算机科学与技术', '软件工程', '人工智能', '网络工程', '物联网工程',
    '数据科学与大数据技术', '信息安全', '电子信息工程', '自动化', '其他理工科专业'
  ];

  const LEVELS = [
    { k: 'basic',    l: '入门水平',       d: '学过基础课，独立项目经验较少' },
    { k: 'course',   l: '做过课程项目',   d: '能独立完成增删改查与简单算法' },
    { k: 'project',  l: '有完整项目经验', d: '做过前后端或软硬件完整作品' },
    { k: 'practice', l: '有实习或竞赛',   d: '参与过真实项目、拿过竞赛奖项' }
  ];

  const EXPERIENCES = [
    { k: 'course', l: '课程设计' },
    { k: 'competition', l: '学科竞赛' },
    { k: 'intern', l: '实习项目' },
    { k: 'lab', l: '实验室 / 大创' },
    { k: 'self', l: '自学项目' },
    { k: 'none', l: '还没有' }
  ];

  const SCENES = ['校园', '医疗健康', '教育', '文旅', '电商', '农业', '工业', '金融', '政务', '养老', '交通', '环保'];

  /* 上一届校级优秀论文题目 */
  const PAST = [
    { t: '基于大模型的心理健康智能检测与干预系统的设计与实现', dir: '大模型', note: '把"检测—干预"做成闭环，风险分级与人工兜底清楚，难点在识别与策略而非调 API。' },
    { t: '基于物理信息机器学习的动力学模型映射技术研究与应用', dir: '机器学习', note: '把物理约束嵌入模型，有明确对比基线，属于"算法研究型"题目的写法。' },
    { t: '基于GraphRag和LLM的河南旅游智能推荐系统的设计与实现', dir: '大模型', note: '图谱 + 检索增强，选一个区域做深，数据来源真实可落地。' },
    { t: '基于SM9部分盲签名算法的电子投票系统的设计与实现', dir: '信息安全', note: '密码学协议实现 + 安全属性验证，工作量在设计协议流程与攻击测试。' },
    { t: '基于uni-app与OCR的个人医疗报告智能管理分析系统设计与实现', dir: '移动端', note: '跨端 + OCR，重点是把指标趋势解释清楚，而不是只做识别。' },
    { t: '基于 Go 语言的分布式 Mesh 负载均衡系统设计与实现', dir: '分布式', note: '分布式系统题，核心在故障转移与压测数据，题目虽含语言但落点是系统能力。' },
    { t: '基于协同过滤和神经网络的个性化学习推荐算法研究', dir: '算法', note: '两种方案对比 + 离线评测，适合偏算法、不想做界面的同学。' },
    { t: '基于大模型的智能慕课平台设计与实现', dir: '大模型', note: '大模型嵌入教学流程（出题、答疑、学情），平台是载体，智能是重点。' },
    { t: '基于大语言模型的海洋知识科普AI Agent的设计与实现', dir: '大模型', note: '领域 Agent + 工具调用，有明确的领域知识边界与评测方式。' },
    { t: '社交媒体知识驱动的多模态指代消解系统设计与实现', dir: '多模态', note: '数据集与评价指标明确，属于典型的多模态算法题。' },
    { t: '基于WebRTC协议和Netty信令服务器的可控p2p远程控制系统设计与实现', dir: '网络', note: '实时通信 + 信令设计，工程难点在 NAT 穿透与连接稳定性。' },
    { t: '基于多智能体的智慧学习平台的设计与实现', dir: '多智能体', note: '多角色协作是卖点，需要把每个 Agent 的职责与消息协议设计清楚。' },
    { t: '基于 YOLOv8的危险驾驶行为识别模型设计与实现', dir: '视觉', note: '检测模型 + 场景数据，工作量在数据标注与调优。' },
    { t: '基于STM32+ESP8266的智慧家居照明控制系统的设计与实现', dir: '嵌入式', note: '软硬结合，端云协同链路完整，硬件成本可控。' },
    { t: '基于机器学习的心脏病预测系统设计与实现', dir: '机器学习', note: '医疗数据建模，重点在特征选择、模型对比与可解释性。' },
    { t: '基于微信小程序的零食商城的设计与实现', dir: '小程序', note: '完整业务闭环 + 工程规范，属于"稳"的系统开发题。' },
    { t: '基于STM32单片机的老年人健康监护系统的设计与实现', dir: '嵌入式', note: '硬件采集 + 异常告警，场景明确、可演示。' },
    { t: '面向算网融合的大模型协同训练方法的设计与验证', dir: '前沿', note: '前沿方向 + 仿真验证，题目新、研究空间足，但对基础要求高。' }
  ];

  const TYPE_LABELS = { system: '系统开发', algorithm: '算法研究', hardware: '软硬结合' };
  const DIFF_LABELS = { 1: '入门', 2: '较易', 3: '适中', 4: '较难', 5: '挑战' };
  const AMBITION = [
    { k: 'safe', l: '求稳', d: '优先保证能做完、能演示' },
    { k: 'balanced', l: '适中', d: '有一点难度，但风险可控' },
    { k: 'challenge', l: '挑战', d: '愿意投入更多时间做深' }
  ];

  const TOPICS = [];

  function addTopics(list) {
    list.forEach(function (t) {
      TOPICS.push(Object.assign({
        type: 'system',
        difficulty: 3,
        hardware: false,
        tags: [],
        skills: [],
        keywords: []
      }, t));
    });
  }

  window.BSCT = {
    FIELDS: FIELDS,
    SKILLS: SKILLS,
    SKILL_ORDER: SKILL_ORDER,
    MAJORS: MAJORS,
    LEVELS: LEVELS,
    EXPERIENCES: EXPERIENCES,
    SCENES: SCENES,
    PAST: PAST,
    TYPE_LABELS: TYPE_LABELS,
    DIFF_LABELS: DIFF_LABELS,
    AMBITION: AMBITION,
    TOPICS: TOPICS,
    addTopics: addTopics
  };
})();
