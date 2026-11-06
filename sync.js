// 词间 · 跨设备同步（GitHub 私有 Gist）
// 只负责网络与配置；不把 token 写进学习数据/备份。
export const SYNC_KEY='word-garden-sync-v1';
export const GIST_FILE='word-garden-state.json';
export const API_BASE='https://api.github.com';
const DEFAULTS={token:'',gistId:'',login:'',auto:true,deviceId:'',deviceName:'',lastSyncAt:0,lastRemoteAt:0,lastLocalAt:0,lastHash:''};

export function randomId(){
  try{if(globalThis.crypto?.randomUUID)return crypto.randomUUID();}catch{}
  return 'dev-'+Math.random().toString(36).slice(2)+Date.now().toString(36);
}
export function loadSyncConfig(storage=globalThis.localStorage){
  let parsed={};
  try{parsed=JSON.parse(storage.getItem(SYNC_KEY)||'{}')||{};}catch{parsed={};}
  const config={...DEFAULTS,...parsed};
  if(!config.deviceId)config.deviceId=randomId();
  if(typeof config.auto!=='boolean')config.auto=true;
  return config;
}
export function saveSyncConfig(config,storage=globalThis.localStorage){
  const clean={token:String(config.token||''),gistId:String(config.gistId||''),login:String(config.login||''),auto:!!config.auto,deviceId:String(config.deviceId||randomId()),deviceName:String(config.deviceName||''),lastSyncAt:Number(config.lastSyncAt)||0,lastRemoteAt:Number(config.lastRemoteAt)||0,lastLocalAt:Number(config.lastLocalAt)||0,lastHash:String(config.lastHash||'')};
  storage.setItem(SYNC_KEY,JSON.stringify(clean));
  return clean;
}
export function clearSyncConfig(storage=globalThis.localStorage){
  storage.removeItem(SYNC_KEY);
}
export function isSyncConfigured(config){return !!config?.token&&!!config?.gistId;}
export function maskToken(token){return token?`${token.slice(0,4)}…${token.slice(-4)}`:'—';}
export function fingerprint(state){
  const text=JSON.stringify(state)||'';
  let hash=0x811c9dc5;
  for(let i=0;i<text.length;i++){hash^=text.charCodeAt(i);hash=Math.imul(hash,0x01000193);}
  return `${(hash>>>0).toString(16).padStart(8,'0')}-${text.length}`;
}
export function makePayload(state,deviceId,now=Date.now(),deviceName=''){
  return {app:'word-garden',schema:2,updatedAt:Number(now),device:String(deviceId||''),deviceName:String(deviceName||''),state};
}
export function parsePayload(parsed){
  if(!parsed||typeof parsed!=='object'||parsed.app!=='word-garden'||!parsed.state||typeof parsed.state!=='object')throw new Error('这个 Gist 不是词间的同步数据。');
  return {state:parsed.state,updatedAt:Number(parsed.updatedAt)||0,device:String(parsed.device||''),deviceName:String(parsed.deviceName||'')};
}
export function extractGistId(text){
  const value=String(text||'').trim();
  if(!value)return '';
  const match=value.match(/([0-9a-f]{20,})/i);
  return match?match[1]:value;
}
async function call(apiBase,path,{token,method='GET',body,fetchImpl=fetch}){
  const headers={Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',Authorization:`Bearer ${token}`};
  if(body)headers['Content-Type']='application/json';
  const response=await fetchImpl(`${apiBase}${path}`,{method,headers,body:body?JSON.stringify(body):undefined});
  if(!response.ok){
    let detail='';
    try{detail=(await response.text()).slice(0,300);}catch{}
    const error=new Error(response.status===401?'GitHub token 无效或已过期。':response.status===404?'找不到这个 Gist，或 token 没有权限。':`GitHub 返回 ${response.status}${detail?`：${detail}`:''}`);
    error.status=response.status;
    throw error;
  }
  return response.json();
}
export async function verifyGithubToken({token,fetchImpl=fetch,apiBase=API_BASE}){
  const data=await call(apiBase,'/user',{token,fetchImpl});
  return {login:data.login||''};
}
export async function createSyncGist({token,state,deviceId,deviceName='',fetchImpl=fetch,apiBase=API_BASE,now=Date.now()}){
  const payload=makePayload(state,deviceId,now,deviceName);
  const data=await call(apiBase,'/gists',{token,method:'POST',fetchImpl,body:{description:'词间 · 学习进度同步（私有）',public:false,files:{[GIST_FILE]:{content:JSON.stringify(payload)}}}});
  return {gistId:data.id,updatedAt:payload.updatedAt,payload};
}
export async function fetchSyncGist({token,gistId,fetchImpl=fetch,apiBase=API_BASE}){
  const data=await call(apiBase,`/gists/${encodeURIComponent(gistId)}`,{token,fetchImpl});
  const file=data.files?.[GIST_FILE];
  if(!file)throw new Error('这个 Gist 里没有词间同步文件。');
  let content=file.content;
  if(file.truncated||!content){
    if(!file.raw_url)throw new Error('无法读取这个 Gist 的内容。');
    const raw=await fetchImpl(file.raw_url,{headers:{Authorization:`Bearer ${token}`}});
    if(!raw.ok)throw new Error('无法读取这个 Gist 的内容。');
    content=await raw.text();
  }
  let parsed;
  try{parsed=JSON.parse(content);}catch{throw new Error('同步文件不是有效的 JSON。');}
  const payload=parsePayload(parsed);
  return {...payload,gistId:data.id,description:data.description||''};
}
export async function pushSyncGist({token,gistId,state,deviceId,deviceName='',fetchImpl=fetch,apiBase=API_BASE,now=Date.now()}){
  const payload=makePayload(state,deviceId,now,deviceName);
  await call(apiBase,`/gists/${encodeURIComponent(gistId)}`,{token,method:'PATCH',fetchImpl,body:{files:{[GIST_FILE]:{content:JSON.stringify(payload)}}}});
  return {updatedAt:payload.updatedAt,payload};
}
