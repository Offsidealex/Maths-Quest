
  (()=>{
    'use strict';
    const scene=document.getElementById('scene');
    const sceneArea=document.getElementById('sceneArea');
    const zoomButton=document.getElementById('zoom');
    const ratio=1660/947;
    let isZoomed=false;
    function fitScene(){
      const cs=getComputedStyle(sceneArea);
      const width=sceneArea.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
      const height=sceneArea.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);
      if(width<=0||height<=0)return;
      const w=isZoomed?Math.max(760,width):Math.min(width,height*ratio);
      scene.style.width=w+'px';
      scene.style.height=(w/ratio)+'px';
    }
    zoomButton.addEventListener('click',()=>{
      isZoomed=!isZoomed;
      sceneArea.classList.toggle('zoomed',isZoomed);
      zoomButton.setAttribute('aria-pressed',String(isZoomed));
      zoomButton.textContent=isZoomed?'⊟ Voir toute la carte':'⌕ Agrandir la carte';
      fitScene();
      sceneArea.scrollLeft=0;sceneArea.scrollTop=0;
    });
    new ResizeObserver(fitScene).observe(sceneArea);
    window.addEventListener('resize',fitScene);
    if(window.visualViewport)window.visualViewport.addEventListener('resize',fitScene);
    document.addEventListener('fullscreenchange',()=>requestAnimationFrame(fitScene));
    fitScene();
    const hero=document.getElementById('hero');
    const heroAngles=Array.from(document.getElementById('heroAngles').content.querySelectorAll('img'),img=>img.src);
    const heroIdle=Array.from(document.getElementById('heroIdle').content.querySelectorAll('img'),img=>img.src);
    heroIdle.forEach(src=>{const frame=new Image();frame.src=src;});
    const facingNames=['est','sud-est','sud','sud-ouest','ouest','nord-ouest','nord','nord-est'];
    let facingFrame=0;
    const directionArtwork=[0,1,2,3,4,7,6,5];
    let heroFacing=6;
    function faceHero(direction,step=1){
      const url=heroAngles[(step%4)*8+directionArtwork[direction]];
      heroFacing=direction;
      hero.style.transform=step%4===3?'scaleX(-1)':'';
      if(hero.src!==url)hero.src=url;
      hero.dataset.facing=facingNames[direction];
    }
    heroAngles.forEach(src=>{const frame=new Image();frame.src=src;});
    function settleHero(){
      hero.style.transform='';
      hero.src=heroIdle[heroFacing];
      hero.dataset.facing=facingNames[heroFacing];
    }
    const landmarkFacing={1:6,2:5,3:7,4:1};
    function pauseAtCircle(id,stage=null){
      if(Object.hasOwn(landmarkFacing,stage))heroFacing=landmarkFacing[stage];
      settleHero();
      return new Promise(resolve=>setTimeout(()=>resolve(id===tripId),650));
    }
    faceHero(6);settleHero();
    function lookAlongPath(path,progress,step=1){
      const t=Math.max(0,Math.min(progress,.999999));
      let i=0;while(i<path.length-2&&t>=path[i+1].offset)i++;
      const dx=(parseFloat(path[i+1].left)-parseFloat(path[i].left))*1660;
      const dy=(parseFloat(path[i+1].top)-parseFloat(path[i].top))*947;
      if(Math.abs(dx)+Math.abs(dy)<.001)return;
      const direction=(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8;
      faceHero(direction,step);
    }
    function followFacing(path,duration){
      cancelAnimationFrame(facingFrame);
      const active=animation;
      function tick(){
        if(animation!==active||!active||!hero.classList.contains('walking'))return;
        const time=Number(active.currentTime)||0;
        lookAlongPath(path,time/duration,Math.floor(time/115));
        facingFrame=requestAnimationFrame(tick);
      }
      tick();
    }
    const play=document.getElementById('startQuest');
    const reset=document.getElementById('reset');
    const mobileStart=document.getElementById('startMobile');
    const message=document.getElementById('message');
    const arrival=document.getElementById('arrival');
    const oath=document.getElementById('oath');
    const acceptOath=document.getElementById('acceptOath');
    function fitOath(){
      if(oath.hidden)return;
      oath.style.scale='1';
      const rect=oath.getBoundingClientRect();
      const mobile=window.matchMedia('(max-width:700px)').matches;
      const bounds=mobile?{right:window.innerWidth-8,bottom:window.innerHeight-8}:scene.getBoundingClientRect();
      const toolbar=document.querySelector('.toolbar').getBoundingClientRect();
      const bottom=mobile&&toolbar.top>rect.top?Math.min(bounds.bottom,toolbar.top-8):bounds.bottom-8;
      const factor=Math.min(1,Math.max(1,bottom-rect.top)/oath.offsetHeight,Math.max(1,bounds.right-rect.left-8)/oath.offsetWidth);
      oath.style.scale=String(factor);
    }
    new ResizeObserver(()=>requestAnimationFrame(fitOath)).observe(scene);
    new ResizeObserver(()=>requestAnimationFrame(fitOath)).observe(oath);
    window.addEventListener('resize',()=>requestAnimationFrame(fitOath));
    if(window.visualViewport)window.visualViewport.addEventListener('resize',()=>requestAnimationFrame(fitOath));

    // v0.3.29 : une scène illustrée de face, distincte de la carte et de l'exercice.
    const transition=document.getElementById('trialTransition');
    const transitionArea=document.getElementById('transitionArea');
    const transitionViewport=document.getElementById('transitionViewport');
    const transitionStart=document.getElementById('transitionStart');
    const transitionZoom=document.getElementById('transitionZoom');
    const transitionBack=document.getElementById('transitionBack');
    let transitionIsZoomed=false;
    let currentStage=1;
    // Each future challenge registers its ID, legacy save key and next route here.
    const challenges=[
      {stage:1,id:'tables',legacyKey:'maths-quest-mult-v0.3',next:2,move:()=>continueToSecond()},
      {stage:2,id:'relatifs',legacyKey:'maths-quest-add-rel-v0.3',next:3,move:()=>continueToThird()},
      {stage:3,id:'fractions',legacyKey:'maths-quest-frac-equiv-v0.3',next:4,move:()=>continueToBridge()}
    ];
    const PROGRESS_KEY='maths-quest-completed-challenges-v1';
    const completedChallenges=new Set();
    try{
      const saved=JSON.parse(localStorage.getItem(PROGRESS_KEY)||'[]');
      if(Array.isArray(saved))saved.filter(id=>typeof id==='string').forEach(id=>completedChallenges.add(id));
    }catch(e){}
    for(const challenge of challenges){
      try{if(challenge.legacyKey&&localStorage.getItem(challenge.legacyKey)==='passed')completedChallenges.add(challenge.id)}catch(e){}
    }
    function isChallengeCompleted(stage=currentStage){
      const challenge=challenges.find(item=>item.stage===stage);
      return !!challenge&&completedChallenges.has(challenge.id);
    }
    function markChallengeCompleted(stage){
      const challenge=challenges.find(item=>item.stage===stage);if(!challenge)return;
      completedChallenges.add(challenge.id);
      try{localStorage.setItem(window.MQAccount?.progressKey()||PROGRESS_KEY,JSON.stringify([...completedChallenges]));if(!window.MQAccount?.accountId()&&challenge.legacyKey)localStorage.setItem(challenge.legacyKey,'passed')}catch(e){}
    }
    function skipCompletedChallenge(){
      const challenge=challenges.find(item=>item.stage===currentStage);
      if(!challenge||!isChallengeCompleted()||!challenge.next||!challenge.move)return;
      challenge.move();
    }
    function updateChallengeChoices(){
      const challenge=challenges.find(item=>item.stage===currentStage);
      const done=isChallengeCompleted();
      const canSkip=done&&!!challenge?.next&&!!challenge?.move;
      transition.classList.toggle('completed',done);
      document.getElementById('skipCompletedTrial').hidden=!canSkip;
      transition.classList.toggle('can-skip',canSkip);
      const label=done?'Rejouer':'⚔ Commencer le défi';
      transitionStart.textContent=done?'Rejouer':'';
      transitionStart.title=label;
      transitionStart.setAttribute('aria-label',label);
    }
    document.getElementById('skipCompletedTrial').addEventListener('click',skipCompletedChallenge);
    const nextTrial=document.getElementById('nextTrial');
    const relativeIntro=document.getElementById('relativeIntro');
    const transitionImage=document.querySelector('.transition-image');
    const tableArt=transitionImage.src,tableAlt=transitionImage.alt;
    const relativeArt=document.getElementById('relativeArt').content.querySelector('img');
    const fractionArt=document.getElementById('fractionArt').content.querySelector('img');
    const stageTitles={1:'Tables de multiplication',2:'Additions de relatifs',3:'Fractions équivalentes'};
    const mapSource=document.querySelector('.scene-image').src;
    document.getElementById('relativeStart').addEventListener('click',launchFromTransition);
    document.getElementById('relativeBack').addEventListener('click',returnFromTransition);
    nextTrial.addEventListener('click',()=>currentStage===4?returnFromBridge():skipCompletedChallenge());

    function fitTransition(){
      const css=getComputedStyle(transitionArea);
      const w=transitionArea.clientWidth-parseFloat(css.paddingLeft)-parseFloat(css.paddingRight);
      const h=transitionArea.clientHeight-parseFloat(css.paddingTop)-parseFloat(css.paddingBottom);
      if(w<=0||h<=0)return;
      const ratio=1672/941;
      const fit=transitionIsZoomed?Math.max(1100,w):Math.min(w,h*ratio);
      transitionViewport.style.width=fit+'px';
      transitionViewport.style.height=(fit/ratio)+'px';
    }
    // Fullscreen must contain the map, transitions and quiz together.
    async function toggleAppFullscreen(){
      try{
        if(document.fullscreenElement)await document.exitFullscreen();
        else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();
      }catch(e){message.textContent='Le plein écran n’est pas disponible dans ce navigateur.';}
    }
    function releasePartialFullscreen(resume){
      const active=document.fullscreenElement;
      if(!active||active===document.documentElement)return false;
      const stage=currentStage,trip=tripId;
      document.exitFullscreen().then(()=>{
        if(stage===currentStage&&trip===tripId)resume();
      }).catch(()=>{message.textContent='Le navigateur n’a pas pu changer le mode plein écran.';});
      return true;
    }
    function showTransition(){
      if(releasePartialFullscreen(showTransition))return;
      if(currentStage<1||currentStage>3)return;
      arrival.hidden=true;oath.hidden=true;
      transition.classList.toggle('relatives',currentStage===2);
      relativeIntro.hidden=true;
      transitionImage.src=currentStage===3?fractionArt.src:currentStage===2?relativeArt.src:tableArt;
      transitionImage.alt=currentStage===3?fractionArt.alt:currentStage===2?relativeArt.alt:tableAlt;
      transitionViewport.style.backgroundImage='';
      transitionStart.setAttribute('aria-label','Commencer le défi : '+stageTitles[currentStage]);
      transition.setAttribute('aria-label',stageTitles[currentStage]);
      updateChallengeChoices();
      transition.hidden=false;
      transition.classList.toggle('passed',passed);
      requestAnimationFrame(fitTransition);
      // Large, accessible button beneath the scene on narrow screens.
      requestAnimationFrame(()=>{
        transitionStart.focus({preventScroll:true});
      });
    }
    function hideTransition(){transition.hidden=true;}
    function returnFromTransition(){
      hideTransition();
      arrival.hidden=false;
      document.getElementById('startTrial').textContent='Voir le camp d’entraînement';
      updateArrival();
    }
    function replayFromTransition(){
      hideTransition();backToStart();start();
    }
    function toggleTransitionZoom(){
      transitionIsZoomed=!transitionIsZoomed;
      transitionArea.classList.toggle('zoomed',transitionIsZoomed);
      transitionZoom.setAttribute('aria-pressed',String(transitionIsZoomed));
      transitionZoom.setAttribute('aria-label',transitionIsZoomed?'Afficher tout le décor':'Agrandir le décor du défi');
      fitTransition();transitionArea.scrollTop=0;transitionArea.scrollLeft=0;
    }
    function launchFromTransition(){hideTransition();showQuiz();}
    transitionStart.addEventListener('click',launchFromTransition);
    transitionBack.addEventListener('click',returnFromTransition);
    document.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&!transition.hidden&&!document.fullscreenElement) returnFromTransition();
    });
    document.getElementById('transitionBackMobile').addEventListener('click',returnFromTransition);
    document.getElementById('transitionReplay').addEventListener('click',replayFromTransition);
    transitionZoom.addEventListener('click',toggleTransitionZoom);
    document.getElementById('transitionFullscreen').addEventListener('click',toggleAppFullscreen);
    new ResizeObserver(fitTransition).observe(transitionArea);
    window.addEventListener('resize',fitTransition);
    document.addEventListener('fullscreenchange',()=>requestAnimationFrame(fitTransition));

    const levelTwoScreen=document.getElementById('levelTwoScreen');
    const levelTwoStage=document.getElementById('levelTwoStage');
    const levelTwoScene=document.getElementById('levelTwoScene');
    const levelTwoHero=document.getElementById('levelTwoHero');
    const levelTwoStatus=document.getElementById('levelTwoStatus');
    let levelTwoFrame=0,levelTwoDoorTimer=null,levelTwoFinishTimer=null;
    levelTwoHero.src=heroIdle[6];
    function fitLevelTwo(){
      const css=getComputedStyle(levelTwoStage);
      const w=levelTwoStage.clientWidth-parseFloat(css.paddingLeft)-parseFloat(css.paddingRight);
      const h=levelTwoStage.clientHeight-parseFloat(css.paddingTop)-parseFloat(css.paddingBottom);
      if(w<=0||h<=0)return;
      const width=Math.min(w,h*1672/941);levelTwoScene.style.width=width+'px';levelTwoScene.style.height=width*941/1672+'px';
    }
    function clearLevelTwoAnimation(){cancelAnimationFrame(levelTwoFrame);clearTimeout(levelTwoDoorTimer);clearTimeout(levelTwoFinishTimer);levelTwoFrame=0;}
    function finishLevelTwoEntrance(){
      clearLevelTwoAnimation();if(levelTwoScreen.hidden)return;
      levelTwoScene.classList.remove('playing');levelTwoScene.classList.add('gate-open','arrived');
      levelTwoHero.src=heroIdle[6];levelTwoHero.style.transform='';
      levelTwoStatus.textContent='La grande porte est ouverte. Bienvenue au niveau 2 !';
      document.getElementById('levelTwoSkip').hidden=true;document.getElementById('levelTwoReplay').hidden=false;document.getElementById('courtEnter').hidden=false;
    }
    function playLevelTwoEntrance(){
      if(levelTwoScreen.hidden)return;clearLevelTwoAnimation();
      levelTwoScene.classList.remove('playing','gate-open','arrived');
      levelTwoHero.src=heroIdle[6];levelTwoHero.style.transform='';
      document.getElementById('levelTwoSkip').hidden=false;document.getElementById('levelTwoReplay').hidden=true;document.getElementById('courtEnter').hidden=true;
      levelTwoStatus.textContent='Le héros s’avance sur le pont…';
      if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){finishLevelTwoEntrance();return}
      void levelTwoScene.offsetWidth;levelTwoScene.classList.add('playing');
      const started=performance.now();
      function step(){
        if(levelTwoScreen.hidden)return;
        const elapsed=performance.now()-started;
        if(elapsed>=7000){levelTwoHero.src=heroIdle[6];levelTwoHero.style.transform='';return}
        const phase=Math.floor(elapsed/115)%4;levelTwoHero.src=heroAngles[phase*8+6];levelTwoHero.style.transform=phase===3?'scaleX(-1)':'';
        levelTwoFrame=requestAnimationFrame(step);
      }
      step();
      levelTwoDoorTimer=setTimeout(()=>{if(!levelTwoScreen.hidden){levelTwoScene.classList.add('gate-open');levelTwoStatus.textContent='La grande porte s’ouvre devant lui…';}},3200);
      levelTwoFinishTimer=setTimeout(finishLevelTwoEntrance,7200);
    }
    function showLevelTwoEntrance(){
      if(!isChallengeCompleted(3)||currentStage!==4)return;
      if(releasePartialFullscreen(showLevelTwoEntrance))return;
      hideTransition();arrival.hidden=true;oath.hidden=true;levelTwoScreen.hidden=false;
      requestAnimationFrame(fitLevelTwo);playLevelTwoEntrance();document.getElementById('levelTwoBack').focus({preventScroll:true});
    }
    function hideLevelTwoEntrance(){
      clearLevelTwoAnimation();levelTwoScreen.hidden=true;levelTwoScene.classList.remove('playing','gate-open','arrived');
      levelTwoHero.src=heroIdle[6];levelTwoHero.style.transform='';
    }
    function returnToBridge(){hideLevelTwoEntrance();arrival.hidden=false;updateArrival();startTrial.focus({preventScroll:true});}
    document.getElementById('levelTwoBack').addEventListener('click',returnToBridge);
    document.getElementById('levelTwoReplay').addEventListener('click',playLevelTwoEntrance);
    document.getElementById('levelTwoSkip').addEventListener('click',finishLevelTwoEntrance);
    document.getElementById('levelTwoFullscreen').addEventListener('click',toggleAppFullscreen);
    new ResizeObserver(fitLevelTwo).observe(levelTwoStage);window.addEventListener('resize',()=>requestAnimationFrame(fitLevelTwo));
    document.addEventListener('fullscreenchange',()=>requestAnimationFrame(fitLevelTwo));
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!levelTwoScreen.hidden&&!document.fullscreenElement)returnToBridge();});

    const origin={left:'10.96%',top:'67.05%'};
    const destination={left:'24.02%',top:'51.85%'};
    const firstTrial={left:'30.40%',top:'33.65%'};
    let animation=null,tripId=0;
    const steps=[
      {offset:0,...origin},
      {offset:.23,left:'14.1%',top:'62.9%'},
      {offset:.49,left:'17.8%',top:'59.1%'},
      {offset:.76,left:'21.5%',top:'55.4%'},
      {offset:1,...destination}
    ];
    function stop(){cancelAnimationFrame(facingFrame);tripId++;if(animation){animation.cancel();animation=null;}hero.classList.remove('walking');settleHero();}
    function backToStart(){hideLevelTwoEntrance();faceHero(6);startTrial.disabled=false;currentStage=1;nextTrial.hidden=true;hideTransition();stop();hero.style.left=origin.left;hero.style.top=origin.top;
      oath.hidden=true;arrival.hidden=true;play.hidden=false;mobileStart.hidden=false;
      play.disabled=false;mobileStart.disabled=false;mobileStart.textContent='▶ Commencer la quête';play.setAttribute('aria-label','Commencer la quête et avancer jusqu’au premier cercle lumineux');
      message.innerHTML='Le héros attend sous le porche. Clique sur <b>Commencer la quête</b>.';}
    async function start(){
      stop();const id=tripId;
      hero.style.left=origin.left;hero.style.top=origin.top;
      oath.hidden=true;arrival.hidden=true;play.hidden=true;mobileStart.hidden=true;
      play.disabled=true;mobileStart.disabled=true;
      message.textContent='Le héros suit le chemin vers les tables de multiplication…';
      if(window.matchMedia('(prefers-reduced-motion: reduce)').matches || !hero.animate){
        lookAlongPath(steps,1);hero.style.left=destination.left;hero.style.top=destination.top;
        finish(id);return;
      }
      hero.classList.add('walking');
      animation=hero.animate(steps,{duration:4600,easing:'linear',fill:'forwards'});followFacing(steps,4600);
      try{await animation.finished;}catch(e){return;}
      if(id!==tripId)return;
      lookAlongPath(steps,1);hero.style.left=destination.left;hero.style.top=destination.top;
      animation.cancel();animation=null;
      finish(id);
    }
    async function finish(id){
      if(id!==tripId)return;
      hero.classList.remove('walking');settleHero();
      if(!await pauseAtCircle(id))return;
      // Premier cercle du parcours : halte obligatoire, lecture des règles.
      oath.hidden=false;
      fitOath();requestAnimationFrame(fitOath);
      acceptOath.focus({preventScroll:true});
      message.innerHTML='Le héros fait halte au <b>premier cercle</b>. Écoute le serment de l’Académie avant de rejoindre les tables de multiplication.';
    }
    async function continueQuest(){
      if(oath.hidden)return;
      stop();const id=tripId;
      oath.hidden=true;arrival.hidden=true;
      play.disabled=true;mobileStart.disabled=true;
      hero.style.left=destination.left;hero.style.top=destination.top;
      message.textContent='L’aventurier rejoint la première épreuve : Tables de multiplication…';
      const nextSteps=[
        {offset:0,...destination},
        {offset:.32,left:'26.1%',top:'46.6%'},
        {offset:.67,left:'28.6%',top:'39.5%'},
        {offset:1,...firstTrial}
      ];
      if(window.matchMedia('(prefers-reduced-motion: reduce)').matches || !hero.animate){
        lookAlongPath(nextSteps,1);hero.style.left=firstTrial.left;hero.style.top=firstTrial.top;
        finishTrial(id);return;
      }
      hero.classList.add('walking');
      animation=hero.animate(nextSteps,{duration:2800,easing:'linear',fill:'forwards'});followFacing(nextSteps,2800);
      try{await animation.finished;}catch(e){return;}
      if(id!==tripId)return;
      lookAlongPath(nextSteps,1);hero.style.left=firstTrial.left;hero.style.top=firstTrial.top;
      animation.cancel();animation=null;
      finishTrial(id);
    }
    async function continueToSecond(){
      if(!passed)return;
      hideTransition();stop();const id=tripId;currentStage=2;
      arrival.hidden=true;nextTrial.hidden=true;oath.hidden=true;
      hero.style.left=firstTrial.left;hero.style.top=firstTrial.top;
      message.textContent='Le héros rejoint la deuxième épreuve : Additions de relatifs…';
      const target={left:'49.5%',top:'32.4%'};
      const path=[{offset:0,...firstTrial},{offset:.35,left:'37%',top:'33.3%'},{offset:.7,left:'44%',top:'32.9%'},{offset:1,...target}];
      if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches&&hero.animate){
        hero.classList.add('walking');animation=hero.animate(path,{duration:3300,easing:'linear',fill:'forwards'});followFacing(path,3300);
        try{await animation.finished}catch(e){return}if(id!==tripId)return;
        animation.cancel();animation=null;
      }
      lookAlongPath(path,1);hero.style.left=target.left;hero.style.top=target.top;hero.classList.remove('walking');settleHero();
      message.textContent='Deuxième épreuve atteinte : Additions de relatifs.';
      if(!await pauseAtCircle(id,2))return;
      showTransition();
    }
    const fractionPath=[
      {offset:0,left:'49.5%',top:'32.4%'},
      {offset:.2,left:'50.8%',top:'38%'},
      {offset:.4,left:'53%',top:'43.4%'},
      {offset:.63,left:'57.5%',top:'47.6%'},
      {offset:.84,left:'62%',top:'49.5%'},
      {offset:1,left:'64.5%',top:'48.8%'}
    ];
    async function travelFractionPath(reverse=false){
      if(!secondPassed)return;
      hideTransition();stop();const id=tripId;
      arrival.hidden=true;nextTrial.hidden=true;oath.hidden=true;
      const path=reverse?fractionPath.slice().reverse().map(p=>({...p,offset:1-p.offset})):fractionPath;
      const target=path[path.length-1];currentStage=reverse?2:3;
      message.textContent=reverse?'Le héros revient vers les relatifs…':'Le héros tourne et descend vers les fractions…';
      if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches&&hero.animate){
        hero.classList.add('walking');animation=hero.animate(path,{duration:4500,easing:'linear',fill:'forwards'});followFacing(path,4500);
        try{await animation.finished}catch(e){return}if(id!==tripId)return;
        animation.cancel();animation=null;
      }
      lookAlongPath(path,1);hero.style.left=target.left;hero.style.top=target.top;hero.classList.remove('walking');settleHero();
      if(!await pauseAtCircle(id,currentStage))return;
      if(!reverse){showTransition();return}
      arrival.hidden=false;updateArrival();nextTrial.focus({preventScroll:true});
    }
    function continueToThird(){return travelFractionPath(false)}
    function returnToSecond(){return travelFractionPath(true)}
    // The bridge path follows the paving around the left end of the low wall.
    const bridgeFeet=[[1107,579],[1090,603],[1070,617],[1055,629],[1065,649],[1086,660],[1101,669],[1140,692],[1179,715],[1195,731],[1222,758],[1250,781],[1290,804]];
    const bridgeDistances=bridgeFeet.map((p,i)=>i?Math.hypot(p[0]-bridgeFeet[i-1][0],p[1]-bridgeFeet[i-1][1]):0);
    const bridgeLength=bridgeDistances.reduce((a,b)=>a+b,0);
    let bridgeCovered=0;
    const bridgePath=bridgeFeet.map((p,i)=>{bridgeCovered+=bridgeDistances[i];return {offset:bridgeCovered/bridgeLength,left:(p[0]/1660*100-2.17)+'%',top:(p[1]/947*100-12.15)+'%'}});
    bridgePath[0]={offset:0,left:'64.5%',top:'48.8%'};
    async function travelBridge(reverse=false){
      if(!isChallengeCompleted(3))return;
      hideTransition();stop();const id=tripId;
      arrival.hidden=true;nextTrial.hidden=true;oath.hidden=true;
      const path=reverse?bridgePath.slice().reverse().map(p=>({...p,offset:1-p.offset})):bridgePath;
      const target=path[path.length-1];currentStage=reverse?3:4;
      message.textContent=reverse?'Le héros revient vers la fontaine des fractions…':'Le héros contourne le muret et rejoint le cercle du pont…';
      if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches&&hero.animate){
        hero.classList.add('walking');animation=hero.animate(path,{duration:6000,easing:'linear',fill:'forwards'});followFacing(path,6000);
        try{await animation.finished}catch(e){return}if(id!==tripId)return;
        animation.cancel();animation=null;
      }
      lookAlongPath(path,1);hero.style.left=target.left;hero.style.top=target.top;hero.classList.remove('walking');settleHero();
      if(!await pauseAtCircle(id,currentStage))return;
      if(reverse){showTransition();return}
      showLevelTwoEntrance();
    }
    function continueToBridge(){return travelBridge(false)}
    function returnFromBridge(){hideLevelTwoEntrance();return travelBridge(true)}
    function updateArrival(){
      arrival.append(nextTrial);startTrial.disabled=false;
      if(currentStage===4){
        arrival.style.left='49%';arrival.style.top='66%';
        arrival.querySelector('.arrival-heading').textContent='🏆 Premier niveau terminé !';
        arrival.querySelector('strong').textContent='Entrée du niveau 2';
        arrival.querySelector('small').textContent='La grande porte t’attend de l’autre côté du pont.';
        startTrial.textContent='Entrer dans le niveau 2';startTrial.disabled=false;
        nextTrial.hidden=false;nextTrial.textContent='← Revenir aux fractions';nextTrial.setAttribute('aria-label','Revenir aux fractions');
        message.textContent='Les trois défis sont validés ! Le héros a atteint le dernier cercle, sur le pont.';return;
      }
      arrival.style.left=currentStage===3?'40%':currentStage===2?'57%':'';
      arrival.style.top=currentStage===3?'62%':currentStage===2?'30%':'';
      arrival.querySelector('.arrival-heading').textContent=isChallengeCompleted()?'🏆 Défi déjà validé !':'⚔ Épreuve atteinte !';
      arrival.querySelector('strong').textContent=stageTitles[currentStage];
      arrival.querySelector('small').textContent='10 questions · '+(currentStage===3?'30':'10')+' secondes chacune';
      startTrial.textContent='Voir le défi';nextTrial.hidden=!isChallengeCompleted();
      nextTrial.textContent='Passer le défi →';nextTrial.setAttribute('aria-label','Passer le défi déjà validé');
      message.textContent='Le héros est devant '+stageTitles[currentStage]+'.';
    }
    async function finishTrial(id){
      if(id!==tripId)return;
      hero.classList.remove('walking');settleHero();
      arrival.hidden=true;
      if(passed){arrival.querySelector('.arrival-heading').textContent='🏆 Épreuve remportée !';arrival.querySelector('strong').textContent='Tables de multiplication : validées';arrival.querySelector('small').textContent='La voie suivante est débloquée';startTrial.textContent='↻ Rejouer les tables';}
      // Après le départ, le bouton de quête ne revient pas :
      // « Retour au départ » permet de recommencer le parcours.
      play.hidden=true;mobileStart.hidden=true;
      message.innerHTML='Le héros est arrivé devant <b>Tables de multiplication</b>. Clique sur <b>Commencer le défi</b>.';
      if(!await pauseAtCircle(id,1))return;
      showTransition();
    }
    acceptOath.addEventListener('click',continueQuest);
    play.addEventListener('click',start);
    mobileStart.addEventListener('click',start);
    reset.addEventListener('click',backToStart);

    /* V0.3 : module mult repris d'Activités mentales (tables 2 à 9, 10 questions aléatoires
       distinctes, 10 s par question). L'interface est locale, sans appel réseau. */
    const quizScreen=document.getElementById('quizScreen');
    const startTrial=document.getElementById('startTrial');
    const questionArea=document.getElementById('quizQuestions');
    const resultsArea=document.getElementById('quizResults');
    const qForm=document.getElementById('quizForm');
    const qInput=document.getElementById('quizAnswer');
    const qSubmit=document.getElementById('quizSubmit');
    const qFeedback=document.getElementById('quizFeedback');
    const qProgress=document.getElementById('quizProgressFill');
    const qScore=document.getElementById('quizScore');
    const qLabel=document.getElementById('questionLabel');
    const qOperation=document.getElementById('quizOperation');
    const qTimerNum=document.getElementById('quizTimerNumber');
    const qTimerArc=document.getElementById('quizTimerArc');
    const STORAGE='maths-quest-mult-v0.3';
    let questions=[],questionIndex=0,correct=0,completed=false,quizActive=false;
    let quizTimer=null,advanceTimer=null,deadline=0,totalSpentMs=0,lastQuestionStarted=0,answers=[];
    let sessionToken=0,quizAccount=null;
    const CIRC=2*Math.PI*27;
    let passed=isChallengeCompleted(1),secondPassed=isChallengeCompleted(2);
    let questionTime=10000;
    function shuffle(a){for(let i=a.length-1;i>0;i--){const j=0|Math.random()*(i+1);[a[i],a[j]]=[a[j],a[i]]}}
    function generateTables(){
      // Identique au générateur MODULES.mult d'Activités mentales.
      const pool=[];
      for(let a=2;a<=9;a++)for(let b=2;b<=9;b++)pool.push({a,b,answer:a*b});
      shuffle(pool);return pool.slice(0,10);
    }
