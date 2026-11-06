// 词间 · 学习引擎（FSRS 调度版）
// 采用 vendored ts-fsrs@5.4.2（MIT，实现 FSRS-6 模型），本地计算，不上传任何学习数据。
import {fsrs, createEmptyCard, generatorParameters, State} from './vendor/ts-fsrs.js';
export {State} from './vendor/ts-fsrs.js';

export const dayKey=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export function addDays(day,n){const d=new Date(day+'T12:00:00');d.setDate(d.getDate()+n);return dayKey(d);}
const dayMs=day=>Date.parse(day+'T12:00:00');

// —— FSRS 调度参数（固定版本，见 vendor/README.md）——
const DEFAULT_PARAMS={
  request_retention:0.9,      // 90% 目标保留率：是模型目标，不是保证
  maximum_interval:36500,     // 不设 30 天封顶
  enable_fuzz:true,           // 确定性扰动，用于错峰（刷新/撤销不会改变已定排期）
  enable_short_term:true,
  learning_steps:['10m'],     // 短期学习步骤：真实时间（分钟）
  relearning_steps:['10m'],
};
const NEUTRAL_DIFFICULTY=generatorParameters(DEFAULT_PARAMS).w[4]; // ≈6.41，FSRS 默认初始难度（无证据时的中性值）
const _schedulers=new Map();
export function makeScheduler(opts={}){return fsrs({...DEFAULT_PARAMS,...opts});}
// 目标保留率可调：不同保留率使用独立调度器实例（FSRS 参数固定，仅目标变化）。
export function getScheduler(retention=0.9){
  const key=Math.min(0.99,Math.max(0.7,Number(retention)||0.9));
  let scheduler=_schedulers.get(key);
  if(!scheduler){scheduler=makeScheduler({request_retention:key});_schedulers.set(key,scheduler);}
  return scheduler;
}

export const freshState=()=>({version:2,customWords:[],progress:{},logs:{},settings:{goal:0,autoSpeak:true,autoSpeakVersion:1},sessions:{},session:null,lastBackup:null});

// 新增设置项：旧状态/旧备份缺少时补默认值（幂等，不改动用户已做出的选择）。
export const SETTINGS_DEFAULTS={dailyNew:30,dailyReview:200,retention:0.9,theme:'auto'};
export function migrateSettings(state){
  const s=state.settings;let changed=false;
  if(!Number.isInteger(s.dailyNew)||s.dailyNew<0){s.dailyNew=s.goal>0?s.goal:SETTINGS_DEFAULTS.dailyNew;changed=true;}
  if(!Number.isInteger(s.dailyReview)||s.dailyReview<0){s.dailyReview=SETTINGS_DEFAULTS.dailyReview;changed=true;}
  if(!Number.isFinite(s.retention)||s.retention<0.7||s.retention>0.99){s.retention=SETTINGS_DEFAULTS.retention;changed=true;}
  if(!['auto','light','dark'].includes(s.theme)){s.theme=SETTINGS_DEFAULTS.theme;changed=true;}
  return changed;
}

// —— 卡片（反）序列化：存储用毫秒时间戳，运行时用 Date ——
function toCard(c){return {state:c.state,due:new Date(c.due),stability:c.stability,difficulty:c.difficulty,scheduled_days:c.scheduled_days,reps:c.reps,lapses:c.lapses,learning_steps:c.learning_steps,last_review:c.last_review!=null?new Date(c.last_review):undefined};}
function fromCard(card,estimated){return {state:card.state,due:card.due.getTime(),stability:card.stability,difficulty:card.difficulty,scheduled_days:card.scheduled_days,reps:card.reps,lapses:card.lapses,learning_steps:card.learning_steps,last_review:card.last_review?card.last_review.getTime():null,estimated:!!estimated};}
export function dueDayOf(p){return p?.card?dayKey(new Date(p.card.due)):null;}
export function isLearningCard(p){return p?.card?.state===State.Learning||p?.card?.state===State.Relearning;}

