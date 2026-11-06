import {createPronouncer} from './audio.js';
import {words as baseWords,readingBatch} from './words.js';
import {learningPacks} from './packs.js';
import {loadSyncConfig,saveSyncConfig,clearSyncConfig,isSyncConfigured,maskToken,fingerprint,extractGistId,verifyGithubToken,createSyncGist,fetchSyncGist,pushSyncGist} from './sync.js';
import {backupBeforeMigration,freshState,dayKey,addDays,rateWord,isMastered,dueWords,newWords,newWordsLearnedToday,spellingWords,validateBackup,normalizeAnswer,addCustomWord,findExistingWord,rememberSession,getSession,migratePreferences,migrateToV2,migrateSettings,advanceQueue,reviewPlan,weakWords,leechWords,forecastDue,retentionStats,previewRating,intervalLabel,captureAnswerUndo,undoAnswer,importReadingBatch,importLearningPacks,nextAnswerIndex,nextConsolidation,dueDayOf,isLearningCard,isDue} from './engine.js';

const params=new URLSearchParams(location.search);
const isTestMode=params.has('test');
const KEY=isTestMode?'word-garden-test-v1':'word-garden-v1';
const PUBLIC_URL='https://wrxq522t9c-debug.github.io/word-garden/';
const app=document.querySelector('#app');
let words=[...baseWords];
let byId=new Map(words.map(w=>[w.id,w]));
let state=freshState();
let view='home';
let revealed=false;
let feedback=null;
let query='';
let filter='all';
let dayFilter='all';
let page=1;
let blocked=false;
let detailId=null;
let lastAnswerUndo=null;
let waitTimer=null;
let ringSeq=0;
let syncConfig=loadSyncConfig();
if(!syncConfig.deviceName)syncConfig.deviceName=/iPhone|iPad|iPod/i.test(navigator.userAgent)?'iPhone':'电脑';
let syncRuntime={busy:false,status:'off',message:'',error:'',pendingGist:extractGistId(params.get('gist')||''),conflict:null};
let syncReady=false,applyingRemote=false,autoPushTimer=null;

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const progress=w=>state.progress[w.id]||{};
const studied=()=>words.filter(w=>progress(w).firstSeen);
const mastered=()=>words.filter(w=>isMastered(progress(w)));
const today=()=>dayKey();
const retention=()=>Number(state.settings.retention)||0.9;
const dailyNew=()=>Number(state.settings.dailyNew)||0;
const dailyReview=()=>Number(state.settings.dailyReview)||0;
const pct=(a,b)=>b>0?Math.max(0,Math.min(100,Math.round(a/b*100))):0;

