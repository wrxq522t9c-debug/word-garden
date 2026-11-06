export function audioUrl(word,accent='us'){
 return `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word.trim())}&type=${accent==='uk'?1:2}`;
}
export function createPronouncer({makeAudio,synthesis,makeUtterance,notify,setTimer=setTimeout,clearTimer=clearTimeout}){
 let serial=0,current=null,timer=null;
 function stop(){serial++;if(timer!==null)clearTimer(timer);timer=null;if(current){current.pause();current=null;}synthesis?.cancel();}
 async function speak(word,accent='us'){
  stop();const request=serial,lang=accent==='uk'?'en-GB':'en-US';let finished=false;
  const fallback=()=>{
   if(request!==serial||finished)return;finished=true;clearTimer(timer);current?.pause();
   if(!synthesis){notify('词典发音暂不可用，请联网后重试。');return;}
   notify('词典发音暂不可用，本次使用系统语音。');
   const u=makeUtterance(word);u.lang=lang;u.rate=1;
   const voices=synthesis.getVoices().filter(v=>v.lang===lang);
   u.voice=voices.find(v=>/premium|enhanced|natural|Samantha|Daniel/i.test(v.name))||voices[0]||null;
   u.onerror=e=>{if(request===serial&&!['interrupted','canceled'].includes(e.error))notify('发音失败，请稍后重试。');};synthesis.speak(u);
  };
  try{
   current=makeAudio(audioUrl(word,accent));current.playbackRate=1;current.preload='auto';current.onerror=fallback;
   timer=setTimer(fallback,6000);
   await current.play();
   if(request===serial){clearTimer(timer);timer=null;}
  }catch(error){
   if(request!==serial)return;
   if(error.name==='NotAllowedError'){finished=true;clearTimer(timer);notify('请点击单词旁的发音按钮，允许浏览器播放声音。');}
   else fallback();
  }
 }
 return {speak,stop};
}
