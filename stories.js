// 故事 / 模板作文听写：把词库里的词放进完整句子里。
// 这里只放内容与纯函数；播放、输入、音效和界面在 app.js。

export const ESSAY_TYPES=[
  {
    id:'opinion',title:'观点 + 论证型',tag:'OPINION',
    structure:['引出观点 + 表明立场','展开论证：原因 / 好处 / 举例 / 数据','总结全文 + 重申观点'],
    frames:[
      {part:'开头',en:'I fully agree with the above opinion. I have two arguments to support it.'},
      {part:'开头',en:'Some people argue that ... However, I embrace an entirely different view.'},
      {part:'开头',en:'From my perspective, the merits of ... outweigh its demerits.'},
      {part:'主体',en:'First of all, doing sth. helps ...'},
      {part:'主体',en:'Moreover, sth. enables sb. to do sth.'},
      {part:'主体',en:'Take sb. as an example, ...'},
      {part:'主体',en:'According to the latest survey conducted by ..., approximately ...% of the respondents hold the view that ...'},
      {part:'结尾',en:'Based on the analysis above, it can be concluded that doing sth. is extremely important for sb. to do sth.'},
      {part:'结尾',en:'It can not only help sb. do sth. but also help sb. do sth.'},
    ],
  },
  {
    id:'problem',title:'问题 + 解决方案型',tag:'PROBLEM',
    structure:['引出现象','表明立场 / 引出问题 + 提出建议','总结全文 + 重申观点'],
    frames:[
      {part:'开头',en:'In recent years, doing sth. has become a common social phenomenon.'},
      {part:'开头',en:'A common phenomenon in colleges today is that students are highly involved in ...'},
      {part:'问题',en:'As far as I am concerned, there is no denying that ... may have quite some bad influences on ...'},
      {part:'问题',en:'Such a situation is of great concern. In my view, ... is not beneficial to ...'},
      {part:'建议',en:'To prevent sb. from doing sth., efforts should be made in more ways than one.'},
      {part:'建议',en:'To begin with, sb. should do ... This can be done through ...'},
      {part:'建议',en:'What’s more, sb. should also do ...'},
      {part:'建议',en:'Last but not least, it’s crucial that sb. (should) do ...'},
      {part:'结尾',en:'With these timely and strong measures taken, we have every reason to believe that the problem will be properly resolved in the days to come.'},
      {part:'结尾',en:'I am deeply convinced that if we make concerted efforts in one mind, it will only be a matter of time to settle this problem.'},
    ],
  },
  {
    id:'chart',title:'图表 / 现象 + 原因分析型',tag:'CHART',
    structure:['描述图表 / 现象','分析原因','总结全文 + 重申观点'],
    frames:[
      {part:'开头',en:'As the chart above shows, the past two decades have seen a sharp increase in ... from 1% in 2000 to 99% in 2020.'},
      {part:'开头',en:'It can be seen that China has made tremendous achievements in ...'},
      {part:'原因',en:'The reasons accounting for this phenomenon can be listed as follows.'},
      {part:'原因',en:'First of all, it is beyond all doubts that the achievements are attributed to ...'},
      {part:'原因',en:'Besides, ... factors also prove responsible for this phenomenon in that ...'},
      {part:'原因',en:'Last but not least, the positive guidance of the governmental policies is another key factor that can’t be ignored.'},
      {part:'结尾',en:'Based on the analysis above, we may reasonably predict that the phenomenon is normal and positive, and therefore I firmly believe that it is bound to continue in the years to come.'},
      {part:'结尾',en:'To conclude, having witnessed the remarkable achievements in ..., we have every reason to believe that our people will lead a richer and better life.'},
    ],
  },
  {
    id:'proscons',title:'分析利弊型',tag:'PROS & CONS',
    structure:['引出话题','分析利与弊','提出建议'],
    frames:[
      {part:'开头',en:'In recent years, doing sth. has become a common social phenomenon.'},
      {part:'开头',en:'As far as I am concerned, ... have both advantages and disadvantages.'},
      {part:'利',en:'Among all the plus sides of sth., ... comes first: sb. can do sth.'},
      {part:'利',en:'In addition, sth. is beneficial to us in that it ...'},
      {part:'利',en:'Moreover, sth. enables sb. to do sth.'},
      {part:'弊',en:'Despite these advantages, the shortcomings of sth. should not be ignored.'},
      {part:'弊',en:'On the one hand, sth. demands ..., while sb. have difficulty in doing sth.'},
      {part:'弊',en:'On the other hand, sth. can produce unexpected results. For example, it was found that ...'},
      {part:'建议',en:'Given the overall situation of sth., I think, to improve the effectiveness of sth., sb. should do sth.'},
      {part:'建议',en:'Besides, it’s crucial that sb. (should) do ...'},
    ],
  },
];

