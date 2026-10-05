#include "../js/layout.js"
var ISP={items:[],doc:null,ab:null,bounds:[],selection:[]};
function ispQuote(s){return '"'+String(s).replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\r/g,'\\r').replace(/\n/g,'\\n').replace(/\t/g,'\\t')+'"';}
function ispJSON(v){if(v===null)return 'null';if(typeof v==='string')return ispQuote(v);if(typeof v==='number'||typeof v==='boolean')return String(v);var a=[],k;if(v instanceof Array){for(k=0;k<v.length;k++)a.push(ispJSON(v[k]));return '['+a.join(',')+']';}for(k in v)if(v.hasOwnProperty(k))a.push(ispQuote(k)+':'+ispJSON(v[k]));return '{'+a.join(',')+'}';}
function ispContainsImage(p){if(p.typename==='PlacedItem'||p.typename==='RasterItem')return true;if(p.typename==='GroupItem'){for(var i=0;i<p.pageItems.length;i++)if(ispContainsImage(p.pageItems[i]))return true;}return false;}
function ispBounds(p){if(p.typename==='GroupItem'&&p.clipped){for(var i=0;i<p.pageItems.length;i++){var c=p.pageItems[i];if(c.typename==='PathItem'&&c.clipping)return c.geometricBounds;if(c.typename==='CompoundPathItem'&&c.pathItems.length&&c.pathItems[0].clipping)return c.geometricBounds;}}return p.visibleBounds;}
function ispInfo(){try{if(!app.documents.length)throw Error('Open a document first.');var d=app.activeDocument,ab=d.artboards[d.artboards.getActiveArtboardIndex()].artboardRect;return ispJSON({width:ab[2]-ab[0],height:ab[1]-ab[3]});}catch(e){return ispJSON({error:e.message});}}
function ispPreview(options){try{
    if(!app.documents.length)throw Error('Open a document and select images.');
    var d=app.activeDocument,sel=d.selection;if(!sel||!sel.length)throw Error('Select linked images, embedded images, or groups containing images.');
    ISP={items:[],doc:d,ab:d.artboards[d.artboards.getActiveArtboardIndex()].artboardRect,bounds:[],selection:[]};
    var data=[],ignored=0,i,j;
    for(i=0;i<sel.length;i++)ISP.selection.push(sel[i]);
    for(i=0;i<sel.length;i++){
        var p=sel[i],nested=false;
        for(j=0;j<sel.length;j++){var parent=p.parent;while(parent&&parent.typename!=='Document'){if(parent===sel[j]){nested=true;break;}parent=parent.parent;}if(nested)break;}
        if(nested)continue;
        if(!ispContainsImage(p)){ignored++;continue;}
        if(p.locked||p.hidden||!p.editable)throw Error('Unlock and show selected images and their layers.');
        var b=ispBounds(p),id=ISP.items.length;ISP.items.push(p);ISP.bounds.push([b[0],b[1],b[2],b[3]]);data.push({id:id,w:b[2]-b[0],h:b[1]-b[3]});
    }
    if(!data.length)throw Error('The selection contains no images.');
    var o=eval('('+options+')');o.width=ISP.ab[2]-ISP.ab[0];o.height=ISP.ab[1]-ISP.ab[3];
    ISP.result=ImageSpacerLayout(data,o);ISP.result.ignored=ignored;return ispJSON(ISP.result);
}catch(e){ISP.result=null;return ispJSON({error:e.message});}}
function ispApply(){var moved=[];try{
    if(!ISP.result||!ISP.result.placed.length)throw Error('Preview a layout first.');
    if(!app.documents.length||app.activeDocument!==ISP.doc)throw Error('Document changed. Preview again.');
    var d=ISP.doc,ab=d.artboards[d.artboards.getActiveArtboardIndex()].artboardRect,i,j;
    for(i=0;i<4;i++)if(Math.abs(ab[i]-ISP.ab[i])>0.001)throw Error('Artboard changed. Preview again.');
    if(d.selection.length!==ISP.selection.length)throw Error('Selection changed. Preview again.');
    for(i=0;i<ISP.selection.length;i++){var found=false;for(j=0;j<d.selection.length;j++)if(d.selection[j]===ISP.selection[i])found=true;if(!found)throw Error('Selection changed. Preview again.');}
    for(i=0;i<ISP.items.length;i++){var p=ISP.items[i],b=ispBounds(p);if(!p.editable||p.locked||p.hidden)throw Error('An image is no longer editable.');for(j=0;j<4;j++)if(Math.abs(b[j]-ISP.bounds[i][j])>0.001)throw Error('Images changed. Preview again.');}
    for(i=0;i<ISP.result.placed.length;i++){
        var q=ISP.result.placed[i],item=ISP.items[q.id],old=ISP.bounds[q.id],factor=q.scale||1;
        var record={item:item,old:old,scale:1};moved.push(record);
        if(Math.abs(factor-1)>0.00000001){item.resize(factor*100,factor*100,true,true,true,true,factor*100,Transformation.CENTER);record.scale=factor;}
        var current=ispBounds(item),dx=ab[0]+q.x-current[0],dy=ab[1]-q.y-current[1];
        item.translate(dx,dy);
    }
    var count=moved.length;ISP.result=null;app.redraw();return ispJSON({count:count});
}catch(e){for(var r=moved.length-1;r>=0;r--)try{var rec=moved[r];if(rec.scale!==1)rec.item.resize(100/rec.scale,100/rec.scale,true,true,true,true,100/rec.scale,Transformation.CENTER);var restored=ispBounds(rec.item);rec.item.translate(rec.old[0]-restored[0],rec.old[1]-restored[1]);}catch(rollback){e.message+=" Some changes could not be restored; use Illustrator Undo.";}ISP.result=null;return ispJSON({error:e.message});}}