// Source : Offsidealex/Activites_mentales, index.html, blob 535d121d101d3e1bddaa44c82d0a3f0c6100e6de
function generateRelatives(level){
  const rand=(min,max)=>Math.floor(Math.random()*(max-min+1))+min;
  const signed=(min,max)=>{const n=rand(min,max);return Math.random()<.5?-n:n;};
  const fmt=n=>n<0?'('+String(n).replace('-','−')+')':String(n);
  const minus=n=>n<0?'− '+fmt(-n):'+ '+fmt(n);
  const questions=[],seen=new Set();
  let tries=0;
  while(questions.length<10 && tries++<1000){
    let html,ans,a,b,c;
    if(level==='add'){
      a=signed(1,45);b=signed(1,45);html=fmt(a)+' + '+fmt(b);ans=a+b;
    }else if(level==='mult'){
      a=signed(2,12);b=signed(2,12);html=fmt(a)+' × '+fmt(b);ans=a*b;
    }else if(level==='sub'){
      a=signed(1,50);b=signed(1,50);html=fmt(a)+' − '+fmt(b);ans=a-b;
    }else if(level==='chain'){
      a=signed(1,40);b=signed(1,30);c=signed(1,30);
      const first=Math.random()<.5,second=Math.random()<.5;
      html=fmt(a)+(first?' + ':' − ')+fmt(b)+(second?' + ':' − ')+fmt(c);
      ans=a+(first?b:-b)+(second?c:-c);
    }else{
      a=signed(2,40);b=signed(2,10);c=signed(2,10);
      const first=Math.random()<.5,second=Math.random()<.5;
      if(first){
        html=fmt(a)+(second?' + ':' − ')+fmt(b)+' × '+fmt(c);
        ans=a+(second?1:-1)*b*c;
      }else{
        html=fmt(a)+' × '+fmt(b)+(second?' + ':' − ')+fmt(c);
        ans=a*b+(second?c:-c);
      }
    }
    if(seen.has(html))continue;
    seen.add(html);questions.push({html,ans});
  }
  return questions;
}

    // Exact fraction question pool from Offsidealex/Activites_mentales MODULES.frac_equiv (30 s).
    function generateEquivalentFractions(){
      const F=(n,d)=>'<span class="fr"><span class="n">'+n+'</span><span class="d">'+d+'</span></span>';
      const pool=[[1, 2, 4, 2], [1, 5, 10, 2], [4, 5, 10, 8], [6, 2, 4, 12], [7, 8, 16, 14], [6, 7, 14, 12], [3, 8, 24, 9], [5, 6, 30, 25], [12, 5, 30, 72], [12, 6, 36, 72], [15, 8, 40, 75], [12, 7, 21, 36], [4, 6, 48, 32], [5, 6, 42, 35], [14, 12, 24, 28], [15, 11, 22, 30], [11, 9, 72, 88], [12, 9, 81, 108], [6, 8, 56, 42], [8, 7, 56, 64]].map(([n,d,target,answer])=>({html:F(n,d)+' = '+F('<span class="blk">?</span>',target),text:n+'/'+d+' = ?/'+target,answer,n,d,target}));
      shuffle(pool);return pool.slice(0,10);
    }
    function operation(q){return q.text||q.html||q.a+' × '+q.b;}
    function stopQuizTimers(){clearInterval(quizTimer);clearTimeout(advanceTimer);quizTimer=null;advanceTimer=null}
    function setMapStatus(){
      document.getElementById('questDone').hidden=!passed;
      document.getElementById('questDone2').hidden=!secondPassed;
      document.getElementById('questDone3').hidden=!isChallengeCompleted(3);
      const count=challenges.filter(challenge=>challenge.stage<=3&&isChallengeCompleted(challenge.stage)).length;
      const total=3;
      document.getElementById('mapCounter').hidden=false;
      document.querySelectorAll('.quest-progress').forEach(bar=>{
        bar.setAttribute('aria-valuenow',String(count));bar.setAttribute('aria-valuemax',String(total));
        bar.setAttribute('aria-valuetext',count+' défis validés sur '+total);
        bar.querySelector('.quest-progress-fill').style.width=(count/total*100)+'%';
      });
      document.getElementById('mapCounter').textContent=count+' / '+total+' défis validés';
      document.getElementById('transitionRecap').textContent=count+' / '+total+' défis validés ✓';
      updateCourtStatus();
    }
    function showQuiz(){
      if(releasePartialFullscreen(showQuiz))return;
      if(!challenges.some(item=>item.stage===currentStage)||(currentStage===5&&!isChallengeCompleted(3)&&!levelTwoDirectAccess)||(currentStage===12&&!levelThreeDirectAccess&&!worldTwo.modules.every((_,i)=>isChallengeCompleted(i+5)))||(currentStage>1&&currentStage!==5&&currentStage!==12&&!isChallengeCompleted(currentStage-1)))return;
      hideTransition();courtTrial.hidden=true;stopQuizTimers();sessionToken++;closeCalculator();resetCalculator();calcToggle.hidden=!calculatorAvailable();document.getElementById('calculatorHint').textContent=currentStage===7?'Étendue = maximum − minimum.':currentStage===14?'Arrondis le résultat au dixième.':'Pour un carré, multiplie le nombre par lui-même.';
      quizAccount=window.MQAccount?.accountId()||null;
      questions=currentStage>=5?courtModule().gen().map(q=>({...q,answer:q.ans})):currentStage===3?generateEquivalentFractions():currentStage===2?generateRelatives('add').map(q=>({...q,answer:q.ans})):generateTables();
      questionTime=currentStage>=5?courtModule().time*1000:currentStage===3?30000:10000;questionIndex=0;correct=0;answers=[];totalSpentMs=0;
      const title=stageTitles[currentStage];
      document.querySelector('.quiz-brand small').textContent="L’Académie des Nombres · Niveau "+(currentStage>=12?'3':currentStage>=5?'2':'1');
      document.querySelector('.quiz-stage-label').innerHTML=(currentStage>=12?'⚜ L’Observatoire royal':currentStage>=5?'⚜ La Cour des Savoirs':'⚜ Les bases de l’Académie')+' <small>Version 0.3.41</small>';
      quizScreen.classList.toggle('fractions-quiz',currentStage===3);quizScreen.classList.toggle('level2-quiz',currentStage>=5);
      document.querySelector('.quiz-tip').textContent=currentStage===3?'Trouve le numérateur manquant · 8 bonnes réponses pour rejoindre le pont.':'⚜ Obtiens au moins 8 bonnes réponses pour ouvrir la voie suivante.';
      document.querySelector('.quiz-title-wrap strong').textContent=title;
      quizScreen.setAttribute('aria-label','Épreuve : '+title);
      document.querySelector('label[for="quizAnswer"]').textContent=currentStage===3?'Numérateur manquant de la fraction':currentStage===2?'Résultat de l’addition (signe moins autorisé)':'Résultat de la multiplication';
      qInput.type=currentStage>=5?'text':'number';
      qInput.setAttribute('inputmode',currentStage>=5?(courtModule().ansType==='fraction'?'text':courtModule().ansType==='decimal'?'decimal':courtModule().ansType==='text'?'text':'numeric'):currentStage===2?'text':'numeric');
      qInput.placeholder=currentStage>=5&&courtModule().ansType==='fraction'?'Ex. : 3/5':currentStage>=12&&courtModule().ansType==='text'?'Ex. : 2x + 3':'?';
      if(currentStage>=5){document.querySelector('label[for="quizAnswer"]').textContent=courtModule().ansType==='fraction'?'Probabilité sous forme de fraction (exemple : 3/5)':'Ta réponse';document.querySelector('.quiz-tip').textContent=courtModule().ansType==='fraction'?'Écris une fraction, par exemple 3/5. Les fractions équivalentes sont acceptées.':courtModule().ansType==='decimal'?'Virgule ou point acceptés · 8 bonnes réponses pour continuer.':'8 bonnes réponses pour continuer.';}
      // Each exercise keeps the frontal scenery of its own preceding transition.
      const exerciseScenery=currentStage>=5?courtArts[currentStage-courtBase]:currentStage===3?fractionArt.src:currentStage===2?relativeArt.src:tableArt;
      quizScreen.style.backgroundSize='cover';quizScreen.style.backgroundPosition='center';
      quizScreen.style.backgroundImage='linear-gradient(#071b3999,#071b3999),url("'+exerciseScenery+'")';
      quizActive=true;completed=false;
      resultsArea.hidden=true;questionArea.hidden=false;
      if(currentStage>=12&&courtModule().ansType==='text')document.querySelector('.quiz-tip').textContent='Réduis l’expression. Carré : ² ou ^2 ; termes équivalents acceptés.';
      quizScreen.hidden=false;
      document.body.style.overflow='hidden';
      renderQuestion();
    }
    function updateClock(remaining){
      const t=Math.max(0,Math.min(questionTime/1000,Math.ceil(remaining/1000)));
      qTimerNum.textContent=String(t);
      qTimerArc.style.strokeDashoffset=String(CIRC*(1-Math.max(0,remaining)/questionTime));
      const color=t<=3?'#d64548':t<=5?'#e09d37':'#2256ed';
      qTimerArc.style.stroke=color;qTimerNum.style.color=color;
    }
    function renderQuestion(){
      if(!quizActive)return;
      const q=questions[questionIndex];completed=false;resetCalculator();
      qLabel.textContent='QUESTION '+(questionIndex+1)+' / 10';
      qOperation.classList.toggle('fraction-question',currentStage===3);
      if(currentStage===3||currentStage>=5)qOperation.innerHTML=q.html;else qOperation.textContent=operation(q);
      qScore.textContent=String(correct);
      qProgress.style.width=(questionIndex*10)+'%';
      qInput.value='';qInput.disabled=false;qInput.className='';
      qSubmit.disabled=false;
      qFeedback.textContent='';qFeedback.className='quiz-feedback';
      deadline=performance.now()+questionTime;lastQuestionStarted=performance.now();
      updateClock(questionTime);
      clearInterval(quizTimer);
      quizTimer=setInterval(()=>{
        const remain=deadline-performance.now();updateClock(remain);
        if(remain<=0)gradeAnswer(true);
      },100);
      qInput.readOnly=false;
      qInput.focus({preventScroll:true});
      requestAnimationFrame(()=>{if(quizActive&&!quizScreen.hidden&&!completed)qInput.focus({preventScroll:true});});
    }
    function gradeAnswer(timeout=false){
      if(!quizActive||completed)return;
      completed=true;clearInterval(quizTimer);calcCopy.disabled=true;
      const q=questions[questionIndex];
      const given=qInput.value.trim();
      const good=!timeout && acceptsAnswer(given,q) && performance.now()<=deadline;
      if(good)correct++;
      const elapsed=Math.round(Math.min(questionTime,Math.max(0,performance.now()-lastQuestionStarted)));
      totalSpentMs+=elapsed;
      answers.push({html:operation(q),a:q.a,b:q.b,answer:answerText(q.answer),given:timeout?null:given,ok:good,elapsed});
      qInput.disabled=true;qSubmit.disabled=true;
      qInput.className=good?'good':'bad';
      qFeedback.textContent=good?'✅ Bravo !':timeout?'⏱️ Temps écoulé · réponse : '+answerText(q.answer):'❌ Pas tout à fait · réponse : '+answerText(q.answer);
      qFeedback.className='quiz-feedback '+(good?'good':'bad');
      qScore.textContent=String(correct);
      const token=sessionToken;
      advanceTimer=setTimeout(()=>{
        if(!quizActive||token!==sessionToken)return;
        questionIndex++;
        if(questionIndex<10)renderQuestion();else showResults();
      },1400);
    }
    function showResults(){
      stopQuizTimers();quizActive=false;closeCalculator();calcToggle.hidden=true;
      qProgress.style.width='100%';
      const success=correct>=8;
      if(success){
        if(currentStage===1)passed=true;else if(currentStage===2)secondPassed=true;
        markChallengeCompleted(currentStage);
      }
      window.MQAccount?.record({account:quizAccount,challenge:challenges.find(c=>c.stage===currentStage)?.id,score:correct,duration:totalSpentMs,answers});
      document.getElementById('resultTitle').textContent=success?'🏆 Épreuve remportée !':'⚔ Épreuve à retenter';
      document.getElementById('resultScore').textContent=correct+' / 10';
      document.getElementById('resultPercent').textContent=(correct*10)+' % de réussite';
      document.getElementById('resultMessage').textContent=success?
        (currentStage>=5?(currentStage===courtBase+courtModules.length-1?'Bravo ! Tous les défis du niveau sont validés. Rejoins la dernière porte !':'Bravo ! La prochaine épreuve est débloquée.'):currentStage===1?'Bravo ! La voie vers les additions de relatifs est ouverte.':currentStage===2?'Bravo ! Le deuxième défi est validé. Tu peux maintenant rejoindre le cercle des fractions.':'Bravo ! Les trois défis sont validés. Rejoins le dernier cercle sur le pont !'):
        'Le seuil des 80 % n’est pas atteint. Reprends courage et retente cette épreuve !';
      document.getElementById('quizTotalTime').textContent='⏱ Temps de réponse total : '+Math.round(totalSpentMs/1000)+' s';
      const recap=document.getElementById('resultRecap');recap.replaceChildren();
      answers.forEach((v,i)=>{
        const row=document.createElement('div');row.className='recap-row';
        const first=document.createElement('span');first.textContent=(i+1)+'. '+v.html.replace(/<\/(?:td|th)>/g,' · ').replace(/<\/tr>/g,' / ').replace(/<[^>]*>/g,' ');
        const second=document.createElement('strong');second.className=v.ok?'ok':'bad';
        second.textContent=v.ok?'✓ '+v.answer:(v.given===null?'⏱ ':((v.given||'—')+' → '))+v.answer;
        row.append(first,second);recap.append(row);
      });
      document.getElementById('finishQuiz').textContent=success?(currentStage>=5?(currentStage===courtBase+courtModules.length-1?'⚔ Rejoindre la dernière porte →':'⚔ Rejoindre la prochaine épreuve →'):currentStage===1?'⚔ Rejoindre les relatifs →':currentStage===2?'⚔ Rejoindre les fractions →':'⚔ Rejoindre le pont →'):'← Retour à la carte';
      questionArea.hidden=true;resultsArea.hidden=false;
    }
    function closeQuiz(advance=false){
      sessionToken++;stopQuizTimers();quizActive=false;closeCalculator();calcToggle.hidden=true;
      quizScreen.hidden=true;questionArea.hidden=false;resultsArea.hidden=true;
      document.body.style.overflow='';setMapStatus();
      if(advance&&correct>=8&&isChallengeCompleted()){skipCompletedChallenge();return}
      if(currentStage>=5){courtArrival();return}
      arrival.hidden=false;updateArrival();startTrial.focus({preventScroll:true});
    }
    startTrial.addEventListener('click',()=>currentStage===4?showLevelTwoEntrance():showTransition());
    qForm.addEventListener('submit',e=>{e.preventDefault();if(!completed)gradeAnswer(false)});
    document.getElementById('quizBack').addEventListener('click',()=>closeQuiz());
    document.getElementById('retryQuiz').addEventListener('click',showQuiz);
    document.getElementById('finishQuiz').addEventListener('click',()=>closeQuiz(true));
