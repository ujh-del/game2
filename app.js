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
  { title:'第一間｜市集小屋', prompt:'你有 20 枚心動幣，買 12 枚的果汁後還剩幾枚？', options:['6 枚','8 枚','10 枚'], correct:1, hint:'用 20 減掉 12。', lesson:'先算支出，再確認剩餘金額。' },
  { title:'第二間｜存錢小屋', prompt:'你每週有 10 枚零用錢，想存下 3 枚。四週後存了幾枚？', options:['12 枚','7 枚','13 枚'], correct:0, hint:'每週存 3 枚，連續四週。', lesson:'固定儲蓄能幫助達成目標。' },
  { title:'第三間｜投資小屋', prompt:'種子可能長成兩袋果實，也可能沒有收成。這種事情代表什麼？', options:['投資一定賺錢','投資有風險，結果不一定','投入越多一定越安全'], correct:1, hint:'想想看，種子會不會每次都長大？', lesson:'投資可能有不同結果，要先了解風險。' },
  { title:'第四間｜聰明選擇屋', prompt:'你想買 15 枚的玩具，現在有 9 枚。最好的做法是？', options:['借很多錢馬上買','先存錢，等夠了再買','把所有零用錢都交給陌生人'], correct:1, hint:'想想怎樣不用借錢，也能安全達成目標。', lesson:'設定目標、量入為出，做安全的選擇。' }
];
const houses=[{x:.16,y:.48},{x:.39,y:.35},{x:.63,y:.43},{x:.84,y:.34}];
const state = { level:0, score:0, keys:0, answered:false, awaitingNext:false, player:{x:.5,y:.72}, gate:{x:.92,y:.63}, keysDown:new Set() };

function resize(){ const dpr=Math.min(devicePixelRatio||1,2); canvas.width=canvas.clientWidth*dpr; canvas.height=canvas.clientHeight*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); draw(); }
window.addEventListener('resize', resize); resize();

