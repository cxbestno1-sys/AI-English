# SpeakNow - AI英语学习应用 完整方案

## 1. 技术栈
- 前端: React 18 + Vite + TypeScript + Tailwind CSS
- 构建: Vite 6
- 路由: React Router 6
- 图标: Lucide React
- 语音: Web Speech API（TTS + STT，浏览器内置）
- 音频: Web Audio API（TTS 录制 + WAV 导出）
- AI: 可配置 LLM（默认 OpenAI，支持自定义端点）
- 存储: localStorage（API Key、用户进度、得分、历史）
- 导出: JSZip（打包多个文件为 .zip 下载）
- 设计: 移动端优先响应式，后续转 Android（Capacitor）

## 2. LLM 适配器设计（多模型支持）

LLMAdapter 接口，支持多后端：
- OpenAI (gpt-4o-mini 默认)
- 自定义端点 (任意兼容 OpenAI API 格式的模型)

用户可在设置页配置 API Key 和端点。

## 3. 核心功能模块

### 3.1 智能内容生成（升级）

**输入类型自动判断** + **用户可手动切换**

```
用户粘贴 "apple" (单词)     → AI 推荐: 对话 (适合单个物品认知)
用户粘贴 "The weather is nice today" (句子) → AI 推荐: 故事 (适合有上下文的内容)
用户粘贴 "check in, luggage, boarding pass" (多个短语) → AI 推荐: 对话 (多场景词汇)
```

**交互流程：**

```
┌─────────────────────────────────┐
│  [输入框: 粘贴单词/短语/句子]    │
│                                 │
│  ▸ AI 智能推荐: 🗣️ 日常对话     │
│     "单个单词适合对话记忆"       │
│                                 │
│  或 切换为: 📖 小故事            │
│                                 │
│  [场景选择] [难度选择]           │
│                                 │
│  [生成]                         │
└─────────────────────────────────┘
```

- AI 先快速判断输入内容最适合的形式（用一次轻量 API 调用）
- 用户可一键切换为另一种形式再重新生成
- 两种模式使用不同的 Prompt 模板

**生成输出格式：**
```json
{
  "title": "在咖啡店",
  "type": "dialogue" | "story",
  "keywords": ["coffee", "order", "milk"],
  "lines": [
    { "speaker": "barista", "english": "...", "chinese": "..." },
    { "speaker": "customer", "english": "...", "chinese": "..." }
  ]
}
```

### 3.2 TTS 朗读 + 音频导出

#### 朗读
- Web Speech API speechSynthesis
- 每句独立播放按钮
- 调速：0.5x, 0.75x, 1.0x, 1.25x, 1.5x
- 连续播放模式
- 美式英语语音优先

#### 音频导出（新增）
```
每条句子的播放控件旁: [🔊] [📥]

导出选项:
┌──────────────────────┐
│ 📥 导出音频           │
│   ├── 导出当前句     │  →  单句 .wav
│   ├── 导出全部       │  →  JSZip 打包 .zip
│   └── 拼接成一段     │  →  所有句合并为一个 .wav
└──────────────────────┘
```

**实现方式：**
- 用 Web Audio API + MediaStreamDestination 捕获 TTS 音频流
- 录制成 WAV 格式（浏览器原生支持，手机通用）
- 支持单句导出、全部导出、合并导出三种模式
- 文件命名：`{标题}_{序号}_{角色名}.wav`

### 3.3 跟读 + 发音评分
- 点击 🎤 跟读按钮 → 启动录音
- Web Speech API SpeechRecognition 转文字
- 发送对比请求到 LLM 分析
- 返回评分 + 改进建议

### 3.4 得分 + 奖励系统

#### 得分规则
| 行为 | 经验值 |
|------|--------|
| 生成一次内容（对话/故事） | +5 XP |
| 完整听读一组内容 | +10 XP |
| 跟读评分 ≥ 90 | +20 XP + 金牌 |
| 跟读评分 70-89 | +15 XP + 银牌 |
| 跟读评分 < 70 | +5 XP |
| 连续 3 天登录 | +30 XP |
| 导出一次音频 | +3 XP |

#### 等级体系
```
Lv.1  初学者    (0-100 XP)
Lv.2  入门者    (100-300 XP)
Lv.3  进阶者    (300-600 XP)
Lv.4  流利者    (600-1000 XP)
Lv.5  精通者    (1000-2000 XP)
Lv.6  大师      (2000+ XP)
```

#### 徽章系统
| 徽章 | 条件 |
|------|------|
| 🌱 First Step | 第一次生成内容 |
| 🗣️ Talker | 第一次跟读 |
| 💯 Perfect | 一次跟读 ≥ 95 分 |
| 🔥 3-Day Streak | 连续3天学习 |
| 🌍 Explorer | 使用5种不同场景 |
| 📚 Storyteller | 完成一篇故事学习 |
| ⭐ Gold Rush | 累计获得10枚金牌 |
| 🎯 Sharp Ear | 连续5次跟读 ≥ 85 分 |
| 🎒 Sound Collector | 导出3次音频 |
| 🏆 Champion | 达到 Lv.5 |
| 🎓 Graduate | 完成全部10种场景 |

#### 进步追踪
- 今日学习时长 / 次数
- 连续学习天数
- 总跟读次数 / 平均得分
- 总导出次数
- 场景解锁进度

## 4. 页面设计