// —— 到期判定 ——
// isDue：是否属于“到期工作”（复习词按日历日、学习/重学词按真实时间）。
export function isDue(p,now=new Date(),today=dayKey(now)){
  if(!p?.card)return true; // 新词：未作答，随时可学
  if(p.card.state===State.Review)return dueDayOf(p)<=today;
  return p.card.due<=now.getTime(); // Learning / Relearning：遵守真实 due 时间
}
// isPracticable：额外练习（错词/指定词组）是否可作答。复习词允许提前练习（FSRS 用真实经过时间），
// 但学习/重学中未到期的词不允许提前作答，避免伪造 10 分钟巩固间隔。
export function isPracticable(p,now=new Date()){
  if(!p?.card)return true;
  if(p.card.state===State.Review)return true;
  return p.card.due<=now.getTime();
}

// —— 会话队列 ——
export function rememberSession(state){if(state.session){state.sessions||={};state.sessions[state.session.mode]=state.session;}}
export function getSession(state,mode){return state.session?.mode===mode?state.session:state.sessions?.[mode]||null;}
export function advanceQueue(session,shouldRepeat){
  const id=session.queue[session.index];
  if(shouldRepeat){session.queue.push(id);session.retries[id]=(session.retries[id]||0)+1;}
  session.index++;
}
// 优先展示新词与已到期项；仅剩短期巩固时允许立即继续。
// 真实时间传给 FSRS，不把提前练习伪造成已经等待到期。
export function nextAnswerIndex(session,progress,now=new Date()){
  for(let j=session.index;j<session.queue.length;j++){const p=progress[session.queue[j]];if(isPracticable(p,now))return j;}
  return session.index<session.queue.length?session.index:-1;
}
// 剩余短时巩固词的最早到期时间（毫秒），无则 null。
export function nextConsolidation(session,progress){
  let min=Infinity;
  for(let j=session.index;j<session.queue.length;j++){const p=progress[session.queue[j]];if(isLearningCard(p)&&p.card.due<min)min=p.card.due;}
  return min===Infinity?null:min;
}

export function migratePreferences(state){
  if(state.settings.autoSpeakVersion!==1){state.settings.autoSpeak=true;state.settings.autoSpeakVersion=1;return true;}
  return false;
}

// —— 核心调度：逐词、真实时间、三档反馈 ——
// rating：1=忘记了(Again) 2=费力想起(Hard) 3=记得(Good)。与 FSRS Rating 数值一致。
// options.retention：该次调度使用的目标保留率，默认 0.9。
export function rateWord(previous,rating,now=new Date(),mode="review",options={}){
  const p={streak:0,mistakes:0,fuzzyCount:0,attempts:0,...previous};
  const today=dayKey(now);
  const isNew=!p.card;
  p.firstSeen||=today;p.lastSeen=today;p.attempts=(p.attempts||0)+1;p.lastRating=rating;

  const card=isNew?createEmptyCard(now):toCard(p.card);
  const result=getScheduler(options.retention??0.9).next(card,now,rating);
  p.card=fromCard(result.card,previous?.card?.estimated); // 保留迁移估计来源，不冒充已校准
  p.reviewHistory=[...(previous?.reviewHistory||[]),{time:now.getTime(),rating,mode}];

  // 跨天成功回忆（仅用于“已掌握”展示，不是 FSRS 历史）：记得记成功，忘记清零，费力保持。
  if(rating===1){p.streak=0;p.lastSuccess=null;p.mistakes=(p.mistakes||0)+1;}
  else if(rating===2){p.fuzzyCount=(p.fuzzyCount||0)+1;}
  else if(p.lastSuccess!==today){p.streak=(p.streak||0)+1;p.lastSuccess=today;}

  return p;
}

export const isMastered=p=>!!p&&p.streak>=3;

