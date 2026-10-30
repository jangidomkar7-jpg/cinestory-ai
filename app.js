const $=id=>document.getElementById(id);
const canvas=$('canvas'),ctx=canvas.getContext('2d');
let scenes=[],active=0,images=[],musicFile=null,playing=false,playTimer=null;
const W=1280,H=720;
function splitStory(s){return s.replace(/\n+/g,' ').split(/(?<=[।.!?])\s+/).map(x=>x.trim()).filter(Boolean)}
function moodText(){return $('look').selectedOptions[0].text}
function promptFor(text,i){return `Photorealistic cinematic film still, ${moodText().toLowerCase()} style, scene ${i+1}: ${text}. Natural human expressions, realistic Indian setting when relevant, detailed environment, cinematic lighting, 35mm film composition, no text, no watermark.`}
function makeScenes(){
 const lines=splitStory($('story').value);if(!lines.length){setStatus('पहले कहानी लिखो।');return}
 scenes=lines.map((text,i)=>({text,prompt:promptFor(text,i),image:null}));
 active=0;$('count').textContent=scenes.length;$('sceneList').innerHTML='';
 scenes.forEach((s,i)=>{const b=document.createElement('button');b.className='scene-item';b.innerHTML=`<strong>${String(i+1).padStart(2,'0')}</strong>${esc(s.text.slice(0,72))}`;b.onclick=()=>selectScene(i);$('sceneList').append(b)});
 $('title').textContent='My cinematic story';$('play').disabled=false;$('export').disabled=false;
 $('preview').classList.toggle('portrait',$('format').value==='portrait');$('empty').style.display='none';
 selectScene(0);setStatus(`${scenes.length} scenes created. Add a picture to each scene for a realistic video.`);
}
function esc(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function selectScene(i){if(!scenes.length)return;active=Math.max(0,Math.min(i,scenes.length-1));const s=scenes[active];$('prompt').value=s.prompt;$('caption').textContent=s.text;$('sceneNo').textContent=`Scene ${active+1} / ${scenes.length}`;$('sceneList').querySelectorAll('button').forEach((b,n)=>b.classList.toggle('active',n===active));showFrame();$('thumb').innerHTML=s.image?`<img src="${s.image}">`:'No image selected';}
function showFrame(){
 const portrait=$('format').value==='portrait';canvas.width=portrait?720:1280;canvas.height=portrait?1280:720;
 const w=canvas.width,h=canvas.height,s=scenes[active];ctx.clearRect(0,0,w,h);
 const img=s.image;
 if(img){drawCover(img,w,h)}else{
  const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,'#17263b');g.addColorStop(.55,'#496274');g.addColorStop(1,'#c17c54');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#ffffff18';for(let n=0;n<18;n++){ctx.beginPath();ctx.arc((n*173)%w,(n*97)%h,30+(n%4)*18,0,Math.PI*2);ctx.fill()}
  ctx.fillStyle='white';ctx.textAlign='center';ctx.font='bold 34px sans-serif';wrapText(s.text,w/2,h*.45,w*.78,48,4);
  ctx.font='18px sans-serif';ctx.fillStyle='#ffffffbd';ctx.fillText('ADD A SCENE IMAGE FOR REALISTIC VISUALS',w/2,h*.78);
 }
 // cinematic overlay and lower title
 const shade=ctx.createLinearGradient(0,h*.55,0,h);shade.addColorStop(0,'#00000000');shade.addColorStop(1,'#000000a8');ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
 ctx.fillStyle='#ffffff';ctx.textAlign='left';ctx.font=`600 ${Math.round(w*.022)}px sans-serif`;wrapText(s.text,w*.07,h*.82,w*.86,Math.round(w*.034),3);
}
function drawCover(img,w,h){const scale=Math.max(w/img.width,h/img.height),sw=w/scale,sh=h/scale,sx=(img.width-sw)/2,sy=(img.height-sh)/2;ctx.drawImage(img,sx,sy,sw,sh,0,0,w,h)}
function wrapText(text,x,y,maxWidth,lineHeight,maxLines){let words=text.split(' '),line='',lines=[];for(const word of words){const test=line+word+' ';if(ctx.measureText(test).width>maxWidth&&line){lines.push(line.trim());line=word+' '}else line=test}if(line)lines.push(line.trim());lines.slice(0,maxLines).forEach((l,i)=>ctx.fillText(l,x,y+i*lineHeight))}
function setStatus(s){$('status').textContent=s}
$('make').onclick=makeScenes;
$('prompt').addEventListener('input',()=>{if(scenes[active])scenes[active].prompt=$('prompt').value});
$('imageUpload').onchange=e=>{const f=e.target.files[0];if(!f||!scenes[active])return;const url=URL.createObjectURL(f),img=new Image();img.onload=()=>{scenes[active].image=img;selectScene(active);setStatus('Scene image added.')};img.src=url};
$('format').onchange=()=>{if(scenes.length){$('preview').classList.toggle('portrait',$('format').value==='portrait');showFrame()}};
$('back').onclick=()=>selectScene(active-1);$('forward').onclick=()=>selectScene(active+1);
$('speak').onclick=()=>{if(!scenes[active])return;if(!('speechSynthesis'in window)){setStatus('Speech synthesis is not supported in this browser.');return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(scenes[active].text);u.lang=$('lang').value;u.rate=.94;speechSynthesis.speak(u)};
$('music').onchange=e=>{musicFile=e.target.files[0]||null;$('musicName').textContent=musicFile?musicFile.name:'No music selected'};
$('play').onclick=async()=>{if(!scenes.length)return;playing=true;$('play').textContent='Ⅱ Stop';for(let i=0;i<scenes.length&&playing;i++){selectScene(i);await new Promise(r=>playTimer=setTimeout(r,3000))}playing=false;$('play').textContent='▶ Preview'};
$('play').addEventListener('click',()=>{if(playing){playing=false;clearTimeout(playTimer);speechSynthesis?.cancel?.();$('play').textContent='▶ Preview'}});
$('help').onclick=()=>$('helpDialog').showModal();$('closeHelp').onclick=()=>$('helpDialog').close();
function drawExportFrame(scene,idx,total,progress){active=idx;showFrame();ctx.save();ctx.fillStyle='#0009';ctx.fillRect(0,canvas.height-16,canvas.width,16);ctx.fillStyle='#b79aff';ctx.fillRect(0,canvas.height-16,canvas.width*progress,16);ctx.restore()}
async function loadFFmpeg(){
 const {FFmpeg}=await import('https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js');
 const {toBlobURL}=await import('https://unpkg.com/@ffmpeg/util@0.12.1/dist/esm/index.js');
 const ffmpeg=new FFmpeg();const base='https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
 await ffmpeg.load({coreURL:await toBlobURL(base+'/ffmpeg-core.js','text/javascript'),wasmURL:await toBlobURL(base+'/ffmpeg-core.wasm','application/wasm')});
 return ffmpeg;
}
$('export').onclick=async()=>{
 if(!scenes.length)return;
 const button=$('export');button.disabled=true;
 try{
  setStatus('Preparing video recording…');selectScene(0);
  const stream=canvas.captureStream(24);let audioContext=null,audioEl=null,audioUrl=null;
  if(musicFile){audioContext=new AudioContext();audioEl=new Audio(URL.createObjectURL(musicFile));audioEl.loop=true;const source=audioContext.createMediaElementSource(audioEl);const dest=audioContext.createMediaStreamDestination();source.connect(dest);source.connect(audioContext.destination);dest.stream.getAudioTracks().forEach(t=>stream.addTrack(t));audioUrl=audioEl.src;await audioContext.resume();await audioEl.play()}
  const mime=MediaRecorder.isTypeSupported('video/webm;codecs=vp9')?'video/webm;codecs=vp9':'video/webm';
  const rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:5000000}),chunks=[];
  rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
  const stopped=new Promise(resolve=>rec.onstop=resolve);rec.start();
  for(let i=0;i<scenes.length;i++){selectScene(i);setStatus(`Recording scene ${i+1} of ${scenes.length}…`);await new Promise(r=>setTimeout(r,3200))}
  rec.stop();await stopped;stream.getTracks().forEach(t=>t.stop());if(audioEl){audioEl.pause();URL.revokeObjectURL(audioUrl);await audioContext.close()}
  const webm=new Blob(chunks,{type:'video/webm'});setStatus('Converting to MP4. First conversion downloads FFmpeg engine; please keep this tab open…');
  const ffmpeg=await loadFFmpeg();await ffmpeg.writeFile('input.webm',new Uint8Array(await webm.arrayBuffer()));
  await ffmpeg.exec(['-i','input.webm','-c:v','libx264','-preset','ultrafast','-pix_fmt','yuv420p','-movflags','+faststart',...(musicFile?['-c:a','aac','-shortest']:['-an']),'output.mp4']);
  const data=await ffmpeg.readFile('output.mp4');const blob=new Blob([data.buffer],{type:'video/mp4'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='cinestory-video.mp4';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);
  setStatus('MP4 export complete!');selectScene(0);
 }catch(err){console.error(err);setStatus('MP4 export failed on this device/browser. Try desktop Chrome or use WebM recording in the browser. Error: '+(err?.message||err))}
 finally{button.disabled=false}
};
showFrame();