```
/                     # 首页 - 内容生成
  ├── InputPanel      # 粘贴/输入
  ├── SmartSuggest    # AI 智能推荐 + 手动切换
  ├── SceneSelector   # 场景选择
  ├── DifficultyBar   # 难度选择
  └── GenerateBtn     # 生成按钮

/learn/:id            # 学习页（对话/故事）
  ├── ContentHeader   # 标题 + 类型标签 + 导出按钮
  ├── ExportDropdown  # 导出菜单
  ├── DialogueCard    # 每条对话/故事片段
  │   ├── PlayBtn(x3) # 慢速/正常/连续
  │   ├── ExportBtn   # 导出单句
  │   └── RecordBtn   # 跟读
  ├── ScoreResult     # 评分结果
  └── ContinueBar     # 下一句 / 结束

/history              # 历史记录
  └── HistoryList     # 按时间排序

/profile              # 个人中心
  ├── LevelDisplay    # 等级 + 经验条
  ├── BadgesGrid      # 徽章墙
  ├── StatsPanel      # 学习统计
  └── Settings        # API Key、模型选择
```

## 5. 文件结构

```
AI english/
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   └── index.css
│
│── api/
│   ├── llm/
│   │   ├── adapter.ts       # LLMAdapter 接口
│   │   ├── openai.ts        # OpenAI 适配器
│   │   ├── custom.ts        # 自定义端点适配器
│   │   └── index.ts
│   └── types.ts
│
│── features/
│   ├── content/
│   │   ├── generate.ts      # AI 生成（对话+故事）
│   │   ├── recommend.ts     # AI 智能推荐对话/故事
│   │   └── types.ts
│   ├── tts/
│   │   ├── speak.ts         # TTS 朗读
│   │   ├── recorder.ts      # TTS 音频录制
│   │   ├── export.ts        # WAV 导出 + ZIP 打包
│   │   └── types.ts
│   ├── stt/
│   │   ├── listen.ts
│   │   ├── score.ts
│   │   └── types.ts
│   └── progress/
│       ├── store.ts
│       ├── levels.ts
│       ├── badges.ts
│       ├── rewards.ts
│       └── types.ts
│
│── components/
│   ├── Header.tsx
│   ├── InputPanel.tsx
│   ├── SmartSuggest.tsx     # AI 推荐 + 手动切换
│   ├── SceneSelector.tsx
│   ├── DifficultyBar.tsx
│   ├── DialogueCard.tsx
│   ├── SpeedControl.tsx
│   ├── RecordButton.tsx
│   ├── ExportButton.tsx     # 音频导出按钮
│   ├── ScoreResult.tsx
│   ├── LevelDisplay.tsx
│   ├── BadgeWall.tsx
│   ├── StatsPanel.tsx
│   ├── SettingsPanel.tsx
│   └── Layout.tsx
│
│── hooks/
│   ├── useSpeechSynthesis.ts
│   ├── useSpeechRecognition.ts
│   ├── useTTSExport.ts      # 导出 hook
│   ├── useProgress.ts
│   ├── useLLM.ts
│   └── useScore.ts
│
│── utils/
│   ├── prompts.ts
│   ├── storage.ts
│   └── wavEncoder.ts        # WAV 编码工具
│
│── types/
│   ├── dialogue.ts
│   ├── progress.ts
│   └── llm.ts
│
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── tsconfig.node.json
└── README.md
```

## 6. AI Prompt 设计

### 智能推荐 Prompt
```
根据用户输入的内容，判断最适合的英语学习形式。

输入: "{input}"

返回: {
  "recommended_type": "dialogue" | "story",
  "reason": "简短说明原因"
}

判断依据:
- 单个单词/名词短语 → 对话
- 一句话/完整句子 → 故事
- 多个相关短语 → 对话
- 抽象概念/情感表达 → 故事
```

### 生成对话 Prompt
```
你是一位英语教师。根据用户输入的内容，生成一段{scene}场景的对话。

输入内容: "{input}"
难度: {difficulty}

要求:
- 包含用户输入的所有关键词
- 每条对话包含英文和中文翻译
- 1-4轮对话
- 自然、实用

返回JSON:
{
  "title": "场景标题",
  "lines": [
    { "speaker": "角色名", "english": "", "chinese": "" }
  ]
}
```

### 生成故事 Prompt
```
你是一位英语教师。根据用户输入的内容，创作一篇小故事。

输入内容: "{input}"
难度: {difficulty}

要求:
- 围绕用户输入的内容展开
- 每条"叙述"包含英文和中文翻译
- 3-6个小段落
- 有趣、有画面感

返回JSON:
{
  "title": "故事标题",
  "lines": [
    { "narrator": "旁白", "english": "", "chinese": "" }
  ]
}
```

### 发音评分 Prompt
```
对比用户的发音识别结果和目标句子，评估发音准确度。

目标: "{target}"
识别结果: "{user_said}"

返回JSON:
{
  "score": 0-100,
  "matched_words": [],
  "missing_words": [],
  "wrong_words": [{"expected": "", "said": ""}],
  "feedback": "中文反馈",
  "tips": ["具体的发音建议"]
}
```

## 7. 实施顺序

Phase 1: 项目基础
1. 初始化 Vite + React + TS + Tailwind + React Router
2. 搭建文件结构和基础组件
3. 页面布局和路由

Phase 2: AI 集成
4. LLM 适配器层（OpenAI + 自定义）
5. Prompt 模板 + 智能推荐功能
6. 内容生成（对话 + 故事）

Phase 3: 语音功能
7. TTS 朗读（含调速 + 连续播放）
8. TTS 音频录制 + WAV 导出（含 JSZip 打包）
9. STT 语音识别

Phase 4: 评分系统
10. 跟读 + 发音评分
11. 经验值 + 等级系统

Phase 5: 奖励与进度
12. 徽章系统
13. 进步追踪 + 历史记录

Phase 6: 打磨
14. UI 精细化 + 加载状态
15. 错误处理 + 边界情况
16. 移动端适配 + 测试