function fmtProp(n){return String(n).replace('.',',');}
function tableauProp(l1,l2,a,b,c,d){return `<table style="border-collapse:collapse;margin:auto;font:700 clamp(14px,3.5vw,19px) 'Open Sans',sans-serif;text-align:center"><tr><th style="border:2px solid #94a3b8;padding:9px 12px;background:#eff6ff">${l1}</th><td style="border:2px solid #94a3b8;padding:9px 16px">${a}</td><td style="border:2px solid #94a3b8;padding:9px 16px">${b}</td></tr><tr><th style="border:2px solid #94a3b8;padding:9px 12px;background:#eff6ff">${l2}</th><td style="border:2px solid #94a3b8;padding:9px 16px">${c}</td><td style="border:2px solid #94a3b8;padding:9px 16px;color:#ea580c">${d}</td></tr></table>`;}


function generateEquations(level){
 const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
 const nz=(a,b)=>{let v=0;while(!v)v=rand(a,b);return v;};
 const fmt=n=>String(n).replace('-', '−').replace('.',',');
 const signed=n=>n<0?' − '+fmt(-n):' + '+fmt(n);
 const coef=n=>n===1?'x':n===-1?'−x':fmt(n)+'x';
 const out=[],seen=new Set();let tries=0;
 while(out.length<10 && tries++<2000){
  let x=rand(-10,10),a=nz(2,9),b=rand(-12,12),c=rand(-8,8),d,html,ans=x;
  switch(level){
   case 1:html='x'+signed(b)+' = '+fmt(x+b);break;
   case 2:html=coef(a)+' = '+fmt(a*x);break;
   case 3:html=coef(a)+signed(b)+' = '+fmt(a*x+b);break;
   case 4:html=fmt(a)+'(x'+signed(b)+') = '+fmt(a*(x+b));break;
   case 5:c=nz(-6,6);if(c===a)continue;d=a*x+b-c*x;html=coef(a)+signed(b)+' = '+coef(c)+signed(d);break;
   case 6:a=-rand(2,9);html=coef(a)+signed(b)+' = '+fmt(a*x+b);break;
   case 7:a=rand(2,8);x=rand(-8,8)*a;ans=x;html='x / '+a+signed(b)+' = '+fmt(x/a+b);break;
   case 8:c=nz(-5,5);if(c===a)continue;d=a*(x+b)-c*x;html=fmt(a)+'(x'+signed(b)+') = '+coef(c)+signed(d);break;
   case 9:c=nz(2,6);d=rand(-8,8);{const e=a*(x+b)-c*(x+d);html=fmt(a)+'(x'+signed(b)+') − '+fmt(c)+'(x'+signed(d)+') = '+fmt(e);if(a===c)continue;}break;

  }
  if(seen.has(html))continue;seen.add(html);out.push({html,ans});
 }
 // Dernière question : coefficients décimaux, dans le même type d'équation.
 const x=rand(-16,16)/2, a=rand(2,9)/10, b=rand(-20,20)/10;
 const f=n=>String(Math.round(n*10000)/10000).replace('-', '−').replace('.',',');
 const plus=n=>n<0?' − '+f(-n):' + '+f(n);
 let html,ans=x;
 switch(level){
  case 1:html='x'+plus(b)+' = '+f(x+b);break;
  case 2:html=f(a)+'x = '+f(a*x);break;
  case 3:html=f(a)+'x'+plus(b)+' = '+f(a*x+b);break;
  case 4:html=f(a)+'(x'+plus(b)+') = '+f(a*(x+b));break;
  case 5:{const c=-rand(2,8)/10;html=f(a)+'x'+plus(b)+' = '+f(c)+'x'+plus((a-c)*x+b);break;}
  case 6:{const c=-a;html=f(c)+'x'+plus(b)+' = '+f(c*x+b);break;}
  case 7:{const k=rand(2,8);html='x / '+f(k/10)+plus(b)+' = '+f(x/(k/10)+b);break;}
  case 8:{const c=-rand(2,8)/10;html=f(a)+'(x'+plus(b)+') = '+f(c)+'x'+plus(a*(x+b)-c*x);break;}
  case 9:{const c=rand(2,8)/10,d=rand(-15,15)/10;html=f(a)+'(x'+plus(b)+') − '+f(c)+'(x'+plus(d)+') = '+f(a*(x+b)-c*(x+d));break;}
 }
 out[9]={html,ans};
 return out;
}

