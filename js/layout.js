/* Image Spacer by vipercoma. ES3-compatible layout engine shared by CEP and ExtendScript. */
var ImageSpacerLayout = function (items, o) {
    var keys=['gapX','gapY','margin','width','height'],k,i;
    for(k=0;k<keys.length;k++)if(!isFinite(o[keys[k]])||o[keys[k]]<0)throw Error('Enter valid dimensions and non-negative gaps.');
    var W=o.width-2*o.margin,H=o.height-2*o.margin;
    if(W<=0||H<=0)throw Error('Margins leave no room on the artboard.');
    var list=items.slice(0),placed=[],skipped=[],maxW=0,maxH=0,mode=o.mode||'grid';
    for(i=0;i<list.length;i++){var p=list[i];if(!isFinite(p.w)||!isFinite(p.h)||p.w<=0||p.h<=0)throw Error('An image has invalid bounds.');maxW=Math.max(maxW,p.w);maxH=Math.max(maxH,p.h);}
    if(o.sort==='height')list.sort(function(a,b){return b.h-a.h||a.id-b.id;});
    if(o.sort==='width')list.sort(function(a,b){return b.w-a.w||a.id-b.id;});
    if(o.sort==='area')list.sort(function(a,b){return b.w*b.h-a.w*a.h||a.id-b.id;});
    if(!list.length)return {placed:[],skipped:[],width:o.width,height:o.height,scale:1};
    if(mode==='grid'||mode==='distributed'){
        var cols=Number(o.columns||0),best=null,n=list.length;
        if(!isFinite(cols)||cols<0||Math.floor(cols)!==cols||cols>999)throw Error('Columns must be Auto (0) or a whole number from 1 to 999.');
        for(var c=cols||1;c<=(cols||n);c++){
            var rows=Math.ceil(n/c),cellW=(W-(c-1)*o.gapX)/c,cellH=(H-(rows-1)*o.gapY)/rows;
            if(cellW<=0||cellH<=0)continue;
            var scale=Math.min(1,cellW/maxW,cellH/maxH);
            if(!o.fit&&scale<1-1e-8)continue;
            var score=Math.abs(Math.log((c*maxW+(c-1)*o.gapX)/(rows*maxH+(rows-1)*o.gapY)/(W/H)))+(c*rows-n)/n;
            if(!best||scale>best.scale+1e-8||(Math.abs(scale-best.scale)<1e-8&&score<best.score))best={cols:c,rows:rows,cellW:cellW,cellH:cellH,scale:scale,score:score};
        }
        if(!best)throw Error('All images cannot fit this grid. Enable Shrink to fit, reduce gaps/margins, choose Auto columns, or enlarge the artboard.');
        var s=best.scale,cw=mode==='distributed'?best.cellW:maxW*s,ch=mode==='distributed'?best.cellH:maxH*s;
        var blockW=best.cols*cw+(best.cols-1)*o.gapX,blockH=best.rows*ch+(best.rows-1)*o.gapY;
        var ox=o.align==='center'?(W-blockW)/2:0,oy=o.align==='center'?(H-blockH)/2:0;
        for(i=0;i<n;i++){p=list[i];var w=p.w*s,h=p.h*s;placed.push({id:p.id,x:o.margin+ox+(i%best.cols)*(cw+o.gapX)+(cw-w)/2,y:o.margin+oy+Math.floor(i/best.cols)*(ch+o.gapY)+(ch-h)/2,w:w,h:h,scale:s});}
        return {placed:placed,skipped:[],width:o.width,height:o.height,columns:best.cols,rows:best.rows,scale:s};
    }
    if(mode==='column'){
        var trans=[];for(i=0;i<list.length;i++)trans.push({id:list[i].id,w:list[i].h,h:list[i].w});
        var t=ImageSpacerLayout(trans,{width:o.height,height:o.width,margin:o.margin,gapX:o.gapY,gapY:o.gapX,mode:'row',sort:'selection',align:o.align});
        for(i=0;i<t.placed.length;i++){p=t.placed[i];placed.push({id:p.id,x:p.y,y:p.x,w:p.h,h:p.w,scale:1});}
        return {placed:placed,skipped:t.skipped,width:o.width,height:o.height,scale:1};
    }
    if(mode!=='wrap'&&mode!=='row')throw Error('Unknown layout mode.');
    var x=0,y=0,rowH=0,lines=[[]];
    for(i=0;i<list.length;i++){
        p=list[i];if(p.w>W+0.001||p.h>H+0.001){skipped.push(p.id);continue;}
        var nx=x,ny=y,nrh=rowH;
        if(nx>0&&nx+p.w>W+0.001){if(mode==='row'){skipped.push(p.id);continue;}nx=0;ny=y+rowH+o.gapY;nrh=0;}
        if(ny+p.h>H+0.001){skipped.push(p.id);continue;}
        if(ny!==y)lines.push([]);
        var q={id:p.id,x:nx+o.margin,y:ny+o.margin,w:p.w,h:p.h,scale:1};placed.push(q);lines[lines.length-1].push(q);
        x=nx+p.w+o.gapX;y=ny;rowH=Math.max(nrh,p.h);
    }
    for(i=0;i<lines.length;i++){var line=lines[i];if(!line.length)continue;var end=line[line.length-1],spare=W-(end.x-o.margin+end.w);for(k=0;k<line.length;k++){if(o.align==='center')line[k].x+=spare/2;else if(o.align==='between'&&line.length>1)line[k].x+=k*spare/(line.length-1);}}
    return {placed:placed,skipped:skipped,width:o.width,height:o.height,scale:1};
};
if(typeof module!=='undefined')module.exports=ImageSpacerLayout;
