const canvas = document.querySelector('#scene');
const ctx = canvas.getContext('2d');
const levelText = document.querySelector('#levelText');
const scoreText = document.querySelector('#scoreText');
const keyText = document.querySelector('#keyText');
const progressBar = document.querySelector('#progressBar');
const hint = document.querySelector('#hint');
const interact = document.querySelector('#interact');
const questionCard = document.querySelector('#questionCard');
const resultCard = document.querySelector('#resultCard');
const questionTitle = document.querySelector('#questionTitle');
const questionPrompt = document.querySelector('#questionPrompt');
const answers = document.querySelector('#answers');
const feedback = document.querySelector('#feedback');
const closeQuestion = document.querySelector('#closeQuestion');
const restart = document.querySelector('#restart');
const finalScore = document.querySelector('#finalScore');
const resultMessage = document.querySelector('#resultMessage');

const questions = [
  { title:'第一關｜市集小管家', prompt:'你有 20 枚心動幣，想買 12 枚的果汁。買完後還剩幾枚？', options:['6 枚','8 枚','10 枚'], correct:1, hint:'用 20 減掉 12，想想錢包還剩多少。', lesson:'先計算支出，再確認剩餘資金。' },
  { title:'第二關｜小小投資站', prompt:'你有 10 枚心動幣，可以全部放進安全存錢箱，或投入 6 枚到種子攤位。哪個做法風險較低？', options:['全部放入安全存錢箱','投入 6 枚，保留 4 枚','借錢投入更多'], correct:0, hint:'把錢放在安全的地方，通常比較不會有損失。', lesson:'投資前先保留需要的錢，並了解風險。' }
];
const state = { level:0, score:0, keys:0, answered:false, player:{x:.5,y:.72}, station:{x:.5,y:.28}, keysDown:new Set() };

function resize(){ const dpr=Math.min(devicePixelRatio||1,2); canvas.width=canvas.clientWidth*dpr; canvas.height=canvas.clientHeight*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); draw(); }
window.addEventListener('resize', resize); resize();

