    // Worlds share their movement, challenge and result interface.
    const worldTwo={modules:courtModules,places:courtPlaces,points:courtPoints,routes:courtRoutes,arts:courtArts,background:courtBackground,routeMarkup:document.querySelector('.court-routes').innerHTML};
    const worldThree={
      modules:['mult10','mult_rel','arrondir','carre','moyenne','conversions2','angles','tableau_prop2','pct_variation','probas_des','reductions','eq_niv2','eq_niv7'],
      places:['Galerie des puissances de dix','Atelier des relatifs','Cadran des arrondis','Pavillon des carrés','Jardin des moyennes','Atelier des mesures','Terrasse des triangles','Marché des proportions','Comptoir des pourcentages','Tour des probabilités','Bibliothèque des expressions','Balance des équations','Sanctuaire des constellations'],
      points:[[170,916],[236,694],[429,725],[595,879],[847,897],[1117,896],[1216,752],[1173,538],[287,412],[454,361],[620,341],[808,344],[1016,362],[1246,304],[1250,238]],
      routes:OBS_ROUTES,
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
