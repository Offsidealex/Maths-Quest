from pathlib import Path
import re,json,base64,zipfile,math
s=Path('outputs/Maths-Quest-v0.3.35-autonome.html').read_text().replace('0.3.35','0.3.36')
source=Path('work/activites-source-level3.html').read_text();keys=['mult10','mult_rel','arrondir','carre','moyenne','conversions2','angles','tableau_prop2','pct_variation','probas_des','reductions','eq_niv2','eq_niv7'];parts=[]
for key in keys:
 m=re.search(r'^  '+key+r':',source,re.M);end=re.search(r'^  [a-z0-9_]+:',source[m.end():],re.M)
 part=source[m.start():m.end()+end.start()] if end else source[m.start():source.index('\n};',m.start())]
 part=re.sub(r'\n\s*/\*.*?\*/\s*$','',part,flags=re.S).strip();parts.append(part)
modules="const F=(n,d)=>`<span class=\"fr\"><span class=\"n\">${n}</span><span class=\"d\">${d}</span></span>`;\nconst LEVEL_THREE_MODULES={\n"+'\n'.join(parts)+'\n};\n'
Path('work/level3-modules.js').write_text(modules)
routes=[[[250, 886], [208, 850], [180, 807], [184, 766], [213, 729], [236, 694]], [[236, 694], [285, 704], [340, 725], [390, 735], [429, 725]], [[429, 725], [454, 758], [435, 794], [451, 829], [501, 855], [547, 871], [595, 879]], [[595, 879], [663, 888], [755, 894], [847, 897]], [[847, 897], [944, 902], [1038, 902], [1117, 896]], [[1117, 896], [1176, 872], [1213, 829], [1234, 786], [1216, 752]], [[1216, 752], [1270, 758], [1333, 765], [1378, 758], [1409, 732], [1414, 702], [1401, 674], [1387, 651], [1368, 623], [1356, 594], [1351, 561], [1293, 543], [1173, 538]], [[1173, 538], [1228, 545], [1280, 548], [1327, 549], [1352, 540], [1362, 520], [1361, 500], [1353, 480], [1345, 455], [1339, 434], [1325, 413], [1308, 395], [1283, 381], [1246, 370], [1215, 362], [1114, 343], [1016, 362], [908, 356], [808, 344], [710, 342], [620, 341], [531, 350], [454, 361], [369, 386], [287, 412]], [[287, 412], [345, 389], [403, 369], [454, 361]], [[454, 361], [536, 349], [620, 341]], [[620, 341], [712, 340], [808, 344]], [[808, 344], [902, 352], [1016, 362]], [[1016, 362], [1114, 358], [1186, 337], [1246, 304]], [[1246, 304], [1250, 272], [1250, 238]]]
extra=Path('work/observatory-v0336.js').read_text().replace('OBS_ROUTES',json.dumps(routes)).replace('points:[[170,916]','points:[[250,886]')
# Shared world engine, retaining stage IDs and saves for existing challenges.
for name in ['courtModules','courtPlaces','courtPoints','courtRoutes','courtArts','courtBackground']:s=s.replace('const '+name+'=','let '+name+'=',1)
s=s.replace('let levelTwoDirectAccess=false;', 'let levelTwoDirectAccess=false,levelThreeDirectAccess=false,courtWorld=2,courtBase=5;',1)
s=s.replace('function courtModule(){return LEVEL_TWO_MODULES[courtModules[currentStage-5]];}', 'function courtModule(){return (courtWorld===3?LEVEL_THREE_MODULES:LEVEL_TWO_MODULES)[courtModules[currentStage-courtBase]];}')
s=s.replace('courtZoom,1614/974','courtZoom,courtWorld===3?1672/941:1614/974',1)
a=s.index('    function updateCourtStatus(){');b=s.index('    function courtPosition(',a)
s=s[:a]+'''    function updateCourtStatus(){worldProgress()}
'''+s[b:]
s=s.replace("p[0]/1616*100-2.17", "p[0]/(courtWorld===3?1672:1616)*100-2.17").replace("p[1]/970*100-12.05", "p[1]/(courtWorld===3?941:970)*100-(courtWorld===3?12.6:12.05)")
s=s.replace("function enterCourt(){\n      if(!isChallengeCompleted(3)&&!levelTwoDirectAccess)return;", "function enterCourt(requestedWorld=2){\n      const nextWorld=requestedWorld===3?3:2;\n      if(nextWorld===3&&!levelThreeDirectAccess&&!worldTwo.modules.every((_,i)=>isChallengeCompleted(i+5)))return;\n      if(nextWorld===2&&!isChallengeCompleted(3)&&!levelTwoDirectAccess)return;\n      hideObservatoryEntrance();setCourtWorld(nextWorld);")
s=s.replace('courtAt=0;currentStage=5;', 'courtAt=0;currentStage=courtBase;',1)
s=s.replace("courtMessage.textContent='Bienvenue dans la Cour des Savoirs ! Six épreuves t’attendent autour du cheval.';", "courtMessage.textContent=courtWorld===3?'Bienvenue à l’Observatoire royal ! Treize épreuves t’attendent sous les étoiles.':'Bienvenue dans la Cour des Savoirs ! Six épreuves t’attendent autour du cheval.';",1)
s=s.replace('function leaveCourt(){\n      cancelCourt();', 'function leaveCourt(){\n      if(courtWorld===3){enterCourt(2);return}\n      cancelCourt();',1)
s=s.replace('target<1||target>7', 'target<1||target>courtModules.length+1',1).replace('!isChallengeCompleted(target+3)', '!isChallengeCompleted(courtBase+target-2)',1)
s=s.replace('target===7?', 'target===courtModules.length+1?',1).replace('currentStage=target+4;', 'currentStage=target+courtBase-1;',1)
s=s.replace('courtRest([6,5,5,6,6,7,6,0][target]);', 'courtRest(courtWorld===3?6:[6,5,5,6,6,7,6,0][target]);',1)
s=s.replace('if(target===7){', 'if(target===courtModules.length+1){',1)
s=s.replace("courtMessage.textContent='🏆 Les six défis sont validés ! La voie vers le niveau 3 est ouverte.';", "courtMessage.textContent=courtWorld===3?'🏆 Les treize défis sont validés ! L’Observatoire royal est conquis.':'🏆 Les six défis sont validés ! La voie vers le niveau 3 est ouverte.';",1)
s=s.replace("textContent='🏆 Niveau 2 terminé'", "textContent='🏆 Niveau '+courtWorld+' terminé'",1)
s=s.replace('courtAt<1||courtAt>6','courtAt<1||courtAt>courtModules.length',1)
s=s.replace("const landing=[[34.3,88.3],[35.2,86.4],[28.4,89],[31.8,89],[31.6,88.1],[28.3,90.9]][courtAt-1];", "const landing=courtWorld===3?[30,90.5]:[[34.3,88.3],[35.2,86.4],[28.4,89],[31.8,89],[31.6,88.1],[28.3,90.9]][courtAt-1];",1)
s=s.replace("['Première','Deuxième','Troisième','Quatrième','Cinquième','Sixième'][courtAt-1]", "['Première','Deuxième','Troisième','Quatrième','Cinquième','Sixième','Septième','Huitième','Neuvième','Dixième','Onzième','Douzième','Treizième'][courtAt-1]",1)
s=s.replace("enterCourt()});", "enterCourt(courtWorld)});",1)
s=s.replace('courtAt===7?', 'courtAt===courtModules.length+1?',1)
s=s.replace("if(currentStage<1||currentStage===4||currentStage>10||(currentStage===5&&!isChallengeCompleted(3)&&!levelTwoDirectAccess)||(currentStage>1&&currentStage!==5&&!isChallengeCompleted(currentStage-1)))return;", "if(!challenges.some(item=>item.stage===currentStage)||(currentStage===5&&!isChallengeCompleted(3)&&!levelTwoDirectAccess)||(currentStage===12&&!levelThreeDirectAccess&&!worldTwo.modules.every((_,i)=>isChallengeCompleted(i+5)))||(currentStage>1&&currentStage!==5&&currentStage!==12&&!isChallengeCompleted(currentStage-1)))return;",1)
s=s.replace('calcToggle.hidden=currentStage!==7','calcToggle.hidden=!calculatorAvailable()',1)
s=s.replace("(currentStage>=5?'2':'1')", "(currentStage>=12?'3':currentStage>=5?'2':'1')",1)
s=s.replace("(currentStage>=5?'⚜ La Cour des Savoirs':'⚜ Les bases de l’Académie')", "(currentStage>=12?'⚜ L’Observatoire royal':currentStage>=5?'⚜ La Cour des Savoirs':'⚜ Les bases de l’Académie')",1)
s=s.replace("courtModule().ansType==='decimal'?'decimal':'numeric'", "courtModule().ansType==='decimal'?'decimal':courtModule().ansType==='text'?'text':'numeric'",1)
s=s.replace("qInput.placeholder=currentStage>=5&&courtModule().ansType==='fraction'?'Ex. : 3/5':'?';", "qInput.placeholder=currentStage>=5&&courtModule().ansType==='fraction'?'Ex. : 3/5':currentStage>=12&&courtModule().ansType==='text'?'Ex. : 2x + 3':'?';",1)
s=s.replace("const exerciseScenery=currentStage>=5?courtArts[currentStage-5]", "const exerciseScenery=currentStage>=5?courtArts[currentStage-courtBase]",1)
s=s.replace("mod.ansType==='fraction'){", "mod.ansType==='text')return polynomialEqual(given,q.answer);\n      if(mod.ansType==='fraction'){",1)
s=s.replace("mod.ansType==='int'?Number.isInteger(value)&&value===q.answer:Math.abs(value-q.answer)<=(mod.tol||1e-9)", "mod.ansType==='int'?Number.isInteger(value)&&value===q.answer:Math.abs(value-q.answer)<=(mod.tol||1e-9)+(courtWorld===3?Math.abs(q.answer)*.0001:0)",1)
s=s.replace('currentStage!==7||!quizActive', '!calculatorAvailable()||!quizActive')
s=s.replace("(currentStage===10?'Bravo ! Les six défis sont validés. Rejoins la dernière porte !':'Bravo ! La prochaine épreuve de la Cour est débloquée.')", "(currentStage===courtBase+courtModules.length-1?'Bravo ! Tous les défis du niveau sont validés. Rejoins la dernière porte !':'Bravo ! La prochaine épreuve est débloquée.')",1)
s=s.replace("(currentStage===10?'⚔ Rejoindre la dernière porte →':'⚔ Rejoindre la prochaine épreuve →')", "(currentStage===courtBase+courtModules.length-1?'⚔ Rejoindre la dernière porte →':'⚔ Rejoindre la prochaine épreuve →')",1)
s=s.replace("textContent='Six épreuves remportées ! La Cour des Savoirs est conquise.'", "textContent=courtWorld===3?'Treize épreuves remportées ! L’Observatoire royal est conquis.':'Six épreuves remportées ! La Cour des Savoirs est conquise.'",1)
s=s.replace('courtAt!==7||!courtModules.every((_,i)=>isChallengeCompleted(i+5))', 'courtAt!==courtModules.length+1||!courtModules.every((_,i)=>isChallengeCompleted(courtBase+i))',1)
s=s.replace('<p>Étendue = maximum − minimum.<br>Le temps continue de s’écouler.</p>','<p><span id="calculatorHint">Étendue = maximum − minimum.</span><br>Le temps continue de s’écouler.</p>',1)
s=s.replace('calcToggle.hidden=!calculatorAvailable();', "calcToggle.hidden=!calculatorAvailable();document.getElementById('calculatorHint').textContent=currentStage===7?'Étendue = maximum − minimum.':currentStage===14?'Arrondis le résultat au dixième.':'Pour un carré, multiplie le nombre par lui-même.';",1)
s=s.replace("quizScreen.hidden=false;", "if(currentStage>=12&&courtModule().ansType==='text')document.querySelector('.quiz-tip').textContent='Réduis l’expression. Carré : ² ou ^2 ; termes équivalents acceptés.';\n      quizScreen.hidden=false;",1)
s=s.replace('    setMapStatus();',modules+'\n'+extra+'\n    setMapStatus();',1)
# World-specific labels and common parchment, retaining all existing IDs.
s=s.replace('<div class="court-world-title">Niveau 2<small>La Cour des Savoirs</small></div>', '<div class="court-world-title"><span id="courtWorldTitle">Niveau 2</span><small id="courtWorldSubtitle">La Cour des Savoirs</small></div>',1)
a=s.index('<aside id="courtTrialQuests"');b=s.index('</aside>',a)+8
labels=['Conversions de longueurs','Tableaux de proportionnalité','Étendue d’une série','Probabilités','Calcul d’expressions','Équations']
quests='<aside id="courtTrialQuests" class="court-quests" aria-label="Quêtes du niveau"><h2>Quêtes du niveau</h2>'+''.join('<div id="worldQuestRow'+str(i)+'" class="court-quest-row"'+(' hidden' if i>=6 else '')+'><b>'+str(i+1)+'</b><span id="worldQuestLabel'+str(i)+'">'+(labels[i] if i<6 else '')+'</span><span id="courtTrialDone'+str(i)+'" class="court-quest-check" aria-label="Non validé">✓</span></div>' for i in range(13))+'<p class="court-goal">⭐ Obtiens au moins<br><strong>80 %</strong> de bonnes réponses<br>pour avancer au niveau <span id="courtGoalLevel">3</span>.</p></aside>'
s=s[:a]+quests+s[b:]
s=s.replace('<img id="courtTrialHero"', '<div id="courtTrialRing" hidden aria-hidden="true"></div><img id="courtTrialHero"',1)
s=s.replace('<button id="courtBack"','<button id="skipLevelTwo" type="button">Passer au niveau 3 →</button><button id="courtBack"',1)
s=s.replace('<p class="court-victory-next">','<p id="courtVictoryNext" class="court-victory-next">',1)
s=s.replace('<button id="courtVictoryReplay"','<button id="observatoryContinue" type="button">Rejoindre l’Observatoire royal →</button><button id="courtVictoryReplay"',1)
groups=''.join('<span id="observatoryGroup'+str(i)+'" class="observatory-group-count" style="top:'+str(y)+'%" hidden>0 / '+str(n)+'</span><span id="observatoryGroupDone'+str(i)+'" class="observatory-group-done" style="top:'+str(cy)+'%" hidden>✓</span>' for i,(y,n,cy) in enumerate([(30.6,5,28.7),(43.4,2,39.0),(54.1,6,50.8)]))
s=s.replace('<img id="courtHero"',groups+'<img id="courtHero"',1)
s=s.replace('  </style>',Path('work/observatory-v0336.css').read_text()+'\n  </style>',1)
# Prepare JS even while illustrations are still generating.
Path('work/game-v0336.js').write_text(re.search(r'<script>(.*?)</script>',s,re.S)[1])
assets=[Path('work/observatory-map-v0336.png'),Path('work/observatory-gate-v0336.png')]+[Path('work/observatory-station-'+str(i)+'.png') for i in range(13)]
if not all(p.exists() for p in assets):print('Script niveau 3 prêt ; illustrations en cours.');raise SystemExit(0)
# Encode illustrations efficiently; preserve map lettering at its original resolution.
from PIL import Image
for i,p in enumerate(assets):
 im=Image.open(p).convert('RGB')
 if i>=2:im.thumbnail((1440,810))
 im.save(p.with_suffix('.jpg'),quality=94 if i<2 else 90,subsampling=0,optimize=True)