function draw(){
  const w=canvas.clientWidth, h=canvas.clientHeight; ctx.clearRect(0,0,w,h);
  const sky=ctx.createLinearGradient(0,0,0,h*.62); sky.addColorStop(0,'#63bfe9'); sky.addColorStop(1,'#c5f0fa'); ctx.fillStyle=sky; ctx.fillRect(0,0,w,h);
  drawCloud(w*.16,h*.18,1.0); drawCloud(w*.72,h*.13,.72); drawCloud(w*.92,h*.30,.55);
  ctx.fillStyle='#a7d78a';ctx.beginPath();ctx.moveTo(0,h*.46);ctx.quadraticCurveTo(w*.19,h*.24,w*.39,h*.45);ctx.quadraticCurveTo(w*.63,h*.21,w*.79,h*.42);ctx.quadraticCurveTo(w*.91,h*.29,w,h*.39);ctx.lineTo(w,h*.7);ctx.lineTo(0,h*.7);ctx.fill();
  ctx.fillStyle='#72b96a';ctx.beginPath();ctx.moveTo(0,h*.54);ctx.quadraticCurveTo(w*.22,h*.38,w*.46,h*.54);ctx.quadraticCurveTo(w*.7,h*.37,w,h*.48);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fill();
  // Warm winding footpath, layered like a small isometric village scene.
  ctx.fillStyle='#c49a67';ctx.beginPath();ctx.moveTo(w*.39,h);ctx.lineTo(w*.51,h*.57);ctx.lineTo(w*.61,h*.52);ctx.lineTo(w*.55,h);ctx.fill();
  ctx.fillStyle='#d8b17b';ctx.beginPath();ctx.moveTo(w*.44,h);ctx.lineTo(w*.53,h*.58);ctx.lineTo(w*.58,h*.55);ctx.lineTo(w*.53,h);ctx.fill();
  // River with soft banks, reflections and depth.
  ctx.fillStyle='#e6e2cf';ctx.beginPath();ctx.moveTo(0,h*.68);ctx.quadraticCurveTo(w*.22,h*.61,w*.38,h*.72);ctx.quadraticCurveTo(w*.65,h*.81,w,h*.69);ctx.lineTo(w,h*.78);ctx.quadraticCurveTo(w*.65,h*.9,w*.4,h*.8);ctx.quadraticCurveTo(w*.2,h*.7,0,h*.78);ctx.fill();
  const river=ctx.createLinearGradient(0,h*.71,0,h);river.addColorStop(0,'#30b8cb');river.addColorStop(.5,'#42c9d5');river.addColorStop(1,'#168ea9');ctx.fillStyle=river;ctx.beginPath();ctx.moveTo(0,h*.7);ctx.quadraticCurveTo(w*.2,h*.64,w*.39,h*.75);ctx.quadraticCurveTo(w*.63,h*.84,w,h*.71);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fill();
  for(let i=0;i<24;i++){const x=(i*97+31)%w,y=h*(.75+(i%5)*.045);ctx.fillStyle=i%2?'rgba(214,252,239,.42)':'rgba(255,255,255,.25)';ctx.beginPath();ctx.ellipse(x,y,12+(i%4)*6,2,0,0,Math.PI*2);ctx.fill();}
  drawBridge(w*.5,h*.72,w*.42); houses.forEach((house,i)=>drawHouse(house.x*w,house.y*h,i));
  // Layered foliage frames the view and gives the scene more depth.
  drawTree(w*.035,h*.32,1.75);drawTree(w*.97,h*.3,1.8);drawTree(w*.25,h*.35,.95);drawTree(w*.72,h*.32,1.05);drawTree(w*.46,h*.28,.65);
  drawBushes(w,h);
  if(state.awaitingNext) drawGate(state.gate.x*w,state.gate.y*h);
  const px=state.player.x*w, py=state.player.y*h; drawPlayer(px,py);
}
function drawCloud(x,y,s){ ctx.fillStyle='rgba(255,255,255,.75)'; ctx.beginPath(); ctx.arc(x,y,25*s,0,7); ctx.arc(x+30*s,y-12*s,35*s,0,7); ctx.arc(x+68*s,y,24*s,0,7); ctx.fill(); }
function drawTree(x,y,s){ctx.fillStyle='rgba(29,78,55,.15)';ctx.beginPath();ctx.ellipse(x+9*s,y+70*s,54*s,13*s,0,0,7);ctx.fill();ctx.fillStyle='#80604a';ctx.fillRect(x-8*s,y+14*s,17*s,91*s);ctx.fillStyle='#245f4b';for(const [ox,oy,r] of [[0,0,39],[-28,22,32],[29,23,34],[-8,-24,31],[18,-17,27]]){ctx.beginPath();ctx.arc(x+ox*s,y+oy*s,r*s,0,7);ctx.fill();}ctx.fillStyle='#4d9c63';for(const [ox,oy,r] of [[-9,-24,22],[22,-9,19],[-28,11,18],[5,4,20]]){ctx.beginPath();ctx.arc(x+ox*s,y+oy*s,r*s,0,7);ctx.fill();}}
function drawCabin(x,y,s){ctx.fillStyle='rgba(48,63,48,.2)';ctx.beginPath();ctx.ellipse(x+5*s,y+76*s,78*s,14*s,0,0,7);ctx.fill();ctx.fillStyle='#9a493e';ctx.fillRect(x-57*s,y,x*0+114*s,72*s);ctx.fillStyle='#6d3435';ctx.beginPath();ctx.moveTo(x-70*s,y+2*s);ctx.lineTo(x-3*s,y-48*s);ctx.lineTo(x+70*s,y+2*s);ctx.lineTo(x+59*s,y+8*s);ctx.lineTo(x-3*s,y-35*s);ctx.lineTo(x-60*s,y+9*s);ctx.fill();ctx.fillStyle='#273f43';ctx.beginPath();ctx.moveTo(x-72*s,y);ctx.lineTo(x-3*s,y-51*s);ctx.lineTo(x+72*s,y);ctx.lineTo(x+66*s,y+8*s);ctx.lineTo(x-3*s,y-39*s);ctx.lineTo(x-65*s,y+9*s);ctx.fill();ctx.fillStyle='#583e38';ctx.fillRect(x-18*s,y+31*s,36*s,41*s);ctx.fillStyle='#8ed1d7';ctx.fillRect(x-44*s,y+20*s,20*s,21*s);ctx.fillRect(x+24*s,y+20*s,20*s,21*s);ctx.strokeStyle='#f0cf91';ctx.lineWidth=3*s;ctx.strokeRect(x-44*s,y+20*s,20*s,21*s);ctx.strokeRect(x+24*s,y+20*s,20*s,21*s);}
function drawBushes(w,h){for(let i=0;i<34;i++){const x=(i*137+17)%w,y=h*(.57+(i%4)*.035),r=9+(i%5)*3;ctx.fillStyle=['#2b744e','#398a52','#55a65b','#28704d'][i%4];ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.arc(x+r*.8,y-3,r*.8,0,7);ctx.arc(x-r*.7,y-2,r*.75,0,7);ctx.fill();}for(let i=0;i<12;i++){const x=(i*83+20)%w,y=h*(.59+(i%3)*.04);ctx.fillStyle='#fff5dc';ctx.beginPath();ctx.arc(x,y,3,0,7);ctx.arc(x+4,y,3,0,7);ctx.fill();ctx.fillStyle='#f6c453';ctx.beginPath();ctx.arc(x+2,y,1.5,0,7);ctx.fill();}}
function drawHouse(x,y,i){ const colors=['#c85a4c','#4c91a5','#d28b42','#8a68a8']; drawCabin(x,y,.72); ctx.fillStyle=colors[i]; ctx.fillRect(x-23,y+25,46,38); ctx.fillStyle='#fff4c2'; ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillText(`第${i+1}屋`,x,y-40);if(state.keys>i){ctx.fillStyle='#ffd45f';ctx.font='bold 17px sans-serif';ctx.fillText('🔑',x+39,y+16);} }
function drawBridge(x,y,width){ ctx.fillStyle='#8f5b37'; ctx.beginPath(); ctx.moveTo(x-width/2,y); ctx.lineTo(x+width/2,y); ctx.lineTo(x+width*.38,y+32); ctx.lineTo(x-width*.38,y+32); ctx.closePath(); ctx.fill(); ctx.strokeStyle='#e2aa65'; ctx.lineWidth=4; for(let i=0;i<8;i++){ const xx=x-width/2+i*width/7; ctx.beginPath(); ctx.moveTo(xx,y+3); ctx.lineTo(xx+10,y+28); ctx.stroke(); } }
function drawStation(x,y){ ctx.save(); ctx.translate(x,y); ctx.shadowColor='rgba(20,50,60,.22)'; ctx.shadowBlur=12; ctx.fillStyle='#d96350'; ctx.fillRect(-60,-28,120,67); ctx.shadowBlur=0; ctx.fillStyle='#ffd45f'; ctx.beginPath(); ctx.moveTo(-68,-28); for(let i=0;i<8;i++) ctx.lineTo(-68+i*19,-50+(i%2)*10); ctx.lineTo(70,-28); ctx.closePath(); ctx.fill(); ctx.fillStyle='#fff7dd'; ctx.font='bold 16px sans-serif'; ctx.textAlign='center'; ctx.fillText('理財互動站',0,0); ctx.fillStyle='#fff'; ctx.font='bold 13px sans-serif'; ctx.fillText('先想一想再決定',0,23); ctx.restore(); }
function drawGate(x,y){ ctx.save(); ctx.translate(x,y); ctx.fillStyle='rgba(20,50,60,.20)'; ctx.beginPath(); ctx.ellipse(0,35,70,12,0,0,7); ctx.fill(); ctx.fillStyle='#8f5b37'; ctx.fillRect(-48,-4,12,57); ctx.fillRect(36,-4,12,57); ctx.fillRect(-52,-8,104,11); ctx.fillStyle='#ffd45f'; ctx.font='bold 14px sans-serif'; ctx.textAlign='center'; ctx.fillText('下一關',0,-23); ctx.strokeStyle='#e2aa65'; ctx.lineWidth=8; ctx.beginPath(); ctx.moveTo(-32,12); ctx.lineTo(32,43); ctx.moveTo(32,12); ctx.lineTo(-32,43); ctx.stroke(); ctx.restore(); }
function drawPlayer(x,y){ ctx.save(); ctx.translate(x,y); ctx.fillStyle='rgba(20,50,60,.22)'; ctx.beginPath(); ctx.ellipse(0,23,23,8,0,0,7); ctx.fill(); ctx.fillStyle='#f6c453'; ctx.beginPath(); ctx.arc(0,0,18,0,7); ctx.fill(); ctx.fillStyle='#f8e6c7'; ctx.beginPath(); ctx.arc(0,-18,13,0,7); ctx.fill(); ctx.fillStyle='#3f7b9b'; ctx.fillRect(-13,-31,26,8); ctx.restore(); }