// 完整范文用于“模板作文听写”，不是占位符模板。
export const ESSAY_SAMPLES=[
  {
    id:'basics-2023-12',typeId:'opinion',
    title:'A Sound Knowledge of the Basics',
    source:'2023 年 12 月真题范文 · 观点 + 论证型',
    sentences:[
      {en:'As is known to all, gaining a sound knowledge of the basics is of vital importance for students to master an academic subject.',zh:'众所周知，扎实掌握基础知识，对学生学好一门学科至关重要。'},
      {en:'I fully agree with the above opinion.',zh:'我完全同意上述观点。'},
      {en:'I have two arguments to support it.',zh:'我有两个理由来支持它。'},
      {en:'First of all, learning the basics enables students to lay a solid foundation before reaching a higher level.',zh:'首先，学习基础能让学生在进入更高层次之前打下扎实的根基。'},
      {en:'Take myself as an example: when learning English, with enough vocabulary and proficiency in grammar rules, I could read more difficult articles and books easily.',zh:'以我自己为例：学英语时，有了足够的词汇量和熟练的语法规则，我就能轻松读懂更难的英语文章和书。'},
      {en:'Moreover, the grasp of basic knowledge is beneficial to us in that it can be applied to different fields of the academic subject.',zh:'此外，掌握基础知识对我们有益，因为它能应用到这门学科的不同领域。'},
      {en:'According to the latest survey conducted by the Chinese Academy of Social Sciences, approximately 76% of the respondents hold the view that people who gain a sound knowledge of the basics do better in interdisciplinary fields than those who do not.',zh:'根据中国社会科学院的最新调查，约 76% 的受访者认为，扎实掌握基础知识的人在跨学科领域比没有掌握的人表现更好。'},
      {en:'Based on the analysis above, it can be concluded that gaining a sound knowledge of the basics is extremely important for students to master an academic subject.',zh:'基于以上分析可以得出结论：掌握扎实的基础知识，对学生学好一门学科极其重要。'},
      {en:'It can not only help students lay a solid foundation for the future but also help them master the basic knowledge from different disciplines.',zh:'它不仅能帮学生为未来打下坚实基础，还能帮他们掌握不同学科的基础知识。'},
    ],
  },
];