// —— 迁移 v1 → v2（版本化、幂等、可回滚）——
// 保留旧到期日；用旧间隔作初始稳定度（估计），难度取中性默认；reps/lapses 从 0 计（旧 attempts/mistakes
// 含同日重复与各练习模式，不能等同于 FSRS 历史，故单独保留原计数，不冒充 FSRS）。
export function migrateToV2(state,today=dayKey()){
  if(state.version===2)return false;
  for(const [id,p] of Object.entries(state.progress)){
    if(p.card||!p.firstSeen)continue;
    state.progress[id]=migrateProgress(p,today);
  }
  state.version=2;
  return true;
}
function migrateProgress(p,today){
  const out={};
  for(const k of ['firstSeen','lastSeen','lastSuccess','streak','mistakes','fuzzyCount','attempts','lastRating','note','favorite'])if(p[k]!=null)out[k]=p[k];
  out.card=estimateCard(p,today);
  return out;
}
function estimateCard(p,today){
  const lastSeen=p.lastSeen||p.firstSeen;
  const due=p.due||today;
  let interval=Math.round((dayMs(due)-dayMs(lastSeen))/86400000);
  interval=Math.max(1,Math.min(interval,365)); // 旧间隔天数，夹在 1~365
  return {
    state:State.Review,
    due:dayMs(due),                       // 原样保留旧到期日（不制造新集中到期）
    stability:interval,                   // 估计：以旧系统预测的间隔为初值，随后由 FSRS 逐步接管
    difficulty:NEUTRAL_DIFFICULTY,        // 估计：无逐词证据，取 FSRS 默认初始难度
    scheduled_days:interval,
    reps:0,                               // 未知，从 0 起算（不冒充历史）
    lapses:0,                             // 未知，从 0 起算（不冒充历史）
    learning_steps:0,
    last_review:dayMs(lastSeen),
    estimated:true,
  };
}