function updateHud(){ scoreText.textContent=state.score; keyText.textContent=`${state.keys} / 4`; levelText.textContent=questions[state.level].title; progressBar.style.width=`${state.keys*25}%`; }
function nearHouse(){return Math.hypot(state.player.x-houses[state.level].x,state.player.y-houses[state.level].y)<.14;}
function nearGate(){ return Math.hypot(state.player.x-state.gate.x,state.player.y-state.gate.y)<.14; }
function openQuestion(){ if(state.answered||!nearHouse())return;state.answered=true;const q=questions[state.level];questionTitle.textContent=q.title;questionPrompt.textContent=q.prompt;feedback.textContent=`提示：${q.hint}`;feedback.className='feedback';answers.innerHTML='';q.options.forEach((option,i)=>{const b=document.createElement('button');b.textContent=option;b.addEventListener('click',()=>answer(i));answers.appendChild(b);});questionCard.hidden=false; }
function answer(index){const q=questions[state.level],buttons=[...answers.children];buttons.forEach(b=>b.disabled=true);if(index===q.correct){state.score+=50;state.keys++;buttons[index].classList.add('correct');feedback.textContent=`答對了！${q.lesson} 取得一把 KEY！`;updateHud();setTimeout(()=>{questionCard.hidden=true;state.answered=false;if(state.level===3)showResult();else{state.level++;hint.textContent=`已解鎖第 ${state.level+1} 間房子！走到房子旁再按 E 或點房子作答。`;updateHud();draw();}},1100);}else{state.score=Math.max(0,state.score-10);buttons[index].classList.add('wrong');feedback.textContent=`再想想！${q.hint}（-10 分）`;feedback.className='feedback error';updateHud();setTimeout(()=>buttons.forEach(b=>b.disabled=false),500);}}
function showResult(){finalScore.textContent=state.score;resultMessage.textContent=`四間房子都探索完成，取得 ${state.keys} 把 KEY！你學會了計算、儲蓄、認識風險與做出聰明選擇。`;resultCard.hidden=false;hint.textContent='四間房子的理財任務都完成了！';}
function handleInteract(){if(nearHouse())openQuestion();}
function restartGame(){ state.level=0;state.score=0;state.keys=0;state.answered=false;state.player={x:.5,y:.72};questionCard.hidden=true;resultCard.hidden=true;hint.textContent='走到目前解鎖的房子旁，點擊房子或按 E 問問題。';updateHud();draw(); }