const LEVEL_TWO_MODULES={
conv_long:{group:'Mesures & conversions',color:'#a855f7',icon:'📏',title:'Conversions de longueurs',desc:'Convertir des longueurs (cm, dm, m, mm)',tags:['longueurs','⏱ 25s'],time:25,ansType:'decimal',tol:1e-9,
    gen(){const p=[{html:'440 cm → m',ans:4.4},{html:'650 cm → m',ans:6.5},{html:'300 dm → m',ans:30},{html:'400 dm → m',ans:40},{html:'5,9 cm → m',ans:0.059},{html:'3,3 cm → m',ans:0.033},{html:'85 cm → m',ans:0.85},{html:'56 cm → m',ans:0.56},{html:'144 cm → m',ans:1.44},{html:'123 cm → m',ans:1.23},{html:'0,22 m → mm',ans:220},{html:'0,23 m → mm',ans:230},{html:'240 cm → m',ans:2.4},{html:'125 cm → m',ans:1.25},{html:'6 cm → m',ans:0.06},{html:'8 cm → m',ans:0.08},{html:'0,6 mm → m',ans:0.0006},{html:'0,8 mm → m',ans:0.0008},{html:'2 300 mm → m',ans:2.3},{html:'2 500 mm → m',ans:2.5}];shuffle(p);return p.slice(0,10);}},
tableau_prop1:{group:'Proportionnalité & %',color:'#0d9488',icon:'▦',title:'Tableaux — Niveau 1',desc:'Compléter un tableau avec un coefficient entier',tags:['tableaux','⏱ 25s'],time:25,ansType:'int',smallFont:true,
    gen(){const p=[];for(let k=2;k<=9;k++)for(let a=2;a<=12;a++){const b=a+[2,3,5][a%3];p.push({html:tableauProp('Quantité','Prix (€)',a,b,a*k,'?'),ans:b*k});}shuffle(p);return p.slice(0,10);}},
etendue:{group:'Statistiques',color:'#16a34a',icon:'📐',title:"Étendue d'une série",desc:"Calculer l'étendue de chaque série",tags:['stats','⏱ 30s'],time:30,ansType:'decimal',tol:0.005,note:'📐 Étendue = max − min',smallFont:true,
    gen(){const p=[{html:'{1 ; 2 ; 3 ; 4 ; 5}',ans:4},{html:'{120 ; 102 ; 130 ; 104 ; 105}',ans:28},{html:'{410 ; 402 ; 440 ; 455 ; 405}',ans:53},{html:'{1,2 ; 1,01 ; 1,3 ; 1,4 ; 1,06}',ans:0.39},{html:'{4,1 ; 4,01 ; 4,4 ; 4,6 ; 4,06}',ans:0.59},{html:'{9 ; 8,9 ; 1,6 ; 7,64 ; 5,38}',ans:7.4},{html:'{8 ; 7,9 ; 1,5 ; 8,64 ; 5,65}',ans:7.14},{html:'{87 ; 89 ; 85 ; 86 ; 84}',ans:5},{html:'{78 ; 79 ; 75 ; 77 ; 76}',ans:4},{html:'{102,1 ; 1 110 ; 12,8 ; 105,3 ; 115,4}',ans:1097.2},{html:'{141,8 ; 1 327 ; 129,7 ; 234,8 ; 2,56}',ans:1324.44},{html:'{2,1 ; 11 ; 2,8 ; 15,3 ; 15,04}',ans:13.2},{html:'{11,8 ; 2,09 ; 12,7 ; 2,8 ; 2,6}',ans:10.61},{html:'{2,1 ; 11 ; 2,8 ; 15,3 ; 15,44}',ans:13.34},{html:'{11,9 ; 2,09 ; 12,77 ; 2,8 ; 2,6}',ans:10.68},{html:'{12,5 ; 101 ; 12,8 ; 15,3 ; 5,4}',ans:95.6},{html:'{11,8 ; 2,9 ; 2,7 ; 2,8 ; 1,6}',ans:10.2},{html:'{2,501 ; 2,150 ; 2,015 ; 2,051 ; 2,510}',ans:0.495},{html:'{3,804 ; 3,408 ; 3,840 ; 3,084 ; 3,048}',ans:0.792}];shuffle(p);return p.slice(0,10);}},
probas_simples:{group:'Probabilités',color:'#16a34a',icon:'⚪',title:'Probabilités — Niveau 1',desc:'Calculer une probabilité avec des boules ou des jetons',tags:['probas','niveau 1','fractions','⏱ 20s'],time:20,ansType:'fraction',note:'🎯 Probabilité = cas favorables / cas possibles',
    gen(){const p=[{html:'Sac : 3 rouges et 2 bleues. Tirer une rouge.',ans:{n:3,d:5}},{html:'Sac : 1 rouge et 4 bleues. Tirer une rouge.',ans:{n:1,d:5}},{html:'Sac : 2 vertes et 6 jaunes. Tirer une verte.',ans:{n:1,d:4}},{html:'Sac : 5 noires et 5 blanches. Tirer une blanche.',ans:{n:1,d:2}},{html:'Sac : 2 rouges et 8 bleues. Tirer une bleue.',ans:{n:4,d:5}},{html:'Urne : 3 vertes, 3 rouges, 3 bleues. Tirer une verte.',ans:{n:1,d:3}},{html:'Sac : 4 jaunes et 6 noires. Tirer une jaune.',ans:{n:2,d:5}},{html:'Urne : 7 rouges et 3 bleues. Tirer une bleue.',ans:{n:3,d:10}},{html:'Sac : 1 blanche et 9 noires. Tirer une noire.',ans:{n:9,d:10}},{html:'Urne : 4 rouges et 12 vertes. Tirer une rouge.',ans:{n:1,d:4}},{html:'Sac : 6 bleues et 2 jaunes. Tirer une jaune.',ans:{n:1,d:4}},{html:'Urne : 8 vertes et 2 rouges. Tirer une verte.',ans:{n:4,d:5}},{html:'Sac : 5 rouges et 15 bleues. Tirer une rouge.',ans:{n:1,d:4}},{html:'Urne : 9 jaunes et 3 noires. Tirer une noire.',ans:{n:1,d:4}},{html:'Sac : 2 blanches et 2 noires. Tirer une blanche.',ans:{n:1,d:2}}];shuffle(p);return p.slice(0,10);}},
expressions:{group:'Algèbre',color:'#7c3aed',icon:'🔣',title:"Calcul d'expressions",desc:'Calculer une expression algébrique',tags:['algèbre','⏱ 25s'],time:25,ansType:'int',smallFont:true,
    gen(){const p=[{html:'a=1, b=4 → a+b',ans:5},{html:'a=4, b=1 → a+b',ans:5},{html:'a=2, b=3 → ab',ans:6},{html:'a=5, b=2 → ab',ans:10},{html:'a=5 → 5+a²',ans:30},{html:'a=3 → 5+a²',ans:14},{html:'a=3 → 1+5a²',ans:46},{html:'a=2 → 1+5a²',ans:21},{html:'a=3, b=5 → 3a+2b',ans:19},{html:'a=2, b=5 → 3a+2b',ans:16},{html:'a=5, b=6 → a²+2b',ans:37},{html:'a=3, b=7 → a²+2b',ans:23},{html:'a=3, b=4 → a²+b²',ans:25},{html:'a=4, b=3 → a²+b²',ans:25},{html:'a=5, b=2 → b²+3a',ans:19},{html:'a=4, b=2 → b²+3a',ans:16},{html:'a=5, b=2 → 2b²+5a',ans:33},{html:'a=4, b=2 → 2b²+5a',ans:28},{html:'a=1, b=1 → 3a(a+2b)',ans:9}];shuffle(p);return p.slice(0,10);}},
eq_niv1:{group:'Équations',color:'#2563eb',icon:'=',title:'Équations — Niveau 1',desc:'x + a = b',tags:['équations','niveau 1','⏱ 20s'],time:20,ansType:'decimal',tol:0.001,smallFont:true,gen(){return generateEquations(1);}},
};

    // La Cour des Savoirs : six modules originaux, entièrement hors ligne.
    const courtScreen=document.getElementById('courtScreen');
    const courtMap=document.getElementById('courtMap');
    const courtHero=document.getElementById('courtHero');
    const courtTrial=document.getElementById('courtTrial');
    const courtScene=document.getElementById('courtTrialScene');
    const courtMessage=document.getElementById('courtMessage');
    let courtModules=['conv_long','tableau_prop1','etendue','probas_simples','expressions','eq_niv1'];
    let courtPlaces=['Atelier des mesures','Halle des échanges','Jardin des statistiques','Tour du hasard','Laboratoire des expressions','Sanctuaire des équations'];
    let courtPoints=[[704,879],[257,796],[380,540],[549,392],[788,386],[1046,497],[1154,780],[1433,919]];
    let courtRoutes=[[[704, 879], [677, 808], [647, 757], [615, 724], [575, 712], [540, 724], [508, 752], [482, 785], [438, 815], [383, 825], [327, 822], [287, 807], [257, 796]], [[257, 796], [291, 772], [322, 745], [332, 716], [330, 684], [333, 649], [352, 609], [380, 540]], [[380, 540], [435, 506], [483, 470], [521, 431], [549, 392]], [[549, 392], [618, 377], [683, 364], [733, 374], [788, 386]], [[788, 386], [824, 423], [887, 451], [965, 475], [1046, 497]], [[1046, 497], [1000, 535], [952, 577], [918, 630], [909, 687], [962, 727], [1044, 756], [1154, 780]], [[1154, 780], [1215, 823], [1275, 866], [1339, 901], [1433, 919]]];
    let levelTwoDirectAccess=false,levelThreeDirectAccess=false,courtWorld=2,courtBase=5;
    let courtAt=0,courtTrip=0,courtAnimation=null,courtRaf=0,courtFacing=6;
    let courtZoom=false,courtTrialZoom=false;
    let courtArts=Array.from(document.getElementById('courtArts').content.querySelectorAll('img'),img=>img.src);
    let courtBackground=document.getElementById('courtBackground').src;document.getElementById('courtDepthBoard').src=courtBackground;
    courtHero.src=heroIdle[6];
    const classicFrame=fractionArt.src;document.getElementById('courtTrialHeader').src=classicFrame;
    document.querySelector('.court-panel').style.backgroundImage='url("'+classicFrame+'")';document.getElementById('courtTrialQuests').style.backgroundImage='url("'+classicFrame+'")';
    courtModules.forEach((key,i)=>{
      const stage=i+5;stageTitles[stage]=LEVEL_TWO_MODULES[key].title;
      challenges.push({stage,id:'niveau2-'+key,next:stage+1,move:()=>moveCourt(i+2)});
    });
    function courtModule(){return (courtWorld===3?LEVEL_THREE_MODULES:LEVEL_TWO_MODULES)[courtModules[currentStage-courtBase]];}
    function courtFit(){
      for(const [area,node,zoomed,r] of [[document.getElementById('courtArea'),courtMap,courtZoom,courtWorld===3?1672/941:1614/974],[document.getElementById('courtTrialArea'),courtScene,courtTrialZoom,16/9]]){
        const w=area.clientWidth-12,h=area.clientHeight-12;if(w<=0||h<=0)continue;
        const fit=zoomed?Math.max(w,1100):Math.min(w,h*r);node.style.width=fit+'px';node.style.height=fit/r+'px';
      }
    }
    new ResizeObserver(courtFit).observe(document.getElementById('courtArea'));
    new ResizeObserver(courtFit).observe(document.getElementById('courtTrialArea'));
    window.addEventListener('resize',courtFit);document.addEventListener('fullscreenchange',()=>requestAnimationFrame(courtFit));
    function updateCourtStatus(){worldProgress()}
    function courtPosition(p){return {left:(p[0]/(courtWorld===3?1672:1616)*100-2.17)+'%',top:(p[1]/(courtWorld===3?941:970)*100-(courtWorld===3?12.6:12.05))+'%'};}
    function courtRest(direction=courtFacing){courtFacing=direction;courtHero.src=heroIdle[direction];courtHero.style.transform='';courtHero.dataset.facing=facingNames[direction];}
    function cancelCourt(){courtTrip++;cancelAnimationFrame(courtRaf);if(courtAnimation){courtAnimation.cancel();courtAnimation=null}courtRest();}
    function enterCourt(requestedWorld=2){
      const nextWorld=requestedWorld===3?3:2;
      if(nextWorld===3&&!levelThreeDirectAccess&&!worldTwo.modules.every((_,i)=>isChallengeCompleted(i+5)))return;
      if(nextWorld===2&&!isChallengeCompleted(3)&&!levelTwoDirectAccess)return;
      hideObservatoryEntrance();setCourtWorld(nextWorld);
      hideLevelTwoEntrance();hideTransition();arrival.hidden=true;oath.hidden=true;
      courtScreen.hidden=false;courtTrial.hidden=true;document.getElementById('courtComplete').hidden=true;cancelCourt();cancelVictory();courtAt=0;currentStage=courtBase;
      Object.assign(courtHero.style,courtPosition(courtPoints[0]));courtRest(6);
      document.getElementById('courtAction').hidden=false;document.getElementById('courtAction').textContent='⚔ Commencer le parcours';
      courtMessage.textContent=courtWorld===3?'Bienvenue à l’Observatoire royal ! Treize épreuves t’attendent sous les étoiles.':'Bienvenue dans la Cour des Savoirs ! Six épreuves t’attendent autour du cheval.';
      updateCourtStatus();requestAnimationFrame(courtFit);document.getElementById('courtAction').focus({preventScroll:true});
    }
    function leaveCourt(){
      hideObservatoryEntrance();
      if(courtWorld===3){enterCourt(2);return}
      cancelCourt();cancelVictory();courtScreen.hidden=true;courtTrial.hidden=true;document.getElementById('courtComplete').hidden=true;
      if(!isChallengeCompleted(3)){backToStart();return}
      currentStage=4;arrival.hidden=false;updateArrival();startTrial.focus({preventScroll:true});
    }
    async function moveCourt(target){
      if(target<1||target>courtModules.length+1)return;
      if(target>1&&!isChallengeCompleted(courtBase+target-2))return;
      // Only the current landing point can launch the next part of the route.
      if(target!==courtAt+1)return;
      cancelCourt();const token=courtTrip;
      courtTrial.hidden=true;document.getElementById('courtAction').hidden=true;
      courtMessage.textContent=target===courtModules.length+1?'Le héros rejoint la dernière porte de la Cour…':'Le héros rejoint '+courtPlaces[target-1]+'…';
      // Switch to the entrance cinematic as soon as the hero reaches the stairs.
      const enteringObservatory=courtWorld===2&&target===courtModules.length+1;
      const points=enteringObservatory?courtRoutes[target-1].slice(0,2):courtRoutes[target-1],dist=points.map((p,i)=>i?Math.hypot(p[0]-points[i-1][0],p[1]-points[i-1][1]):0),length=dist.reduce((a,b)=>a+b,0);
      let covered=0;const path=points.map((p,i)=>{covered+=dist[i];return {offset:covered/length,...courtPosition(p)}});
      const duration=Math.max(2800,length*8);
      function faceAt(time){
        const progress=Math.min(.999999,time/duration);let i=0;while(i<path.length-2&&progress>=path[i+1].offset)i++;
        const a=points[i],b=points[i+1],dir=(Math.round(Math.atan2(b[1]-a[1],b[0]-a[0])/(Math.PI/4))+8)%8;
        const step=Math.floor(time/115)%4;courtFacing=dir;courtHero.src=heroAngles[step*8+directionArtwork[dir]];courtHero.style.transform=step===3?'scaleX(-1)':'';courtHero.dataset.facing=facingNames[dir];
      }
      if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches&&courtHero.animate){
        courtAnimation=courtHero.animate(path,{duration,easing:'linear',fill:'forwards'});const active=courtAnimation;
        function tick(){if(token!==courtTrip||courtAnimation!==active)return;faceAt(Number(active.currentTime)||0);courtRaf=requestAnimationFrame(tick)}tick();
        try{await active.finished}catch(e){return}if(token!==courtTrip)return;
        cancelAnimationFrame(courtRaf);courtAnimation=null;Object.assign(courtHero.style,path[path.length-1]);active.cancel();
      }else{faceAt(duration);Object.assign(courtHero.style,path[path.length-1]);}
      courtAt=target;currentStage=target+courtBase-1;
      courtRest(courtWorld===3?6:[6,5,5,6,6,7,6,0][target]);
      if(enteringObservatory){
        courtMessage.textContent='🏆 Les six défis sont validés ! Le héros monte vers l’Observatoire royal.';
        document.getElementById('courtAction').textContent='Rejoindre l’Observatoire royal →';
        document.getElementById('courtAction').hidden=false;
        showObservatoryEntrance(false);return;
      }
      if(!await new Promise(resolve=>setTimeout(()=>resolve(token===courtTrip),650)))return;
      if(target===courtModules.length+1){
        courtMessage.textContent=courtWorld===3?'🏆 Les treize défis sont validés ! L’Observatoire royal est conquis.':'🏆 Les six défis sont validés ! La voie vers le niveau 3 est ouverte.';
        document.getElementById('courtAction').textContent='🏆 Niveau '+courtWorld+' terminé';document.getElementById('courtAction').hidden=false;
        document.getElementById('courtComplete').hidden=false;startVictory();document.getElementById('courtCompleteClose').focus({preventScroll:true});return;
      }
      showCourtTrial();
    }
    function showCourtTrial(){
      const mod=courtModule();if(!mod||courtAt<1||courtAt>courtModules.length)return;
      if(releasePartialFullscreen(showCourtTrial))return;
      document.getElementById('courtTrialArt').src=courtArts[courtAt-1];
      document.getElementById('courtTrialArt').alt=courtPlaces[courtAt-1]+', vue de face.';
      document.getElementById('courtTrialHero').src=heroIdle[6];
      const landing=courtWorld===3?[30,90.5]:[[34.3,88.3],[35.2,86.4],[28.4,89],[31.8,89],[31.6,88.1],[28.3,90.9]][courtAt-1];
      document.getElementById('courtTrialHero').style.left=(landing[0]-3.5)+'%';document.getElementById('courtTrialHero').style.top=(landing[1]*.884-20.5)+'%';
      document.getElementById('courtTrialPlace').textContent=mod.title;document.getElementById('courtTrialNumber').textContent=String(courtAt);
      document.getElementById('courtTrialTitle').textContent=mod.title;
      document.getElementById('courtTrialOrder').textContent='⚔ '+['Première','Deuxième','Troisième','Quatrième','Cinquième','Sixième','Septième','Huitième','Neuvième','Dixième','Onzième','Douzième','Treizième'][courtAt-1]+' épreuve atteinte !';
      document.getElementById('courtTrialTime').textContent='⌛ '+mod.time+' secondes chacune';
      document.getElementById('courtTrialRule').textContent=mod.desc;
      const done=isChallengeCompleted();document.getElementById('courtTrialStart').textContent=done?'Rejouer':'▶ Commencer le défi';
      document.getElementById('courtTrialPass').hidden=!done;
      courtTrial.hidden=false;updateCourtStatus();requestAnimationFrame(courtFit);document.getElementById('courtTrialStart').focus({preventScroll:true});
      courtMessage.textContent='Le héros regarde '+courtPlaces[courtAt-1]+'.';
    }
    function courtArrival(){
      courtTrial.hidden=true;updateCourtStatus();
      document.getElementById('courtAction').hidden=false;document.getElementById('courtAction').textContent='⚔ Voir le défi';
      courtMessage.textContent='Épreuve '+courtAt+' : '+stageTitles[currentStage]+'.';document.getElementById('courtAction').focus({preventScroll:true});
    }
    document.getElementById('skipLevelOne').addEventListener('click',()=>{stop();levelTwoDirectAccess=true;enterCourt(courtWorld)});
    document.getElementById('courtEnter').addEventListener('click',enterCourt);
    document.getElementById('courtBack').addEventListener('click',leaveCourt);
    document.getElementById('courtReset').addEventListener('click',()=>{document.getElementById('courtComplete').hidden=true;enterCourt()});
    document.getElementById('courtAction').addEventListener('click',()=>courtAt===0?moveCourt(1):courtAt===courtModules.length+1?(()=>{document.getElementById('courtComplete').hidden=false;startVictory()})():showCourtTrial());
    document.getElementById('courtTrialStart').addEventListener('click',showQuiz);
    document.getElementById('courtTrialPass').addEventListener('click',skipCompletedChallenge);
    document.getElementById('courtTrialBack').addEventListener('click',courtArrival);
    document.getElementById('courtTrialReplay').addEventListener('click',()=>{const target=courtAt;courtAt--;Object.assign(courtHero.style,courtPosition(courtPoints[courtAt]));moveCourt(target)});
    for(const id of ['courtFullscreen','courtTrialFullscreen'])document.getElementById(id).addEventListener('click',toggleAppFullscreen);
    document.getElementById('courtZoom').addEventListener('click',()=>{courtZoom=!courtZoom;document.getElementById('courtArea').classList.toggle('zoomed',courtZoom);document.getElementById('courtZoom').textContent=courtZoom?'⊟ Voir toute la carte':'⌕ Agrandir la carte';courtFit()});
    document.getElementById('courtTrialZoom').addEventListener('click',()=>{courtTrialZoom=!courtTrialZoom;document.getElementById('courtTrialArea').classList.toggle('zoomed',courtTrialZoom);courtFit()});
    document.getElementById('courtCompleteClose').addEventListener('click',()=>{cancelVictory();document.getElementById('courtComplete').hidden=true});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!courtTrial.hidden&&!document.fullscreenElement)courtArrival()});
    function answerText(value){return typeof value==='object'?value.n+'/'+value.d:String(value).replace('.',',')}
    function acceptsAnswer(given,q){
      const mod=currentStage>=5?courtModule():null;
      if(!mod)return /^[+-]?\d+$/.test(given)&&Number(given)===q.answer;
      const clean=given.replace(/−/g,'-').replace(/,/g,'.');
      if(mod.ansType==='text')return polynomialEqual(given,q.answer);
      if(mod.ansType==='fraction'){
        const m=clean.match(/^([+-]?\d+)\s*\/\s*([+-]?\d+)$/);if(!m)return false;
        const n=Number(m[1]),d=Number(m[2]);return Number.isSafeInteger(n)&&Number.isSafeInteger(d)&&d!==0&&n*q.answer.d===q.answer.n*d;
      }
      if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(clean))return false;
      const value=Number(clean);
      // An unrounded quotient must never pass because it is close to the tenth.
      if(mod.exactRoundedAnswer)return Number.isFinite(value)&&value===q.answer;
      return Number.isFinite(value)&&(mod.ansType==='int'?Number.isInteger(value)&&value===q.answer:Math.abs(value-q.answer)<=(mod.tol||1e-9)+(courtWorld===3?Math.abs(q.answer)*.0001:0));
    }

    const calcDrawer=document.getElementById('calculatorDrawer');
    const calcToggle=document.getElementById('calculatorToggle');
    const calcDisplay=document.getElementById('calculatorDisplay');
    const calcCopy=document.getElementById('calculatorCopy');
    let calcExpression='',calcEvaluated=false,calcResult=null;
    function calculateExpression(source){
      const s=source.replace(/,/g,'.').replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/\s/g,'');
      if(!s||s.length>120||/[^\d.+*/()\-]/.test(s))throw Error('Calcul incomplet');
      let i=0;
      function atom(){
        if(s[i]==='+'){i++;return atom()}
        if(s[i]==='-'){i++;return -atom()}
        if(s[i]==='('){i++;const value=sum();if(s[i++]!==')')throw Error('Parenthèse manquante');return value}
        const m=s.slice(i).match(/^(?:\d+(?:\.\d*)?|\.\d+)/);if(!m)throw Error('Calcul incomplet');i+=m[0].length;return Number(m[0]);
      }
      function product(){let v=atom();while(s[i]==='*'||s[i]==='/'){const op=s[i++],n=atom();if(op==='/'&&n===0)throw Error('Division par zéro');v=op==='*'?v*n:v/n}return v}
      function sum(){let v=product();while(s[i]==='+'||s[i]==='-'){const op=s[i++],n=product();v=op==='+'?v+n:v-n}return v}
      const value=sum();if(i!==s.length)throw Error('Calcul incomplet');if(!Number.isFinite(value)||Math.abs(value)>1e15)throw Error('Résultat trop grand');return Number(value.toPrecision(12));
    }
    function resetCalculator(){calcExpression='';calcEvaluated=false;calcResult=null;calcDisplay.value='0';calcCopy.disabled=true;document.getElementById('calculatorStatus').textContent='';}
    function closeCalculator(focus=false){calcDrawer.hidden=true;quizScreen.classList.remove('calculator-open');calcToggle.setAttribute('aria-expanded','false');if(focus)calcToggle.focus({preventScroll:true})}
    function calculatorKey(key){
      if(calcDrawer.hidden||!calculatorAvailable()||!quizActive)return;
      document.getElementById('calculatorStatus').textContent='';
      if(key==='C'){resetCalculator();return}
      if(key==='='){
        try{calcResult=calculateExpression(calcExpression);calcExpression=calcResult.toLocaleString('en-US',{useGrouping:false,maximumSignificantDigits:12});calcEvaluated=true;calcDisplay.value=calcExpression.replace('.',',');calcCopy.disabled=completed;}
        catch(e){document.getElementById('calculatorStatus').textContent=e.message;calcResult=null;calcCopy.disabled=true}return;
      }
      if(key==='Backspace'){calcExpression=calcExpression.slice(0,-1)}
      else if(/^[\d.,+*/()\-]$/.test(key)){
        if(calcEvaluated&&/[\d.,(]/.test(key))calcExpression='';
        if(calcExpression.length>=120)return;calcExpression+=key.replace(',','.');
      }else return;
      calcEvaluated=false;calcResult=null;calcCopy.disabled=true;calcDisplay.value=(calcExpression||'0').replace(/\./g,',').replace(/\*/g,'×').replace(/\//g,'÷');
    }
    calcToggle.addEventListener('click',()=>{
      if(!calculatorAvailable()||!quizActive)return;
      if(!calcDrawer.hidden){closeCalculator(true);return}
      calcDrawer.hidden=false;quizScreen.classList.add('calculator-open');calcToggle.setAttribute('aria-expanded','true');calcDisplay.focus({preventScroll:true});positionCalculator();
    });
    document.getElementById('calculatorClose').addEventListener('click',()=>closeCalculator(true));
    const calculatorKeys=['C','Backspace','(',')','7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+'];
    calculatorKeys.forEach((key,i)=>document.getElementById('calculatorKey'+i).addEventListener('click',()=>calculatorKey(key)));
    calcDrawer.addEventListener('keydown',event=>{
      if(event.ctrlKey||event.metaKey||event.altKey)return;
      if(event.key==='Escape'){event.preventDefault();closeCalculator(true);return}
      if(event.key==='Enter'&&['calculatorCopy','calculatorClose'].includes(event.target?.id))return;
      const key=event.key==='Enter'?'=':event.key==='Delete'?'C':event.key;
      if(key==='='||key==='C'||key==='Backspace'||/^[\d.,+*/()\-]$/.test(key)){event.preventDefault();calculatorKey(key)}
    });
    calcCopy.addEventListener('click',()=>{
      if(!calculatorAvailable()||!quizActive||completed||!calcEvaluated||calcResult===null)return;
      qInput.value=calcExpression.replace('.',',');qInput.focus({preventScroll:true});document.getElementById('calculatorStatus').textContent='Résultat reporté. Clique sur Valider pour répondre.';
    });

    // Center the calculator in the actual free space beside the exercise.
    function positionCalculator(){
      if(calcDrawer.hidden)return;
      if(window.innerWidth<960){calcDrawer.style.right='10px';return}
      const edge=document.querySelector('.quiz-content').getBoundingClientRect().right;
      const width=calcDrawer.getBoundingClientRect().width;
      calcDrawer.style.right=Math.max(12,(window.innerWidth-edge-width)/2)+'px';
    }
    new ResizeObserver(positionCalculator).observe(document.querySelector('.quiz-content'));
    window.addEventListener('resize',positionCalculator);
    let victoryFrame=0,victoryTimer=null,victoryToken=0;
    const victoryHero=document.getElementById('courtVictoryHero');
    document.getElementById('courtVictoryBackdrop').src=courtBackground;
    function cancelVictory(){victoryToken++;cancelAnimationFrame(victoryFrame);clearTimeout(victoryTimer);document.getElementById('courtVictoryScene').classList.remove('celebrating');victoryHero.src=heroIdle[6];victoryHero.style.transform='';}
    function finishVictory(){
      cancelAnimationFrame(victoryFrame);clearTimeout(victoryTimer);victoryHero.src=heroIdle[6];victoryHero.style.transform='';
      document.getElementById('courtVictoryScene').classList.add('finished');
      document.getElementById('courtVictoryStatus').textContent=courtWorld===3?'Treize épreuves remportées ! L’Observatoire royal est conquis.':'Six épreuves remportées ! La Cour des Savoirs est conquise.';
    }
    function startVictory(){
      if(courtAt!==courtModules.length+1||!courtModules.every((_,i)=>isChallengeCompleted(courtBase+i)))return;
      if(courtWorld===2){showObservatoryEntrance(false);return}
      cancelVictory();const token=victoryToken,scene=document.getElementById('courtVictoryScene');scene.classList.remove('finished');victoryHero.src=heroIdle[6];
      document.getElementById('courtVictoryStatus').textContent='Le héros fait ses derniers pas vers la porte…';
      if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){finishVictory();return}
      void scene.offsetWidth;scene.classList.add('celebrating');const started=performance.now();
      function step(){
        if(token!==victoryToken||document.getElementById('courtComplete').hidden)return;
        const elapsed=performance.now()-started;if(elapsed>=3200){victoryHero.src=heroIdle[6];victoryHero.style.transform='';return}
        const phase=Math.floor(elapsed/115)%4;victoryHero.src=heroAngles[phase*8+6];victoryHero.style.transform=phase===3?'scaleX(-1)':'';victoryFrame=requestAnimationFrame(step);
      }step();victoryTimer=setTimeout(()=>{if(token===victoryToken&&!document.getElementById('courtComplete').hidden)finishVictory()},4800);
    }
    document.getElementById('courtVictoryReplay').addEventListener('click',startVictory);

    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!document.getElementById('courtComplete').hidden){cancelVictory();document.getElementById('courtComplete').hidden=true;document.getElementById('courtAction').focus({preventScroll:true})}});