/* ---------- icons ---------- */
const ICONS={
  home:'<path d="M3 10.6 12 3l9 7.6"/><path d="M5.5 9.4V21h13V9.4"/><path d="M10 21v-5.5h4V21"/>',
  book:'<path d="M12 6.4C10 5 6.8 4.5 4 5v13c2.8-.5 6 0 8 1.4 2-1.4 5.2-1.9 8-1.4V5c-2.8-.5-6 0-8 1.4Z"/><path d="M12 6.4V19.4"/>',
  layers:'<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12.5 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
  chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  settings:'<path d="M4 6.5h16M4 12h16M4 17.5h16"/><circle cx="9" cy="6.5" r="2.2"/><circle cx="15" cy="12" r="2.2"/><circle cx="7" cy="17.5" r="2.2"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon:'<path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z"/>',
  flame:'<path d="M12 3c1.2 4-2.2 5.1-2.2 8.1a2.2 2.2 0 0 0 4.4 0c0-1-.1-1.7-.7-2.7 2.3 1.4 4.5 4 4.5 6.6a6 6 0 0 1-12 0C6 11.7 9.6 8.2 12 3Z"/>',
  volume:'<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.2 6a8.6 8.6 0 0 1 0 12"/>',
  star:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
  arrowLeft:'<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
  arrowRight:'<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  check:'<path d="m4 12.5 5 5L20 6.5"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>',
  undo:'<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
  keyboard:'<rect x="2" y="6" width="20" height="12" rx="3"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/>',
  spark:'<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  download:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 17v3h16v-3"/>',
  refresh:'<path d="M20 7v5h-5"/><path d="M4 17v-5h5"/><path d="M6.5 9a7 7 0 0 1 11.6-2L20 12"/><path d="M17.5 15a7 7 0 0 1-11.6 2L4 12"/>',
  upload:'<path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M5 20h14"/>',
  link:'<path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7L13 18"/>',
};
function icon(name,cls=''){return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]||''}</svg>`;}

/* ---------- storage ---------- */
try{
  const raw=localStorage.getItem(KEY);
  if(raw)state=validateBackup(JSON.parse(raw),baseWords);
}catch(error){
  blocked=true;
}
function syncWords(){
  words=[...baseWords,...(state.customWords||[])];
  byId=new Map(words.map(w=>[w.id,w]));
}
function banner(){
  return `<div class="banner" role="alert">本地进度读取失败或数据需要恢复，已停止自动写入以保护原数据。请到「数据」页导出原始数据，或恢复一份有效备份。</div>`;
}
function toast(text){
  const element=document.querySelector('#toast');
  if(!element)return;
  element.textContent=text;
  element.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer=setTimeout(()=>element.classList.remove('show'),3200);
}
function save(){
  rememberSession(state);
  if(blocked){toast('请先在「数据」页恢复有效备份，原数据受到保护。');return false;}
  try{
    localStorage.setItem(KEY,JSON.stringify(state));
    if(!applyingRemote&&syncReady&&!isTestMode)markLocalChange();
    return true;
  }catch(error){
    toast('本地保存失败。请立即导出备份，暂时不要关闭页面。');
    return false;
  }
}
function touchLog(){
  const d=today();
  if(!state.logs[d]){
    const next=baseWords.find(w=>!progress(w).firstSeen);
    state.logs[d]={answers:0,correct:0,spelling:0,spellingCorrect:0,ids:[],planDay:next?.day||14};
  }
  return state.logs[d];
}
function streak(){
  let d=today(),n=0;
  if(!state.logs[d]?.answers)d=addDays(d,-1);
  while(state.logs[d]?.answers){n++;d=addDays(d,-1);}
  return n;
}

/* ---------- cross-device sync ---------- */
const syncEnabled=!isTestMode;
let lastSyncErrorAt=0;
function syncConfigured(){return syncEnabled&&isSyncConfigured(syncConfig);}
function publicAppUrl(){
  if(location.protocol==='https:'&&location.hostname.endsWith('github.io'))return location.origin+location.pathname;
  return PUBLIC_URL;
}
function pairingUrl(){return `${publicAppUrl()}?gist=${encodeURIComponent(syncConfig.gistId)}`;}
function syncTimeLabel(ts=syncConfig.lastSyncAt){
  if(!ts)return '尚未同步';
  return new Date(ts).toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});
}
function isIosDevice(){return /iPhone|iPad|iPod/i.test(navigator.userAgent);}
function isStandaloneApp(){return !!navigator.standalone||!!window.matchMedia?.('(display-mode: standalone)').matches;}
function syncIosNote(){
  const ios=isIosDevice();
  const standalone=isStandaloneApp();
  if(!ios||standalone)return '';
  return '<div class="data-note"><b>iPhone：</b>建议先在 Safari 里「分享 → 添加到主屏幕」，再从主屏幕的「词间」打开配置同步。Safari 和主屏幕 App 的本地存储是分开的，先在 Safari 配置不会自动带过去。</div>';
}
function syncStatusInfo(){
  if(!syncEnabled)return {label:'测试模式',cls:'warn'};
  if(!syncConfigured())return {label:'未连接',cls:''};
  if(syncRuntime.busy)return {label:'同步中…',cls:'accent'};
  if(syncRuntime.status==='error')return {label:'同步失败',cls:'bad'};
  if(syncRuntime.conflict)return {label:'需要选择',cls:'warn'};
  if(syncRuntime.status==='synced')return {label:'已同步',cls:'good'};
  return {label:syncConfig.auto?'已连接':'已连接 · 手动',cls:'good'};
}
function updateSyncStatusDom(){
  const info=syncStatusInfo(),chip=document.querySelector('#sync-status-chip');
  if(chip){chip.textContent=info.label;chip.className=`chip ${info.cls}`.trim();}
  const detail=document.querySelector('#sync-status-detail');
  if(detail)detail.textContent=syncTimeLabel();
  const error=document.querySelector('#sync-error');
  if(error)error.textContent=syncRuntime.error||'';
}
function setSyncStatus(status,message=''){
  syncRuntime.status=status;
  if(status!=='error')syncRuntime.error='';
  if(message)syncRuntime.message=message;
  updateSyncStatusDom();
}
function syncError(message){
  syncRuntime.status='error';syncRuntime.error=String(message||'同步失败');
  updateSyncStatusDom();
  if(Date.now()-lastSyncErrorAt>20000){lastSyncErrorAt=Date.now();toast(`同步失败：${syncRuntime.error}`);}
}
function markLocalChange(){
  if(!syncConfigured())return;
  syncConfig.lastLocalAt=Date.now();
  saveSyncConfig(syncConfig);
  scheduleAutoPush();
}
function scheduleAutoPush(){
  if(!syncConfigured()||!syncConfig.auto||syncRuntime.conflict||!navigator.onLine)return;
  clearTimeout(autoPushTimer);
  autoPushTimer=setTimeout(()=>{autoPushTimer=null;pushSync({auto:true});},2500);
}
function syncPanelHtml(){
  const info=syncStatusInfo();
  if(!syncEnabled)return `<section class="panel settings-wide sync-panel"><div class="section-head"><div><h2>跨设备同步</h2><div class="sub">测试模式不启用同步</div></div><span class="chip warn">测试模式</span></div></section>`;
  if(!syncConfigured()){
    const pending=!!syncRuntime.pendingGist;
    return `<section class="panel settings-wide sync-panel">
      <div class="section-head"><div><h2>跨设备同步</h2><div class="sub">电脑和 iPhone 共用同一份学习进度</div></div><span class="chip ${info.cls}" id="sync-status-chip">${info.label}</span></div>
      <p class="form-sub">学习数据放在你的私有 GitHub Gist；token 只保存在本机浏览器，不写进学习备份。${pending?'已从配对链接读取同步空间，只需粘贴 token。':''}</p>
      <div class="sync-setup">
        <div class="field"><label for="sync-token">GitHub token 或整段手机配对信息</label>${isIosDevice()?`<textarea id="sync-token" class="sync-token-area" rows="2" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="粘贴 token，或电脑上复制的整段配对信息"></textarea>`:`<input id="sync-token" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="ghp_... 或 github_pat_...">`}<a class="text-btn" href="https://github.com/settings/tokens/new?scopes=gist&description=word-garden-sync" target="_blank" rel="noopener">去 GitHub 创建 token ↗</a></div>
        <div class="field"><label for="sync-gist">${isIosDevice()?'同步空间 ID（粘贴配对信息后自动带入）':'同步空间 ID（已有就填；没有留空自动创建）'}</label><input id="sync-gist" value="${esc(syncRuntime.pendingGist||'')}" placeholder="32 位 ID；手机端可由配对链接自动带入" autocomplete="off" spellcheck="false"></div>
      </div>
      <div class="settings-actions">
        ${isIosDevice()
          ? `<button class="btn primary" data-action="sync-connect" data-sync-action>${icon('download')} 用这个 ID 下载云端</button>`
          : `<button class="btn primary" data-action="sync-create" data-sync-action>创建同步空间并上传本机</button><button class="btn ghost" data-action="sync-connect" data-sync-action>用这个 ID 下载云端</button>`}
      </div>
      <div id="sync-error" class="form-error">${esc(syncRuntime.error||'')}</div>
      <div class="data-note"><b>建议流程：</b>电脑上创建同步空间 → 复制手机配对信息 → iPhone 先添加到主屏幕，再从主屏幕 App 里粘贴配对信息并下载。之后打开应用会自动同步。<br>在 iPhone 上用 Safari 打开 <a href="${esc(publicAppUrl())}" target="_blank" rel="noopener">${esc(publicAppUrl())}</a>，然后「分享 → 添加到主屏幕」。</div>
      ${syncIosNote()}
    </section>`;
  }
  const login=syncConfig.login?`GitHub @${esc(syncConfig.login)}`:'GitHub 已连接';
  const autoLabel=syncConfig.auto?'自动同步已开':'自动同步已关';
  return `<section class="panel settings-wide sync-panel">
    <div class="section-head"><div><h2>跨设备同步</h2><div class="sub">${login} · 私有 Gist · ${autoLabel}</div></div><span class="chip ${info.cls}" id="sync-status-chip">${info.label}</span></div>
    <div class="sync-grid">
      <div class="sync-kv"><span>同步空间</span><code>${esc(syncConfig.gistId)}</code></div>
      <div class="sync-kv"><span>上次同步</span><b id="sync-status-detail">${esc(syncTimeLabel())}</b></div>
      <div class="sync-kv"><span>本机 token</span><b>${esc(maskToken(syncConfig.token))}</b></div>
      <div class="sync-kv"><span>手机打开</span><a href="${esc(publicAppUrl())}" target="_blank" rel="noopener">${esc(publicAppUrl().replace(/^https?:\/\//,''))}</a></div>
    </div>
    <div class="setting-row" style="border-top:1px solid var(--line);margin-top:4px">
      <div class="setting-copy"><span class="setting-label">自动同步</span><small>打开应用时拉取另一台设备的新进度；每次作答后自动上传。</small></div>
      <label class="switch"><input id="sync-auto" type="checkbox" data-setting="syncAuto" ${syncConfig.auto?'checked':''}><span></span></label>
    </div>
    <div class="settings-actions">
      <button class="btn primary" data-action="sync-push" data-sync-action>${icon('upload')} 上传本机</button>
      <button class="btn ghost" data-action="sync-pull" data-sync-action>${icon('download')} 从云端下载</button>
      ${syncRuntime.conflict?'<button class="btn ghost" data-action="sync-conflict">处理同步冲突</button>':''}
      <button class="btn ghost" data-action="sync-phone">${icon('link')} 复制手机配对信息</button>
      <button class="text-btn" data-action="sync-pair">复制配对链接</button>
      <button class="text-btn" data-action="sync-copy-gist">复制同步 ID</button>
      <button class="text-btn" data-action="sync-disconnect">断开同步</button>
    </div>
    <div id="sync-error" class="form-error">${esc(syncRuntime.error||'')}</div>
    <div class="data-note">token 只保存在本机；学习数据在私有 Gist 中。两边都改过时会弹窗让你选，不会悄悄覆盖。iPhone 上用 Safari 打开上面的地址，分享 → 添加到主屏幕。</div>
    ${syncIosNote()}
  </section>`;
}
async function syncLogin(token){try{return (await verifyGithubToken({token})).login||'';}catch{return '';}}
function downloadLocalBackup(label){
  try{download(JSON.stringify(state,null,2),`词间-${label}-${today()}-${Date.now()}.json`);}catch{}
}
async function copyText(text,label){
  try{await navigator.clipboard.writeText(text);toast(`${label}已复制`);}
  catch{prompt(label,text);}
}
function copyGistId(){copyText(syncConfig.gistId,'同步 ID');}
function copyPairLink(){copyText(pairingUrl(),'手机配对链接');}
function parsePhoneInfo(text){
  const raw=String(text||'');
  const token=(raw.match(/(?:github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9_]{20,})/)||[])[0]||'';
  const labeled=raw.match(/(?:同步\s*ID|Gist\s*ID)[：:]\s*([A-Za-z0-9_-]{6,}?)(?=\s|Token[：:]|$)/i);
  const fromUrl=raw.match(/gist=([0-9a-f]{20,})/i)||raw.match(/gist\.github\.com\/[^/\s]+\/([0-9a-f]{20,})/i);
  return {token,gistId:(labeled||fromUrl||[])[1]||''};
}
function copyPhoneInfo(){
  const text=`词间跨设备同步\n网页：${publicAppUrl()}\n同步 ID：${syncConfig.gistId}\nToken：${syncConfig.token}\n\n在 iPhone 的「词间」→ 设置 → 跨设备同步，把这段粘贴到 token 输入框即可。`;
  copyText(text,'手机配对信息（含 token）');
  setTimeout(()=>toast('这段信息含 token，请只发给自己'),900);
}
function disconnectSync(){
  if(!confirm('断开同步？本机学习进度保留，只是不再上传或下载。'))return;
  clearSyncConfig();
  syncConfig=loadSyncConfig();
  if(!syncConfig.deviceName)syncConfig.deviceName=/iPhone|iPad|iPod/i.test(navigator.userAgent)?'iPhone':'电脑';
  syncRuntime={busy:false,status:'off',message:'',error:'',pendingGist:'',conflict:null};
  clearTimeout(autoPushTimer);
  render();toast('已断开同步，本机进度不变');
}
function createSyncFromForm(){
  if(!syncEnabled)return;
  if(syncRuntime.busy)return;
  const token=document.querySelector('#sync-token')?.value.trim()||'';
  if(!token){toast('先粘贴 GitHub token');return;}
  if(!navigator.onLine){syncError('当前离线，无法创建同步空间');return;}
  syncRuntime.busy=true;setSyncStatus('syncing');
  (async()=>{
    try{
      const login=await syncLogin(token);
      const created=await createSyncGist({token,state,deviceId:syncConfig.deviceId,deviceName:syncConfig.deviceName});
      syncConfig={...syncConfig,token,gistId:created.gistId,login,auto:true,lastRemoteAt:created.updatedAt,lastSyncAt:created.updatedAt,lastLocalAt:created.updatedAt,lastHash:fingerprint(state)};
      saveSyncConfig(syncConfig);syncRuntime.pendingGist='';
      syncRuntime.busy=false;setSyncStatus('synced');render();toast('同步空间已创建，本机进度已上传');
    }catch(error){syncError(error.message);}
    finally{syncRuntime.busy=false;}
  })();
}
function connectSyncFromForm(){
  if(!syncEnabled)return;
  if(syncRuntime.busy)return;
  const raw=document.querySelector('#sync-token')?.value.trim()||'';
  const parsed=parsePhoneInfo(raw);
  const token=parsed.token||raw;
  const gistField=document.querySelector('#sync-gist')?.value.trim()||'';
  const gistId=extractGistId(gistField)||parsed.gistId||(parsed.token?'':extractGistId(raw));
  if(!token){toast('先粘贴 GitHub token 或手机配对信息');return;}
  if(!gistId){toast('填写同步空间 ID，或粘贴含同步 ID 的配对信息');return;}
  if(!navigator.onLine){syncError('当前离线，无法下载云端进度');return;}
  syncRuntime.busy=true;setSyncStatus('syncing');
  (async()=>{
    try{
      const login=await syncLogin(token);
      const remote=await fetchSyncGist({token,gistId});
      validateBackup(remote.state,baseWords);
      if(studied().length&&!confirm('将用云端进度替换本机进度。\n\n确定继续？会先自动下载本机备份。')){setSyncStatus('idle');return;}
      if(studied().length)downloadLocalBackup('同步连接前');
      syncConfig={...syncConfig,token,gistId,login,auto:true};
      saveSyncConfig(syncConfig);
      applyRemoteState(remote);
      syncRuntime.pendingGist='';
      setSyncStatus('synced');toast('已连接并从云端下载最新进度');
    }catch(error){syncError(error.message);}
    finally{syncRuntime.busy=false;}
  })();
}
function applyRemoteState(remote){
  const next=validateBackup(remote.state,baseWords);
  migratePreferences(next);migrateToV2(next);migrateSettings(next);
  applyingRemote=true;
  state=next;syncWords();blocked=false;
  try{localStorage.setItem(KEY,JSON.stringify(state));}finally{applyingRemote=false;}
  syncConfig.lastRemoteAt=remote.updatedAt;syncConfig.lastSyncAt=remote.updatedAt;syncConfig.lastLocalAt=remote.updatedAt;syncConfig.lastHash=fingerprint(state);
  saveSyncConfig(syncConfig);
  syncRuntime.conflict=null;syncRuntime.error='';
  applyTheme();view='home';feedback=null;revealed=false;lastAnswerUndo=null;page=1;
  render();
}
async function pushSync({force=false,auto=false}={}){
  if(!syncConfigured()){if(!auto)toast('先连接同步');return;}
  if(syncRuntime.busy)return;
  if(!navigator.onLine){if(!auto)syncError('当前离线，进度已保存在本机');return;}
  syncRuntime.busy=true;syncRuntime.error='';setSyncStatus('syncing');
  try{
    if(!force){
      const remote=await fetchSyncGist({token:syncConfig.token,gistId:syncConfig.gistId});
      const dirty=fingerprint(state)!==syncConfig.lastHash;
      if(remote.updatedAt>syncConfig.lastRemoteAt&&dirty){
        syncRuntime.busy=false;syncRuntime.conflict=remote;setSyncStatus('conflict');
        if(view!=='study'&&!document.hidden)openSyncConflict(remote);else toast('云端有更新；学完这组后再处理同步');
        return;
      }
      if(remote.updatedAt>syncConfig.lastRemoteAt&&!dirty){
        syncRuntime.busy=false;syncRuntime.conflict=remote;setSyncStatus('conflict');
        if(view!=='study'&&!document.hidden)openSyncConflict(remote);else toast('云端有更新；稍后可从云端下载');
        return;
      }
    }
    const result=await pushSyncGist({token:syncConfig.token,gistId:syncConfig.gistId,state,deviceId:syncConfig.deviceId,deviceName:syncConfig.deviceName});
    syncConfig.lastRemoteAt=result.updatedAt;syncConfig.lastSyncAt=result.updatedAt;syncConfig.lastLocalAt=result.updatedAt;syncConfig.lastHash=fingerprint(state);
    saveSyncConfig(syncConfig);
    syncRuntime.conflict=null;setSyncStatus('synced');
    if(!auto){syncRuntime.busy=false;render();toast('已上传本机进度');}
  }catch(error){syncError(error.message);}
  finally{syncRuntime.busy=false;}
}
async function pullSync(){
  if(!syncConfigured()){toast('先连接同步');return;}
  if(syncRuntime.busy)return;
  if(!navigator.onLine){syncError('当前离线');return;}
  syncRuntime.busy=true;setSyncStatus('syncing');
  try{
    const remote=await fetchSyncGist({token:syncConfig.token,gistId:syncConfig.gistId});
    const dirty=fingerprint(state)!==syncConfig.lastHash;
    if(dirty&&!confirm('本机有未同步的修改，将用云端进度覆盖。\n\n确定继续？会先自动下载本机备份。')){setSyncStatus('idle');return;}
    if(studied().length)downloadLocalBackup('同步下载前');
    applyRemoteState(remote);setSyncStatus('synced');toast('已从云端下载最新进度');
  }catch(error){syncError(error.message);}
  finally{syncRuntime.busy=false;}
}
async function autoSync(){
  if(!syncConfigured()||!syncConfig.auto||syncRuntime.busy||syncRuntime.conflict||!navigator.onLine)return;
  syncRuntime.busy=true;syncRuntime.error='';setSyncStatus('syncing');
  try{
    const remote=await fetchSyncGist({token:syncConfig.token,gistId:syncConfig.gistId});
    const dirty=fingerprint(state)!==syncConfig.lastHash;
    if(remote.updatedAt>syncConfig.lastRemoteAt){
      if(dirty){
        syncRuntime.busy=false;syncRuntime.conflict=remote;setSyncStatus('conflict');
        if(view!=='study'&&!document.hidden)openSyncConflict(remote);else toast('云端有更新；学完这组后到设置处理同步');
        return;
      }
      if(view==='study'||pendingSessions().length){syncRuntime.busy=false;setSyncStatus('idle');if(view!=='study')toast('云端有更新，学完当前组后可同步');return;}
      applyRemoteState(remote);syncRuntime.busy=false;setSyncStatus('synced');toast('已同步另一台设备的最新进度');
      return;
    }
    if(dirty){syncRuntime.busy=false;await pushSync({auto:true});return;}
    setSyncStatus('synced');
  }catch(error){syncError(error.message);}
  finally{syncRuntime.busy=false;}
}
function openSyncConflict(remote){
  syncRuntime.conflict=remote;setSyncStatus('conflict');
  const dialog=document.querySelector('#sync-conflict-dialog');
  if(!dialog)return;
  const from=remote.deviceName||'另一台设备';
  const when=remote.updatedAt?new Date(remote.updatedAt).toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}):'未知时间';
  dialog.innerHTML=`<div class="modal">
    <div class="modal-head"><span class="chip warn">同步冲突</span><button class="modal-close" data-action="sync-later" aria-label="关闭">${icon('x')}</button></div>
    <h2 class="form-title">两台设备都有新进度。</h2>
    <p class="form-sub">云端有来自 ${esc(from)} 的更新（${esc(when)}），本机也有未同步的修改。选择保留哪一份；选择“使用云端”前会先下载本机备份。</p>
    <div class="modal-actions">
      <button class="btn primary" data-action="sync-use-cloud">使用云端（先备份本机）</button>
      <button class="btn ghost" data-action="sync-keep-local">保留本机并上传</button>
      <button class="btn ghost" data-action="sync-later">稍后再说</button>
    </div>
  </div>`;
  if(!dialog.open)dialog.showModal();
}
async function resolveSyncConflict(choice){
  const dialog=document.querySelector('#sync-conflict-dialog');
  if(dialog?.open)dialog.close();
  const remote=syncRuntime.conflict;
  if(!remote){setSyncStatus('idle');return;}
  if(choice==='later'){setSyncStatus('conflict');return;}
  if(choice==='cloud'){
    downloadLocalBackup('同步冲突-使用云端前');
    try{applyRemoteState(remote);setSyncStatus('synced');toast('已使用云端进度');}
    catch(error){syncError(error.message);}
    return;
  }
  if(choice==='local'){
    syncRuntime.conflict=null;syncRuntime.busy=false;
    await pushSync({force:true});
    if(syncRuntime.status!=='error')toast('已保留本机并上传');
  }
}

/* ---------- theme ---------- */
const darkQuery=window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
function resolvedTheme(){
  const theme=state.settings.theme||'auto';
  if(theme==='light'||theme==='dark')return theme;
  return darkQuery?.matches?'dark':'light';
}
function applyTheme(){
  const theme=resolvedTheme();
  document.documentElement.dataset.theme=theme;
  const meta=document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if(meta)meta.content=theme==='dark'?'black-translucent':'default';
  const color=document.querySelector('meta[name="theme-color"]');
  if(color)color.content=theme==='dark'?'#080b14':'#f5f4fa';
}
darkQuery?.addEventListener?.('change',()=>{
  if((state.settings.theme||'auto')==='auto'&&!['study'].includes(view)){applyTheme();render();}
});

/* ---------- boot migrations ---------- */
let readingImport=null,packImport=null;
if(!blocked&&state.version===1){
  try{backupBeforeMigration(localStorage,KEY,localStorage.getItem(KEY));}
  catch(error){blocked=true;}
}
if(!blocked){
  const preferencesChanged=migratePreferences(state);
  const scheduleChanged=migrateToV2(state);
  const settingsChanged=migrateSettings(state);
  readingImport=importReadingBatch(baseWords,state,readingBatch);
  packImport=importLearningPacks(baseWords,state,learningPacks);
  syncWords();
  if(preferencesChanged||scheduleChanged||settingsChanged||readingImport||packImport)save();
}else{
  syncWords();
}
applyTheme();

/* ---------- helpers ---------- */
function groupLabel(w){return w.custom?'做题新词':`Day ${String(w.day).padStart(2,'0')}`;}
function fmtDate(key){const [,m,d]=key.split('-').map(Number);return `${m} 月 ${d} 日`;}
function dueText(p){
  if(!p?.firstSeen)return '尚未学习';
  if(!p.card)return '';
  if(isLearningCard(p)){
    if(p.card.due<=Date.now())return '现在可巩固';
    return `${intervalLabel(p.card.due)}可巩固`;
  }
  const due=dueDayOf(p);
  if(!due)return '';
  if(due<=today())return '今天到期';
  if(due===addDays(today(),1))return '明天到期';
  return `${fmtDate(due)}到期`;
}
function statusOf(w,p=progress(w)){
  if(!p.firstSeen)return {label:'未学习',cls:'new'};
  if(isMastered(p))return {label:'已掌握',cls:'mastered'};
  if(p.card&&isLearningCard(p))return {label:'巩固中',cls:'learning'};
  if(p.card&&isDue(p))return {label:'待复习',cls:'due'};
  return {label:'学习中',cls:'learning'};
}
function definitionHtml(text){
  return esc(text).replace(/(^|[\s；;，,])((?:n|v|vt|vi|adj|adv|prep|conj|pron|num|art|int)\.)/g,'$1<span class="pos">$2</span>');
}
function greeting(){
  const h=new Date().getHours();
  if(h<5)return '夜深了';
  if(h<11)return '早上好';
  if(h<14)return '中午好';
  if(h<18)return '下午好';
  return '晚上好';
}
function weekdayLabel(offset){
  if(offset===0)return '今天';
  if(offset===1)return '明天';
  const names=['周日','周一','周二','周三','周四','周五','周六'];
  const d=new Date();
  d.setDate(d.getDate()+offset);
  return names[d.getDay()];
}
function forecastTip(data){
  const rest=data.slice(1);
  const max=rest.reduce((best,item)=>item.count>best.count?item:best,rest[0]||{count:0});
  if(!max.count)return '未来几天没有集中到期，按自己的节奏推进就好。';
  const index=data.indexOf(max);
  return `${weekdayLabel(index)}有 <b>${max.count}</b> 个到期，是接下来 6 天里的小高峰，可以提前留一点时间。`;
}
function ringHtml(percent,size=176,stroke=9){
  const r=(size-stroke*2)/2,c=2*Math.PI*r,id=`ring-${++ringSeq}`;
  const p=Math.max(0,Math.min(100,percent));
  return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--accent)"/><stop offset="1" stop-color="var(--teal)"/></linearGradient></defs>
    <circle class="ring-bg" cx="${size/2}" cy="${size/2}" r="${r}" stroke-width="${stroke}"/>
    <circle class="ring-fg" cx="${size/2}" cy="${size/2}" r="${r}" stroke="url(#${id})" stroke-width="${stroke}" stroke-dasharray="${c}" stroke-dashoffset="${c*(1-p/100)}"/>
  </svg>`;
}
function pendingSessions(){
  return ['review','learn','mistakes','spell'].map(mode=>{
    const q=getSession(state,mode);
    if(!q||q.index>=q.queue.length)return null;
    return {mode,title:q.title,left:q.queue.length-q.index,index:q.index,total:q.queue.length};
  }).filter(Boolean);
}
function primaryAction(){
  const pendingReview=getSession(state,'review');
  if(pendingReview&&pendingReview.index<pendingReview.queue.length)return {mode:'review',label:'继续复习',count:pendingReview.queue.length-pendingReview.index};
  const plan=reviewPlan(words,state);
  if(plan.queue.length)return {mode:'review',label:'开始复习',count:plan.queue.length};
  const pendingLearn=getSession(state,'learn');
  if(pendingLearn&&pendingLearn.index<pendingLearn.queue.length)return {mode:'learn',label:'继续新词',count:pendingLearn.queue.length-pendingLearn.index};
  const pool=newWords(words,state);
  if(pool.length)return {mode:'learn',label:'学习新词',count:Math.min(20,pool.length)};
  const pendingMistakes=getSession(state,'mistakes');
  if(pendingMistakes&&pendingMistakes.index<pendingMistakes.queue.length)return {mode:'mistakes',label:'继续错词',count:pendingMistakes.queue.length-pendingMistakes.index};
  const weak=weakWords(words,state);
  if(weak.length)return {mode:'mistakes',label:'巩固错词',count:Math.min(20,weak.length)};
  const spell=spellingWords(words,state);
  if(spell.length)return {mode:'spell',label:'拼写练习',count:Math.min(20,spell.length)};
  return null;
}
function navigate(next,opts={}){
  lastAnswerUndo=null;
  pronunciation.stop();
  view=next;
  feedback=null;
  revealed=false;
  page=1;
  if(next==='library'||next==='mistakes'){
    query=opts.query??'';
    dayFilter=opts.dayFilter||'all';
    filter=opts.filter||(next==='mistakes'?'weak':'all');
  }
  render();
  window.scrollTo({top:0,behavior:'auto'});
}

/* ---------- shell ---------- */
function topbar(){
  const theme=resolvedTheme();
  const navItems=[['home','今日',ICONS.home],['library','词库',ICONS.book],['mistakes','生词本',ICONS.layers],['stats','数据',ICONS.chart],['settings','设置',ICONS.settings]];
  return `<header class="topbar">
    <a class="brand" href="#home" data-view="home" aria-label="词间首页">
      <span class="logo">词</span>
      <span class="brand-text"><b>词间</b><small>WORD FLOW</small></span>
    </a>
    <nav class="mainnav" aria-label="主导航">
      ${navItems.map(([key,label])=>`<button data-view="${key}" class="${view===key?'active':''}">${icon(key)}${label}</button>`).join('')}
    </nav>
    <div class="top-actions">
      <span class="streak-pill" title="连续学习天数">${icon('flame')}${streak()}</span>
      <button class="btn-new" data-action="add-word" title="添加做题新词 (N)" aria-label="添加做题新词">${icon('plus')}<span>新词</span></button>
      <button class="icon-btn" data-action="toggle-theme" title="切换主题" aria-label="切换主题">${icon(theme==='dark'?'sun':'moon')}</button>
      <button class="avatar" data-view="settings" title="学习设置" aria-label="学习设置">我</button>
    </div>
  </header>`;
}
function mobileNav(){
  const items=[['home','今日','home'],['library','词库','book'],['mistakes','生词本','layers'],['stats','数据','chart'],['settings','设置','settings']];
  return `<nav class="mobile-nav" aria-label="移动导航">${items.map(([key,label,ic])=>`<button data-view="${key}" class="${view===key?'active':''}">${icon(ic)}${label}</button>`).join('')}</nav>`;
}
function footer(){
  return `<footer class="site-foot"><span>词间 · 默认本机保存 · 可选私有 Gist 同步</span><span>词库来源：烤鸭TV / Zoey 老师 · 个人学习使用</span></footer>`;
}
function render(){
  clearWaitTimer();
  applyTheme();
  if(blocked&&!['library','mistakes','stats','settings'].includes(view))view='home';
  if(view==='study'){renderStudy();return;}
  const content={home:renderHome,library:renderLibrary,mistakes:renderLibrary,stats:renderStats,settings:renderSettings}[view]||renderHome;
  app.innerHTML=`<div class="shell">${topbar()}${blocked?banner():''}<main class="container">${content()}</main>${footer()}</div>${mobileNav()}`;
  if(view==='library'||view==='mistakes')renderRows();
}

/* ---------- home ---------- */
function renderHome(){
  const due=dueWords(words,state);
  const plan=reviewPlan(words,state);
  const pool=newWords(words,state);
  const newDone=newWordsLearnedToday(words,state);
  const reviewed=new Set(state.logs[today()]?.reviewedIds||[]);
  const weak=weakWords(words,state);
  const leeches=leechWords(words,state);
  const spell=spellingWords(words,state);
  const forecast=forecastDue(words,state,7);
  const newCap=dailyNew(),reviewCap=dailyReview();
  const reviewTarget=reviewCap>0?Math.min(reviewCap,reviewed.size+due.length):reviewed.size+due.length;
  const newTarget=newCap>0?Math.min(newCap,newDone+pool.length):(newDone+pool.length);
  const totalTarget=reviewTarget+newTarget;
  const done=Math.min(reviewed.size+newDone,totalTarget);
  const percent=totalTarget?Math.round(done/totalTarget*100):100;
  const newRemaining=Math.max(0,newTarget-newDone);
  const pendingReview=getSession(state,'review');
  const canResumeReview=!!pendingReview&&pendingReview.index<pendingReview.queue.length;
  const action=primaryAction();
  const pendings=pendingSessions();

  let headline='今天的任务，完成了。';
  if(action){
    if(action.mode==='review')headline=due.length>20?'先把记忆的旧账，还清一点。':'先温习旧词，再认识新词。';
    else if(action.mode==='learn')headline='今天，认识几个新词。';
    else if(action.mode==='mistakes')headline='把容易忘的，再看一眼。';
    else headline='把记住的词，写出来。';
  }
  const newPart=`<b>${Math.min(newRemaining,pool.length)}</b> 个新词`;
  const capNote=reviewCap>0&&plan.backlog>0?(plan.capReached?` 今天的复习额度已完成，还有 ${plan.backlog} 个到期词会留在明天。`:` 今天先复习 ${reviewCap} 个，其余 ${plan.backlog} 个会留在明天。`):'';
  let sub;
  if(plan.capReached&&due.length)sub=`今天的复习额度已完成，还有 <b>${due.length}</b> 个到期词留到明天。${pool.length?`再认识 ${newPart}。`:''}`;
  else if(due.length&&pool.length)sub=`复习 <b>${due.length}</b> 个到期词，再认识 ${newPart}。${capNote}`;
  else if(due.length)sub=`今天有 <b>${due.length}</b> 个到期词，先把它们过一遍。${capNote}`;
  else if(pool.length)sub=`今天没有到期复习。新词额度 ${newPart}，慢慢来。`;
  else sub='今天的任务已经清空，想多练可以去生词本看看。';

  return `<section class="hero">
    <div class="hero-grid">
      <div>
        <p class="eyebrow">${greeting()} · ${new Date().toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long'})}</p>
        <h1>${headline}</h1>
        <p class="lede">${sub}</p>
        <div class="hero-actions">
          ${action?`<button class="btn primary" data-action="start" data-mode="${action.mode}">${action.label} · ${action.count} 词 ${icon('arrowRight')}</button>`:`<button class="btn primary" disabled>今天已完成 ${icon('check')}</button>`}
          <button class="btn ghost" data-action="add-word">${icon('plus')} 录入做题新词</button>
        </div>
        ${pendings.length?`<div class="resume-row">${pendings.map(p=>`<button class="resume-chip" data-action="resume-mode" data-mode="${p.mode}"><b>${esc(p.title)}</b><span>${p.index + 1} / ${p.total}</span><span class="go">${icon('arrowRight')}</span></button>`).join('')}</div>`:''}
      </div>
      <div class="ring-wrap" aria-label="今日完成 ${percent}%">
        ${ringHtml(percent)}
        <div class="ring-center"><div class="ring-value">${percent}<small>%</small></div><div class="ring-label">今日完成</div><div class="ring-sub">${done} / ${totalTarget} 词</div></div>
      </div>
    </div>
    <div class="hero-foot">
      <div><b>${mastered().length}</b><span>已经掌握</span></div>
      <div><b>${studied().length}</b><span>学过的词</span></div>
      <div><b>${streak()}</b><span>连续天数</span></div>
      <div><b>${(state.customWords||[]).length}</b><span>做题新词</span></div>
    </div>
  </section>
  <section class="tasks">
    ${taskCard('review','到期复习','clock',due.length,'个待复习',(due.length||reviewed.size)?`今日已复习 ${reviewed.size} / ${reviewCap||'不限'}`:'今天没有到期词',pct(reviewed.size,reviewTarget),(due.length>0&&!plan.capReached)||canResumeReview,'review',plan.capReached?'今日额度已用完':(canResumeReview?'继续复习':(due.length?'开始复习':'暂无任务')))}
    ${taskCard('new','新词学习','spark',Math.min(pool.length,newRemaining||pool.length),'个可学',newTarget?`今日已学 ${newDone} / ${newTarget}`:'词库里的新词已学完',pct(newDone,newTarget),pool.length>0,'learn',pool.length?'开始新词':'词库已学完')}
    ${taskCard('weak','生词巩固','layers',weak.length,'个薄弱词',`${leeches.length} 个顽固词反复遗忘`,0,weak.length>0,'mistakes',weak.length?'巩固错词':'暂无错词')}
    ${taskCard('spell','拼写练习','keyboard',spell.length,'个待拼写','把认识的词写出来',0,spell.length>0,'spell',spell.length?'开始拼写':'暂无任务')}
  </section>
  ${reviewCap>0&&plan.backlog>0?`<p class="task-note">按每日 ${reviewCap} 个的复习上限，今天还有 <b>${plan.backlog}</b> 个到期词排在后面。可在设置里调整上限，或明天继续。</p>`:''}
  <div class="columns">
    <section class="panel">
      <div class="section-head"><div><h2>未来 7 天</h2><div class="sub">按当前 FSRS 排期，提前知道高峰</div></div><span class="chip">${due.length} 个待复习</span></div>
      ${forecastHtml(forecast,7)}
      <p class="forecast-tip">${forecastTip(forecast)}</p>
      <div class="forecast-total"><span>7 天合计 <b>${forecast.reduce((n,item)=>n+item.count,0)}</b></span><span>今天已复习 <b>${reviewed.size}</b></span></div>
    </section>
    <section class="panel">
      <div class="section-head"><div><h2>做题新词</h2><div class="sub">每天从题目里捡回来的词</div></div><button class="text-btn" data-action="go-custom">全部 →</button></div>
      ${recentWordsHtml()}
    </section>
  </div>`;
}
function taskCard(kind,title,ic,num,unit,sub,percent,enabled,mode,cta){
  return `<button class="task t-${kind} ${enabled?'':'off'}" data-action="start" data-mode="${mode}" ${enabled?'':'disabled'}>
    <span class="task-top"><span class="task-icon">${icon(ic)}</span><span class="task-title">${title}</span></span>
    <span class="task-count"><b>${num}</b><span>${unit}</span></span>
    <span class="task-sub">${sub}</span>
    <span class="task-bar"><i style="width:${percent}%"></i></span>
    <span class="task-go"><span>${cta}</span>${icon('arrowRight')}</span>
  </button>`;
}
function forecastHtml(data,days){
  const total=data.reduce((n,item)=>n+item.count,0);
  if(!total)return `<div class="forecast-empty"><span class="chip good">未来 ${days} 天暂无到期</span><p>按当前 FSRS 排期，这段时间可以轻松一点。</p></div>`;
  const max=Math.max(1,...data.map(item=>item.count));
  return `<div class="forecast">${data.map((item,index)=>`<div class="fc ${index===0?'today':''}" title="${item.day} · ${item.count} 个到期">
    <b>${item.count}</b>
    <div class="fc-bar-wrap"><div class="fc-bar" style="height:${Math.max(2,item.count/max*100)}%"></div></div>
    <small>${weekdayLabel(index)}</small>
  </div>`).join('')}</div>`;
}
function recentWordsHtml(){
  const list=(state.customWords||[]).filter(w=>w.addedOn<=today()).slice().sort((a,b)=>(b.addedOn||'').localeCompare(a.addedOn||'')||b.id-a.id).slice(0,5);
  if(!list.length)return `<div class="recent-empty">还没有做题新词。<br>遇到不会的词，点右上角「新词」或按 <kbd>N</kbd> 记下来。</div>`;
  return `<div class="recent-list">${list.map(w=>{
    const s=statusOf(w);
    return `<button class="recent" data-action="detail" data-id="${w.id}">
      <span class="recent-main"><b>${esc(w.word)}</b><small>${esc(w.definition)}</small></span>
      <span class="chip ${s.cls==='new'?'':s.cls}">${s.label}</span>
    </button>`;
  }).join('')}</div>`;
}

/* ---------- library ---------- */
function filterOptions(){
  if(view==='mistakes')return [['weak','待巩固'],['leech','顽固词'],['favorite','收藏']];
  return [['all','全部'],['unseen','未学'],['learning','学习中'],['mastered','已掌握'],['custom','做题新词'],['high','原表高频'],['favorite','收藏']];
}
function getFiltered(){
  let list=words;
  if(view==='mistakes'){
    if(filter==='favorite')list=words.filter(w=>progress(w).favorite);
    else if(filter==='leech')list=leechWords(words,state);
    else list=weakWords(words,state);
  }else if(filter==='custom')list=list.filter(w=>w.custom).sort((a,b)=>(b.addedOn||'').localeCompare(a.addedOn||'')||b.id-a.id);
  else if(filter==='unseen')list=list.filter(w=>!progress(w).firstSeen);
  else if(filter==='mastered')list=list.filter(w=>isMastered(progress(w)));
  else if(filter==='learning')list=list.filter(w=>progress(w).firstSeen&&!isMastered(progress(w)));
  else if(filter==='favorite')list=list.filter(w=>progress(w).favorite);
  else if(filter==='high')list=list.filter(w=>w.highFrequency);
  if(dayFilter!=='all')list=list.filter(w=>String(w.day)===String(dayFilter));
  if(query.trim()){
    const q=query.trim().toLowerCase();
    list=list.filter(w=>w.word.toLowerCase().includes(q)||w.definition.includes(q)||(w.collocations||'').toLowerCase().includes(q)||(w.mnemonic||'').toLowerCase().includes(q)||(progress(w).note||'').toLowerCase().includes(q));
  }
  return list;
}
function renderLibrary(){
  const mistakes=view==='mistakes';
  const total=words.length;
  return `<div class="page-head">
    <div>
      <p class="eyebrow">${mistakes?'A SECOND LOOK':'YOUR WORD COLLECTION'}</p>
      <h1>${mistakes?'再见面，会更熟悉。':'每个词，都有迹可循。'}</h1>
      <p>${mistakes?'容易忘记的词、反复错的词，都收在这里。':`${baseWords.length} 个核心词 · ${(state.customWords||[]).length} 个做题新词 · 共 ${total} 词`}</p>
    </div>
    <div class="head-actions">
      ${mistakes?`<button class="btn ghost" data-action="practice-list">练习当前列表 ${icon('arrowRight')}</button>`:`<button class="btn ghost" data-action="start" data-mode="spell" ${spellingWords(words,state).length?'':'disabled'}>拼写练习 ${icon('arrowRight')}</button>`}
    </div>
  </div>
  <div class="lib-toolbar">
    <label class="search-box">${icon('search')}<input id="search" placeholder="搜索单词、释义或搭配" value="${esc(query)}" aria-label="搜索词库" autocomplete="off" spellcheck="false"></label>
    <select id="day-filter" aria-label="按天筛选">
      <option value="all">全部分组</option>
      <option value="0" ${dayFilter==='0'?'selected':''}>做题新词</option>
      ${Array.from({length:14},(_,i)=>`<option value="${i+1}" ${String(i+1)===String(dayFilter)?'selected':''}>Day ${i+1}</option>`).join('')}
    </select>
    <button class="icon-btn" data-action="${mistakes?'practice-list':'start'}" ${mistakes?'':'data-mode="spell"'} title="直接开始练习" aria-label="直接开始练习">${icon('spark')}</button>
  </div>
  <div class="chip-row">${filterOptions().map(([key,label])=>`<button class="chip-btn ${filter===key?'active':''}" data-action="tab" data-filter="${key}">${label}</button>`).join('')}</div>
  <div id="library-results"></div>`;
}
function renderRows(){
  const container=document.querySelector('#library-results');
  if(!container)return;
  const list=getFiltered();
  const max=Math.max(1,Math.ceil(list.length/30));
  page=Math.min(page,max);
  const slice=list.slice((page-1)*30,page*30);
  if(!slice.length){
    container.innerHTML=`<div class="empty"><span class="wait-icon" style="margin-bottom:0">${icon('search')}</span><h3>${query?'没有找到这个线索':'这里还很清爽'}</h3><p>${query?'换一个英文或中文关键词试试。':'答错的词会自动收进生词本，也可以给想多看几遍的词点星收藏。'}</p></div>`;
    return;
  }
  container.innerHTML=`<div class="word-list">${slice.map(w=>{
    const p=progress(w),s=statusOf(w,p);
    return `<div class="word-row" data-action="detail" data-id="${w.id}" role="button" tabindex="0" aria-label="查看 ${esc(w.word)}">
      <div class="row-word"><span class="row-en">${esc(w.word)}</span><span class="row-ph">${esc(w.phonetic||'—')} · ${groupLabel(w)}</span></div>
      <div class="row-def">${esc(w.definition)}</div>
      <div class="row-meta"><span class="status ${s.cls}">${s.label}</span><span class="row-due">${esc(dueText(p))}</span><button class="row-star ${p.favorite?'on':''}" data-action="favorite" data-id="${w.id}" aria-label="${p.favorite?'取消收藏':'收藏'}">${icon('star')}</button></div>
    </div>`;
  }).join('')}</div>
  <div class="pagination"><span class="lib-count">共 ${list.length} 个单词 · 点击查看搭配与笔记</span><div class="pages"><button class="btn ghost tiny" data-action="page" data-step="-1" ${page===1?'disabled':''}>上一页</button><span>${page} / ${max}</span><button class="btn ghost tiny" data-action="page" data-step="1" ${page===max?'disabled':''}>下一页</button></div></div>`;
}

/* ---------- detail dialog ---------- */
function detail(id){
  detailId=id;
  const w=byId.get(id);if(!w)return;
  const p=progress(w),s=statusOf(w,p),dialog=document.querySelector('#word-dialog');
  const card=p.card;
  const next=dueText(p)||'—';
  dialog.innerHTML=`<div class="modal">
    <div class="modal-head"><span class="chip ${s.cls==='new'?'':s.cls}">${groupLabel(w)} · ${s.label}</span><button class="modal-close" data-action="close-dialog" aria-label="关闭">${icon('x')}</button></div>
    <h2 class="modal-word">${esc(w.word)}</h2>
    <div class="phonetic">${esc(w.phonetic||'音标待补')}<button class="speaker" data-action="speak" data-id="${w.id}" aria-label="播放发音">${icon('volume')}</button></div>
    <div class="definition">${definitionHtml(w.definition)}</div>
    <div class="extras">
      ${w.mnemonic?`<div class="extra-box memory"><b>近义词 / 助记</b>${esc(w.mnemonic)}</div>`:''}
      ${w.collocations?`<div class="extra-box"><b>搭配 / 例句</b>${esc(w.collocations)}</div>`:''}
      ${p.note?`<div class="extra-box note"><b>我的笔记</b>${esc(p.note)}</div>`:''}
    </div>
    <div class="detail-stats">
      <div class="detail-stat"><span>下次复习</span><b>${esc(next)}</b></div>
      <div class="detail-stat"><span>记忆稳定度</span><b>${card&&card.stability?card.stability.toFixed(1)+' 天':'—'}</b></div>
      <div class="detail-stat"><span>难度</span><b>${card&&card.difficulty?Math.min(10,card.difficulty).toFixed(1):'—'}</b></div>
      <div class="detail-stat"><span>遗忘 / 模糊</span><b>${p.mistakes||0} / ${p.fuzzyCount||0}</b></div>
    </div>
    ${card?.estimated?'<p class="stats-foot" style="margin-top:10px">稳定度与难度来自旧版间隔的初始估计；首次真实作答后由 FSRS 逐步接管。</p>':''}
    <div class="note-field"><label for="word-note">我的记忆笔记</label><textarea id="word-note" maxlength="5000" placeholder="写联想、易混词或记忆提示…">${esc(p.note||'')}</textarea></div>
    <div class="modal-actions">
      <button class="btn primary" data-action="save-note">保存笔记</button>
      <button class="btn ghost" data-action="practice-word" data-id="${w.id}">${icon('target')} 单独练这个词</button>
      <button class="btn ghost" data-action="favorite" data-id="${w.id}">${icon('star')} ${p.favorite?'取消收藏':'收藏'}</button>
    </div>
  </div>`;
  if(!dialog.open)dialog.showModal();
}

/* ---------- study ---------- */
function clearWaitTimer(){if(waitTimer){clearInterval(waitTimer);waitTimer=null;}}
function modeLabel(mode){
  return {learn:'NEW WORDS',review:'FSRS REVIEW',mistakes:'WEAK WORDS',spell:'SPELLING',day:'PRACTICE'}[mode]||'STUDY';
}
function studyFrame(s,body,progressValue,note){
  return `<div class="study-view">
    <div class="study-top">
      <button class="icon-btn" data-view="home" aria-label="返回今日学习">${icon('arrowLeft')}</button>
      <div class="study-heading"><b>${esc(s.title)}</b><span>${modeLabel(s.mode)} · ${s.total} 词</span></div>
      <span class="study-count">${Math.min(s.index+1,s.queue.length)} / ${s.queue.length}</span>
      <button class="icon-btn" data-action="show-shortcuts" aria-label="键盘快捷键">${icon('keyboard')}</button>
    </div>
    <div class="study-bar"><i style="width:${progressValue}%"></i></div>
    ${body}
    ${note?`<p class="study-note">${note}</p>`:''}
  </div>`;
}
function renderStudy(){
  clearWaitTimer();
  applyTheme();
  const s=state.session;
  if(!s){navigate('home');return;}
  const progressValue=Math.round(s.index/Math.max(1,s.queue.length)*100);
  let body='',note='';
  if(s.index>=s.queue.length&&!feedback){
    body=summaryHtml(s);
  }else if(s.mode==='spell'){
    body=spellCard(s);
    note='Enter 检查拼写 · 作答后 Enter 继续 · 每次作答自动保存';
  }else{
    const cur=resolveCurrent(s);
    if(!cur){body=summaryHtml(s);}
    else if(cur.waiting){
      body=waitHtml(cur);
      startWaitCountdown(cur.until);
    }else{
      body=wordCard(s,cur.word,cur.p);
      note='Space 显示释义 · 1 / 2 / 3 选择 · P 播放发音 · N 添加新词';
    }
  }
  app.innerHTML=studyFrame(s,body,progressValue,note);
  if(s.mode==='spell'&&!feedback){
    requestAnimationFrame(()=>document.querySelector('#spell-answer')?.focus());
  }
}
function wordCard(s,w,p){
  const previews=previewRating(p,new Date(),retention());
  const isNew=!p.card;
  const stateChip=p.card?(isLearningCard(p)?'巩固中':isDue(p)?'待复习':'复习'):'新词';
  const answer=revealed?`<div class="answer">
    <div class="definition">${definitionHtml(w.definition)}</div>
    <div class="extras">
      ${w.mnemonic?`<div class="extra-box memory"><b>近义词 / 助记</b>${esc(w.mnemonic)}</div>`:''}
      ${w.collocations?`<div class="extra-box"><b>搭配 / 例句</b>${esc(w.collocations)}</div>`:''}
      ${p.note?`<div class="extra-box note"><b>我的笔记</b>${esc(p.note)}</div>`:''}
    </div>
    <div class="card-history"><span>忘记 <b>${p.mistakes||0}</b> 次</span><span>模糊 <b>${p.fuzzyCount||0}</b> 次</span><span>复习 <b>${p.card?.reps||0}</b> 次</span>${p.card&&p.card.estimated?'<span>迁移估计的初始间隔</span>':''}</div>
  </div>`:`<div class="reveal-zone">
    <button class="reveal-btn" data-action="reveal">回忆一下，显示释义</button>
    <span class="hint">按 <kbd>Space</kbd> 或点击显示</span>
  </div>`;
  return `<section class="study-card">
    <div class="card-meta">
      <span class="chip ${w.custom?'accent':''}">${groupLabel(w)}</span>
      ${w.highFrequency?'<span class="chip warn">原表高频</span>':''}
      <span class="chip">${stateChip}</span>
      <button class="star ${p.favorite?'on':''}" data-action="favorite" data-id="${w.id}" aria-label="${p.favorite?'取消收藏':'收藏'}">${icon('star')}</button>
    </div>
    <div class="word-block">
      <h1 class="word">${esc(w.word)}</h1>
      <div class="phonetic">${w.phonetic?esc(w.phonetic):'<span class="faint">音标待补</span>'}<button class="speaker" data-action="speak" data-id="${w.id}" aria-label="播放发音">${icon('volume')}</button></div>
      ${answer}
    </div>
    ${revealed?`<div class="ratings">
      <button class="rating again" data-action="rate" data-rating="1"><b>忘记了</b><small>${intervalLabel(previews.find(x=>x.rating===1)?.due)}</small><kbd>1</kbd></button>
      <button class="rating hard" data-action="rate" data-rating="2"><b>费力想起</b><small>${intervalLabel(previews.find(x=>x.rating===2)?.due)}</small><kbd>2</kbd></button>
      <button class="rating good" data-action="rate" data-rating="3"><b>记得</b><small>${intervalLabel(previews.find(x=>x.rating===3)?.due)}</small><kbd>3</kbd></button>
    </div>`:''}
    <div class="study-tools">${undoControl()}</div>
  </section>`;
}
function spellCard(s){
  const w=byId.get(feedback?feedback.id:s.queue[s.index]);
  const p=progress(w);
  if(!w)return '';
  const result=feedback?`<div class="spell-result">
    <div class="result-banner ${feedback.correct?'ok':'err'}">${feedback.correct?'✓ 拼写正确，记忆很牢。':'还差一点，再记一次。'}</div>
    <div class="spell-answer">${feedback.correct?esc(w.word):spellingDiff(feedback.answer,w.word)}</div>
    ${feedback.correct?'':`<div class="spell-attempt">你的拼写：${esc(feedback.answer||'（未填写）')}</div>`}
    <div class="phonetic" style="justify-content:center">${esc(w.phonetic||'')}<button class="speaker" data-action="speak" data-id="${w.id}" aria-label="播放发音">${icon('volume')}</button></div>
    <div class="modal-actions" style="justify-content:center"><button class="btn primary" data-action="next">继续 ${icon('arrowRight')}</button></div>
  </div>`:`<form id="spell-form" class="spell-form">
    <input id="spell-answer" class="spell-input" placeholder="输入英文单词" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="输入英文单词" required>
    <button class="btn primary" type="submit">检查</button>
  </form>
  <div style="text-align:center;margin-top:16px"><button class="text-btn" data-action="skip-spell">想不起来，查看答案</button></div>`;
  return `<section class="study-card spell-card">
    <div class="card-meta"><span class="chip">拼写练习</span><span class="chip ${isMastered(p)?'good':''}">${statusOf(w,p).label}</span><button class="star ${p.favorite?'on':''}" data-action="favorite" data-id="${w.id}" aria-label="收藏">${icon('star')}</button></div>
    <div class="spell-prompt"><p class="eyebrow">WRITE THE WORD</p><div class="definition">${definitionHtml(w.definition)}</div><p class="hint">${feedback?'':'根据释义，把这个词完整写出来'}</p></div>
    ${result}
    <div class="study-tools">${undoControl()}</div>
  </section>`;
}
function waitHtml(cur){
  const until=cur.until?new Date(cur.until):null;
  const left=until?Math.max(0,until-Date.now()):0;
  return `<section class="study-card wait-card">
    <div class="wait-icon">${icon('clock')}</div>
    <p class="eyebrow">SHORT-TERM CONSOLIDATION</p>
    <h2 style="font-size:24px;font-weight:800;letter-spacing:-.03em;margin-top:10px">记忆正在沉淀</h2>
    <div class="countdown" id="wait-count">${fmtDuration(left)}</div>
    <p class="lede">还有 ${cur.count} 个词需要隔一小段时间再回忆一次，才会进入长期复习。这一小段等待，本身就是记忆的一部分。</p>
    <div class="wait-actions">
      <button class="btn primary" data-action="recheck">刷新一下</button>
      <button class="btn ghost" data-action="learn-while-waiting">先学新词</button>
      <button class="btn ghost" data-view="home">回首页</button>
    </div>
  </section>`;
}
function fmtDuration(ms){
  const total=Math.max(0,Math.round(ms/1000));
  const m=Math.floor(total/60),s=total%60;
  if(m>=60)return `${Math.floor(m/60)}:${String(m%60).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
function startWaitCountdown(until){
  clearWaitTimer();
  if(!until)return;
  waitTimer=setInterval(()=>{
    const left=until-Date.now();
    const el=document.querySelector('#wait-count');
    if(!el){clearWaitTimer();return;}
    if(left<=0){clearWaitTimer();renderStudy();return;}
    el.textContent=fmtDuration(left);
  },1000);
}
function summaryHtml(s){
  const accuracy=s.index?Math.round(s.correct/s.index*100):0;
  const next=nextAction(s);
  const plan=reviewPlan(words,state);
  return `<section class="study-card">
    <div class="summary">
      <div class="summary-check">${icon('check')}</div>
      <p class="eyebrow">ONE SMALL STEP, WELL DONE</p>
      <h2>这一组，积累完成。</h2>
      <p>熟悉的词会晚些再见，模糊的词会继续陪你练习。今天的每一次回忆，都已经记下。</p>
      <div class="summary-stats">
        <div><b>${s.total}</b><span>本组单词</span></div>
        <div><b>${s.index}</b><span>回忆次数</span></div>
        <div><b>${accuracy}%</b><span>认识比例</span></div>
      </div>
      ${s.mode==='review'&&plan.capReached&&plan.due>0?`<p style="margin-top:18px">今日复习额度已用完，还有 ${plan.due} 个到期词会留在明天。可在设置里调整上限。</p>`:''}
      <div class="summary-actions">
        ${next?`<button class="btn primary" data-action="next-group" data-mode="${next.mode}">${next.label} ${icon('arrowRight')}</button>`:`<button class="btn primary" data-view="home">回到今日学习</button>`}
        ${next?'<button class="btn ghost" data-view="home">回首页</button>':''}
        ${undoControl()}
      </div>
    </div>
  </section>`;
}
function nextAction(s){
  if(s.mode==='review'){
    const plan=reviewPlan(words,state);
    if(!plan.capReached&&plan.queue.length)return {mode:'review',label:`再复习一组 · ${plan.queue.length}`};
    const pool=newWords(words,state);
    if(pool.length)return {mode:'learn',label:plan.capReached?'复习额度完成，去学新词':'旧词复习完成，去学新词'};
    const weak=weakWords(words,state);
    if(weak.length)return {mode:'mistakes',label:`去巩固错词 · ${Math.min(20,weak.length)}`};
    return null;
  }
  if(s.mode==='learn'){
    const pool=newWords(words,state);
    if(pool.length)return {mode:'learn',label:`再学一组新词 · ${Math.min(20,pool.length)}`};
    const plan=reviewPlan(words,state);
    if(plan.queue.length)return {mode:'review',label:'去复习到期词'};
    const weak=weakWords(words,state);
    if(weak.length)return {mode:'mistakes',label:`去巩固错词 · ${Math.min(20,weak.length)}`};
    return null;
  }
  if(s.mode==='mistakes'){
    const weak=weakWords(words,state);
    if(weak.length)return {mode:'mistakes',label:`再巩固一组 · ${Math.min(20,weak.length)}`};
    return null;
  }
  if(s.mode==='spell'){
    const spell=spellingWords(words,state);
    if(spell.length)return {mode:'spell',label:`再拼一组 · ${Math.min(20,spell.length)}`};
    return null;
  }
  return null;
}
function undoControl(){
  return `<button class="undo-btn" data-action="undo-answer" ${lastAnswerUndo&&!lastAnswerUndo.used?'':'disabled'}>${icon('undo')} 撤销上一次选择</button>`;
}

/* ---------- session flow ---------- */
function practiceList(){
  if(blocked){toast('请先刷新或恢复有效备份。');return;}
  const list=getFiltered();
  if(!list.length){toast('当前列表里没有可以练习的词。');return;}
  const labels={weak:'待巩固错词',leech:'顽固词专练',favorite:'收藏专练'};
  const pool=list.slice(0,20);
  state.session={mode:'day',title:labels[filter]||'专项练习',queue:pool.map(w=>w.id),index:0,total:pool.length,correct:0,date:today(),retries:{}};
  save();navigate('study');autoSpeak();
}
function start(mode,day){
  if(blocked){toast('请先刷新或恢复有效备份。');return;}
  rememberSession(state);
  const pending=getSession(state,mode);
  if(pending&&pending.index<pending.queue.length){resumeMode(mode);return;}
  touchLog();
  let pool,title;
  switch(mode){
    case 'learn':pool=newWords(words,state);title='新词学习';break;
    case 'review':{const plan=reviewPlan(words,state);pool=plan.queue;title='到期复习';break;}
    case 'mistakes':pool=weakWords(words,state);title='错词巩固';break;
    case 'spell':pool=spellingWords(words,state);title='拼写练习';break;
    case 'day':pool=words.filter(w=>w.day===day);title=`Day ${day} 练习`;break;
  }
  if(!pool||!pool.length){
    if(mode==='review'&&reviewPlan(words,state).capReached)toast(`今日复习已达 ${dailyReview()} 个上限，可在设置中调整。`);
    else if(mode==='spell')toast('今天的已学词都拼写过了。');
    else toast('当前没有需要练习的单词。');
    return;
  }
  const selected=pool.slice(0,20);
  state.session={mode,title,queue:selected.map(w=>w.id),index:0,total:selected.length,correct:0,date:today(),retries:{}};
  save();
  navigate('study');
  autoSpeak();
}
function resumeMode(mode){
  if(blocked){toast('请刷新后继续，确保读取最新进度。');return;}
  rememberSession(state);
  const q=getSession(state,mode);
  if(!q||q.index>=q.queue.length){start(mode);return;}
  state.session=q;
  save();
  navigate('study');
  autoSpeak();
}
function autoSpeak(){
  if(!state.settings.autoSpeak||state.session?.mode==='spell'||view!=='study')return;
  const s=state.session,j=nextAnswerIndex(s,state.progress);
  if(j>=0){const w=byId.get(s.queue[j]);if(w)speak(w.word);}
}
function learnWhileWaiting(){
  if(blocked)return;
  rememberSession(state);
  const q=getSession(state,'learn');
  if(!q||q.index>=q.queue.length){start('learn');return;}
  const existing=new Set(q.queue);
  const added=newWords(words,state).filter(w=>!existing.has(w.id)).slice(0,20);
  if(added.length){q.queue.push(...added.map(w=>w.id));q.total+=added.length;}
  else if(nextAnswerIndex(q,state.progress)<0){toast('没有其他新词，稍后再继续巩固。');return;}
  state.session=q;
  save();
  navigate('study');
  autoSpeak();
}
function resolveCurrent(s){
  if(s.index>=s.queue.length)return null;
  if(s.mode==='spell'){const w=byId.get(s.queue[s.index]);return {word:w,p:progress(w),waiting:false};}
  const j=nextAnswerIndex(s,state.progress);
  if(j<0)return {waiting:true,until:nextConsolidation(s,state.progress),count:s.queue.length-s.index};
  if(j!==s.index){const [id]=s.queue.splice(j,1);s.queue.splice(s.index,0,id);}
  const w=byId.get(s.queue[s.index]);
  return {word:w,p:progress(w),waiting:false};
}
function spellingDiff(actual,expected){
  const a=normalizeAnswer(actual),b=normalizeAnswer(expected);
  let start=0,end=0;
  while(start<Math.min(a.length,b.length)&&a[start]===b[start])start++;
  while(end<Math.min(a.length,b.length)-start&&a[a.length-1-end]===b[b.length-1-end])end++;
  const tail=end?b.slice(-end):'';
  return esc(b.slice(0,start))+'<mark>'+esc(b.slice(start,b.length-end)||'·')+'</mark>'+(tail?`<span class="tail">${esc(tail)}</span>`:'');
}
function answer(rating,typed){
  if(blocked)return;
  pronunciation.stop();
  const s=state.session;
  if(!s||s.index>=s.queue.length)return;
  const id=s.queue[s.index],now=new Date();
  lastAnswerUndo=captureAnswerUndo(state,today(),rating);
  const log=touchLog();
  if(s.mode==='spell'){
    log.answers++;log.spelledIds||=[];
    if(!log.spelledIds.includes(id))log.spelledIds.push(id);
    log.spelling++;
    if(rating===3){log.spellingCorrect++;s.correct++;}
    if(!log.ids.includes(id))log.ids.push(id);
    feedback={id,answer:typed||'（未填写）',correct:rating===3};
    advanceQueue(s,rating<3);
    lastAnswerUndo.repeated=rating<3;
  }else{
    const newP=rateWord(state.progress[id],rating,now,s.mode,{retention:retention()});
    state.progress[id]=newP;
    log.answers++;
    if(rating>=2){log.correct++;s.correct++;}
    if(!log.ids.includes(id))log.ids.push(id);
    if(s.mode==='review'&&rating>=2){log.reviewedIds||=[];if(!log.reviewedIds.includes(id))log.reviewedIds.push(id);}
    const repeat=isLearningCard(newP);
    advanceQueue(s,repeat);
    lastAnswerUndo.repeated=repeat;
  }
  revealed=false;
  save();
  renderStudy();
  if(s.mode!=='spell')autoSpeak();
  window.scrollTo({top:0,behavior:'smooth'});
}
function undoLastAnswer(){
  if(blocked)return;
  if(!undoAnswer(state,lastAnswerUndo)){toast('当前没有可撤销的选择');return;}
  pronunciation.stop();
  lastAnswerUndo=null;
  feedback=null;
  revealed=true;
  save();
  renderStudy();
  autoSpeak();
  toast('已撤销，请重新选择');
}

/* ---------- stats ---------- */
function metric(label,value,unit,caption){
  return `<div class="metric"><div class="metric-label">${label}<span>◦</span></div><div class="metric-value">${value}<small>${unit}</small></div><div class="metric-caption">${caption}</div></div>`;
}
function renderStats(){
  const logs=Object.values(state.logs||{});
  const answers=logs.reduce((n,l)=>n+(l.answers||0),0);
  const spelling=logs.reduce((n,l)=>n+(l.spelling||0),0);
  const spellingCorrect=logs.reduce((n,l)=>n+(l.spellingCorrect||0),0);
  const retentionData=retentionStats(state,30);
  const forecast=forecastDue(words,state,7);
  const masteredCount=mastered().length,studiedCount=studied().length;
  const learningCount=Math.max(0,studiedCount-masteredCount);
  const unseenCount=Math.max(0,words.length-studiedCount);
  const rate=retentionData.rate==null?null:Math.round(retentionData.rate*100);
  return `<div class="page-head">
    <div>
      <p class="eyebrow">EVERY DAY COUNTS</p>
      <h1>看见自己的积累。</h1>
      <p>记住需要时间，来过的每一天都算数。</p>
    </div>
    <div class="head-actions"><button class="btn ghost" data-action="export">${icon('download')} 导出备份</button></div>
  </div>
  <div class="metrics">
    ${metric('累计学习',studiedCount,'词',`共 ${words.length} 个词`)}
    ${metric('已经掌握',masteredCount,'词','至少 3 次跨天成功回忆')}
    ${metric('连续学习',streak(),'天',`今日作答 ${state.logs[today()]?.answers||0} 次`)}
    ${metric('拼写正确率',spelling?Math.round(spellingCorrect/spelling*100):'—',spelling?'%':'',`共 ${spelling} 次拼写`)}
  </div>
  <div class="stats-grid">
    <section class="panel">
      <div class="section-head"><div><h2>学习热力图</h2><div class="sub">最近 24 周，每格代表一天</div></div><span class="chip">${logs.filter(l=>l.answers>0).length} 天有记录</span></div>
      <div class="heatmap-scroll">${heatmapHtml()}</div>
      <div class="heat-legend">少 <span class="heat"></span><span class="heat l1"></span><span class="heat l2"></span><span class="heat l3"></span><span class="heat l4"></span> 多</div>
    </section>
    <section class="panel">
      <div class="section-head"><div><h2>掌握分布</h2><div class="sub">${pct(masteredCount,words.length)}% 的词已经稳固</div></div></div>
      <div class="mastery-bar"><i class="m" style="width:${pct(masteredCount,words.length)}%"></i><i class="l" style="width:${pct(learningCount,words.length)}%"></i></div>
      <div class="mastery-legend">
        <div><span class="dot m"></span>已掌握 <b>${masteredCount}</b></div>
        <div><span class="dot l"></span>学习中 <b>${learningCount}</b></div>
        <div><span class="dot n"></span>未学习 <b>${unseenCount}</b></div>
      </div>
      <div class="stats-foot">“已掌握”按跨天成功回忆至少三次统计，同一天重复作答不会增加。FSRS 的实际间隔会继续增长。</div>
    </section>
    <section class="panel">
      <div class="section-head"><div><h2>近 30 天回忆质量</h2><div class="sub">来自你的真实作答</div></div></div>
      <div class="retention">
        <div class="ring-wrap">${ringHtml(rate??0,130,8)}<div class="ring-center"><div class="ring-value">${rate==null?'—':rate}<small>${rate==null?'':'%'}</small></div></div></div>
        <div class="retention-copy">
          <b>${rate==null?'还没有足够记录':'记得的比例'}</b>
          共 ${retentionData.attempts} 次作答：记得 ${retentionData.good} · 费力 ${retentionData.hard} · 忘记 ${retentionData.again}。<br>
          目标保留率 ${Math.round(retention()*100)}%，这是调度目标，不是保证。${retentionData.attempts?'':'<br><span class="faint">升级后开始记录每次评分；旧版汇总记录没有逐次评分，不会在这里伪造。</span>'}
        </div>
      </div>
    </section>
    <section class="panel">
      <div class="section-head"><div><h2>未来 7 天复习量</h2><div class="sub">提前安排时间，避免堆积</div></div></div>
      ${forecastHtml(forecast,7)}
      <p class="forecast-tip">${forecastTip(forecast)}</p>
      <div class="stats-foot">复习量只统计已进入 FSRS 复习阶段的词；当天短时巩固的词会在到点后出现。</div>
    </section>
  </div>`;
}
function heatmapHtml(){
  const now=new Date();now.setHours(12,0,0,0);
  const mondayOffset=(now.getDay()+6)%7;
  const start=new Date(now);start.setDate(start.getDate()-mondayOffset-23*7);
  const todayStr=dayKey();
  let cells='';
  for(let i=0;i<24*7;i++){
    const d=new Date(start);d.setDate(start.getDate()+i);
    const key=dayKey(d);
    const log=state.logs[key];
    const n=log?.answers||0;
    const level=n===0?0:n<30?1:n<80?2:n<150?3:4;
    const future=key>todayStr;
    const title=`${key} · ${n} 次作答${log?.ids?` · ${log.ids.length} 个词`:''}`;
    cells+=`<span class="heat ${future?'future':''} l${level}" title="${title}"></span>`;
  }
  return `<div class="heatmap">${cells}</div>`;
}

/* ---------- settings ---------- */
function renderSettings(){
  const theme=state.settings.theme||'auto';
  const newValue=dailyNew(),reviewValue=dailyReview();
  const options=(list,value)=>list.map(([v,t])=>`<option value="${v}" ${String(value)===String(v)?'selected':''}>${t}</option>`).join('');
  return `<div class="page-head">
    <div><p class="eyebrow">MAKE IT YOUR OWN</p><h1>按自己的节奏来。</h1><p>调整每天的份量和记忆目标；默认本机保存，开启同步后可跨设备。</p></div>
    <div class="head-actions"><button class="btn ghost" data-action="show-shortcuts">${icon('keyboard')} 快捷键</button></div>
  </div>
  <div class="settings-grid">
    ${syncPanelHtml()}
    <section class="panel">
      <h2>记忆算法</h2>
      <div class="setting-row">
        <div class="setting-copy"><span class="setting-label">每日新词上限</span><small>做题新词优先安排，并计入这个额度。设为“不限”则不限制每天的新词数量。</small></div>
        <select data-setting="dailyNew">${options([[0,'不限'],[10,'10 个'],[20,'20 个'],[30,'30 个'],[50,'50 个'],[80,'80 个'],[100,'100 个']],newValue)}</select>
      </div>
      <div class="setting-row">
        <div class="setting-copy"><span class="setting-label">每日复习上限</span><small>到期词多时，先做最薄弱的 ${20} 个一组，避免一次压垮。设为“不限”可一直复习。</small></div>
        <select data-setting="dailyReview">${options([[0,'不限'],[60,'60 个'],[100,'100 个'],[150,'150 个'],[200,'200 个'],[300,'300 个'],[500,'500 个']],reviewValue)}</select>
      </div>
      <div class="setting-row">
        <div class="setting-copy"><span class="setting-label">目标保留率</span><small>越高，复习越频繁、记得越牢；越低，间隔越长、每天更轻松。</small></div>
        <select data-setting="retention">${options([[0.8,'80% · 轻松'],[0.85,'85%'],[0.9,'90% · 平衡'],[0.95,'95% · 牢固']],retention())}</select>
      </div>
      <div class="data-note"><b>FSRS-6 调度：</b>每个词独立计算稳定度与难度，<b>忘记</b>会 10 分钟后再来，<b>费力想起</b>比“记得”更早复习，间隔没有 30 天上限。记录只存在这台电脑的浏览器里。</div>
    </section>
    <section class="panel">
      <h2>外观与发音</h2>
      <div class="setting-row">
        <div class="setting-copy"><span class="setting-label">主题</span><small>跟随系统，或固定深色 / 浅色。</small></div>
        <div class="seg">${[['auto','自动'],['dark','深色'],['light','浅色']].map(([v,t])=>`<button class="${theme===v?'active':''}" data-action="set-theme" data-theme="${v}">${t}</button>`).join('')}</div>
      </div>
      <div class="setting-row">
        <div class="setting-copy"><span class="setting-label">自动发音</span><small>进入和切换单词卡时自动朗读，拼写题不提前读答案。</small></div>
        <label class="switch"><input id="auto-speak" type="checkbox" data-setting="autoSpeak" ${state.settings.autoSpeak?'checked':''}><span></span></label>
      </div>
      <div class="setting-row">
        <div class="setting-copy"><span class="setting-label">词典发音</span><small>优先使用有道在线词典，失败时使用系统语音。</small></div>
        <select data-setting="accent">${[['us','美式'],['uk','英式']].map(([v,t])=>`<option value="${v}" ${(state.settings.accent||'us')===v?'selected':''}>${t}</option>`).join('')}</select>
      </div>
      <div class="settings-actions"><button class="btn ghost tiny" data-action="preview-voice">${icon('volume')} 试听 beautiful</button></div>
      <div class="data-note">朗读时会向有道发送当前单词；词库和学习记录不会上传。</div>
    </section>
    <section class="panel">
      <h2>数据与备份</h2>
      <div class="data-note"><b>当前记录：</b>${studied().length} 个学过的词 · ${(state.customWords||[]).length} 个做题新词 · ${Object.keys(state.logs||{}).length} 天记录。<br><b>上次导出：</b>${state.lastBackup||'尚未导出'}</div>
      <div class="settings-actions">
        <button class="btn primary" data-action="export">${icon('download')} 导出备份</button>
        <button class="btn ghost" data-action="import">恢复备份</button>
        <button class="text-btn" data-action="migration-backup">导出升级前原始备份</button>
        ${blocked?`<button class="text-btn" data-action="raw-export">导出当前原始数据</button>`:''}
      </div>
      <div class="data-note">进度保存在这台电脑的当前浏览器中。固定使用同一个浏览器和启动入口；清理网站数据或无痕模式可能导致记录丢失。恢复备份会先下载当前记录，并校验文件。</div>
    </section>
    <section class="panel">
      <h2>键盘操作</h2>
      <div class="kbd-list">
        <div><span>显示释义</span><span class="keys"><kbd>Space</kbd></span></div>
        <div><span>忘记了 / 费力想起 / 记得</span><span class="keys"><kbd>1</kbd><kbd>2</kbd><kbd>3</kbd></span></div>
        <div><span>播放发音</span><span class="keys"><kbd>P</kbd></span></div>
        <div><span>添加做题新词</span><span class="keys"><kbd>N</kbd></span></div>
        <div><span>检查拼写 / 继续</span><span class="keys"><kbd>Enter</kbd></span></div>
      </div>
    </section>
    <section class="panel settings-wide">
      <h2>关于词间</h2>
      <p class="about-copy">词间是一个本地优先的六级单词工作区：1500 个核心词按原表分组，配合 FSRS-6 间隔重复；做题遇到的新词随时录入，和原有词库一起复习。默认数据只在本机；开启跨设备同步后，学习数据会写进你私有的 GitHub Gist，token 只保存在当前浏览器。<br><span class="faint">词库来源：烤鸭TV / Zoey 老师。Excel 原件保持不变。</span></p>
    </section>
  </div>`;
}

/* ---------- add word ---------- */
function openAddWord(){
  if(blocked){toast('请先恢复有效备份，再添加新词。');return;}
  pronunciation.stop();
  const dialog=document.querySelector('#add-word-dialog');
  const todayAdded=(state.customWords||[]).filter(w=>w.addedOn===today()).length;
  dialog.innerHTML=`<div class="modal">
    <div class="modal-head"><span class="chip accent">FROM YOUR PRACTICE</span><button class="modal-close" data-action="close-add" aria-label="关闭">${icon('x')}</button></div>
    <h2 class="form-title">把做题遇到的新词，留下来。</h2>
    <p class="form-sub">保存后优先出现在今天的新词里，并计入每日新词额度；额度用完会自动顺延到明天。今天已添加 ${todayAdded} 个。</p>
    <form id="add-word-form">
      <div class="field"><label for="new-word">英文单词或短语 <span class="req">*</span></label><input id="new-word" name="word" placeholder="例如 serendipity" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="100" required><small class="faint">也可以直接粘贴「word 释义」，会自动拆分。</small></div>
      <div class="field"><label for="new-definition">中文释义 <span class="req">*</span></label><textarea id="new-definition" name="definition" placeholder="写这道题里它的意思" maxlength="2000" required></textarea></div>
      <div class="field"><label for="new-phonetic">音标 <span class="opt">（选填）</span></label><input id="new-phonetic" name="phonetic" placeholder="可留空，仍可发音" maxlength="200"></div>
      <div class="field"><label for="new-collocations">搭配 / 例句 <span class="opt">（选填）</span></label><textarea id="new-collocations" name="collocations" placeholder="题目里的短语或原句" maxlength="2000"></textarea></div>
      <div class="field"><label for="new-mnemonic">近义词 / 助记 <span class="opt">（选填）</span></label><textarea id="new-mnemonic" name="mnemonic" placeholder="近义词、词根、联想或易混词" maxlength="5000"></textarea></div>
      <div id="duplicate-check" class="add-feedback" role="status" aria-live="polite">自动检查原词库和自建词库，忽略大小写与多余空格。</div>
      <div id="add-error" class="form-error" role="alert"></div>
      <div class="modal-actions">
        <button id="save-new-word" class="btn primary" type="submit">添加并加入今日任务 ${icon('arrowRight')}</button>
        <button class="btn ghost" type="button" data-action="close-add">取消</button>
      </div>
    </form>
  </div>`;
  dialog.showModal();
  setTimeout(()=>document.querySelector('#new-word')?.focus(),40);
}
function checkNewWord(){
  const input=document.querySelector('#new-word'),box=document.querySelector('#duplicate-check');
  if(!input||!box)return;
  const existing=findExistingWord(baseWords,state,input.value);
  const saveButton=document.querySelector('#save-new-word');
  if(saveButton)saveButton.disabled=!!existing;
  const error=document.querySelector('#add-error');if(error)error.textContent='';
  box.innerHTML=existing?`<strong>词库已有「${esc(existing.word)}」，无需重复添加。</strong><div>${esc(existing.definition)}</div><button type="button" class="text-btn" data-action="view-existing" data-id="${existing.id}">查看已有单词 →</button>`:input.value.trim()?'词库中未找到重复词。填写释义后即可加入今日任务。':'自动检查原词库和自建词库，忽略大小写与多余空格。';
  box.classList.toggle('duplicate',!!existing);
}
function parsePasted(text){
  const value=String(text||'').trim();
  if(!value)return null;
  const chinese=value.search(/[\u4e00-\u9fff]/);
  if(chinese>0){
    const word=value.slice(0,chinese).trim().replace(/[\s:：,，\-–—]+$/,'');
    const definition=value.slice(chinese).trim();
    if(word&&definition&&/[a-z]/i.test(word))return {word,definition};
  }
  const parts=value.split(/\t+|\s{3,}/);
  if(parts.length>1&&/[a-z]/i.test(parts[0]))return {word:parts[0].trim(),definition:parts.slice(1).join(' ').trim()};
  return null;
}
function submitNewWord(){
  if(blocked){document.querySelector('#add-error').textContent='记录已在其他页面更新，请刷新后重新添加。';return;}
  const previous=structuredClone(state);
  try{
    const result=addCustomWord(baseWords,state,{
      word:document.querySelector('#new-word').value,
      definition:document.querySelector('#new-definition').value,
      phonetic:document.querySelector('#new-phonetic').value,
      collocations:document.querySelector('#new-collocations').value,
      mnemonic:document.querySelector('#new-mnemonic').value
    },today());
    if(!result.added){checkNewWord();return;}
    if(!save()){state=previous;document.querySelector('#add-error').textContent='保存失败，新词尚未添加。请检查浏览器存储空间后重试。';return;}
    syncWords();
    document.querySelector('#add-word-dialog').close();
    render();
    const learnQueue=getSession(state,'learn');
    const visibleToday=newWords(words,state).some(w=>w.id===result.word.id)||!!learnQueue?.queue.includes(result.word.id);
    toast(visibleToday?`「${result.word.word}」已加入今天的任务`:`「${result.word.word}」已保存，明天优先安排`);
  }catch(error){
    state=previous;
    document.querySelector('#add-error').textContent=error.message;
  }
}

/* ---------- shortcuts dialog ---------- */
function openShortcuts(){
  const dialog=document.querySelector('#shortcuts-dialog');
  dialog.innerHTML=`<div class="modal">
    <div class="modal-head"><span class="chip accent">KEYBOARD</span><button class="modal-close" data-action="close-shortcuts" aria-label="关闭">${icon('x')}</button></div>
    <h2 class="form-title">少用鼠标，多记单词。</h2>
    <div class="shortcut-grid">
      <div><span>显示释义</span><span class="keys"><kbd>Space</kbd></span></div>
      <div><span>忘记了</span><span class="keys"><kbd>1</kbd></span></div>
      <div><span>费力想起</span><span class="keys"><kbd>2</kbd></span></div>
      <div><span>记得</span><span class="keys"><kbd>3</kbd></span></div>
      <div><span>播放发音</span><span class="keys"><kbd>P</kbd></span></div>
      <div><span>添加新词</span><span class="keys"><kbd>N</kbd></span></div>
      <div><span>检查拼写 / 继续</span><span class="keys"><kbd>Enter</kbd></span></div>
      <div><span>回到今日</span><span class="keys"><kbd>Esc</kbd> 关闭弹窗</span></div>
    </div>
    <p class="form-sub">撤销按钮在每次作答下方，刷新页面或离开学习页后失效。</p>
  </div>`;
  dialog.showModal();
}

/* ---------- backup ---------- */
function download(data,name){
  const blob=new Blob([data],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download=name;a.click();
  setTimeout(()=>URL.revokeObjectURL(url),10000);
}
function exportBackup(){
  state.lastBackup=today();
  download(JSON.stringify(state,null,2),`词间学习备份-${today()}-${Date.now()}.json`);
  save();
  toast('已导出备份，请保存在安全的位置。');
}

/* ---------- speech ---------- */
const pronunciation=createPronouncer({
  makeAudio:url=>{
    document.querySelector('#pronunciation-audio')?.remove();
    const audio=new Audio(url);
    audio.id='pronunciation-audio';audio.hidden=true;document.body.append(audio);return audio;
  },
  synthesis:window.speechSynthesis,
  makeUtterance:word=>new SpeechSynthesisUtterance(word),
  notify:toast
});
function speak(word){return pronunciation.speak(word,state.settings.accent||'us');}

/* ---------- events ---------- */
document.addEventListener('click',event=>{
  const target=event.target.closest('[data-action],[data-view],[role="button"]');
  if(!target||target.disabled)return;
  const id=Number(target.dataset.id);
  if(target.dataset.view){
    event.preventDefault();
    navigate(target.dataset.view);
    return;
  }
  const action=target.dataset.action;
  switch(action){
    case 'toggle-theme':{
      const next=resolvedTheme()==='dark'?'light':'dark';
      state.settings.theme=next;save();applyTheme();render();
      toast(next==='dark'?'已切换到深色主题':'已切换到浅色主题');
      break;
    }
    case 'set-theme':{
      state.settings.theme=target.dataset.theme||'auto';save();applyTheme();render();
      break;
    }
    case 'add-word':lastAnswerUndo=null;openAddWord();break;
    case 'close-add':document.querySelector('#add-word-dialog').close();break;
    case 'view-existing':document.querySelector('#add-word-dialog').close();detail(id);break;
    case 'start':start(target.dataset.mode);break;
    case 'sync-create':createSyncFromForm();break;
    case 'sync-connect':connectSyncFromForm();break;
    case 'sync-push':pushSync();break;
    case 'sync-pull':pullSync();break;
    case 'sync-pair':copyPairLink();break;
    case 'sync-phone':copyPhoneInfo();break;
    case 'sync-copy-gist':copyGistId();break;
    case 'sync-disconnect':disconnectSync();break;
    case 'sync-conflict':if(syncRuntime.conflict)openSyncConflict(syncRuntime.conflict);else toast('当前没有待处理的冲突');break;
    case 'sync-use-cloud':resolveSyncConflict('cloud');break;
    case 'sync-keep-local':resolveSyncConflict('local');break;
    case 'sync-later':resolveSyncConflict('later');break;
    case 'practice-list':practiceList();break;
    case 'resume-mode':resumeMode(target.dataset.mode);break;
    case 'reveal':revealed=true;renderStudy();break;
    case 'rate':if(revealed)answer(Number(target.dataset.rating));break;
    case 'speak':{const w=byId.get(id);if(w)speak(w.word);break;}
    case 'next':feedback=null;renderStudy();break;
    case 'skip-spell':answer(1,'');break;
    case 'undo-answer':undoLastAnswer();break;
    case 'recheck':renderStudy();break;
    case 'learn-while-waiting':learnWhileWaiting();break;
    case 'next-group':{
      const mode=target.dataset.mode;
      rememberSession(state);
      state.session=null;
      save();
      start(mode);
      break;
    }
    case 'favorite':{
      if(blocked){toast('当前数据受保护，请先恢复备份。');break;}
      state.progress[id]||={};
      state.progress[id].favorite=!state.progress[id].favorite;
      save();
      if(view==='study')renderStudy();
      else if(document.querySelector('#word-dialog')?.open)detail(id);
      else renderRows();
      break;
    }
    case 'detail':detail(id);break;
    case 'close-dialog':pronunciation.stop();document.querySelector('#word-dialog').close();break;
    case 'save-note':{
      if(blocked){toast('当前数据受保护，请先恢复备份。');break;}
      state.progress[detailId]||={};
      state.progress[detailId].note=document.querySelector('#word-note').value;
      save();toast('笔记已保存');
      document.querySelector('#word-dialog').close();
      break;
    }
    case 'practice-word':{
      const w=byId.get(id);
      if(!w)break;
      pronunciation.stop();
      document.querySelector('#word-dialog').close();
      state.session={mode:'day',title:'单词练习',queue:[id],index:0,total:1,correct:0,date:today(),retries:{}};
      save();navigate('study');
      // 等 dialog 的 close 事件先完成（它会停止旧发音），再开始新卡片发音
      setTimeout(()=>{if(view==='study')autoSpeak();},80);
      break;
    }
    case 'page':page+=Number(target.dataset.step);renderRows();window.scrollTo({top:0,behavior:'smooth'});break;
    case 'tab':filter=target.dataset.filter;page=1;render();break;
    case 'go-custom':navigate('library',{filter:'custom'});break;
    case 'migration-backup':{
      const raw=localStorage.getItem(KEY+':pre-fsrs-v2');
      if(raw)download(raw,'词间升级前原始备份.json');
      else toast('没有升级前快照；已经升级的数据无法补造旧记录。');
      break;
    }
    case 'export':exportBackup();break;
    case 'import':document.querySelector('#import-file').click();break;
    case 'raw-export':download(localStorage.getItem(KEY)||'','词间原始数据.json');break;
    case 'preview-voice':pronunciation.speak('beautiful',state.settings.accent||'us');break;
    case 'show-shortcuts':openShortcuts();break;
    case 'close-shortcuts':document.querySelector('#shortcuts-dialog').close();break;
  }
});
document.addEventListener('input',event=>{
  if(event.target.id==='new-word')checkNewWord();
  if(event.target.id==='search'){query=event.target.value;page=1;renderRows();}
});
document.addEventListener('paste',event=>{
  if(event.target.id==='sync-token'){
    const text=event.clipboardData?.getData('text')||'';
    if(/Token[：:]|同步\s*ID|gist=/.test(text)){
      event.preventDefault();
      const parsed=parsePhoneInfo(text);
      if(parsed.token)event.target.value=parsed.token;
      const gist=document.querySelector('#sync-gist');
      if(parsed.gistId&&gist&&!gist.value)gist.value=parsed.gistId;
      toast('已从配对信息填入 token 和同步 ID');
    }
    return;
  }
  if(event.target.id!=='new-word')return;
  const text=event.clipboardData?.getData('text')||'';
  const parsed=parsePasted(text);
  if(!parsed)return;
  event.preventDefault();
  document.querySelector('#new-word').value=parsed.word;
  const definition=document.querySelector('#new-definition');
  if(!definition.value.trim())definition.value=parsed.definition;
  checkNewWord();
});
document.addEventListener('change',event=>{
  const el=event.target;
  if(el.dataset?.setting==='syncAuto'){
    syncConfig.auto=!!el.checked;
    saveSyncConfig(syncConfig);
    if(!syncConfig.auto)clearTimeout(autoPushTimer);else scheduleAutoPush();
    updateSyncStatusDom();
    if(view==='settings')render();
    toast(syncConfig.auto?'已开启自动同步':'已关闭自动同步');
    return;
  }
  if(el.dataset?.setting){
    const key=el.dataset.setting;
    let value=el.type==='checkbox'?el.checked:el.value;
    if(['dailyNew','dailyReview','retention'].includes(key))value=Number(value);
    state.settings[key]=value;
    save();
    if(key==='retention'||key==='dailyNew'||key==='dailyReview')toast('设置已保存');
    return;
  }
  if(el.id==='day-filter'){dayFilter=el.value;page=1;renderRows();}
  if(el.id==='import-file'){
    const file=el.files[0];if(!file)return;
    (async()=>{
      try{
        if(file.size>10000000)throw new Error('备份文件过大，请选择词间导出的 JSON 文件。');
        const imported=validateBackup(JSON.parse(await file.text()),baseWords);
        if(!confirm('确认用此备份替换当前学习进度？替换前会先下载一份当前进度备份。'))return;
        if(blocked)download(localStorage.getItem(KEY)||'','词间恢复前原始数据.json');
        else download(JSON.stringify(state,null,2),`词间恢复前备份-${Date.now()}.json`);
        migratePreferences(imported);migrateToV2(imported);migrateSettings(imported);
        localStorage.setItem(KEY,JSON.stringify(imported));
        state=imported;syncWords();blocked=false;
        navigate('home');
        toast('备份已恢复');
      }catch(error){
        toast(error instanceof SyntaxError?'文件不是有效的 JSON 备份。':error.message);
      }finally{el.value='';}
    })();
  }
});
document.addEventListener('submit',event=>{
  if(event.target.id==='add-word-form'){event.preventDefault();submitNewWord();return;}
  if(event.target.id==='spell-form'){
    event.preventDefault();
    const input=document.querySelector('#spell-answer');
    const s=state.session;
    if(!s)return;
    const w=byId.get(s.queue[s.index]);
    const text=input.value;
    if(!text.trim()||!w)return;
    answer(normalizeAnswer(text)===normalizeAnswer(w.word)?3:1,text);
  }
});
document.addEventListener('keydown',event=>{
  const typing=['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName);
  if(event.key==='n'&&!typing&&!event.metaKey&&!event.ctrlKey&&!event.altKey&&!document.querySelector('dialog[open]')){
    event.preventDefault();openAddWord();return;
  }
  if(view!=='study'||document.querySelector('dialog[open]')||event.repeat||event.metaKey||event.ctrlKey||event.altKey)return;
  if(typing&&document.activeElement?.id!=='spell-answer')return;
  const s=state.session;
  if(!s||(s.index>=s.queue.length&&!feedback))return;
  if(s.mode!=='spell'&&nextAnswerIndex(s,state.progress)<0)return;
  if(s.mode==='spell'){
    if(event.key==='Enter'&&feedback){event.preventDefault();feedback=null;renderStudy();}
    return;
  }
  if(event.code==='Space'){event.preventDefault();if(!revealed){revealed=true;renderStudy();}}
  else if(['1','2','3'].includes(event.key)&&revealed){event.preventDefault();answer(Number(event.key));}
  else if(event.key.toLowerCase()==='p'){event.preventDefault();const w=byId.get(s.queue[s.index]);if(w)speak(w.word);}
});
document.addEventListener('keydown',event=>{
  if(event.key==='Enter'&&document.activeElement?.matches?.('.word-row')){event.preventDefault();document.activeElement.click();}
});
window.addEventListener('pagehide',()=>pronunciation.stop());
window.addEventListener('online',()=>{if(syncConfigured()&&syncConfig.auto)autoSync();});
window.addEventListener('offline',()=>{if(syncConfigured())setSyncStatus('idle');});
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible'&&syncConfigured()&&syncConfig.auto)autoSync();
  if(document.visibilityState==='hidden'&&syncConfigured()&&syncConfig.auto&&!syncRuntime.conflict){clearTimeout(autoPushTimer);pushSync({auto:true});}
});
document.querySelector('#word-dialog').addEventListener('close',()=>pronunciation.stop());
window.addEventListener('storage',event=>{
  if(event.key===KEY){
    blocked=true;
    render();
    toast('另一个页面更新了学习记录。请刷新本页载入最新进度。');
  }
});

/* reading import may add words after initial sync */
const bootMessages=[];
if(readingImport?.added.length)bootMessages.push(`阅读新词 +${readingImport.added.length}`);
if(packImport){
  const added=packImport.reduce((n,item)=>n+item.added.length,0);
  const updated=packImport.reduce((n,item)=>n+item.updated.length,0);
  if(added||updated)bootMessages.push(`今日学习包 +${added}${updated?` · ${updated} 个已有词补充笔记`:''}`);
}
if(bootMessages.length)toast(bootMessages.join(' · '));
if(syncEnabled&&syncRuntime.pendingGist&&!syncConfigured())view='settings';
syncReady=true;
render();
if(syncEnabled&&syncConfigured()){
  syncRuntime.status='idle';
  updateSyncStatusDom();
  setTimeout(()=>{if(syncConfig.auto)autoSync();},350);
}
if(syncEnabled&&syncRuntime.pendingGist&&!syncConfigured())setTimeout(()=>toast('已读取配对信息，粘贴 token 即可从云端下载'),450);
