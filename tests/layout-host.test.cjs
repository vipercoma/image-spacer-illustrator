const assert=require('assert'),fs=require('fs'),vm=require('vm');
const layout=require('../js/layout.js');
const base={width:400,height:300,margin:10,gapX:8,gapY:12,mode:'grid',columns:0,fit:false,align:'start'};
function valid(r,o,all){if(all)assert.equal(r.placed.length,all);for(const a of r.placed){assert(a.x>=o.margin-1e-5&&a.y>=o.margin-1e-5&&a.x+a.w<=o.width-o.margin+1e-5&&a.y+a.h<=o.height-o.margin+1e-5);for(const b of r.placed)if(a.id!==b.id)assert(a.x+a.w+o.gapX<=b.x+1e-5||b.x+b.w+o.gapX<=a.x+1e-5||a.y+a.h+o.gapY<=b.y+1e-5||b.y+b.h+o.gapY<=a.y+1e-5);}}
const items=Array.from({length:9},(_,id)=>({id,w:30+id*2,h:40+id}));
for(const mode of ['grid','distributed'])for(const align of ['start','center']){let o={...base,mode,align,columns:3};let r=layout(items,o);assert.equal(r.columns,3);assert.equal(r.rows,3);valid(r,o,9);assert.equal(r.scale,1);}
assert.throws(()=>layout(items,{...base,width:70,height:70}),/cannot fit/);
let fitO={...base,width:100,height:90,gapX:2,gapY:2,fit:true};let fit=layout(items,fitO);valid(fit,fitO,9);assert(fit.scale<1);for(const q of fit.placed)assert(Math.abs(q.w/q.h-items[q.id].w/items[q.id].h)<1e-8);
for(let t=0;t<100;t++){let sample=Array.from({length:1+t%30},(_,id)=>({id,w:20+(id*19+t)%90,h:15+(id*31+t)%80}));for(const mode of ['grid','distributed']){let o={...base,mode,fit:true,align:t%2?'center':'start'};valid(layout(sample,o),o,sample.length);}for(const mode of ['wrap','row','column'])for(const align of ['start','center','between']){let o={...base,mode,align};valid(layout(sample,o),o);}}
let source=fs.readFileSync(__dirname+'/../jsx/host.jsx','utf8').replace(/^\uFEFF/,'').replace(/^#include.*$/m,'');
function image(type,bounds){return {typename:type,visibleBounds:bounds,editable:true,translate(dx,dy){this.visibleBounds=this.visibleBounds.map((v,i)=>v+(i%2?dy:dx));},resize(x,y){let b=this.visibleBounds,cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2;this.visibleBounds=[cx+(b[0]-cx)*x/100,cy+(b[1]-cy)*y/100,cx+(b[2]-cx)*x/100,cy+(b[3]-cy)*y/100];}};}
let a=image('PlacedItem',[30,90,90,30]),b=image('RasterItem',[70,90,150,20]);
let doc={selection:[a,b],artboards:[{artboardRect:[0,100,100,0]}]};doc.artboards.getActiveArtboardIndex=()=>0;
let ctx={app:{documents:[doc],activeDocument:doc,redraw(){}},Transformation:{CENTER:0}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/../js/layout.js','utf8'),ctx);vm.runInContext(source,ctx);
let o={...base,margin:5,gapX:5,gapY:5,columns:2,fit:true};let r=JSON.parse(ctx.ispPreview(JSON.stringify(o)));assert.equal(r.placed.length,2);assert(r.scale<1);assert.equal(JSON.parse(ctx.ispApply()).count,2);for(const q of r.placed){let bounds=ctx.ISP.items[q.id].visibleBounds;assert(Math.abs(bounds[0]-q.x)<1e-5);assert(Math.abs(bounds[1]-(100-q.y))<1e-5);assert(Math.abs(bounds[2]-bounds[0]-q.w)<1e-5);}
ctx.ispPreview(JSON.stringify(o));a.visibleBounds[0]++;assert.match(JSON.parse(ctx.ispApply()).error,/changed/);
ctx.ispPreview(JSON.stringify(o));let before=[a.visibleBounds.slice(),b.visibleBounds.slice()];let translate=b.translate;let once=true;b.translate=function(dx,dy){if(once){once=false;throw Error('Simulated movement failure');}translate.call(this,dx,dy);};let result=JSON.parse(ctx.ispApply());assert.match(result.error,/Simulated/);for(let i=0;i<4;i++){assert(Math.abs(a.visibleBounds[i]-before[0][i])<1e-5);assert(Math.abs(b.visibleBounds[i]-before[1][i])<1e-5);}
console.log('PASS: all five modes, fixed/auto grids, fit scaling, 100 randomized cases per mode/alignment, host resize/move, stale previews, rollback after failure.');


