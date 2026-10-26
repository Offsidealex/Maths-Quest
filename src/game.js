// Maths Quest — Village RPG, prototype 2D. Les questions sont temporaires.
const modules=["Calcul mental","Nombres relatifs","Fractions","Statistiques","Conversions","Proportionnalité","Probabilités","Algèbre","Équations","Géométrie","Pythagore"];
const icons=["✦","±","½","▥","↔","%","⚄","x²","=","△","√"];
let saved={};try{saved=JSON.parse(localStorage.getItem("maths-quest-progress")||"{}")}catch(e){}
const state={done:saved},touch={up:false,down:false,left:false,right:false};
let player,keys,doors=[],label,locked=false,scene,avatar,progress;
const game=new Phaser.Game({type:Phaser.AUTO,width:900,height:600,parent:"game",backgroundColor:"#5b994d",pixelArt:true,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_HORIZONTALLY},physics:{default:"arcade"},scene:{create,update}});
function block(s,x,y,w,h,color,depth=0){return s.add.rectangle(x,y,w,h,color).setDepth(depth)}
function create(){
 const s=this;scene=s;doors=[];
 // Grass checkerboard, small flowers and rocks
 for(let y=0;y<600;y+=30)for(let x=0;x<900;x+=30){block(s,x+15,y+15,30,30,((x/30+y/30)%3===0)?0x68a853:0x74b75b);if((x*13+y*7)%17===0){block(s,x+8,y+11,4,4,0xf9d57a,1);block(s,x+12,y+9,3,3,0xffffff,1)}}
 // Connected stone pathways
 block(s,450,315,86,550,0xcbb98a,1);block(s,450,205,860,58,0xcbb98a,1);block(s,450,350,860,58,0xcbb98a,1);block(s,450,490,860,52,0xcbb98a,1);
 for(let x=22;x<900;x+=37){for(const y of [185,327,470])block(s,x,y,15,4,0xb2a177,2)}
 // Decorative forest edges
 for(let i=0;i<16;i++){const x=16+i*58;tree(s,x,84+(i%2)*13);if(i%3===0)tree(s,x,556)}
 // Houses in three rows: 4 + 4 + 3
 modules.forEach((name,i)=>{const col=i%4,row=Math.floor(i/4),x=112+col*225,y=154+row*141;house(s,x,y,name,icons[i],!!state.done[name]);});
 // Signposts and water well
 block(s,445,553,44,14,0x735137,4);block(s,445,540,34,28,0x6b8395,4);block(s,445,534,21,10,0x93d6ea,5);
 block(s,450,66,410,60,0x233f37,20).setStrokeStyle(4,0xe3c68c);
 s.add.text(450,54,"MATHS QUEST  •  MONDE 1",{fontFamily:"monospace",fontSize:"22px",color:"#ffe8a3",fontStyle:"bold"}).setOrigin(.5).setDepth(21);
 s.add.text(450,77,"LE VILLAGE DES SAVOIRS",{fontFamily:"monospace",fontSize:"15px",color:"#ffffff"}).setOrigin(.5).setDepth(21);
 block(s,450,582,900,35,0x233f37,20);
 label=s.add.text(12,582,"",{fontFamily:"monospace",fontSize:"15px",color:"#ffffff"}).setOrigin(0,.5).setDepth(21);
 progress=s.add.text(888,582,"",{fontFamily:"monospace",fontSize:"14px",color:"#ffe8a3"}).setOrigin(1,.5).setDepth(21);
 // Avatar
 avatar=s.add.container(450,525).setDepth(15);
 avatar.add([block(s,0,0,1,1,0x000000).setVisible(false)]); // harmless internal placeholder
 const shadow=s.add.ellipse(0,13,23,8,0x25422b,.55);
 const boots=s.add.rectangle(0,11,17,9,0x4c3640);
 const body=s.add.rectangle(0,0,20,19,0x326cc1);
 const face=s.add.rectangle(0,-15,19,19,0xf1b980);
 const hair=s.add.rectangle(0,-24,22,7,0x4a3027);
 const eyes=s.add.rectangle(-5,-15,3,3,0x242424);
 const eye2=s.add.rectangle(5,-15,3,3,0x242424);
 avatar.add([shadow,boots,body,face,hair,eyes,eye2]);
 player=s.add.zone(450,525,22,24);s.physics.add.existing(player);player.body.setCollideWorldBounds(true);player.body.setSize(20,20);
 keys=s.input.keyboard.addKeys("UP,DOWN,LEFT,RIGHT,W,A,S,D,SPACE");
 s.input.keyboard.on("keydown-SPACE",interact);
 s.input.keyboard.on("keydown-ENTER",interact);
}
function tree(s,x,y){block(s,x,y+11,10,26,0x805b37,3);block(s,x,y-3,39,34,0x276b40,4);block(s,x-9,y-13,25,23,0x39874a,5);block(s,x+10,y-9,22,23,0x4c9853,5)}
function house(s,x,y,name,icon,done){
 const roof=done?0x328d69:([0xa94f42,0x7463a5,0x4679a6,0xae8444][doors.length%4]);
 block(s,x,y-11,166,72,0xe8d6ad,5).setStrokeStyle(3,0x75593e);
 block(s,x,y-49,184,22,roof,7);block(s,x-65,y-61,38,12,roof,7);block(s,x+65,y-61,38,12,roof,7);
 block(s,x-54,y-16,25,25,0x8ac9dc,6).setStrokeStyle(3,0x674f39);
 block(s,x+54,y-16,25,25,0x8ac9dc,6).setStrokeStyle(3,0x674f39);
 block(s,x,y+8,29,34,0x80513a,7);block(s,x+8,y+9,4,4,0xf5da83,8);
 block(s,x,y+40,177,23,0x283f37,9);
 s.add.text(x,y+40,name,{fontFamily:"monospace",fontSize:"13px",color:"#ffffff",align:"center"}).setOrigin(.5).setDepth(10);
 s.add.text(x,y-27,icon,{fontFamily:"sans-serif",fontSize:"22px",color:"#ffffff"}).setOrigin(.5).setDepth(9);
 const status=s.add.text(x+73,y-62,done?"✓":"1",{fontFamily:"monospace",fontSize:"15px",fontStyle:"bold",color:"#ffffff",backgroundColor:done?"#16764d":"#3e4952",padding:{x:4,y:2}}).setOrigin(.5).setDepth(11);
 doors.push({x,y,name,roof:roof,status});
}
function nearby(){return doors.find(d=>Math.abs(d.x-player.x)<89&&Math.abs(d.y-player.y)<70)}
function update(time){
 if(!player)return;
 if(locked){player.body.setVelocity(0);return}
 const dx=Number(keys.RIGHT.isDown||keys.D.isDown||touch.right)-Number(keys.LEFT.isDown||keys.A.isDown||touch.left);
 const dy=Number(keys.DOWN.isDown||keys.S.isDown||touch.down)-Number(keys.UP.isDown||keys.W.isDown||touch.up);
 player.body.setVelocity(dx*190,dy*190);player.body.velocity.normalize().scale(190);
 avatar.setPosition(player.x,player.y+(dx||dy?Math.sin(time/95)*2:0));
 const d=nearby();label.setText(d?"ENTRER : "+d.name:"Explore le village • flèches ou joystick");
 progress.setText(modules.filter(n=>state.done[n]).length+"/"+modules.length+" défis");
}
function interact(){if(locked||!player)return;const d=nearby();if(d)challenge(d)}
function challenge(d){
 locked=true;player.body.setVelocity(0);
 let correct=0,answered=0;
 for(let i=0;i<10;i++){
  const a=Phaser.Math.Between(1,15),b=Phaser.Math.Between(1,15);
  const answer=prompt(d.name+" — question "+(i+1)+"/10 : "+a+" + "+b+" = ? (prototype)");
  if(answer===null)break;
  answered++;if(answer.trim()!==""&&Number(answer)===a+b)correct++;
 }
 if(answered===10){
  alert("Score : "+correct+"/10. "+(correct>=8?"Défi validé !":"Il faut 8 bonnes réponses."));
  if(correct>=8){state.done[d.name]=true;localStorage.setItem("maths-quest-progress",JSON.stringify(state.done));d.status.setText("✓").setBackgroundColor("#16764d");if(modules.every(n=>state.done[n]))alert("Bravo ! Tous les défis du monde 1 sont validés.")}
 }else alert("Défi interrompu : progression non modifiée.");
 locked=false;
}
document.querySelectorAll("[data-dir]").forEach(button=>{const dir=button.dataset.dir;const release=e=>{e.preventDefault();touch[dir]=false};button.addEventListener("pointerdown",e=>{e.preventDefault();button.setPointerCapture(e.pointerId);touch[dir]=true});button.addEventListener("pointerup",release);button.addEventListener("pointercancel",release);button.addEventListener("lostpointercapture",()=>touch[dir]=false)});
document.getElementById("interact").addEventListener("click",interact);
window.addEventListener("blur",()=>Object.keys(touch).forEach(k=>touch[k]=false));