def uri(p):return 'data:image/jpeg;base64,'+base64.b64encode(p.with_suffix('.jpg').read_bytes()).decode()
def trim(points,first,last):
 ps=[list(p) for p in points]
 for reverse,amount in [(False,first),(True,last)]:
  if reverse:ps.reverse()
  while amount and len(ps)>1:
   a,b=ps[0],ps[1];d=math.dist(a,b)
   if amount>=d:amount-=d;ps.pop(0)
   else:ps[0]=[a[0]+(b[0]-a[0])*amount/d,a[1]+(b[1]-a[1])*amount/d];amount=0
  if reverse:ps.reverse()
 return ps
svg='<svg viewBox="0 0 1672 941"><defs><filter id="observatoryGlow"><feGaussianBlur stdDeviation="4"/></filter><marker id="observatoryArrow" viewBox="0 0 24 24" refX="19" refY="12" markerWidth="4.5" markerHeight="4.5" orient="auto"><path d="M2 2 22 12 2 22 7 12Z" fill="#fff7a8" stroke="#ffd52e" stroke-width="2"/></marker></defs>'
for route in routes[:-1]:
 ps=trim(route,35,38);mid=len(ps)//2
 if len(ps)<2:continue
 for j,half in enumerate([trim(ps[:mid+1],0,7),trim(ps[mid:],7,0)]):
  if len(half)<2:continue
  d='M'+' L'.join(','.join(str(round(v,2)) for v in p) for p in half)
  svg+='<path d="'+d+'" fill="none" stroke="#ffcf00" stroke-width="13" opacity=".75" filter="url(#observatoryGlow)"/><path d="'+d+'" fill="none" stroke="#ffd52a" stroke-width="8"/><path d="'+d+'" fill="none" stroke="#fff7a8" stroke-width="4"'+(' marker-end="url(#observatoryArrow)"' if j else '')+'/>'
