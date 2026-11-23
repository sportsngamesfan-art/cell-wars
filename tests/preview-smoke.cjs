const fs = require('node:fs'); const vm=require('node:vm'); const assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/../preview.html','utf8');
const js=html.split('<script>')[1].split('</script>')[0];
let rendered=''; const store=new Map(); let path='/';
const ctx={
 localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)},
 location:{get pathname(){return path},href:'https://example.test/preview.html'},
 history:{pushState(_a,_b,p){path=p}},
 window:{addEventListener(){},scrollTo(){}},
 document:{getElementById(id){if(id==='root')return {set innerHTML(v){rendered=v},get innerHTML(){return rendered}};return {value:'=SUM(B3:G3)',hidden:true}},querySelector(){return {textContent:''}}},
 navigator:{},console,confirm:()=>true,alert:()=>{},prompt:()=>{}
};ctx.window.window=ctx.window;
vm.createContext(ctx);vm.runInContext(js,ctx,{timeout:10000});
assert.match(rendered,/ONE CHAPTER/);assert.match(rendered,/180/);
ctx.window.App.nav('/modes');assert.match(rendered,/Pick your battle/);
ctx.window.App.start('quick');assert.equal(path,'/quiz');assert.match(rendered,/QUESTION 1 \/ 10/);
const qs=vm.runInContext('session.questions',ctx);
for(let i=0;i<qs.length;i++){
 ctx.window.App.choose(qs[i].answer);ctx.window.App.submit();assert.match(rendered,/Correct/);ctx.window.App.next();
}
assert.equal(path,'/results');assert.match(rendered,/Absolute legend/);assert.equal(vm.runInContext("state.completed",ctx),1);assert(vm.runInContext("state.xp",ctx)>0);
ctx.window.App.nav('/leaderboard');assert.match(rendered,/Local-only/);
ctx.window.App.nav('/lab');assert.match(rendered,/Formula Lab/);
ctx.window.App.formula('=SUM(B3:G3)');assert.equal(vm.runInContext("labCalc('H3')",ctx),750);
ctx.window.App.nav('/settings');assert.match(rendered,/Display nickname/);
console.log('Preview smoke checks passed: landing, navigation, 10-answer quiz, XP, results, leaderboard, lab and settings.');