export const STORY_PACKS=[
  {
    id:'workplace-tone',title:'职场里的语气',kicker:'A STORY ABOUT RESPECT',
    theme:'工作 / 沟通',intro:'一个关于如何把敌意变成尊重的短故事。',
    templateId:'opinion',xp:120,
    targets:['be exposed to','atypical','sarcasm','put down','contemptible','hostility','retaliate','tone down','tone of voice','cut out','belittle','in essence','potent','spice up'],
    sentences:[
      {en:'Last week, I was exposed to an atypical workplace culture.',zh:'上周，我接触到一种非典型的职场文化。',targets:['be exposed to','atypical']},
      {en:'A senior colleague kept using sarcasm to put down the newcomers.',zh:'一位资深同事总用讽刺来贬低新人。',targets:['sarcasm','put down']},
      {en:'His contemptible remarks and open hostility made everyone uneasy.',zh:'他可鄙的言论和公开的敌意让所有人都不安。',targets:['contemptible','hostility']},
      {en:'I wanted to retaliate, but I tried to tone down my tone of voice.',zh:'我本想报复，但还是试着缓和自己的语气。',targets:['retaliate','tone down','tone of voice']},
      {en:'I decided to cut out the habit of belittling others.',zh:'我决定戒掉贬低别人的习惯。',targets:['cut out','belittle']},
      {en:'In essence, a potent idea does not need insults to be heard.',zh:'本质上，一个有力的观点不需要靠侮辱来被听见。',targets:['in essence','potent']},
      {en:'We even used a little humor to spice up the meeting.',zh:'我们甚至用一点幽默让会议更有趣。',targets:['spice up']},
      {en:'Respect, not fear, is what brings a team together.',zh:'带来团队凝聚力的是尊重，而不是恐惧。',targets:[]},
    ],
    essay:'With the increasingly fierce competition in the workplace, how we communicate has aroused widespread concern. From my perspective, it is high time that we cut out sarcasm and learn to respect one another.',
  },
];

const normalizeWord=value=>String(value||'').trim().toLowerCase().replace(/\s+/g,' ');
export function findStoryPack(id){return STORY_PACKS.find(p=>p.id===id)||null;}
export function findEssayType(id){return ESSAY_TYPES.find(t=>t.id===id)||null;}
export function findEssaySample(id){return ESSAY_SAMPLES.find(s=>s.id===id)||null;}

export function storyWordEntries(pack,words){
  const map=new Map(words.map(w=>[normalizeWord(w.word),w]));
  return (pack?.targets||[]).map(name=>map.get(normalizeWord(name))).filter(Boolean);
}

// 从“到期 / 薄弱 / 新词 / 做题新词”里挑今天要用的词；优先有例句的词。
export function selectStoryWords(words,state,limit=10,isDueFn=()=>false){
  const progress=id=>state.progress?.[id]||{};
  const score=w=>{
    const p=progress(w.id);
    let n=0;
    if(isDueFn(p))n+=40;
    if(p.firstSeen)n+=20;
    if(p.mistakes)n+=Math.min(20,p.mistakes*3);
    if(w.custom)n+=12;
    if(w.collocations)n+=8;
    if(p.favorite)n+=6;
    return n;
  };
  const candidates=words.filter(w=>{
    const p=progress(w.id);
    return p.firstSeen||w.custom||isDueFn(p);
  }).sort((a,b)=>score(b)-score(a));
  const out=[];const seen=new Set();
  for(const w of candidates){
    const key=normalizeWord(w.word);
    if(seen.has(key))continue;
    seen.add(key);out.push(w);
    if(out.length>=limit)break;
  }
  return out;
}

function firstSentence(text){
  const raw=String(text||'').trim();
  if(!raw)return '';
  const match=raw.match(/^.+?[.!?](?=\s|$)/);
  return (match?match[0]:raw).replace(/\s+/g,' ').trim();
}

// 本地拼装：没有 AI 时，用“词 + 词性框架”造出可听写的句子。
// 它会明确标注“拼装”，不假装是地道文章；质量最好的仍是 STORY_PACKS。
function localFrame(w){
  const def=String(w.definition||'');
  const pos=(def.match(/\b(n|v|vt|vi|adj|adv|prep|conj|pron)\./)||[])[1]||'';
  const word=w.word;
  if(pos==='n')return `The ${word} was the first thing everyone noticed.`;
  if(pos==='v'||pos==='vt'||pos==='vi')return `We decided to ${word} before the meeting ended.`;
  if(pos==='adj')return `The whole situation felt ${word} to everyone in the room.`;
  if(pos==='adv')return `She explained it ${word}, as if it were obvious.`;
  return `The phrase "${word}" came up again in our conversation.`;
}

