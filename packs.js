// 做题积累学习包：随应用启动自动合并一次；重复词只补充笔记，不重复建卡。
// 后续新增的词包继续往数组末尾追加，id 必须是新的，保证幂等。
export const learningPacks=[
  {
    id:'2026-11-05-practice-01',
    date:'2026-11-05',
    title:'2026-11-05 做题积累',
    marker:'【2026-11-05 做题积累】',
    entries:[
      {
        word:'sarcasm',
        phonetic:'[ˈsɑːrkæzəm]',
        definition:'n. 讽刺，挖苦，尖酸刻薄的话（形容词 sarcastic；副词 sarcastically）',
        mnemonic:'近义词：irony（反语/讽刺）、satire（讽刺文学/嘲讽）、mockery（嘲弄）、ridicule（奚落）。',
        collocations:''
      },
      {
        word:'literal',
        phonetic:'[ˈlɪtərəl]',
        definition:'adj. 字面上的，逐字的（副词 literally：字面上地；简直，真正地）',
        mnemonic:'近义词：word-for-word, exact, actual。词根 liter- = letter（文字、字母）。辨析：literal 字面上的 / literate 有文化的、识字的（illiterate 文盲的）/ literary 文学的。',
        collocations:''
      },
      {
        word:'irritation',
        phonetic:'[ˌɪrɪˈteɪʃn]',
        definition:'n. 恼怒，生气；刺激；恼人的事（动词 irritate；形容词 irritating）',
        mnemonic:'近义词：annoyance, frustration, displeasure, anger。谐音“一再提”：别人犯的小错你一再提，会激怒对方，引发恼怒。',
        collocations:''
      },
      {
        word:'hostility',
        phonetic:'[hɑːˈstɪləti]',
        definition:'n. 敌意，敌对状态（形容词 hostile）',
        mnemonic:'近义词：animosity, antagonism, malice（恶意）, unfriendliness。host- 在拉丁语中有“陌生人/敌人”之意。对比 hospitality（好客，殷勤招待，联想 hospital 的热情照顾）。',
        collocations:''
      },
      {
        word:'contemptible',
        phonetic:'[kənˈtemptəbl]',
        definition:'adj. 可鄙的，卑劣的，令人轻视的',
        mnemonic:'近义词：despicable, scornful, base, shameful。构词：con-（共同/加强）+ tempt（轻视）+ -ible（可……的）。易混：contemptible 令人鄙视的（被动）/ contemptuous 充满轻蔑的（主动，如 a contemptuous look）。',
        collocations:''
      },
      {
        word:'potent',
        phonetic:'[ˈpoʊtnt]',
        definition:'adj. 强有力的，烈性的，有效的（a potent spice 气味浓烈的香料）',
        mnemonic:'近义词：powerful, strong, mighty, effective。词根 pot- = power（力量）。同根词：potential（潜力，潜能）、impotent（无能为力的）。',
        collocations:'a potent spice 气味浓烈的香料'
      },
      {
        word:'absurdity',
        phonetic:'[əbˈsɜːrdəti]',
        definition:'n. 荒谬，荒唐的事（形容词 absurd）',
        mnemonic:'近义词：ridiculousness, nonsense, folly。谐音“俺不死的”：跳下万丈悬崖还说“俺不死的”，真是太荒谬、荒唐了。',
        collocations:''
      },
      {
        word:'belittle',
        phonetic:'[bɪˈlɪtl]',
        definition:'v. 贬低，轻视，小看',
        mnemonic:'近义词：put down, disparage, depreciate, look down upon, underestimate。前缀 be- + 形容词/名词 = 动词“使……成为……”；be- + little（小的）→ 把别人看得很小 → 贬低、小看。同类：befriend（把……当朋友）、bewilder（使困惑）。',
        collocations:'belittle and disrespect 贬低且不尊重'
      },
      {
        word:'retaliate',
        phonetic:'[rɪˈtælieɪt]',
        definition:'v. 报复，反击',
        mnemonic:'近义词：avenge, take revenge, strike back, get even。谐音“瑞-太-厉-害”：他打人“太厉害”，我们要反击、报复他。',
        collocations:'retaliate against 对……进行报复'
      },
      {
        word:'have something in common',
        aliases:['have sth. in common','have sth in common','have something in common with'],
        phonetic:'',
        definition:'有……共同之处（have sth. in common）',
        mnemonic:'近义：share similarities。写作可替换 have sth. in common with...。',
        collocations:''
      },
      {
        word:'tone of voice',
        phonetic:'',
        definition:'说话的语气、语调',
        mnemonic:'近义：way of speaking。注意 tone 还可指“语气、色调、音调”。',
        collocations:'in a ... tone of voice 用……的语气'
      },
      {
        word:'cut out',
        phonetic:'',
        definition:'戒掉，停止（做某事）；剪下，删去',
        mnemonic:'近义：quit, give up, stop, eliminate。cut out 也可表示“剪下、删去”。',
        collocations:'cut out sugar 戒糖'
      },
      {
        word:'put down',
        phonetic:'',
        definition:'贬低，奚落，使出洋相；放下；镇压；记下（阅读中常同义替换 belittle and disrespect）',
        mnemonic:'近义：belittle, disrespect；另有“放下、镇压、记下”。阅读中看到 put down 常考“贬低、奚落”这一僻义。',
        collocations:'put sb. down 贬低某人'
      },
      {
        word:'spice up',
        phonetic:'',
        definition:'给……增添趣味，使……更热闹活泼',
        mnemonic:'近义：liven up, add flavor to。spice 本义“香料”，引申为“给……增添趣味”。',
        collocations:'spice up the conversation 让谈话更有趣'
      },
      {
        word:'tone down',
        phonetic:'',
        definition:'缓和，收敛，使（语气、色彩等）柔和、减弱',
        mnemonic:'近义：soften, moderate, restrain。和 tone of voice 一起记：把语气调低 → 缓和。',
        collocations:'tone down the language 把措辞缓和下来'
      },
      {
        word:'in essence',
        phonetic:'',
        definition:'本质上，实质上',
        mnemonic:'近义：essentially, basically, in nature。essence 本质。',
        collocations:''
      },
      {
        word:'generalisation',
        aliases:['generalization'],
        phonetic:'[ˌdʒenrələˈzeɪʃn]',
        definition:'n. 泛化，推广，举一反三；概括，归纳（美式拼写 generalization；动词 generalise）',
        mnemonic:'近义：application（应用）, abstraction, inference, conclusion。构词：general（普遍的）+ -ise（使……化）+ -ation（名词后缀）→ 把单一经验推广到普遍的新情境 → 泛化、举一反三。',
        collocations:''
      },
      {
        word:'atypical',
        phonetic:'[ˌeɪˈtɪpɪkl]',
        definition:'adj. 非典型的，反常的，不规则的',
        mnemonic:'近义词：unusual, unconventional, irregular, abnormal。前缀 a-/an- 加在形容词前表示“无、非、不”（不是加强语气）：a-（非）+ typical（典型的）。同类：moral → amoral（与道德无关的）；symmetry → asymmetry（不对称）。',
        collocations:''
      },
      {
        word:'be exposed to',
        aliases:['be exposed to...','exposure to','exposure to...'],
        phonetic:'',
        definition:'接触到……，暴露于……（名词 exposure to；to 为介词，后接名词或动名词）',
        mnemonic:'名词 exposure to。六级阅读/写作王牌短语；不要死译“暴露”，常译“接触到”。注意 to 是介词，后接名词或动名词。',
        collocations:'be exposed to different faces 接触不同的面孔'
      }
    ]
  },
  {
    "id": "2026-11-09-practice-01",
    "date": "2026-11-09",
    "title": "2026-11-09 阅读积累（Passage One / Two）",
    "marker": "【2026-11-09 阅读积累】",
    "entries": [
      {
        "word": "irrefutable",
        "definition": "adj. 无可辩驳的，不容置疑的",
        "mnemonic": "近义：indisputable / undeniable / unquestionable / incontrovertible。形近：refute（反驳）/ refuse（拒绝）/ reputable（声誉好的）。原文：It is irrefutable that...",
        "collocations": "It is irrefutable that..."
      },
      {
        "word": "reputable",
        "definition": "adj. 声誉好的，值得信赖的",
        "mnemonic": "来自 reputation（名誉）；近义 respectable / trustworthy；形近 refute / refuse。",
        "collocations": ""
      },
      {
        "word": "idle",
        "definition": "adj. 闲置的；懒散的；v. 空转",
        "mnemonic": "近义 inactive / unused / lazy；形近 idol（偶像）/ ideal（理想的）；idle supervision 闲置/松懈的监管。",
        "collocations": ""
      },
      {
        "word": "diffusion",
        "definition": "n. 扩散，分散；传播",
        "mnemonic": "近义 spread / dispersal / scattering / distribution；动词 diffuse；原文 diffusion of responsibility。",
        "collocations": "diffusion of responsibility 责任分散"
      },
      {
        "word": "precedent",
        "definition": "n. 先例，前例，惯例",
        "mnemonic": "近义 example / model / convention / standard；派生 unprecedented 史无前例的；形近 preceding / president / proceed。原文 creates the precedent。",
        "collocations": "creates the precedent 开创先例"
      },
      {
        "word": "defer",
        "definition": "v. 推迟，延缓；推诿；defer to 听从/推给",
        "mnemonic": "近义 postpone / delay / put off；defer to 还可表“听从、顺从”；形近 deter / differ / infer / confer。原文 defer that action to someone else。",
        "collocations": "defer action to someone else 把行动推给别人"
      },
      {
        "word": "obliged",
        "definition": "adj. 有义务的，必须的；感激的",
        "mnemonic": "近义 required / mandatory / duty-bound / compelled；名词 obligation；动词 oblige。原文 they are obliged to intervene。",
        "collocations": "be obliged to intervene 有义务干预"
      },
      {
        "word": "designated",
        "definition": "adj. 指定的，指派的，选定的",
        "mnemonic": "近义 appointed / assigned / nominated / specified；动词 designate；形近 design / resigned。原文 a designated competent person。",
        "collocations": "a designated competent person 指定的专职人员"
      },
      {
        "word": "bystander effect",
        "definition": "n. 旁观者效应",
        "mnemonic": "bystander 旁观者 + effect 效应；和 diffusion of responsibility（责任分散）一起记。",
        "collocations": ""
      },
      {
        "word": "diffusion of responsibility",
        "definition": "n. 责任分散效应",
        "mnemonic": "diffusion 扩散 + responsibility 责任；旁观者越多，越可能没人出手；与 bystander effect 配套。",
        "collocations": ""
      },
      {
        "word": "supervision",
        "definition": "n. 监督，管理",
        "mnemonic": "动词 supervise；形容词 supervisory；搭配 slack supervision 松懈的监管。",
        "collocations": "slack supervision 松懈的监管"
      },
      {
        "word": "intervention",
        "definition": "n. 干预，介入",
        "mnemonic": "动词 intervene；搭配 workplace safety intervention 职场安全干预；intervene in 干预。",
        "collocations": "workplace safety intervention 职场安全干预"
      },
      {
        "word": "distinction",
        "definition": "n. 区别，差别；卓越，殊荣",
        "mnemonic": "近义 difference / divergence / contrast / separation；形近 distinct / distinctive / extinction / instinct。原文 the distinction between these two strands。",
        "collocations": "the distinction between these two strands 两种流派之间的区别"
      },
      {
        "word": "split",
        "definition": "n./v. 分裂，分歧；劈开",
        "mnemonic": "近义 divide / division / rift / disagreement；形近 spit / spill / spoil。原文 a split within the scientific community。",
        "collocations": "a split within the scientific community 科学界内部的分裂"
      },
      {
        "word": "exclusive",
        "definition": "adj. 唯一的，排他的，专用的；高档的",
        "mnemonic": "近义 sole / only / unique / complete；反义 inclusive；形近 elusive / excessive；副词 exclusively。原文 the exclusive solution。",
        "collocations": "the exclusive solution 唯一的解决方案"
      },
      {
        "word": "contentious",
        "definition": "adj. 有争议的，引起争论的",
        "mnemonic": "近义 controversial / arguable / debatable / disputed；形近 contemptuous / conscientious / conscious / contented。原文 similarly contentious。",
        "collocations": "similarly contentious 同样有争议"
      },
      {
        "word": "halt",
        "definition": "v./n. 停止，停滞，暂停",
        "mnemonic": "近义 stop / cease / stall / suspend / pause；形近 half / haul / limp。原文 progress has halted。",
        "collocations": "progress has halted 进展停滞了"
      },
      {
        "word": "lagging",
        "definition": "adj. 滞后的，落后的",
        "mnemonic": "近义 backward / delayed / trailing；动词 lag；短语 fall behind；形近 logging / luggage。原文 lagging grid infrastructure。",
        "collocations": "lagging grid infrastructure 滞后的电网基础设施"
      },
      {
        "word": "overabundance",
        "definition": "n. 过剩，过多，极度充裕",
        "mnemonic": "近义 surplus / excess / glut / oversupply；形近 abandon / abundant。原文 overabundance of green energy。",
        "collocations": "overabundance of green energy 绿色能源过剩"
      },
      {
        "word": "adherence",
        "definition": "n. 坚持，遵守，依附",
        "mnemonic": "动词 adhere to；近义 sticking to / attachment / devotion / compliance / observance；形近 coherence / inherent。原文 adherence to different interpretations。",
        "collocations": "adherence to different interpretations 坚持不同解读"
      },
      {
        "word": "attainable",
        "definition": "adj. 可达到的，可实现的",
        "mnemonic": "近义 achievable / reachable / obtainable / feasible / viable；动词 attain；形近 sustainable / retain / detain。原文 whether the goal is attainable。",
        "collocations": "whether the goal is attainable 目标是否可实现"
      },
      {
        "word": "speak up",
        "definition": "phr. 大胆说出，公开发表意见",
        "mnemonic": "近义 speak out / voice one's opinion；反义 keep silent。",
        "collocations": "speak up 大胆说出"
      },
      {
        "word": "fall behind",
        "definition": "phr. 落后于，跟不上",
        "mnemonic": "近义 lag behind；原文 lagging → fall behind 同义替换。",
        "collocations": "fall behind 落后"
      },
      {
        "word": "carbon neutrality",
        "definition": "n. 碳中和",
        "mnemonic": "carbon 碳 + neutrality 中和；环保主题术语。",
        "collocations": "carbon neutrality 碳中和"
      },
      {
        "word": "at one's disposal",
        "definition": "phr. 任某人支配，供某人随时使用",
        "mnemonic": "at one's immediate disposal 任某人随时支配；disposal 处置/支配。",
        "collocations": "at one's immediate disposal 任某人随时支配"
      },
      {
        "word": "phase out",
        "definition": "phr. 逐步淘汰，逐步停止",
        "mnemonic": "反义 phase in 逐步引入；phase out fossil fuels。",
        "collocations": "phase out fossil fuels 逐步淘汰化石燃料"
      },
      {
        "word": "phase in",
        "definition": "phr. 逐步引入，逐步采用",
        "mnemonic": "反义 phase out 逐步淘汰。",
        "collocations": ""
      },
      {
        "word": "do away with",
        "definition": "phr. 废除，摆脱，彻底消除",
        "mnemonic": "近义 get rid of / eliminate / abolish。",
        "collocations": "do away with 废除"
      },
      {
        "word": "renewable energy",
        "definition": "n. 可再生能源",
        "mnemonic": "renewable 可再生的；主题词：environmentalism 环保主义、nuclear power 核能、fossil fuel 化石燃料。",
        "collocations": "renewable energy 可再生能源"
      },
      {
        "word": "grid infrastructure",
        "definition": "n. 电网基础设施",
        "mnemonic": "grid 电网 + infrastructure 基础设施；原文 lagging grid infrastructure。",
        "collocations": "grid infrastructure 电网基础设施"
      },
      {
        "word": "strand",
        "definition": "n. 一股；一个流派/思路；v. 使搁浅",
        "mnemonic": "two strands of environmentalism 两种环保主义思路；形近 strange；原文 two strands of environmentalism。",
        "collocations": "two strands of environmentalism 两种环保主义思路"
      },
      {
        "word": "shy away from",
        "definition": "phr. 回避，躲避",
        "mnemonic": "近义 avoid / evade / dodge；shy 原义“害羞”。",
        "collocations": "shy away from 回避"
      },
      {
        "word": "diffuse",
        "definition": "v. 扩散，弥漫；缓和；adj. 分散的",
        "mnemonic": "词根 fus- = pour 流/注；形近 confuse / infuse / profuse；名词 diffusion。",
        "collocations": "diffuse 扩散"
      },
      {
        "word": "infuse",
        "definition": "v. 注入，灌输；使充满",
        "mnemonic": "in- 进入 + fus- 流；infusion 注入；形近 diffuse / confuse / profuse。",
        "collocations": "infuse 注入"
      },
      {
        "word": "profuse",
        "definition": "adj. 大量的，极其丰富的",
        "mnemonic": "pro- 向前 + fus- 流；profusely 大量地；形近 diffuse / infuse / confuse。",
        "collocations": "profuse 大量的"
      },
      {
        "word": "shirk",
        "definition": "v. 逃避（责任、义务）",
        "mnemonic": "shirk responsibility 逃避责任；近义 evade / dodge / avoid。",
        "collocations": "shirk responsibility 逃避责任"
      },
      {
        "word": "dodge",
        "definition": "v. 躲避，闪开；推脱",
        "mnemonic": "近义 evade / elude / avoid；dodge responsibility。",
        "collocations": "dodge responsibility 推脱责任"
      },
      {
        "word": "elude",
        "definition": "v. 躲避，逃避；使难以理解",
        "mnemonic": "近义 evade / dodge；elusive 难以捉摸的；形近 exclude / include。",
        "collocations": "elude 躲避"
      },
      {
        "word": "pervade",
        "definition": "v. 弥漫，遍及，渗透",
        "mnemonic": "per- 贯穿 + vad- 走；近义 permeate / spread throughout；形近 invade / evade。",
        "collocations": "pervade 弥漫"
      },
      {
        "word": "evoke",
        "definition": "v. 唤起（记忆、情感）",
        "mnemonic": "e- 出 + voc- 声音/叫；evoke memories；形近 invoke / provoke / revoke。",
        "collocations": "evoke memories 唤起记忆"
      },
      {
        "word": "preceding",
        "definition": "adj. 在先的，前面的",
        "mnemonic": "动词 precede；precedent 先例；proceed 继续进行；形近 president。",
        "collocations": "preceding 在先的"
      },
      {
        "word": "infer",
        "definition": "v. 推断，推论",
        "mnemonic": "in- 进入 + fer- 带；inference 推论；形近 defer / differ / confer。",
        "collocations": "infer 推断"
      },
      {
        "word": "differ",
        "definition": "v. 不同，有异议",
        "mnemonic": "differ from 与……不同；differ with sb. 与某人意见不同；形近 defer / infer / confer。",
        "collocations": "differ from 与……不同"
      },
      {
        "word": "proficient",
        "definition": "adj. 熟练的，精通的",
        "mnemonic": "be proficient in/at；近义 skilled / capable / competent；名词 proficiency。",
        "collocations": "proficient 熟练的"
      },
      {
        "word": "competitive",
        "definition": "adj. 竞争的，有竞争力的；好胜的",
        "mnemonic": "competition / compete；形近 competent / complacent / component。",
        "collocations": "competitive 竞争的"
      },
      {
        "word": "mitigate",
        "definition": "v. 减轻，缓和",
        "mnemonic": "近义 alleviate / relieve / ease / lessen；mitigate risks。",
        "collocations": "mitigate risks 降低风险"
      },
      {
        "word": "elevate",
        "definition": "v. 举起，提升，抬高",
        "mnemonic": "elevator 电梯；elevate standards；形近 alleviate / allocate / alienate。",
        "collocations": "elevate 提升"
      },
      {
        "word": "alienate",
        "definition": "v. 使疏远，离间",
        "mnemonic": "alien 外国的/陌生的；alienate sb. from；形近 alleviate / elevate / allocate。",
        "collocations": "alienate 使疏远"
      },
      {
        "word": "peril",
        "definition": "n. 危险，风险",
        "mnemonic": "in peril 处于危险中；近义 danger / risk / jeopardy；形近 perilous。",
        "collocations": "in peril 处于危险中"
      },
      {
        "word": "haphazard",
        "definition": "adj. 杂乱无章的，随意的",
        "mnemonic": "hap 机会 + hazard 风险；近义 random / disorganized；形近 blizzard / lizard。",
        "collocations": "haphazard 杂乱无章的"
      },
      {
        "word": "obligation",
        "definition": "n. 义务，责任",
        "mnemonic": "动词 oblige；形容词 obliged；under an obligation to do。",
        "collocations": "under an obligation to do 有义务做"
      },
      {
        "word": "resigned",
        "definition": "adj. 逆来顺受的，顺从的；已辞职的",
        "mnemonic": "resign 辞职；resigned to 听任/顺从；形近 design / designate。",
        "collocations": "resigned to 听任"
      },
      {
        "word": "lax",
        "definition": "adj. 松懈的，不严格的",
        "mnemonic": "lax supervision；近义 slack / loose / negligent / careless。",
        "collocations": "lax supervision 松懈的监管"
      },
      {
        "word": "slick",
        "definition": "adj. 光滑的；圆滑的，花言巧语的",
        "mnemonic": "slick surface；a slick talker；形近 slack / lack / stack。",
        "collocations": "slick 圆滑的"
      },
      {
        "word": "distinctive",
        "definition": "adj. 独特的，有特色的",
        "mnemonic": "distinct 明显的/不同的；distinction 区别；distinctive features。",
        "collocations": "distinctive features 独特特征"
      },
      {
        "word": "extinction",
        "definition": "n. 灭绝，消亡",
        "mnemonic": "动词 extinct；形近 distinction / instinct；mass extinction。",
        "collocations": "mass extinction 大灭绝"
      },
      {
        "word": "instinct",
        "definition": "n. 本能，直觉",
        "mnemonic": "by instinct 出于本能；形近 distinct / extinction。",
        "collocations": "by instinct 出于本能"
      },
      {
        "word": "inclusive",
        "definition": "adj. 包容的，包括一切的",
        "mnemonic": "反义 exclusive；inclusive of 包括；inclusion 包容。",
        "collocations": "inclusive of 包括"
      },
      {
        "word": "elusive",
        "definition": "adj. 难以捉摸的，难以达到的",
        "mnemonic": "动词 elude；形近 exclusive / excessive；an elusive goal。",
        "collocations": "an elusive goal 难以实现的目标"
      },
      {
        "word": "excessive",
        "definition": "adj. 过度的，过分的",
        "mnemonic": "excess 过量；excessively 过度地；形近 exclusive / elusive。",
        "collocations": "excessive 过度的"
      },
      {
        "word": "cease",
        "definition": "v. 停止，终止",
        "mnemonic": "cease to do；近义 stop / halt / suspend；ceaseless 不停的。",
        "collocations": "cease to do 停止做"
      },
      {
        "word": "stall",
        "definition": "v. 停滞，拖延；n. 货摊",
        "mnemonic": "stall the negotiation；近义 halt / delay / pause。",
        "collocations": "stall the negotiation 使谈判停滞"
      },
      {
        "word": "sustainable",
        "definition": "adj. 可持续的",
        "mnemonic": "sustain 维持；sustainable development；形近 attainable / retain / detain。",
        "collocations": "sustainable development 可持续发展"
      },
      {
        "word": "detain",
        "definition": "v. 拘留，扣押；耽搁",
        "mnemonic": "de- 向下 + tain 握；detention 拘留；形近 retain / attain / sustainable。",
        "collocations": "detain 拘留"
      },
      {
        "word": "run off",
        "definition": "phr. 靠……运行；以……为动力",
        "mnemonic": "run off renewables 靠可再生能源运转；run on 靠……运行。",
        "collocations": "run off renewables 靠可再生能源运转"
      },
      {
        "word": "run on",
        "definition": "phr. 靠……运行；以……为燃料",
        "mnemonic": "run on coal and gas；run off 也可表“跑掉/用完”。",
        "collocations": "run on coal and gas 靠煤和天然气运行"
      },
      {
        "word": "refute",
        "mnemonic": "形近：refuse（拒绝）/ reputable（声誉好的）；名词 refutation；irrefutable 无可辩驳的；词根 re- + fut- 反驳。",
        "definition": "v. 反驳，驳斥"
      },
      {
        "word": "evade",
        "mnemonic": "近义 shirk / avoid / escape / dodge / elude；形近 invade / pervade / evoke；evade responsibilities 逃避责任。"
      },
      {
        "word": "invade",
        "mnemonic": "词根 vad- = go：invade 往里走（入侵）→ evade 走出去/躲开（逃避）→ pervade 走遍（弥漫）。"
      },
      {
        "word": "convention",
        "mnemonic": "近义 precedent / example / model / standard；by convention 按照惯例。"
      },
      {
        "word": "unprecedented",
        "mnemonic": "precedent 先例 + un- + -ed；史无前例的。"
      },
      {
        "word": "precede",
        "mnemonic": "preceding 在先的；precedent 先例；proceed 继续进行。"
      },
      {
        "word": "proceed",
        "mnemonic": "proceed with 继续进行；precede / preceding / precedent。"
      },
      {
        "word": "postpone",
        "mnemonic": "近义 defer / delay / put off；postpone doing sth.。"
      },
      {
        "word": "delay",
        "mnemonic": "近义 defer / postpone / put off；delay doing sth.。"
      },
      {
        "word": "deter",
        "mnemonic": "deter sb. from doing sth.；形近 defer / differ / infer / confer。"
      },
      {
        "word": "confer",
        "mnemonic": "confer sth. on sb. 授予；confer with sb. 商讨；形近 defer / differ / infer。"
      },
      {
        "word": "competent",
        "mnemonic": "近义 qualified / capable / proficient；形近 competitive / complacent / component；competent workers。"
      },
      {
        "word": "capable",
        "mnemonic": "be capable of doing；形近 competent / competitive。"
      },
      {
        "word": "complacent",
        "mnemonic": "自满的；形近 competent / competitive / component；complacency 自满。"
      },
      {
        "word": "component",
        "mnemonic": "组成部分；形近 competent / competitive / complacent。"
      },
      {
        "word": "alleviate",
        "mnemonic": "近义 relieve / ease / mitigate / lessen；alleviate workplace hazards 缓解职场隐患。"
      },
      {
        "word": "relieve",
        "mnemonic": "relieve sb. of sth.；近义 alleviate / ease。"
      },
      {
        "word": "allocate",
        "mnemonic": "allocate sth. to sb.；形近 elevate / alienate。"
      },
      {
        "word": "hazard",
        "mnemonic": "近义 risk / danger / peril / jeopardy；workplace hazards；haphazard 杂乱无章的。"
      },
      {
        "word": "oblige",
        "mnemonic": "oblige sb. to do；be obliged to do；obligation 义务。"
      },
      {
        "word": "mandatory",
        "mnemonic": "强制的/义务的；近义 required / obligatory；mandatory safety training。"
      },
      {
        "word": "obey",
        "mnemonic": "obey rules；obligation 义务；obedient 顺从的。"
      },
      {
        "word": "design",
        "mnemonic": "designated 指定的；design 设计；形近 resign。"
      },
      {
        "word": "resign",
        "mnemonic": "resign from 辞职；resigned 顺从的/已辞职的；形近 design / designate。"
      },
      {
        "word": "slack",
        "mnemonic": "slack supervision 松懈监管；近义 lax / loose / negligent；形近 lack / stack / slick。"
      },
      {
        "word": "negligent",
        "mnemonic": "失职的/疏忽的；negligence 疏忽；近义 slack / careless。"
      },
      {
        "word": "combat",
        "mnemonic": "combat climate change；近义 fight / tackle / counter / struggle against；形近 compact / compatriot。"
      },
      {
        "word": "tackle",
        "mnemonic": "tackle a problem；近义 combat / handle / address。"
      },
      {
        "word": "contrast",
        "mnemonic": "contrast A with B；近义 distinction / difference；in contrast 相反。"
      },
      {
        "word": "distinct",
        "mnemonic": "distinct from 与……不同；distinction 区别；distinctive 独特的。"
      },
      {
        "word": "divide",
        "mnemonic": "divide A into B；division 分裂；split 分裂/分歧。"
      },
      {
        "word": "spoil",
        "mnemonic": "spoil the plan；形近 split / spit / spill。"
      },
      {
        "word": "sole",
        "mnemonic": "唯一的；近义 exclusive / only / unique。"
      },
      {
        "word": "unique",
        "mnemonic": "独一无二的；近义 exclusive / sole；be unique to。"
      },
      {
        "word": "controversial",
        "mnemonic": "有争议的；近义 contentious / arguable / debatable / disputed。"
      },
      {
        "word": "contemptuous",
        "mnemonic": "轻蔑的；形近 conscientious / conscious / contentious / contented。"
      },
      {
        "word": "conscientious",
        "mnemonic": "认真勤勉的；形近 conscious / contentious / contemptuous。"
      },
      {
        "word": "conscious",
        "mnemonic": "有意识的；be conscious of；形近 conscientious。"
      },
      {
        "word": "suspend",
        "mnemonic": "暂停/悬挂；近义 halt / cease / stall / pause；suspension。"
      },
      {
        "word": "haul",
        "mnemonic": "拖/拉；形近 halt / half / limp。"
      },
      {
        "word": "overwhelm",
        "mnemonic": "压垮/使不堪重负；solar and wind can overwhelm the grid；形近 overhaul / overlook。"
      },
      {
        "word": "swamp",
        "mnemonic": "沼泽；淹没/使应接不暇；近义 overwhelm / flood。"
      },
      {
        "word": "overhaul",
        "mnemonic": "彻底检修/全面改革；形近 overwhelm / overlook。"
      },
      {
        "word": "overlook",
        "mnemonic": "忽视/俯瞰；形近 overwhelm / overhaul。"
      },
      {
        "word": "surplus",
        "mnemonic": "过剩/盈余；近义 overabundance / excess / glut / oversupply。"
      },
      {
        "word": "excess",
        "mnemonic": "过量/过度；近义 surplus / overabundance。"
      },
      {
        "word": "abandon",
        "mnemonic": "放弃/抛弃；形近 abundant（丰富的）。"
      },
      {
        "word": "abundant",
        "mnemonic": "丰富的/大量的；形近 abandon；abundance 丰富。"
      },
      {
        "word": "adhere",
        "mnemonic": "adhere to 坚持/遵守/粘附；名词 adherence；形近 coherence / inherent。"
      },
      {
        "word": "inherent",
        "mnemonic": "固有的/内在的；inhere in；形近 adhere / coherence。"
      },
      {
        "word": "attain",
        "mnemonic": "达到/获得；attainable 可达到的；形近 retain / detain。"
      },
      {
        "word": "feasible",
        "mnemonic": "可行的；近义 viable / attainable / achievable。"
      },
      {
        "word": "viable",
        "mnemonic": "可行的；近义 feasible / attainable。"
      },
      {
        "word": "retain",
        "mnemonic": "保留/保持；形近 attain / detain。"
      },
      {
        "word": "infrastructure",
        "mnemonic": "基础设施；grid infrastructure；形近 structure。"
      },
      {
        "word": "intervene",
        "mnemonic": "干预/介入；intervene in；名词 intervention。"
      }
    ]
  }
];
