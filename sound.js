// 轻量键盘音效：全部用 Web Audio 合成，不加载任何音频文件。
let ctx=null;
let enabled=true;
function ensure(){
  if(!enabled)return null;
  try{
    if(!ctx){
      const AC=window.AudioContext||window.webkitAudioContext;
      if(!AC)return null;
      ctx=new AC();
    }
    if(ctx.state==='suspended')ctx.resume().catch(()=>{});
    return ctx;
  }catch{return null;}
}
export function setSoundEnabled(value){enabled=!!value;}
export function isSoundEnabled(){return enabled;}
function tone(freq,dur,type='sine',gain=.035,when=0){
  const audio=ensure();if(!audio)return;
  const t=audio.currentTime+when;
  const osc=audio.createOscillator(),g=audio.createGain();
  osc.type=type;osc.frequency.setValueAtTime(freq,t);
  g.gain.setValueAtTime(0.0001,t);
  g.gain.exponentialRampToValueAtTime(gain,t+0.006);
  g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  osc.connect(g);g.connect(audio.destination);
  osc.start(t);osc.stop(t+dur+0.02);
}
export function keyClick(){
  // 短促的机械键帽声：高频短音 + 极短噪声感。
  tone(1550,.025,'square',.012);
  tone(820,.035,'triangle',.018,.004);
}
export function keyBackspace(){
  tone(420,.04,'triangle',.014);
}
export function errorBuzz(){
  tone(180,.16,'sawtooth',.035);
  tone(120,.2,'sawtooth',.025,.06);
}
export function successChime(){
  tone(660,.1,'sine',.03);
  tone(880,.12,'sine',.03,.09);
  tone(1320,.18,'sine',.022,.19);
}
export function comboChime(level=1){
  const base=740+Math.min(5,level)*80;
  tone(base,.08,'sine',.028);
  tone(base*1.5,.12,'sine',.022,.06);
}
export function finishChime(){
  [523,659,784,1047].forEach((f,i)=>tone(f,.24,'sine',.03,i*.12));
}