function move(){if(state.answered||!resultCard.hidden)return;let dx=0,dy=0;if(state.keysDown.has('left'))dx--;if(state.keysDown.has('right'))dx++;if(state.keysDown.has('up'))dy--;if(state.keysDown.has('down'))dy++;const moving=dx||dy,mag=Math.hypot(dx,dy)||1;state.player.x=Math.max(.04,Math.min(.96,state.player.x+dx/mag*.008));state.player.y=Math.max(.16,Math.min(.82,state.player.y+dy/mag*.008));interact.hidden=!nearHouse();if(nearHouse())hint.textContent=`第 ${state.level+1} 間房子就在旁邊，點擊房子或按 E 問問題！`;else if(moving)hint.textContent=`尋找第 ${state.level+1} 間房子（${state.keys}/4 把 KEY）`;draw();requestAnimationFrame(move);}
const keyMap={w:'up',arrowup:'up',s:'down',arrowdown:'down',a:'left',arrowleft:'left',d:'right',arrowright:'right'};
window.addEventListener('keydown',e=>{ const k=keyMap[e.key.toLowerCase()]; if(k){e.preventDefault();state.keysDown.add(k);} if(e.key.toLowerCase()==='e')handleInteract(); }); window.addEventListener('keyup',e=>{const k=keyMap[e.key.toLowerCase()];if(k)state.keysDown.delete(k);});
canvas.addEventListener('click',e=>{if(state.answered||!resultCard.hidden)return;const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height,target=houses[state.level];if(Math.hypot(x-target.x,y-target.y)<.12&&Math.hypot(state.player.x-target.x,state.player.y-target.y)<.14){openQuestion();return;}state.player={x,y:Math.max(.16,Math.min(.82,y))};interact.hidden=!nearHouse();hint.textContent=nearHouse()?'已到房子旁，點擊房子或按 E 問問題！':'走到目前解鎖的房子旁，才能問問題。';draw();});
document.querySelectorAll('[data-key]').forEach(b=>{ const k=b.dataset.key; ['pointerdown','touchstart'].forEach(ev=>b.addEventListener(ev,e=>{e.preventDefault();state.keysDown.add(k);})); ['pointerup','pointerleave','pointercancel','touchend'].forEach(ev=>b.addEventListener(ev,()=>state.keysDown.delete(k))); });
interact.addEventListener('click',handleInteract); closeQuestion.addEventListener('click',()=>{questionCard.hidden=true;state.answered=false;}); restart.addEventListener('click',restartGame); updateHud(); move();