function draw(){
  const w=canvas.clientWidth, h=canvas.clientHeight; ctx.clearRect(0,0,w,h);
  const sky=ctx.createLinearGradient(0,0,0,h*.62); sky.addColorStop(0,'#63bfe9'); sky.addColorStop(1,'#c5f0fa'); ctx.fillStyle=sky; ctx.fillRect(0,0,w,h);
  drawCloud(w*.16,h*.18,1.0); drawCloud(w*.72,h*.13,.72); drawCloud(w*.92,h*.30,.55);
  ctx.fillStyle='#6ebf68'; ctx.beginPath(); ctx.moveTo(0,h*.52); ctx.quadraticCurveTo(w*.22,h*.39,w*.48,h*.54); ctx.quadraticCurveTo(w*.72,h*.36,w,h*.51); ctx.lineTo(w,h); ctx.lineTo(0,h); ctx.fill();
  ctx.fillStyle='#54a75b'; ctx.beginPath(); ctx.moveTo(0,h*.65); ctx.quadraticCurveTo(w*.28,h*.51,w*.57,h*.67); ctx.quadraticCurveTo(w*.82,h*.5,w,h*.64); ctx.lineTo(w,h); ctx.lineTo(0,h); ctx.fill();
  ctx.fillStyle='#48b9d1'; ctx.fillRect(0,h*.76,w,h*.24); ctx.fillStyle='rgba(255,255,255,.28)'; for(let i=0;i<8;i++) ctx.fillRect((i*149+w*.08)%w,h*.83+(i%3)*18,76,3);
  drawBridge(w*.50,h*.73,w*.55); drawCabin(w*.16,h*.48,1); drawCabin(w*.82,h*.43,.8); drawTree(w*.08,h*.37,1.15); drawTree(w*.92,h*.36,1.2); drawTree(w*.27,h*.28,.7); drawTree(w*.68,h*.29,.75);
  const sx=state.station.x*w, sy=state.station.y*h; drawStation(sx,sy);
  const px=state.player.x*w, py=state.player.y*h; drawPlayer(px,py);
}
function drawCloud(x,y,s){ ctx.fillStyle='rgba(255,255,255,.75)'; ctx.beginPath(); ctx.arc(x,y,25*s,0,7); ctx.arc(x+30*s,y-12*s,35*s,0,7); ctx.arc(x+68*s,y,24*s,0,7); ctx.fill(); }
function drawTree(x,y,s){ ctx.fillStyle='#7b4d30'; ctx.fillRect(x-7*s,y+18*s,14*s,75*s); ctx.fillStyle='#2f8c55'; ctx.beginPath(); ctx.arc(x,y,38*s,0,7); ctx.arc(x-28*s,y+23*s,31*s,0,7); ctx.arc(x+30*s,y+24*s,32*s,0,7); ctx.fill(); ctx.fillStyle='#68bd68'; ctx.beginPath(); ctx.arc(x+4*s,y-17*s,24*s,0,7); ctx.fill(); }
function drawCabin(x,y,s){ ctx.fillStyle='#aa5147'; ctx.fillRect(x-57*s,y,x*0+114*s,72*s); ctx.fillStyle='#f6c767'; ctx.beginPath(); ctx.moveTo(x-72*s,y); ctx.lineTo(x,y-48*s); ctx.lineTo(x+72*s,y); ctx.closePath(); ctx.fill(); ctx.fillStyle='#6b4850'; ctx.fillRect(x-19*s,y+32*s,38*s,40*s); ctx.fillStyle='#98dded'; ctx.fillRect(x-43*s,y+22*s,22*s,21*s); ctx.fillRect(x+21*s,y+22*s,22*s,21*s); }
function drawBridge(x,y,width){ ctx.fillStyle='#8f5b37'; ctx.beginPath(); ctx.moveTo(x-width/2,y); ctx.lineTo(x+width/2,y); ctx.lineTo(x+width*.38,y+32); ctx.lineTo(x-width*.38,y+32); ctx.closePath(); ctx.fill(); ctx.strokeStyle='#e2aa65'; ctx.lineWidth=4; for(let i=0;i<8;i++){ const xx=x-width/2+i*width/7; ctx.beginPath(); ctx.moveTo(xx,y+3); ctx.lineTo(xx+10,y+28); ctx.stroke(); } }
function drawStation(x,y){ ctx.save(); ctx.translate(x,y); ctx.shadowColor='rgba(20,50,60,.22)'; ctx.shadowBlur=12; ctx.fillStyle='#d96350'; ctx.fillRect(-60,-28,120,67); ctx.shadowBlur=0; ctx.fillStyle='#ffd45f'; ctx.beginPath(); ctx.moveTo(-68,-28); for(let i=0;i<8;i++) ctx.lineTo(-68+i*19,-50+(i%2)*10); ctx.lineTo(70,-28); ctx.closePath(); ctx.fill(); ctx.fillStyle='#fff7dd'; ctx.font='bold 16px sans-serif'; ctx.textAlign='center'; ctx.fillText('理財互動站',0,0); ctx.fillStyle='#fff'; ctx.font='bold 13px sans-serif'; ctx.fillText('先想一想再決定',0,23); ctx.restore(); }
function drawPlayer(x,y){ ctx.save(); ctx.translate(x,y); ctx.fillStyle='rgba(20,50,60,.22)'; ctx.beginPath(); ctx.ellipse(0,23,23,8,0,0,7); ctx.fill(); ctx.fillStyle='#f6c453'; ctx.beginPath(); ctx.arc(0,0,18,0,7); ctx.fill(); ctx.fillStyle='#f8e6c7'; ctx.beginPath(); ctx.arc(0,-18,13,0,7); ctx.fill(); ctx.fillStyle='#3f7b9b'; ctx.fillRect(-13,-31,26,8); ctx.restore(); }