export function buildLocalStory(words,state,{limit=8,isDueFn=()=>false}={}){
  const picked=selectStoryWords(words,state,limit,isDueFn).slice(0,limit);
  if(picked.length<4)return null;
  const sentences=[];
  sentences.push({en:'Today I want to tell a short story with the words I am learning.',zh:'今天，我想用正在学的词讲一个小故事。',targets:[]});
  picked.forEach((w,index)=>{
    const frame=localFrame(w);
    const lead=index===0?'The first word was':(index===picked.length-1?'The last word was':'Next came');
    sentences.push({en:`${lead} "${w.word}". ${frame}`,zh:`目标词 ${w.word}：${w.definition}`,targets:[w.word]});
    if(index===2)sentences.push({en:'Then the story took a slightly different turn.',zh:'接着，故事有了一个小小的转折。',targets:[]});
  });
  sentences.push({en:'In essence, every word becomes easier when it has a story.',zh:'本质上，当一个词有了故事，它就会变得更容易。',targets:['in essence']});
  return {
    id:`local-${Date.now()}`,title:'今天的词，拼成一段',kicker:'MADE FROM YOUR WORDS',
    theme:'本地拼装 · 你的词库',intro:`从 ${picked.length} 个正在学的词里取出词义和词性，拼成一段可以逐句听写的文字。句子是机械拼装的，但每个词都真的用了一次。`,
    templateId:'opinion',xp:80,local:true,targets:picked.map(w=>w.word),sentences,
    essay:'With the increasingly fierce competition in today’s world, the words we learn have aroused widespread concern. From my perspective, it is high time that we put them into real stories.',
  };
}

export function allStoryChoices(words,state,isDueFn=()=>false){
  const choices=[...STORY_PACKS];
  const local=buildLocalStory(words,state,{isDueFn});
  if(local)choices.push(local);
  return choices;
}

export function storyMeta(pack){
  return {
    sentences:pack?.sentences?.length||0,
    targets:(pack?.targets||[]).length,
    minutes:Math.max(2,Math.ceil((pack?.sentences?.length||0)*0.45)),
  };
}

// —— 逐词评分（忽略标点/大小写；保留缩写）——
export function tokenizeSentence(value){
  return String(value||'').toLowerCase().normalize('NFKC')
    .replace(/[’‘]/g,"'").replace(/[^a-z0-9']+/g,' ')
    .trim().split(/\s+/).filter(Boolean);
}
export function compareSentence(actual,expected){
  const a=tokenizeSentence(actual),b=tokenizeSentence(expected);
  const dp=Array.from({length:a.length+1},()=>new Array(b.length+1).fill(0));
  for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++){
    dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1]);
  }
  let i=a.length,j=b.length;const matches=[];
  while(i>0&&j>0){
    if(a[i-1]===b[j-1]){matches.push([i-1,j-1]);i--;j--;}
    else if(dp[i-1][j]>=dp[i][j-1])i--;else j--;
  }
  const matchedA=new Set(matches.map(x=>x[0])),matchedB=new Set(matches.map(x=>x[1]));
  const expectedParts=b.map((text,index)=>({text,ok:matchedB.has(index)}));
  const actualParts=a.map((text,index)=>({text,ok:matchedA.has(index)}));
  const correct=matches.length;
  return {
    ratio:b.length?correct/b.length:1,
    correct,total:b.length,
    exact:a.length===b.length&&correct===b.length,
    expectedParts,actualParts,
    missing:expectedParts.filter(x=>!x.ok).map(x=>x.text),
    extra:actualParts.filter(x=>!x.ok).map(x=>x.text),
  };
}
export function accuracyLabel(ratio){
  if(ratio>=0.999)return '完美听写';
  if(ratio>=0.85)return '很接近了';
  if(ratio>=0.6)return '听出了大意';
  return '再听一遍会更好';
}
export function todayStory(state,words,isDueFn=()=>false){
  const starts=Object.keys(state.storyLog||{}).length;
  const pack=STORY_PACKS[starts%STORY_PACKS.length]||STORY_PACKS[0];
  if(state.storyLog?.[new Date().toLocaleDateString('en-CA')]?.completed){
    return buildLocalStory(words,state,{isDueFn})||pack;
  }
  return pack;
}