const F=(n,d)=>`<span class="fr"><span class="n">${n}</span><span class="d">${d}</span></span>`;
const LEVEL_THREE_MODULES={
mult10:{group:'Calcul de base',color:'#9333ea',icon:'×',title:'Multiplier par 10, 100, 1 000',desc:'Multiplications par puissances de 10',tags:['calcul','⏱ 20s'],time:20,ansType:'int',
    gen(){const p=[{html:'100 × 596',ans:59600},{html:'614 × 10',ans:6140},{html:'121 × 100',ans:12100},{html:'880 × 10',ans:8800},{html:'445 × 10',ans:4450},{html:'10 × 569',ans:5690},{html:'100 × 510',ans:51000},{html:'100 × 837',ans:83700},{html:'850 × 10',ans:8500},{html:'727 × 100',ans:72700},{html:'10 × 850',ans:8500},{html:'1 000 × 45',ans:45000},{html:'1 000 × 3,2',ans:3200},{html:'100 × 7,5',ans:750},{html:'10 × 0,8',ans:8}];shuffle(p);return p.slice(0,10);}},
mult_rel:{group:'Nombres relatifs',color:'#7c3aed',icon:'✖️',title:'Multiplication de relatifs',desc:'Multiplications avec entiers relatifs',tags:['relatifs','niveau 2','⏱ 15s'],time:15,ansType:'int',
    gen(){return generateRelatives('mult');}},
arrondir:{group:'Fractions',color:'#16a34a',icon:'🎯',title:'Arrondir au dixième',desc:'Arrondir des fractions à 0,1 (calculatrice)',tags:['fractions','calculatrice','⏱ 20s'],time:20,ansType:'decimal',exactRoundedAnswer:true,note:'📱 Calculatrice — arrondir à 0,1',
    gen(){const r=(n,d)=>Math.round(n/d*10)/10;const p=[{html:F(3,7),ans:r(3,7)},{html:F(6,14),ans:r(6,14)},{html:F(6,9),ans:r(6,9)},{html:F(5,13),ans:r(5,13)},{html:F(50,23),ans:r(50,23)},{html:F(100,62),ans:r(100,62)},{html:F(12,59),ans:r(12,59)},{html:F(15,4),ans:r(15,4)},{html:F(15,3),ans:r(15,3)},{html:F(18,6),ans:r(18,6)},{html:F(16,19),ans:r(16,19)},{html:F(17,20),ans:r(17,20)},{html:F(160,9),ans:r(160,9)},{html:F(185,3),ans:r(185,3)},{html:F(3214,3215),ans:r(3214,3215)},{html:F(3215,3216),ans:r(3215,3216)},{html:F(0,4),ans:0},{html:F(0,3),ans:0}];shuffle(p);return p.slice(0,10);}},
carre:{group:'Pythagore & racines',color:'#ea580c',icon:'x²',title:'Calculer un carré',desc:'Calculer x² à la calculatrice',tags:['calculatrice','⏱ 20s'],time:20,ansType:'decimal',tol:0.005,note:'📱 Calculatrice autorisée',
    gen(){const s=n=>Math.round(n*n*1000)/1000;const p=[{html:'3²',ans:9},{html:'4²',ans:16},{html:'5²',ans:25},{html:'6²',ans:36},{html:'7²',ans:49},{html:'8²',ans:64},{html:'9²',ans:81},{html:'11²',ans:121},{html:'12²',ans:144},{html:'13²',ans:169},{html:'15²',ans:225},{html:'20²',ans:400},{html:'25²',ans:625},{html:'30²',ans:900},{html:'45²',ans:2025},{html:'50²',ans:2500},{html:'1,5²',ans:s(1.5)},{html:'2,5²',ans:s(2.5)},{html:'3,5²',ans:s(3.5)},{html:'4,5²',ans:s(4.5)},{html:'0,5²',ans:s(0.5)},{html:'1,2²',ans:s(1.2)},{html:'2,3²',ans:s(2.3)},{html:'3,7²',ans:s(3.7)},{html:'14²',ans:196},{html:'16²',ans:256},{html:'18²',ans:324},{html:'22²',ans:484},{html:'0,4²',ans:s(0.4)},{html:'1,8²',ans:s(1.8)}];shuffle(p);return p.slice(0,10);}},
moyenne:{group:'Statistiques',color:'#0891b2',icon:'📊',title:'Calcul de moyenne',desc:"Calculer la moyenne d'une série",tags:['stats','⏱ 30s'],time:30,ansType:'decimal',tol:0.01,note:'📊 Calcule la moyenne',
    gen(){const p=[{html:'1 ; 2 ; 3',ans:2},{html:'1,5 ; 2,5 ; 4,5 ; 1,5',ans:2.5},{html:'15 ; 25 ; 45 ; 15',ans:25},{html:'16 ; 18 ; 13 ; 12 ; 11',ans:14},{html:'78 ; 88 ; 98 ; 28 ; 18',ans:62},{html:'185 ; 12 ; 8 ; 255',ans:115},{html:'11 ; 12 ; 10 ; 13 ; 14 ; 15',ans:12.5},{html:'11,5 ; 12,5 ; 12 ; 12 ; 12 ; 12',ans:12},{html:'11 ; 12 ; 13 ; 9 ; 4 ; 3 ; 18',ans:10},{html:'9,5 ; 13 ; 19 ; 9,5 ; 4,5 ; 3,5 ; 18',ans:11}];shuffle(p);return p.slice(0,10);}},
conversions2:{group:'Mesures & conversions',color:'#1e40af',icon:'⇄',title:'Conversions masses, volumes, aires',desc:'Convertir kg/g, L/mL, m²/cm²',tags:['mesures','⏱ 25s'],time:25,ansType:'decimal',tol:1e-9,smallFont:true,
    gen(){const p=[{html:'3,5 kg → g',ans:3500},{html:'2 400 g → kg',ans:2.4},{html:'0,75 kg → g',ans:750},{html:'5 200 g → kg',ans:5.2},{html:'2,5 L → mL',ans:2500},{html:'750 mL → L',ans:0.75},{html:'0,3 L → cL',ans:30},{html:'45 cL → L',ans:0.45},{html:'4 m² → cm²',ans:40000},{html:'25 000 cm² → m²',ans:2.5},{html:'1,2 kg → g',ans:1200},{html:'8 500 g → kg',ans:8.5},{html:'1,5 L → cL',ans:150},{html:'250 cL → L',ans:2.5},{html:'6 m² → dm²',ans:600},{html:'0,04 m² → cm²',ans:400},{html:'3 dm³ → L',ans:3},{html:'500 mL → dL',ans:5},{html:'0,5 m² → cm²',ans:5000},{html:'2,5 dm³ → L',ans:2.5}];shuffle(p);return p.slice(0,10);}},
angles:{group:'Géométrie',color:'#6d28d9',icon:'∠',title:'Angles dans un triangle',desc:'Calculer le troisième angle',tags:['géométrie','⏱ 20s'],time:20,ansType:'int',smallFont:true,
    gen(){const p=[{html:'Angles : 60° et 60° → 3ᵉ ?',ans:60},{html:'Angles : 90° et 40° → 3ᵉ ?',ans:50},{html:'Angles : 45° et 55° → 3ᵉ ?',ans:80},{html:'Angles : 30° et 110° → 3ᵉ ?',ans:40},{html:'Angles : 75° et 75° → 3ᵉ ?',ans:30},{html:'Angles : 90° et 60° → 3ᵉ ?',ans:30},{html:'Angles : 35° et 85° → 3ᵉ ?',ans:60},{html:'Angles : 20° et 130° → 3ᵉ ?',ans:30},{html:'Angles : 55° et 65° → 3ᵉ ?',ans:60},{html:'Angles : 90° et 27° → 3ᵉ ?',ans:63},{html:'Angles : 48° et 72° → 3ᵉ ?',ans:60},{html:'Angles : 100° et 42° → 3ᵉ ?',ans:38},{html:'Angles : 15° et 135° → 3ᵉ ?',ans:30},{html:'Angles : 66° et 54° → 3ᵉ ?',ans:60},{html:'Angles : 90° et 18° → 3ᵉ ?',ans:72}];shuffle(p);return p.slice(0,10);}},
tableau_prop2:{group:'Proportionnalité & %',color:'#0284c7',icon:'▦',title:'Tableaux — Niveau 2',desc:'Compléter un tableau avec des nombres décimaux',tags:['tableaux','⏱ 30s'],time:30,ansType:'decimal',tol:0.011,smallFont:true,
    gen(){const p=[];for(const k of [1.5,2.5,3.5,0.5,1.2,2.4])for(const a of [2,4,5,8,10]){const b=a+2;p.push({html:tableauProp('Quantité','Masse (kg)',a,b,fmtProp(a*k),'?'),ans:Math.round(b*k*100)/100});}shuffle(p);return p.slice(0,10);}},
pct_variation:{group:'Proportionnalité & %',color:'#9f1239',icon:'↑%',title:'Augmentation / diminution en %',desc:'Appliquer une hausse ou baisse en %',tags:['%','⏱ 25s'],time:25,ansType:'decimal',tol:0.1,smallFont:true,note:'📊 Donner la valeur finale',
    gen(){const p=[{html:'200 € augmenté de 10 %',ans:220},{html:'150 € augmenté de 20 %',ans:180},{html:'80 kg diminué de 25 %',ans:60},{html:'120 € diminué de 10 %',ans:108},{html:'500 € augmenté de 5 %',ans:525},{html:'40 € diminué de 50 %',ans:20},{html:'350 € augmenté de 20 %',ans:420},{html:'90 € diminué de 30 %',ans:63},{html:'1 000 € augmenté de 15 %',ans:1150},{html:'60 € diminué de 15 %',ans:51},{html:'250 € augmenté de 8 %',ans:270},{html:'400 € diminué de 5 %',ans:380},{html:'75 € augmenté de 40 %',ans:105},{html:'200 € diminué de 35 %',ans:130},{html:'180 € augmenté de 50 %',ans:270},{html:'320 € diminué de 25 %',ans:240}];shuffle(p);return p.slice(0,10);}},
probas_des:{group:'Probabilités',color:'#ea580c',icon:'🎲',title:'Probabilités — Niveau 2',desc:'Probabilités avec 1 ou 2 dés à 6 faces',tags:['probas','fractions','⏱ 25s'],time:25,ansType:'fraction',note:'🎲 Dés équilibrés à 6 faces',
    gen(){const p=[{html:'1 dé : obtenir un 6',ans:{n:1,d:6}},{html:'1 dé : obtenir un 3',ans:{n:1,d:6}},{html:'1 dé : obtenir un nombre pair',ans:{n:1,d:2}},{html:'1 dé : obtenir un nombre impair',ans:{n:1,d:2}},{html:'1 dé : obtenir un multiple de 3',ans:{n:1,d:3}},{html:'1 dé : obtenir un multiple de 2',ans:{n:1,d:2}},{html:'1 dé : obtenir un nombre &gt; 4',ans:{n:1,d:3}},{html:'1 dé : obtenir un nombre ≥ 5',ans:{n:1,d:3}},{html:'1 dé : obtenir un nombre &lt; 3',ans:{n:1,d:3}},{html:'1 dé : obtenir un 7',ans:{n:0,d:1}},{html:'1 dé : obtenir un nombre entre 1 et 6',ans:{n:1,d:1}},{html:'2 dés : somme = 2',ans:{n:1,d:36}},{html:'2 dés : somme = 12',ans:{n:1,d:36}},{html:'2 dés : somme = 7',ans:{n:1,d:6}},{html:'2 dés : somme = 6',ans:{n:5,d:36}},{html:'2 dés : somme = 8',ans:{n:5,d:36}},{html:'2 dés : somme = 5',ans:{n:1,d:9}},{html:'2 dés : somme = 9',ans:{n:1,d:9}},{html:'2 dés : somme = 3',ans:{n:1,d:18}},{html:'2 dés : somme = 11',ans:{n:1,d:18}},{html:'2 dés : somme = 13',ans:{n:0,d:1}},{html:'2 dés : faire un double',ans:{n:1,d:6}},{html:'2 dés : faire un double 6',ans:{n:1,d:36}},{html:'2 dés : au moins un 6',ans:{n:11,d:36}}];shuffle(p);return p.slice(0,10);}},
reductions:{group:'Algèbre',color:'#0891b2',icon:'✏️',title:"Réductions d'expressions",desc:'Réduire une expression algébrique',tags:['algèbre','⏱ 40s'],time:40,ansType:'text',note:'✏️ Format : ax²+bx+c (utilise ^ pour ²)',smallFont:true,
    gen(){const p=[{html:'2x + 3 − x + 5',ans:'x+8'},{html:'2x + 4 − x + 2',ans:'x+6'},{html:'2x + 3 − x + 2',ans:'x+5'},{html:'2x + 4 − x + 3',ans:'x+7'},{html:'−x + 2 + 3x + 8',ans:'2x+10'},{html:'−x + 4 + 4x + 6',ans:'3x+10'},{html:'3b + 2 − 5b − 3',ans:'-2b-1'},{html:'−4b + 4 + 5b + 6',ans:'b+10'},{html:'−3x + 2 + 3x + 8',ans:'10'},{html:'−4x + 2 + 4x + 8',ans:'10'},{html:'3x² + 2 + x² + 5',ans:'4x^2+7'},{html:'4x² + 2 + x² + 7',ans:'5x^2+9'},{html:'3x² + x + x² + 5x + 8',ans:'4x^2+6x+8'},{html:'2x² + x + x² + 4x + 5',ans:'3x^2+5x+5'},{html:'3x² + x − x² − 2x',ans:'2x^2-x'},{html:'4x² + x − x² − 3x',ans:'3x^2-2x'},{html:'−x² + x + 3x² − 2x',ans:'2x^2-x'},{html:'−x² + 5x − 4x² − 2x',ans:'-5x^2+3x'},{html:`${F('18x',9)} + ${F(15,3)} + ${F('6x',2)} + 1`,ans:'5x+6'},{html:`${F('9x',3)} + ${F(12,6)} + ${F('15x',5)} + 1`,ans:'6x+3'}];shuffle(p);return p.slice(0,10);}},
eq_niv2:{group:'Équations',color:'#2563eb',icon:'=',title:'Équations — Niveau 2',desc:'ax = b',tags:['équations','niveau 2','⏱ 25s'],time:25,ansType:'decimal',tol:0.001,smallFont:true,gen(){return generateEquations(2);}},
eq_niv7:{group:'Équations',color:'#2563eb',icon:'=',title:'Équations — Niveau 7',desc:'x / a + b = c',tags:['équations','niveau 7','⏱ 50s'],time:50,ansType:'decimal',tol:0.001,smallFont:true,gen(){return generateEquations(7);}},
};

    // Worlds share their movement, challenge and result interface.
    const worldTwo={modules:courtModules,places:courtPlaces,points:courtPoints,routes:courtRoutes,arts:courtArts,background:courtBackground,routeMarkup:document.querySelector('.court-routes').innerHTML};
    const worldThree={
      modules:['mult10','mult_rel','arrondir','carre','moyenne','conversions2','angles','tableau_prop2','pct_variation','probas_des','reductions','eq_niv2','eq_niv7'],
      places:['Galerie des puissances de dix','Atelier des relatifs','Cadran des arrondis','Pavillon des carrés','Jardin des moyennes','Atelier des mesures','Terrasse des triangles','Marché des proportions','Comptoir des pourcentages','Tour des probabilités','Bibliothèque des expressions','Balance des équations','Sanctuaire des constellations'],
      points:[[250,886],[236,694],[429,725],[595,879],[847,897],[1117,896],[1216,752],[1173,538],[287,412],[454,361],[620,341],[808,344],[1016,362],[1246,304],[1250,238]],
      routes:[[[250, 886], [208, 850], [180, 807], [184, 766], [213, 729], [236, 694]], [[236, 694], [285, 704], [340, 725], [390, 735], [429, 725]], [[429, 725], [454, 758], [435, 794], [451, 829], [501, 855], [547, 871], [595, 879]], [[595, 879], [663, 888], [755, 894], [847, 897]], [[847, 897], [944, 902], [1038, 902], [1117, 896]], [[1117, 896], [1176, 872], [1213, 829], [1234, 786], [1216, 752]], [[1216, 752], [1270, 758], [1333, 765], [1378, 758], [1409, 732], [1414, 702], [1401, 674], [1387, 651], [1368, 623], [1356, 594], [1351, 561], [1293, 543], [1173, 538]], [[1173, 538], [1228, 545], [1280, 548], [1327, 549], [1352, 540], [1362, 520], [1361, 500], [1353, 480], [1345, 455], [1339, 434], [1325, 413], [1308, 395], [1283, 381], [1246, 370], [1215, 362], [1114, 343], [1016, 362], [908, 356], [808, 344], [710, 342], [620, 341], [531, 350], [454, 361], [369, 386], [287, 412]], [[287, 412], [345, 389], [403, 369], [454, 361]], [[454, 361], [536, 349], [620, 341]], [[620, 341], [712, 340], [808, 344]], [[808, 344], [902, 352], [1016, 362]], [[1016, 362], [1114, 358], [1186, 337], [1246, 304]], [[1246, 304], [1250, 272], [1250, 238]]],
      arts:Array.from(document.getElementById('observatoryArts').content.querySelectorAll('img'),img=>img.src),
      background:document.getElementById('observatoryMapArt').content.querySelector('img').src,
      routeMarkup:document.getElementById('observatoryRoutes').content.querySelector('svg').innerHTML
    };
    worldThree.modules.forEach((key,i)=>{const stage=i+12;stageTitles[stage]=LEVEL_THREE_MODULES[key].title;challenges.push({stage,id:'niveau3-'+key,next:stage+1,move:()=>moveCourt(i+2)})});
    function setCourtWorld(world){
      courtWorld=world===3?3:2;const cfg=courtWorld===3?worldThree:worldTwo;
      courtBase=courtWorld===3?12:5;courtModules=cfg.modules;courtPlaces=cfg.places;courtPoints=cfg.points;courtRoutes=cfg.routes;courtArts=cfg.arts;courtBackground=cfg.background;
      document.getElementById('courtBackground').src=courtBackground;
      document.querySelector('.court-routes').innerHTML=cfg.routeMarkup;
      document.querySelector('.court-routes').setAttribute('viewBox',courtWorld===3?'0 0 1672 941':'0 0 1616 970');
      courtScreen.classList.toggle('observatory',courtWorld===3);courtTrial.classList.toggle('observatory',courtWorld===3);
      document.getElementById('courtTrialRing').hidden=courtWorld!==3;
      document.getElementById('courtDepthBoard').hidden=false;document.getElementById('courtDepthBoard').src=courtBackground;
      document.getElementById('courtBack').textContent=courtWorld===3?'← Niveau 2':'← Niveau 1';
      document.getElementById('skipLevelTwo').hidden=courtWorld===3;
      document.getElementById('courtWorldTitle').textContent='Niveau '+courtWorld;
      document.getElementById('courtWorldSubtitle').textContent=courtWorld===3?'L’Observatoire royal':'La Cour des Savoirs';
      document.getElementById('courtGoalLevel').textContent=String(courtWorld+1);
      for(let i=0;i<6;i++)document.getElementById('courtDone'+i).hidden=courtWorld===3||!isChallengeCompleted(i+5);
      for(let i=0;i<3;i++){document.getElementById('observatoryGroup'+i).hidden=courtWorld!==3;document.getElementById('observatoryGroupDone'+i).hidden=true}
      for(let i=0;i<13;i++){
        const row=document.getElementById('worldQuestRow'+i);row.hidden=i>=courtModules.length;
        if(i<courtModules.length){document.getElementById('worldQuestLabel'+i).textContent=(courtWorld===3?LEVEL_THREE_MODULES:LEVEL_TWO_MODULES)[courtModules[i]].title;document.getElementById('courtTrialDone'+i).classList.toggle('validated',isChallengeCompleted(courtBase+i))}
      }
      document.getElementById('courtComplete').classList.toggle('observatory-victory',courtWorld===3);document.getElementById('courtVictoryBackdrop').src=courtWorld===3?document.getElementById('observatoryGatePicture').src:courtBackground;
      document.getElementById('courtCompleteTitle').innerHTML='🏆 Niveau '+courtWorld+' terminé !<small>'+(courtWorld===3?'L’Observatoire royal':'La Cour des Savoirs')+'</small>';
      document.getElementById('courtVictoryNext').textContent=courtWorld===3?'La prochaine aventure sera ajoutée au-delà de cette porte.':'La porte de l’Observatoire royal t’attend.';
      document.getElementById('observatoryContinue').hidden=courtWorld!==2;
      courtFit();
    }
    function worldProgress(){
      const total=courtModules.length,count=courtModules.filter((_,i)=>isChallengeCompleted(courtBase+i)).length;
      for(const id of ['courtProgress','courtTrialProgress']){const bar=document.getElementById(id);bar.setAttribute('aria-valuemax',String(total));bar.setAttribute('aria-valuenow',String(count))}
      for(const id of ['courtProgressFill','courtTrialProgressFill'])document.getElementById(id).style.width=count/total*100+'%';
      for(const id of ['courtCount','courtTrialCount'])document.getElementById(id).textContent=count+' / '+total+' défis validés';
      courtModules.forEach((_,i)=>{const badge=document.getElementById('courtTrialDone'+i),done=isChallengeCompleted(courtBase+i);badge.classList.toggle('validated',done);badge.setAttribute('aria-label',done?'Validé':'Non validé')});
      if(courtWorld===2){for(let i=0;i<6;i++)document.getElementById('courtDone'+i).hidden=!isChallengeCompleted(i+5)}
      else for(const [i,lo,hi] of [[0,0,5],[1,5,7],[2,7,13]]){
        const done=courtModules.slice(lo,hi).filter((_,j)=>isChallengeCompleted(12+lo+j)).length;
        document.getElementById('observatoryGroup'+i).textContent=done+' / '+(hi-lo);
        document.getElementById('observatoryGroupDone'+i).hidden=done!==hi-lo;
        document.getElementById('trialGroupCount'+i).textContent=done+' / '+(hi-lo);
        const check=document.getElementById('trialGroupDone'+i);check.classList.toggle('validated',done===hi-lo);check.setAttribute('aria-label',done===hi-lo?'Groupe validé':'Groupe en cours');
      }
    }
    function calculatorAvailable(){return currentStage===7||(currentStage>=12&&!!courtModule()?.tags?.includes('calculatrice'))}
    // Exact comparison of polynomial coefficients: no evaluation of entered JavaScript.
    function polynomialEqual(student,canonical){
      const variable=(canonical.match(/[a-z]/i)||['x'])[0].toLowerCase();
      function parse(raw){
        const src=raw.toLowerCase().replace(/−/g,'-').replace(/²/g,'^2').replace(/,/g,'.').replace(/\s/g,'').replace(/×/g,'*');
        if(!src||src.length>160||/[^0-9a-z.+*/^()\-]/.test(src))throw Error('Expression');
        const tokens=src.match(/(?:\d+(?:\.\d*)?|\.\d+)|[a-z]|[+*/^()\-]/g)||[];let at=0;
        const add=(a,b,sign=1)=>Array.from({length:Math.max(a.length,b.length)},(_,i)=>(a[i]||0)+sign*(b[i]||0));
        function multiply(a,b){if(a.length+b.length>8)throw Error('Degré');const out=Array(a.length+b.length-1).fill(0);a.forEach((x,i)=>b.forEach((y,j)=>out[i+j]+=x*y));return out}
        function atom(){
          const t=tokens[at++];let p;
          if(t==='+')return atom();if(t==='-')return atom().map(v=>-v);
          if(t==='('){p=sum();if(tokens[at++]!==')')throw Error('Parenthèse')}
          else if(t===variable)p=[0,1];else if(t!==undefined&&/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(t))p=[Number(t)];else throw Error('Terme');
          if(tokens[at]==='^'){at++;const exp=tokens[at++];if(!/^[0-4]$/.test(exp||''))throw Error('Puissance');let q=[1];for(let k=0;k<Number(exp);k++)q=multiply(q,p);p=q}return p;
        }
        function product(){let a=atom();while(at<tokens.length){const t=tokens[at];if(t==='*'||t==='/'){at++;const b=atom();if(t==='/'){if(b.length!==1||b[0]===0)throw Error('Division');a=a.map(v=>v/b[0])}else a=multiply(a,b)}else if(t==='('||t===variable){a=multiply(a,atom())}else break}return a}
        function sum(){let a=product();while(tokens[at]==='+'||tokens[at]==='-'){const op=tokens[at++];a=add(a,product(),op==='+'?1:-1)}return a}
        const out=sum();if(at!==tokens.length||out.some(v=>!Number.isFinite(v)))throw Error('Expression');return out;
      }
      try{const a=parse(student),b=parse(canonical);return Array.from({length:Math.max(a.length,b.length)},(_,i)=>Math.abs((a[i]||0)-(b[i]||0))<1e-8).every(Boolean)}catch(e){return false}
    }
    const observatoryEntrance=document.getElementById('observatoryEntrance');
    const observatoryEntranceScene=document.getElementById('observatoryEntranceScene');
    const observatoryEntranceHero=document.getElementById('observatoryEntranceHero');
    let observatoryRaf=0,observatoryDoorTimer=null,observatoryFinishTimer=null,observatoryToken=0;
    observatoryEntranceHero.src=heroIdle[6];
    function cancelObservatoryEntrance(){observatoryToken++;cancelAnimationFrame(observatoryRaf);clearTimeout(observatoryDoorTimer);clearTimeout(observatoryFinishTimer);observatoryEntranceHero.src=heroIdle[6];observatoryEntranceHero.style.transform=''}
    function fitObservatoryEntrance(){const area=document.getElementById('observatoryEntranceArea'),w=Math.min(area.clientWidth-12,(area.clientHeight-12)*1672/941);if(w>0){observatoryEntranceScene.style.width=w+'px';observatoryEntranceScene.style.height=w*941/1672+'px'}}
    new ResizeObserver(fitObservatoryEntrance).observe(document.getElementById('observatoryEntranceArea'));window.addEventListener('resize',fitObservatoryEntrance);document.addEventListener('fullscreenchange',fitObservatoryEntrance);
    function finishObservatoryEntrance(){
      cancelObservatoryEntrance();if(observatoryEntrance.hidden)return;
      observatoryEntranceScene.classList.remove('playing');observatoryEntranceScene.classList.add('gate-open','arrived');
      document.getElementById('observatoryEntranceStatus').textContent='La porte s’ouvre sur l’Observatoire royal. Bienvenue au niveau 3 !';
      document.getElementById('observatoryEnter').hidden=false;document.getElementById('observatoryEntranceSkip').hidden=true;document.getElementById('observatoryEnter').focus({preventScroll:true});
    }
    function showObservatoryEntrance(direct=false){
      if(!direct&&!worldTwo.modules.every((_,i)=>isChallengeCompleted(i+5)))return;
      if(direct===true)levelThreeDirectAccess=true;
      if(releasePartialFullscreen(()=>showObservatoryEntrance(direct)))return;
      cancelCourt();cancelVictory();document.getElementById('courtComplete').hidden=true;courtTrial.hidden=true;observatoryEntrance.hidden=false;cancelObservatoryEntrance();
      observatoryEntranceScene.classList.remove('gate-open','arrived','playing');document.getElementById('observatoryEnter').hidden=true;document.getElementById('observatoryEntranceSkip').hidden=false;
      document.getElementById('observatoryEntranceStatus').textContent='Le héros quitte la Cour et monte vers les étoiles…';fitObservatoryEntrance();document.getElementById('observatoryEntranceBack').focus({preventScroll:true});
      if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){finishObservatoryEntrance();return}
      void observatoryEntranceScene.offsetWidth;observatoryEntranceScene.classList.add('playing');const token=observatoryToken,started=performance.now();
      function step(){if(token!==observatoryToken||observatoryEntrance.hidden)return;const elapsed=performance.now()-started;if(elapsed>=7000){observatoryEntranceHero.src=heroIdle[6];observatoryEntranceHero.style.transform='';return}const phase=Math.floor(elapsed/115)%4;observatoryEntranceHero.src=heroAngles[phase*8+6];observatoryEntranceHero.style.transform=phase===3?'scaleX(-1)':'';observatoryRaf=requestAnimationFrame(step)}step();
      observatoryDoorTimer=setTimeout(()=>{if(token===observatoryToken&&!observatoryEntrance.hidden){observatoryEntranceScene.classList.add('gate-open');document.getElementById('observatoryEntranceStatus').textContent='La grande porte constellée s’ouvre devant lui…'}},3200);
      observatoryFinishTimer=setTimeout(finishObservatoryEntrance,7200);
    }
    function hideObservatoryEntrance(){cancelObservatoryEntrance();observatoryEntrance.hidden=true;observatoryEntranceScene.classList.remove('playing','gate-open','arrived')}
    document.getElementById('skipLevelTwo').addEventListener('click',()=>showObservatoryEntrance(true));
    document.getElementById('observatoryContinue').addEventListener('click',()=>showObservatoryEntrance(false));
    document.getElementById('observatoryEnter').addEventListener('click',()=>{hideObservatoryEntrance();enterCourt(3)});
    document.getElementById('observatoryEntranceSkip').addEventListener('click',finishObservatoryEntrance);
    document.getElementById('observatoryEntranceReplay').addEventListener('click',()=>showObservatoryEntrance(levelThreeDirectAccess));
    document.getElementById('observatoryEntranceBack').addEventListener('click',()=>{hideObservatoryEntrance();document.getElementById('courtAction').focus({preventScroll:true})});
    document.getElementById('observatoryEntranceFullscreen').addEventListener('click',toggleAppFullscreen);

    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!observatoryEntrance.hidden&&!document.fullscreenElement){hideObservatoryEntrance();document.getElementById('courtAction').focus({preventScroll:true})}});

    setMapStatus();

    const fullscreen=document.getElementById('fullscreen');
    fullscreen.addEventListener('click',toggleAppFullscreen);
    window.MQAccount?.attach({apply(ids,reset){
      if(reset){
        sessionToken++;stopQuizTimers();quizActive=false;closeCalculator();calcToggle.hidden=true;
        quizScreen.hidden=true;resultsArea.hidden=true;questionArea.hidden=false;document.body.style.overflow='';
        cancelCourt();cancelVictory();hideObservatoryEntrance();courtScreen.hidden=true;courtTrial.hidden=true;document.getElementById('courtComplete').hidden=true;
        levelTwoDirectAccess=false;levelThreeDirectAccess=false;setCourtWorld(2);backToStart();
      }
      const known=new Set(challenges.map(c=>c.id));
      if(ids===null){try{ids=JSON.parse(localStorage.getItem(PROGRESS_KEY)||'[]')}catch(_){ids=[]}}
      completedChallenges.clear();if(Array.isArray(ids))for(const id of ids)if(known.has(id))completedChallenges.add(id);
      passed=isChallengeCompleted(1);secondPassed=isChallengeCompleted(2);
      setMapStatus();updateChallengeChoices();if(!arrival.hidden)updateArrival();
      if(!courtTrial.hidden){const done=isChallengeCompleted();document.getElementById('courtTrialPass').hidden=!done;document.getElementById('courtTrialStart').textContent=done?'Rejouer':'▶ Commencer le défi'}
    }});
  })();
  