function updateHud(){ scoreText.textContent=state.score; keyText.textContent=`${state.keys} / 2`; levelText.textContent=questions[state.level].title; progressBar.style.width=`${state.level===0?50:100}%`; }
function nearStation(){ return Math.hypot(state.player.x-state.station.x,state.player.y-state.station.y)<.13; }
function openQuestion(){ if(state.answered) return; state.answered=true; const q=questions[state.level]; questionTitle.textContent=q.title; questionPrompt.textContent=q.prompt; feedback.textContent=`提示：${q.hint}`; feedback.className='feedback'; answers.innerHTML=''; q.options.forEach((option,i)=>{ const b=document.createElement('button'); b.textContent=option; b.addEventListener('click',()=>answer(i)); answers.appendChild(b); }); questionCard.hidden=false; }
function answer(index){ const q=questions[state.level]; const buttons=[...answers.children]; buttons.forEach(b=>b.disabled=true); if(index===q.correct){ state.score+=50; state.keys++; buttons[index].classList.add('correct'); feedback.textContent=`答對了！${q.lesson} 你取得一把 KEY！`; feedback.className='feedback'; updateHud(); setTimeout(()=>{ questionCard.hidden=true; state.answered=false; if(state.level===0){ state.level=1; state.player={x:.5,y:.72}; hint.textContent='太棒了！同一座理財站還有第二關，挑戰投資風險題。'; updateHud(); draw(); } else showResult(); },1200); } else { state.score=Math.max(0,state.score-10); buttons[index].classList.add('wrong'); feedback.textContent=`再想想看！${q.hint}（本次 -10 分）`; feedback.className='feedback error'; updateHud(); setTimeout(()=>buttons.forEach(b=>b.disabled=false),500); } }
function showResult(){ finalScore.textContent=state.score; resultMessage.textContent=`你取得 ${state.keys} 把 KEY，完成了兩個理財挑戰。記得：理財不是賭運氣，而是先規劃、再決定！`; resultCard.hidden=false; hint.textContent='學習紀錄已完成：規劃、保留、理解風險。'; }
function restartGame(){ state.level=0; state.score=0; state.keys=0; state.answered=false; state.player={x:.5,y:.72}; questionCard.hidden=true; resultCard.hidden=true; hint.textContent='使用 WASD／方向鍵移動，走近紅色理財站按 E'; updateHud(); draw(); }

function move(){ if(state.answered||!resultCard.hidden) return; let dx=0,dy=0; if(state.keysDown.has('left'))dx-=1;if(state.keysDown.has('right'))dx+=1;if(state.keysDown.has('up'))dy-=1;if(state.keysDown.has('down'))dy+=1; const mag=Math.hypot(dx,dy)||1; state.player.x=Math.max(.05,Math.min(.95,state.player.x+dx/mag*.008)); state.player.y=Math.max(.16,Math.min(.82,state.player.y+dy/mag*.008)); const n=nearStation(); interact.hidden=!n; if(n) hint.textContent='理財互動站就在眼前，按 E 開始挑戰！'; else if(state.level===0) hint.textContent='使用 WASD／方向鍵移動，走近紅色理財站按 E'; draw(); requestAnimationFrame(move); }
const keyMap={w:'up',arrowup:'up',s:'down',arrowdown:'down',a:'left',arrowleft:'left',d:'right',arrowright:'right'};
window.addEventListener('keydown',e=>{ const k=keyMap[e.key.toLowerCase()]; if(k){e.preventDefault();state.keysDown.add(k);} if(e.key.toLowerCase()==='e'&&nearStation())openQuestion(); }); window.addEventListener('keyup',e=>{const k=keyMap[e.key.toLowerCase()];if(k)state.keysDown.delete(k);});
document.querySelectorAll('[data-key]').forEach(b=>{ const k=b.dataset.key; ['pointerdown','touchstart'].forEach(ev=>b.addEventListener(ev,e=>{e.preventDefault();state.keysDown.add(k);})); ['pointerup','pointerleave','pointercancel','touchend'].forEach(ev=>b.addEventListener(ev,()=>state.keysDown.delete(k))); });
interact.addEventListener('click',openQuestion); closeQuestion.addEventListener('click',()=>{questionCard.hidden=true;state.answered=false;}); restart.addEventListener('click',restartGame); updateHud(); move();