svg+='</svg>'
Path('work/observatory-routes-v0336.svg').write_text(svg.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="941" ',1))
cinematic='''<section id="observatoryEntrance" class="level-two-screen observatory-entrance" hidden aria-label="Transition vers le niveau 3"><header class="level-two-heading"><h1>Niveau 3 · L’Observatoire royal</h1><p>De la Cour des Savoirs aux terrasses étoilées</p></header><div id="observatoryEntranceArea" class="level-two-stage"><div id="observatoryEntranceScene" class="level-two-scene"><img id="observatoryGatePicture" class="level-two-background" src="@@GATE@@" alt="Un pont et un escalier montent vers la grande porte constellée de l’Observatoire."><div class="gate-opening" aria-hidden="true"><div class="gate-door gate-door-left"><span class="door-inset"></span><span class="gate-emblem">✦</span><span class="gate-handle"></span></div><div class="gate-door gate-door-right"><span class="door-inset"></span><span class="gate-emblem">✦</span><span class="gate-handle"></span></div></div><div class="level-two-walker"><img id="observatoryEntranceHero" alt="Le héros vu de dos avance vers la porte." draggable="false"></div></div></div><footer class="level-two-controls"><p id="observatoryEntranceStatus" role="status" aria-live="polite"></p><div class="level-two-buttons"><button id="observatoryEntranceBack" type="button">← Retour à la cour</button><button id="observatoryEntranceSkip" type="button">Passer l’animation</button><button id="observatoryEntranceReplay" type="button">↻ Revoir la transition</button><button id="observatoryEnter" type="button" hidden>Entrer dans l’Observatoire →</button><button id="observatoryEntranceFullscreen" type="button">⛶ Plein écran</button></div></footer></section>'''
markup=cinematic+'<svg width="0" height="0" aria-hidden="true"><defs><clipPath id="observatoryHudClip" clipPathUnits="objectBoundingBox"><rect x="0" y="0" width=".33" height=".15"/><rect x=".386" y="0" width=".227" height=".127"/><rect x=".664" y="0" width=".332" height=".165"/></clipPath></defs></svg><template id="observatoryMapArt"><img src="@@MAP@@" alt="La carte de l’Observatoire royal."></template><template id="observatoryArts">@@ARTS@@</template><template id="observatoryRoutes">@@SVG@@</template>'
values={'MAP':uri(assets[0]),'GATE':uri(assets[1]),'ARTS':''.join('<img src="'+uri(p)+'" alt="Épreuve '+str(i+1)+' de l’Observatoire.">' for i,p in enumerate(assets[2:])),'SVG':svg}
markup=re.sub(r'@@(MAP|GATE|ARTS|SVG)@@',lambda m:values[m[1]],markup)
s=s.replace('  <script>',markup+'\n  <script>',1)
p=Path('outputs/Maths-Quest-v0.3.36-autonome.html');p.write_text(s)
external=s
with zipfile.ZipFile('outputs/Maths-Quest-v0.3.35.zip') as old,zipfile.ZipFile('outputs/Maths-Quest-v0.3.36.zip','w',zipfile.ZIP_DEFLATED) as z:
 names=re.findall(r'(?:src=|url\()["\']?(assets/[^"\') ]+)',old.read('index.html').decode())+['assets/observatory-gate.jpg','assets/observatory-map.jpg']+['assets/observatory-station-'+str(i)+'.jpg' for i in range(13)]
 images=list(re.finditer(r'data:image/[^;]+;base64,([A-Za-z0-9+/=]+)',s));assert len(names)==len(images),(len(names),len(images))
 for name,m in zip(names,images):z.writestr(name,base64.b64decode(m[1]))
 it=iter(names);z.writestr('index.html',re.sub(r'data:image/[^;]+;base64,[A-Za-z0-9+/=]+',lambda m:next(it),s));z.write(p,p.name)
 for n in old.namelist():
  if n.startswith('sources/'):z.writestr(n,old.read(n))
 z.writestr('sources/niveau-3-modules.js',modules)
 z.writestr('LIRE-MOI.txt',old.read('LIRE-MOI.txt').decode().replace('0.3.35','0.3.36')+'\nNiveau 3 : L’Observatoire royal, 13 épreuves du dépôt Activites_mentales, décor nocturne, carte et déplacements, treize transitions de face, progression par groupes et seuil 8/10. La fin du niveau 2 mène à une nouvelle cinématique de dos : montée, porte ouvrante et entrée au niveau 3. Bouton Passer au niveau 3 dans la cour pour tester. Calculatrice pour les modules autorisés, expressions algébriques comparées sans exécution de code.\n')
with zipfile.ZipFile('outputs/Maths-Quest-v0.3.36.zip') as z:assert z.testzip() is None
print('Version locale 0.3.36 créée :',p.stat().st_size,'octets.')