export function sortByWeakness(words,state){
  const severity=p=>p.lastRating===1?2:p.lastRating===2?1:0;
  return [...words].sort((a,b)=>{const p=state.progress[a.id]||{},q=state.progress[b.id]||{};
    return severity(q)-severity(p)||(p.streak||0)-(q.streak||0)||((q.mistakes||0)*2+(q.fuzzyCount||0))-((p.mistakes||0)*2+(p.fuzzyCount||0))||(dueDayOf(p)||'').localeCompare(dueDayOf(q)||'')||a.id-b.id;
  });
}
export const dueWords=(words,state,today=dayKey(),now=new Date())=>sortByWeakness(words.filter(w=>{const p=state.progress[w.id];return p?.card&&isDue(p,now,today);}),state);
export const weakWords=(words,state,now=new Date())=>sortByWeakness(words.filter(w=>{const p=state.progress[w.id]||{};return p.firstSeen&&!isMastered(p)&&isPracticable(p,now)&&((p.mistakes||0)>0||(p.fuzzyCount||0)>0||p.lastRating===2);}),state);
export function reviewTask(words,state,today=dayKey(),now=new Date()){
  const pending=getSession(state,'review');
  const ids=new Set(dueWords(words,state,today,now).map(w=>w.id));
  if(pending)for(const id of pending.queue.slice(pending.index))ids.add(id);
  const completed=new Set(state.logs[today]?.reviewedIds||[]);
  for(const id of ids)completed.delete(id);
  return {remaining:ids.size,completed:completed.size,total:ids.size+completed.size};
}
export function newWords(words,state,today=dayKey()){
  const unseen=words.filter(w=>!state.progress[w.id]?.firstSeen);
  const added=unseen.filter(w=>w.custom&&w.addedOn<=today).sort((a,b)=>(b.addedOn||'').localeCompare(a.addedOn||'')||b.id-a.id);
  const original=unseen.filter(w=>!w.custom);
  // 每日新词上限：做题新词优先，但计入当天的新词额度（更像成体系的背词软件，
  // 也避免“原表 30 + 做题新词 50”把一天撑爆）。dailyNew===0 表示真正不限量。
  // 旧 goal 设置仍保留原“不占额度”语义，供未迁移的状态与旧测试使用。
  if(state.settings.dailyNew===0)return [...added,...original];
  if(state.settings.dailyNew>0){
    const learned=words.filter(w=>state.progress[w.id]?.firstSeen===today).length;
    return [...added,...original].slice(0,Math.max(0,state.settings.dailyNew-learned));
  }
  if(state.settings.goal){const learned=words.filter(w=>!w.custom&&state.progress[w.id]?.firstSeen===today).length;return [...added,...original.slice(0,Math.max(0,state.settings.goal-learned))];}
  const planDay=state.logs[today]?.planDay||original[0]?.day||14;
  return [...added,...original.filter(w=>w.day===planDay)];
}
export const newWordsLearnedToday=(words,state,today=dayKey())=>words.filter(w=>state.progress[w.id]?.firstSeen===today).length;
export const normalizeAnswer=s=>s.trim().toLowerCase();
export const normalizeWord=s=>String(s??'').normalize('NFKC').trim().toLowerCase().replace(/[’‘]/g,"'").replace(/[‐‑–—]/g,'-').replace(/\s+/g,' ');
export function findExistingWord(baseWords,state,text){const key=normalizeWord(text);return [...baseWords,...(state.customWords||[])].find(w=>normalizeWord(w.word)===key);}
export function addCustomWord(baseWords,state,input,today=dayKey()){
  const word=normalizeWord(input.word);
  const existing=findExistingWord(baseWords,state,word);
  if(existing)return {added:false,word:existing};
  if(!word||word.length>100||!/[a-z]/.test(word)||!/^[a-z0-9 '.\-]+$/.test(word))throw new Error('请输入英文单词或短语（最多 100 个字符）。');
  const definition=String(input.definition??'').trim(),phonetic=String(input.phonetic??'').trim(),collocations=String(input.collocations??'').trim(),mnemonic=String(input.mnemonic??'').trim();
  if(!definition||definition.length>2000)throw new Error('请填写中文释义（最多 2000 个字符）。');
  if(phonetic.length>200||collocations.length>2000)throw new Error('音标或搭配内容过长，请缩短后保存。');
  if(mnemonic.length>5000)throw new Error('近义词或助记内容过长，请缩短到 5000 个字符以内。');
  if(!validDay(today))throw new Error('添加日期无效。');
  const customWords=state.customWords||[];
  const id=Math.max(0,...baseWords.map(w=>w.id),...customWords.map(w=>w.id))+1;
  const entry={id,word,definition,phonetic,collocations,mnemonic,originalDefinition:definition,day:0,custom:true,addedOn:today,highFrequency:false};
  state.customWords=[...customWords,entry];
  const q=getSession(state,'learn');
  if(q?.mode==='learn'&&q.index<q.queue.length){q.queue.splice(q.index+1,0,id);q.total++;}
  return {added:true,word:entry};
}
// —— 学习包：合并做题积累的词；重复词只追加笔记，不重复建卡（幂等）——
export function importLearningPacks(baseWords,state,packs,date=dayKey()){
  const results=[];
  for(const pack of packs){
    if(!state.importedPacks||typeof state.importedPacks!=='object')state.importedPacks={};
    if(state.importedPacks[pack.id]!=null)continue;
    const added=[],updated=[],skipped=[];
    for(const entry of pack.entries||[]){
      const existing=[entry.word,...(entry.aliases||[])].map(w=>findExistingWord(baseWords,state,w)).find(Boolean);
      if(existing){
        const sameContent=existing.custom&&(existing.mnemonic||'')===(entry.mnemonic||'')&&existing.definition===entry.definition;
        if(sameContent){skipped.push({word:existing.word,reason:'already'});continue;}
        const marker=pack.marker||`【${pack.id}】`;
        const current=String(state.progress[existing.id]?.note||'');
        if(current.includes(marker)){skipped.push({word:existing.word,reason:'noted'});continue;}
        const lines=[pack.marker||`${marker}${pack.title?` ${pack.title}`:''}`];
        if(entry.definition)lines.push(`释义补充：${entry.definition}`);
        if(entry.mnemonic)lines.push(entry.mnemonic);
        const nextNote=(current.trimEnd()?current.trimEnd()+'\n\n':'')+lines.join('\n');
        state.progress[existing.id]||={};
        state.progress[existing.id].note=nextNote.slice(0,5000);
        updated.push({word:existing.word,id:existing.id});
        continue;
      }
      try{
        const isolated={customWords:state.customWords||[]};
        const result=addCustomWord(baseWords,isolated,entry,date);
        state.customWords=isolated.customWords;
        added.push(result.word);
      }catch(error){
        skipped.push({word:entry.word,reason:error.message});
      }
    }
    state.importedPacks[pack.id]={date:pack.date||date,added:added.map(w=>w.word),updated:updated.map(item=>item.word)};
    results.push({pack,added,updated,skipped});
  }
  return results.length?results:null;
}

export function spellingWords(words,state,today=dayKey()){
  const done=new Set(state.logs[today]?.spelledIds||[]);
  return words.filter(w=>state.progress[w.id]?.firstSeen&&!done.has(w.id)).sort((a,b)=>(state.progress[b.id].firstSeen===today)-(state.progress[a.id].firstSeen===today)||(state.progress[b.id].mistakes||0)-(state.progress[a.id].mistakes||0));
}

// —— 今日复习计划：尊重每日上限，按薄弱程度取前 N 个 ——
export function reviewPlan(words,state,today=dayKey(),now=new Date(),size=20){
  const due=dueWords(words,state,today,now);
  const done=new Set(state.logs[today]?.reviewedIds||[]);
  const limit=state.settings.dailyReview>0?state.settings.dailyReview:0;
  const left=limit?Math.max(0,limit-done.size):Infinity;
  const queue=due.slice(0,Math.min(size,left));
  return {due:due.length,done:done.size,limit,left,queue,backlog:Math.max(0,due.length-left),capReached:limit>0&&left===0};
}

// —— 评分预期间隔：作答前就能看到“下次什么时候再见” ——
export function previewRating(previous,now=new Date(),retention=0.9){
  const card=previous?.card?toCard(previous.card):createEmptyCard(now);
  const preview=getScheduler(retention).repeat(card,now);
  return [1,2,3].map(rating=>({rating,due:preview[rating].card.due,state:preview[rating].card.state}));
}
export function intervalLabel(due,now=new Date()){
  const target=due instanceof Date?due.getTime():due;
  if(!Number.isFinite(target))return '';
  const ms=target-now.getTime();
  if(ms<=60000)return '1 分钟内';
  const minutes=Math.round(ms/60000);
  if(minutes<60)return `${minutes} 分钟后`;
  const hours=Math.round(minutes/60);
  if(hours<24)return `${hours} 小时后`;
  const days=Math.round(hours/24);
  if(days<30)return `${days} 天后`;
  const months=Math.round(days/30);
  if(months<12)return `${months} 个月后`;
  return `${(days/365).toFixed(1)} 年后`;
}

// —— 顽固词：反复遗忘的词单独列出，避免淹没在普通错词里 ——
export function isLeech(p){return !!p&&!isMastered(p)&&((p.card?.lapses||0)>=4||(p.mistakes||0)>=5);}
export function leechWords(words,state,now=new Date()){
  return words.filter(w=>isLeech(state.progress[w.id])&&isPracticable(state.progress[w.id],now));
}

// —— 未来 7 天到期量：用于首页“复习压力”预测 ——
export function forecastDue(words,state,days=7,today=dayKey(),now=new Date()){
  const out=Array.from({length:days},(_,i)=>({day:addDays(today,i),count:0}));
  const index=new Map(out.map((item,i)=>[item.day,i]));
  for(const w of words){
    const p=state.progress[w.id];if(!p?.card)continue;
    if(isLearningCard(p)){if(p.card.due<=now.getTime())out[0].count++;continue;}
    const due=dueDayOf(p);if(!due)continue;
    const target=due<=today?0:index.get(due);
    if(target!=null)out[target].count++;
  }
  return out;
}

// —— 近 N 天回忆质量（仅统计长期/复习作答，拼写不计入调度）——
export function retentionStats(state,days=30,now=new Date()){
  const since=now.getTime()-days*86400000;
  let again=0,hard=0,good=0;
  for(const p of Object.values(state.progress||{})){
    for(const event of p.reviewHistory||[]){
      if(!(event.time>=since)||event.mode==='spell')continue;
      if(event.rating===1)again++;else if(event.rating===2)hard++;else if(event.rating===3)good++;
    }
  }
  const attempts=again+hard+good;
  return {attempts,again,hard,good,rate:attempts?good/attempts:null};
}

const validDay=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T12:00:00'))&&dayKey(new Date(v+'T12:00:00'))===v;
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const fail=()=>{throw new Error('备份格式不正确，或不是此词库的备份。原进度未改变。');};

function checkCard(c){
  if(!object(c))fail();
  if(![0,1,2,3].includes(c.state))fail();
  for(const k of ['due','stability','difficulty','scheduled_days'])if(!Number.isFinite(c[k])||c[k]<0)fail();
  for(const k of ['reps','lapses','learning_steps'])if(!Number.isInteger(c[k])||c[k]<0)fail();
  if(c.last_review!=null&&(!Number.isFinite(c.last_review)||c.last_review<0))fail();
  if(c.estimated!=null&&typeof c.estimated!=='boolean')fail();
}
export function validateBackup(s,words){
  const ids=new Set(words.map(w=>String(w.id)));
  const keys=new Set(words.map(w=>normalizeWord(w.word)));
  if(!object(s)||![1,2].includes(s.version)||!object(s.progress)||!object(s.logs)||!object(s.settings))fail();
  if(s.customWords!=null){
    if(!Array.isArray(s.customWords)||s.customWords.length>20000)fail();
    for(const w of s.customWords){
      if(!object(w)||!Number.isSafeInteger(w.id)||w.id<1||ids.has(String(w.id))||w.custom!==true||w.day!==0||!validDay(w.addedOn))fail();
      if(typeof w.word!=='string'||!normalizeWord(w.word)||w.word.length>100||keys.has(normalizeWord(w.word)))fail();
      if(typeof w.definition!=='string'||!w.definition.trim()||w.definition.length>2000||typeof w.phonetic!=='string'||w.phonetic.length>200||typeof w.collocations!=='string'||w.collocations.length>2000||w.highFrequency!==false)fail();
      if(w.mnemonic!=null&&(typeof w.mnemonic!=='string'||w.mnemonic.length>5000))fail();
      ids.add(String(w.id));keys.add(normalizeWord(w.word));
    }
  }
  if(s.settings.accent!=null&&!['us','uk'].includes(s.settings.accent))fail();
  if(!Number.isInteger(s.settings.goal)||s.settings.goal<0||s.settings.goal>300||typeof s.settings.autoSpeak!=='boolean')fail();
  if(s.settings.dailyNew!=null&&(!Number.isInteger(s.settings.dailyNew)||s.settings.dailyNew<0||s.settings.dailyNew>1000))fail();
  if(s.settings.dailyReview!=null&&(!Number.isInteger(s.settings.dailyReview)||s.settings.dailyReview<0||s.settings.dailyReview>5000))fail();
  if(s.settings.retention!=null&&(!Number.isFinite(s.settings.retention)||s.settings.retention<0.7||s.settings.retention>0.99))fail();
  if(s.settings.theme!=null&&!['auto','light','dark'].includes(s.settings.theme))fail();
  for(const [id,p] of Object.entries(s.progress)){
    if(!ids.has(id)||!object(p))fail();
    for(const k of ['firstSeen','lastSeen','lastSuccess'])if(p[k]!=null&&!validDay(p[k]))fail();
    for(const k of ['streak','mistakes','fuzzyCount','attempts','lastRating'])if(p[k]!=null&&(!Number.isInteger(p[k])||p[k]<0||p[k]>10000000))fail();
    if(p.note!=null&&(typeof p.note!=='string'||p.note.length>5000))fail();
    if(p.favorite!=null&&typeof p.favorite!=='boolean')fail();
    if(p.reviewHistory!=null){
      if(!Array.isArray(p.reviewHistory))fail();
      for(const event of p.reviewHistory){
        if(!object(event)||!Number.isFinite(event.time)||!Number.isFinite(new Date(event.time).getTime())||![1,2,3].includes(event.rating)||!['learn','review','mistakes','day'].includes(event.mode))fail();
        if(event.before!=null)checkCard(event.before);
        if(event.after!=null)checkCard(event.after);
      }
    }
    if(s.version===1){
      // 旧格式：已学词必须有到期日与计数；不完整则拒绝，防止损坏后续作答。
      for(const k of ['due'])if(p.firstSeen&&!validDay(p.due))fail();
      if(p.firstSeen&&(!p.due||!Number.isInteger(p.streak)||!Number.isInteger(p.mistakes)))fail();
      if(p.firstRating!=null&&![1,2,3].includes(p.firstRating))fail();
      if(p.scheduleStage!=null&&(!Number.isInteger(p.scheduleStage)||p.scheduleStage<0||p.scheduleStage>4))fail();
    }else{
      // v2：已学词必须有卡片。
      if(p.firstSeen&&!p.card)fail();
      if(p.card!=null)checkCard(p.card);
    }
  }
  for(const [date,log] of Object.entries(s.logs)){
    if(!validDay(date)||!object(log)||!Array.isArray(log.ids)||!['answers','correct','spelling','spellingCorrect'].every(k=>Number.isInteger(log[k])&&log[k]>=0))fail();
    if(log.reviewedIds!=null&&(!Array.isArray(log.reviewedIds)||log.reviewedIds.some(id=>!ids.has(String(id)))))fail();
    if(log.spelledIds!=null&&(!Array.isArray(log.spelledIds)||log.spelledIds.some(id=>!ids.has(String(id)))))fail();
    if(log.planDay!=null&&(!Number.isInteger(log.planDay)||log.planDay<1||log.planDay>14))fail();
    for(const k of ['answers','correct','spelling','spellingCorrect'])if(log[k]!=null&&(!Number.isInteger(log[k])||log[k]<0))fail();
    if(log.ids!=null&&(!Array.isArray(log.ids)||log.ids.some(id=>!ids.has(String(id)))))fail();
  }
  if(s.lastBackup!=null&&!validDay(s.lastBackup))fail();
  function checkSession(q){
    if(!object(q)||!['learn','review','spell','mistakes','day'].includes(q.mode)||!Array.isArray(q.queue)||q.queue.length>1000000||q.queue.some(id=>!ids.has(String(id)))||!Number.isInteger(q.index)||q.index<0||q.index>q.queue.length||!Number.isInteger(q.total)||q.total<1||!Number.isInteger(q.correct)||q.correct<0||!validDay(q.date)||typeof q.title!=='string'||!object(q.retries))fail();
    for(const [id,n] of Object.entries(q.retries))if(!ids.has(id)||!Number.isInteger(n)||n<0||n>1000000)fail();
  }
  if(s.session!=null)checkSession(s.session);
  if(s.sessions!=null){if(!object(s.sessions))fail();for(const [mode,q] of Object.entries(s.sessions)){if(q?.mode!==mode)fail();checkSession(q);}}
  return structuredClone(s);
}

// 单步撤销：恢复作答前的掌握状态、到期日、当日统计与本组队列；收藏/笔记保留。
export function captureAnswerUndo(state,date,rating){
  const session=state.session,id=session.queue[session.index];
  return {session,id,date,rating,before:structuredClone(session),progress:structuredClone(state.progress[id]),log:structuredClone(state.logs[date]),repeated:false,used:false};
}
export function undoAnswer(state,u){
  if(!u||u.used||state.session!==u.session||state.session.index!==u.before.index+1||state.session.queue.length!==u.before.queue.length+(u.repeated?1:0))return false;
  const current=state.progress[u.id]||{},restored=structuredClone(u.progress)||{};
  for(const key of ['note','favorite'])if(Object.hasOwn(current,key))restored[key]=current[key];
  if(Object.keys(restored).length)state.progress[u.id]=restored;else delete state.progress[u.id];
  if(u.log)state.logs[u.date]=structuredClone(u.log);else delete state.logs[u.date];
  Object.assign(state.session,structuredClone(u.before));rememberSession(state);u.used=true;return true;
}

export function importReadingBatch(baseWords,state,batch){
  if(state.importedBatches?.[batch.id])return null;
  const added=[],skipped=[];
  for(const entry of batch.entries){
    const existing=[entry.word,...(entry.aliases||[])].map(w=>findExistingWord(baseWords,state,w)).find(Boolean);
    if(existing){skipped.push({word:entry.word,existing:existing.word});continue;}
    const isolated={customWords:state.customWords||[]};
    const result=addCustomWord(baseWords,isolated,entry,batch.scheduledFor);
    state.customWords=isolated.customWords;added.push(entry.word);
  }
  state.importedBatches||={};state.importedBatches[batch.id]={scheduledFor:batch.scheduledFor,added,skipped};
  return state.importedBatches[batch.id];
}

// 原始快照成功持久化之后，调用方才可迁移；空间不足时抛错并停止写入。
export function backupBeforeMigration(storage,key,raw){
 const snapshotKey=key+':pre-fsrs-v2';
 if(storage.getItem(snapshotKey)==null){storage.setItem(snapshotKey,raw);if(storage.getItem(snapshotKey)!==raw)throw new Error('迁移备份校验失败');}
 return snapshotKey;
}
