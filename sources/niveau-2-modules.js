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
