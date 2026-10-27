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

