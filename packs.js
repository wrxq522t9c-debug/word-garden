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
  }
];
