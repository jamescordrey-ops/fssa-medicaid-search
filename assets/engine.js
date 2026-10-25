var docs=DB.docs, texts=DB.texts, idx=DB.idx, N=DB.n;
var SOURCES=["", "FSSA website", "Application form", "Policy manuals", "Reference notes", "Federal", "Other states", "Waiver manual"];
var SLABEL={"": "All", "FSSA website": "FSSA website", "Application form": "Application forms", "Waiver manual": "Waiver manual", "Policy manuals": "Policy manuals", "Reference notes": "Reference notes", "Federal": "Federal", "Other states": "Other states"};
var BCLS={"FSSA website": "b-site", "Application form": "b-app", "Waiver manual": "b-waiver", "Policy manuals": "b-waiver", "Reference notes": "b-ref", "Federal": "b-fed", "Other states": "b-other"};
var curSrc="";
var idf={}; for(var t in idx){idf[t]=Math.log(1+N/idx[t].length);}
/*LIB2B*/var SYN={"sfc":["caregiv"],"caregiv":["sfc"],"caregiver":["sfc"],"caregiving":["sfc"],"foodstamp":["snap"],"foodstamps":["snap"],"stamp":["snap"],"ebt":["snap"],"childcare":["ccdf"],"ccdf":["childcare"],"doctor":["physician"],"physician":["doctor"],"drug":["prescription"],"drugs":["prescription"]};
var DL=DB.dl||[], AVGDL=1; (function(){var s=0;for(var i=0;i<DL.length;i++)s+=DL[i]; if(DL.length)AVGDL=s/DL.length;})();
var TITLESTEMS=docs.map(function(d){return terms(d.t);});
var curProg="", RAWQ="";
var curJur="";
function conceptStems(w){var s=stem(w), out=[s]; var ex=SYN[w]||SYN[s]||[]; for(var i=0;i<ex.length;i++){var e=stem(ex[i]); if(out.indexOf(e)<0)out.push(e);} return out;}
function phraseTerms(p){return ordTerms(p);}
function ordTerms(q){return toksOf(q).map(stem);}
function parseQuery(raw){
  raw=String(raw).replace(/[“”]/g,'"').replace(/[‘’]/g,"'");
  var phrases=[], phrasesExcl=[];
  function take(m,p){var ph=phraseTerms(p); if(ph.length) phrases.push(ph); return " ";}
  function takeEx(m,p){var ph=phraseTerms(p); if(ph.length) phrasesExcl.push(ph); return " ";}
  var rest=raw.replace(/\bNOT\s+"([^"]+)"/g,takeEx).replace(/-"([^"]+)"/g,takeEx).replace(/"([^"]+)"/g,take);
  var branches=[[]], excl=[], cur=branches[0];
  function wordToken(w){
    if(/^\d+(\.\d+)+$/.test(w)){ var parts=w.split("."); for(var k=0;k<parts.length;k++){ if(parts[k].length>=2) cur.push([parts[k]]); } return; }
    var cw=w.toLowerCase().replace(/[^a-z0-9]/g,"");
    if(cw.length<2||COMMON[cw]) return;
    cur.push(conceptStems(cw));
  }
  var words=rest.split(/\s+/);
  for(var i=0;i<words.length;i++){
    var w=words[i]; if(!w)continue;
    if(/^or$/i.test(w)){cur=[];branches.push(cur);continue;}
    if(w.charAt(0)==="-"||/^NOT$/.test(w)){
      if(/^NOT$/.test(w)){i++; if(i>=words.length)break; w=words[i];} else w=w.slice(1);
      var es=terms(w); for(var j=0;j<es.length;j++) if(!COMMON[es[j]]) excl.push(es[j]);
      continue;
    }
    var subs=w.split("-");
    for(var s2=0;s2<subs.length;s2++){ if(subs[s2]) wordToken(subs[s2]); }
  }
  branches=branches.filter(function(b){return b.length;});
  return {branches:branches, phrases:phrases, phrasesExcl:phrasesExcl, excl:excl};
}
function bm25(di,t,tf){var df=idx[t].length; var idfv=Math.log(1+(N-df+0.5)/(df+0.5)); var dl=DL[di]||AVGDL; return idfv*(tf*2.2)/(tf+1.2*(0.25+0.75*dl/AVGDL));}
var seqCache={};
function docSeq(di){ if(seqCache[di])return seqCache[di]; if(Object.keys(seqCache).length>500)seqCache={}; var s=ordTerms(texts[di]); seqCache[di]=s; return s;}
function hasPhrase(di,ph){ var s=docSeq(di); if(ph.length>s.length)return false; for(var i=0;i+ph.length<=s.length;i++){ var ok=true; for(var j=0;j<ph.length;j++){ if(s[i+j]!==ph[j]){ok=false;break;} } if(ok)return true;} return false;}
function conceptScore(cs){
  var out={};
  for(var i=0;i<cs.length;i++){ var p=post(cs[i]); if(!p)continue; for(var d in p){ out[d]=(out[d]||0)+bm25(+d,cs[i],p[d]); } }
  return out;
}

function branchScoresRelaxed(concepts){
  var strict=branchScores(concepts);
  var n=concepts.length;
  if(n<=3) return strict;
  var frac=n>=7?0.5:2/3, cw=[], tot=0;
  for(var ci=0;ci<n;ci++){ var mx=0; for(var cj=0;cj<concepts[ci].length;cj++){ var iv=idf[concepts[ci][cj]]||0; if(iv>mx)mx=iv; } cw.push(mx); tot+=mx; }
  var need=frac*tot, wsum={}, sum={};
  for(var i=0;i<n;i++){
    var cd=conceptScore(concepts[i]);
    for(var d in cd){ wsum[d]=(wsum[d]||0)+cw[i]; sum[d]=(sum[d]||0)+cd[d]; }
  }
  var out={};
  for(var d2 in sum){ if((wsum[d2]||0)>=need) out[d2]=sum[d2]; }
  return Object.keys(out).length?out:strict;
}
function branchScores(concepts){
  var acc=null;
  for(var i=0;i<concepts.length;i++){
    var cd=conceptScore(concepts[i]);
    if(acc===null){ acc={}; for(var d in cd) acc[d]=cd[d]; }
    else{ for(var d2 in acc){ if(has(cd,d2)) acc[d2]+=cd[d2]; else delete acc[d2]; } }
    if(!Object.keys(acc).length) return {};
  }
  return acc||{};
}

function parseCit(raw){
  var q=String(raw||"").trim().replace(/\s+/g," ");
  var m=q.match(/^(\d{3,4}(?:\.\d{1,3})+)\.?$/);
  if(m) return {key:m[1], exactKeys:[m[1]], parts:m[1].split(".")};
  m=q.match(/^(\d{1,3})\s+CFR\s+(\d{1,4}(?:\.\d+)+)$/i);
  if(m) return {key:m[1]+" CFR "+m[2], exactKeys:[m[1]+" CFR "+m[2], m[2]], parts:[m[1]].concat(m[2].split("."))};
  m=q.match(/^(\d{3})\s+IAC\s+(\d+(?:-\d+)+)$/i);
  if(m) return {key:m[1]+" IAC "+m[2], exactKeys:[m[1]+" IAC "+m[2]], parts:[m[1]].concat(m[2].split("-"))};
  m=q.match(/^(SI|DI)\s+(\d{5}(?:\.\d+)*)$/i);
  if(m) return {key:m[1].toUpperCase()+" "+m[2], exactKeys:[m[1].toUpperCase()+" "+m[2], m[2]], parts:m[2].split(".")};
  return null;
}
function citExactCount(text,key){
  var n=0, i=0;
  while(true){
    i=text.indexOf(key,i);
    if(i<0) break;
    var prev=i>0?text.charAt(i-1):"";
    var next=text.charAt(i+key.length);
    var next2=text.charAt(i+key.length+1);
    if(!/[0-9.]/.test(prev)&&!/[0-9]/.test(next)&&!(next==="."&&/[0-9]/.test(next2))) n++;
    i+=key.length;
  }
  return n;
}

function citHeadingCount(text,key){
  var n=0, i=0;
  while(true){
    i=text.indexOf(key,i);
    if(i<0) break;
    var prev=i>0?text.charAt(i-1):"";
    var next=text.charAt(i+key.length);
    var next2=text.charAt(i+key.length+1);
    if(!/[0-9.]/.test(prev)&&!/[0-9]/.test(next)&&!(next==="."&&/[0-9]/.test(next2))){
      var tail=text.slice(i+key.length, i+key.length+48), letters=0, upper=0;
      for(var j=0;j<tail.length;j++){
        var ch=tail.charAt(j);
        if(/[A-Za-z]/.test(ch)){ letters++; if(/[A-Z]/.test(ch)) upper++; }
      }
      if(letters>=8&&upper/letters>=0.7) n++;
    }
    i+=key.length;
  }
  return n;
}
function citScoreFor(dnum,cit){
  var t=texts[dnum], title=docs[dnum].t, best=0;
  for(var i=0;i<cit.exactKeys.length;i++){
    var k=cit.exactKeys[i];
    var occ=citExactCount(t,k);
    var head=citHeadingCount(t,k);
    if(title.toLowerCase().indexOf(k.toLowerCase())>=0) best=Math.max(best,4000+occ);
    else if(head>0) best=Math.max(best,3500+occ);
    else if(occ>0) best=Math.max(best,3000+occ);
  }
  if(best) return best;
  var hay=title+"\n"+t, all=true, sum=0;
  for(var j=0;j<cit.parts.length;j++){
    var c=hay.split(cit.parts[j]).length-1;
    if(!c){ all=false; break; }
    sum+=Math.min(c,20);
  }
  if(all) return 2000+sum*0.01;
  return 0;
}
function levDist(a,b){
  if(Math.abs(a.length-b.length)>2) return 3;
  var prev=[], cur=[], i, j, tmp;
  for(j=0;j<=b.length;j++) prev[j]=j;
  for(i=1;i<=a.length;i++){
    cur[0]=i;
    for(j=1;j<=b.length;j++){
      cur[j]=Math.min(prev[j]+1, cur[j-1]+1, prev[j-1]+(a.charAt(i-1)===b.charAt(j-1)?0:1));
    }
    tmp=prev; prev=cur; cur=tmp;
  }
  return prev[b.length];
}
function dymPostSet(concept){
  var set={};
  for(var i=0;i<concept.length;i++){
    var p=idx[concept[i]];
    if(p) for(var k=0;k<p.length;k++) set[p[k][0]]=1;
  }
  return set;
}
function dymCandidates(m,dist){
  var vocab=Object.keys(idx), out=[];
  for(var i=0;i<vocab.length;i++){
    var v=vocab[i];
    if(v.charAt(0)!==m.charAt(0)||Math.abs(v.length-m.length)>dist) continue;
    if(levDist(m,v)===dist) out.push(v);
  }
  return out;
}
function dymCorrected(missing,candStem,prims){
  var raw=String(RAWQ||""), toks=rawTerms(raw), tok=null;
  for(var i=0;i<toks.length;i++){ if(stem(toks[i])===missing){ tok=toks[i]; break; } }
  if(tok){
    var re=new RegExp(tok.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"i");
    var out=raw.replace(re,candStem);
    if(out!==raw) return out;
  }
  return prims.map(function(s){return s===missing?candStem:s;}).join(" ");
}
function didYouMean(qobj){
  if(typeof parseCit==="function"&&(parseCit(RAWQ||""))) return [];
  var jobs=[];
  qobj.branches.forEach(function(b){
    var seen={}, prims=b.map(function(c){return c[0];});
    b.forEach(function(c){
      var s=c[0];
      if(s.length>=3&&!idx[s]&&!seen[s]){ seen[s]=1; jobs.push({missing:s,branch:b,prims:prims}); }
    });
  });
  if(!jobs.length) return [];
  var out=[];
  for(var ji=0;ji<jobs.length&&out.length<2;ji++){
    var job=jobs[ji], branch=job.branch, m=job.missing;
    var inBranch={};
    branch.forEach(function(c){ c.forEach(function(s){ inBranch[s]=1; }); });
    var ctx=null, nctx=0;
    for(var cj=0;cj<branch.length;cj++){
      var c=branch[cj];
      if(c[0]===m) continue;
      var has=false;
      for(var q=0;q<c.length;q++){ if(idx[c[q]]){ has=true; break; } }
      if(!has) continue;
      nctx++;
      var ps=dymPostSet(c);
      if(ctx===null){ ctx=ps; }
      else{ for(var d in ctx){ if(!ps[d]) delete ctx[d]; } }
    }
    if(!nctx||ctx===null) continue;
    var cand=dymCandidates(m,1);
    if(!cand.length) cand=dymCandidates(m,2);
    var scored=[];
    for(var vi=0;vi<cand.length;vi++){
      var v=cand[vi];
      if(inBranch[v]) continue;
      var p=idx[v], co=0;
      for(var k=0;k<p.length;k++){ if(ctx[p[k][0]]) co++; }
      if(co>=5) scored.push({stem:v,cooc:co,df:p.length});
    }
    scored.sort(function(a,b){ return (b.cooc-a.cooc)||(b.df-a.df)||(a.stem<b.stem?-1:1); });
    var take=(jobs.length===1)?2:1;
    for(var si=0;si<scored.length&&si<take&&out.length<2;si++){
      var corr=dymCorrected(m,scored[si].stem,job.prims);
      if(corr&&out.indexOf(corr)<0) out.push(corr);
    }
  }
  return out;
}

var COMMON={}; (DB.common||[]).forEach(function(t){COMMON[t]=1;});
var SITE_HOME="https://www.in.gov/fssa/";
var MATCH=Element.prototype.matches||Element.prototype.webkitMatchesSelector||Element.prototype.msMatchesSelector;
var lookup={}, selTag="";
function esc(s){return (s==null?"":String(s)).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
/*LIB2A*/function stem(w){if(w.length>=8&&/ibility$/.test(w))return w.slice(0,-7)+"ible";if(w.length>=7&&/ion$/.test(w))return w.slice(0,-3);if(w.length>=6&&/ing$/.test(w))return w.slice(0,-3);if(w.length>=5&&/ed$/.test(w))return w.slice(0,-2);if(w.length>=5&&/ies$/.test(w))return w.slice(0,-3)+"y";if(w.length>=5&&/es$/.test(w))return w.slice(0,-2);if(w.length>=6&&/er$/.test(w))return w.slice(0,-2);if(w.length>=4&&/s$/.test(w)&&!/ss$/.test(w))return w.slice(0,-1);return w;}
function toksOf(q){var t=String(q).toLowerCase().replace(/(\d),(?=\d{3}(?!\d))/g,"$1");return t.match(/[a-z0-9]{2,}/g)||[];}
function terms(q){var seen=new Set(),out=[],m=toksOf(q);for(var i=0;i<m.length;i++){var s=stem(m[i]);if(!seen.has(s)){seen.add(s);out.push(s);}}return out;}
function rawTerms(q){var seen=new Set(),out=[],m=toksOf(q);for(var i=0;i<m.length;i++){if(!seen.has(m[i])){seen.add(m[i]);out.push(m[i]);}}return out;}

function has(o,k){return Object.prototype.hasOwnProperty.call(o,k);}
function closestEl(el,sel){while(el&&el.nodeType===1){if(MATCH.call(el,sel))return el;el=el.parentNode;}return null;}
function post(t){
  if(has(lookup,t)) return lookup[t];
  var m=null;
  if(has(idx,t)){m={};var p=idx[t];for(var k=0;k<p.length;k++)m[p[k][0]]=p[k][1];}
  return (lookup[t]=m);
}
/*LIB2C*//*LIB2E*/var JURIS_WIN=1;
function jurisSort(a,b){
  var ba=Math.floor(a.s/JURIS_WIN), bb=Math.floor(b.s/JURIS_WIN);
  if(ba!==bb) return bb-ba;
  var ja=(docs[a.di].j==null?2:docs[a.di].j), jb=(docs[b.di].j==null?2:docs[b.di].j);
  if(ja!==jb) return ja-jb;
  return b.s-a.s;
}
function search(qobj,tagStems){
  var cand={};
  if(qobj.branches.length){
    for(var bi=0;bi<qobj.branches.length;bi++){
      var bs=branchScoresRelaxed(qobj.branches[bi]);
      for(var d in bs){ if(!has(cand,d)||bs[d]>cand[d]) cand[d]=bs[d]; }
    }
  } else if(qobj.phrases.length){
    var seed=qobj.phrases[0].filter(function(s){return !!idx[s];});
    cand=branchScores((seed.length?seed:qobj.phrases[0]).map(function(s){return [s];}));
  }
  var tkeys=null;
  if(tagStems.length){ tkeys=branchScores(tagStems.map(function(s){return [s];})); }
  if(!qobj.branches.length && !qobj.phrases.length && tkeys){ cand=tkeys; tkeys=null; }
  if(tkeys){
    for(var k in cand){ if(!has(tkeys,k)) delete cand[k]; }
  }
  var cit=parseCit(RAWQ||"");
  var allc=[]; qobj.branches.forEach(function(b){b.forEach(function(c){allc.push(c);});});
  var hits=[];
  for(var di in cand){
    var dnum=+di;
    if(curSrc && docs[dnum].s!==curSrc) continue;
    if(curProg && (docs[dnum].g||"")!==curProg) continue;
    if(curJur!=="" && (docs[dnum].j==null?2:docs[dnum].j)!==curJur) continue;
    var bad=false;
    for(var ei=0;ei<qobj.excl.length;ei++){ var ep=post(qobj.excl[ei]); if(ep&&has(ep,di)){bad=true;break;} }
    if(bad) continue;
    var pex=qobj.phrasesExcl||[], phex=false;
    for(var px=0;px<pex.length;px++){ if(hasPhrase(dnum,pex[px])){phex=true;break;} }
    if(phex) continue;
    var phok=true;
    for(var pi=0;pi<qobj.phrases.length;pi++){ if(!hasPhrase(dnum,qobj.phrases[pi])){phok=false;break;} }
    if(!phok) continue;
    var score=cand[di];
    var tset=TITLESTEMS[dnum], tmatch=0;
    for(var ci=0;ci<allc.length;ci++){ for(var cj=0;cj<allc[ci].length;cj++){ if(tset.indexOf(allc[ci][cj])>=0){tmatch++;break;} } }
    if(tmatch) score*=Math.min(1.6,1+0.10*tmatch);
    var qseq=[]; for(var qi=0;qi<allc.length;qi++){ if(allc[qi].length) qseq.push(allc[qi][0]); }
    var bg=false; for(var bi2=0;bi2+1<qseq.length&&!bg;bi2++){ var ix=tset.indexOf(qseq[bi2]); if(ix>=0&&ix+1<tset.length&&tset[ix+1]===qseq[bi2+1]) bg=true; }
    if(bg) score*=1.3;
    if(cit){ var cs=citScoreFor(dnum,cit); if(cs>0) score=cs; else score*=0.001; }
    hits.push({di:dnum, s:score});
  }
  /*LIB2E2*/ if(cit){ hits.sort(function(a,b){return b.s-a.s;}); }
  else {
    var maxS=0; for(var hi2=0;hi2<hits.length;hi2++){ if(hits[hi2].s>maxS) maxS=hits[hi2].s; }
    JURIS_WIN=(maxS||1)*0.02;
    hits.sort(jurisSort);
  }
  return hits;
}

function highlight(text,ts){
  if(!ts.length) return esc(text);
  var re=new RegExp("\\b("+ts.join("|")+")\\b","gi"), out="", last=0, m;
  while((m=re.exec(text))){
    out+=esc(text.slice(last,m.index))+"<mark>"+esc(m[0])+"</mark>";
    last=m.index+m[0].length;
  }
  return out+esc(text.slice(last));
}
function snippet(text,ts){
  var low=text.toLowerCase(), bi=-1, s=0, e=Math.min(text.length,180);
  ts.forEach(function(t){var i=low.indexOf(t);if(i>=0&&(bi<0||i<bi))bi=i;});
  if(bi>=0){s=Math.max(0,bi-100);e=Math.min(text.length,bi+130);}
  return (s>0?"...":"")+highlight(text.slice(s,e),ts)+(e<text.length?"...":"");
}
function extInfo(d){
  if(d.u&&!/^https?:\/\//i.test(d.u)) d={t:d.t,u:"",s:d.s,v:d.v};
  if(d.s==="Application form"){
    if(!d.u) return {href:SITE_HOME,label:"Find form on FSSA site"};
    if(d.v===0) return {href:d.u,label:"Official page (form not located)"};
    var u=d.u.toLowerCase();
    return {href:d.u,label:(u.indexOf(".pdf")>=0||u.indexOf("download.aspx")>=0)?"Download official form":"Open official form page"};
  }
  if(d.s==="Reference notes") return {href:d.u||SITE_HOME,label:"Open FSSA homepage"};
  if(!d.u) return {href:SITE_HOME,label:"Find on FSSA site"};
  return {href:d.u,label:"Open original page"};
}
var qel=document.getElementById("q"), res=document.getElementById("res"),
    cnt=document.getElementById("count"), pills=document.getElementById("pills"),
    tagsEl=document.getElementById("tags");
function updateTagUI(){
  var els=document.querySelectorAll("#tags .tag");
  for(var i=0;i<els.length;i++){
    var on=selTag!=="" && els[i].getAttribute("data-q")===selTag;
    if(on) els[i].classList.add("on"); else els[i].classList.remove("on");
    els[i].setAttribute("aria-pressed", on?"true":"false");
  }
}
pills.addEventListener("click",function(e){
  var b=closestEl(e.target,".pill"); if(!b) return;
  var all=pills.querySelectorAll(".pill");
  for(var i=0;i<all.length;i++) all[i].classList.remove("active");
  b.classList.add("active"); curSrc=b.getAttribute("data-s"); run();
});
tagsEl.addEventListener("click",function(e){
  var b=closestEl(e.target,".tag"); if(!b) return;
  e.preventDefault();
  var label=b.getAttribute("data-q")||b.textContent;
  selTag=(selTag===label)?"":label;
  updateTagUI(); run();
});
function answerCards(ts){
  var out="",n=0;
  CARDS.forEach(function(c){
    if(n>=8) return;
    for(var i=0;i<c.t.length;i++){
      if(ts.indexOf(stem(c.t[i]))>=0){
        out+='<div class="acard">'+c.h+(c.u?'<p class="csrc">Source: <a href="'+c.u+'" target="_blank" rel="noopener">'+esc(c.sn||c.u)+"</a></p>":"")+"</div>";
        n++;break;
      }
    }
  });
  return out;
}
/*LIB2F*/function formatReader(text,ts){
  var t=text.replace(/([a-z])-\s+([a-z])/g,"$1$2");
  var segs=t.split(/(?=\b\d{3,4}\.\d{2}\.\d{2}\s+[A-Z])|(?=\bChapter\s+\d+\b)|(?=\bSECTION\s+\d+\b)/);
  var out=[];
  for(var si=0;si<segs.length;si++){
    var seg=segs[si].trim(); if(!seg) continue;
    var head=null, body=seg, m;
    if(seg.length>200){
      m=seg.match(/^(\d{3,4}\.\d{2}\.\d{2}\s+.{0,70}?)(?:\.\s+|$)/);
      if(m){ head=m[1]; body=seg.slice(m[0].length); }
      else { m=seg.match(/^((?:Chapter|SECTION)\s+\d+\s+.{0,70}?)(?:\.\s+|$)/); if(m){ head=m[1]; body=seg.slice(m[0].length); } }
    }
    if(head) out.push('<h3 class="dhead">'+highlight(head.trim(),ts)+'</h3>');
    var sp=body.split(/([.!?])\s+(?=[A-Z0-9"“(])/), sents=[];
    for(var sj=0;sj<sp.length;sj+=2){ var sent=(sp[sj]||"")+(sp[sj+1]||""); if(sent) sents.push(sent); }
    for(var i=0;i<sents.length;i+=4){
      var p=sents.slice(i,i+4).join(" ").trim();
      if(p) out.push("<p>"+highlight(p,ts)+"</p>");
    }
  }
  return out.join("");
}

function openReader(di,ts){
  document.getElementById("rtitle").textContent=docs[di].t;
  var ei=extInfo(docs[di]), rs=document.getElementById("rsrc");
  if(rs){ rs.href=ei.href; rs.textContent="Source: "+ei.href; }
  var rb=document.getElementById("rbody");
  rb.innerHTML=docs[di].f?"":formatReader(texts[di],ts);
  rb.scrollTop=0;
  document.getElementById("reader").classList.add("open");
}
function closeReader(){document.getElementById("reader").classList.remove("open");}
document.addEventListener("keydown",function(e){if(e.key==="Escape")closeReader();});
document.addEventListener("click",function(e){
  var a=closestEl(e.target,"[data-r]"); if(!a) return;
  e.preventDefault(); openReader(+a.getAttribute("data-r"),lastHi);
});
document.addEventListener("click",function(e){
  var a=closestEl(e.target,"[data-dym]"); if(!a) return;
  e.preventDefault(); qel.value=a.getAttribute("data-dym"); qel.focus(); run();
});
/*LIB2D*/var progSel=document.getElementById("progsel");
if(progSel){ progSel.addEventListener("change",function(){curProg=progSel.value; run();}); }
var jurEl=document.getElementById("jurpills");
if(jurEl){ jurEl.addEventListener("click",function(e){ var b=closestEl(e.target,".pill"); if(!b) return; var all=jurEl.querySelectorAll(".pill"); for(var i=0;i<all.length;i++) all[i].classList.remove("active"); b.classList.add("active"); var jv=b.getAttribute("data-j"); curJur=(jv==="")?"":+jv; run(); }); }
var chapEl=document.getElementById("chapters");
if(chapEl){ chapEl.addEventListener("click",function(e){ var a=closestEl(e.target,"[data-chap]"); if(!a)return; e.preventDefault(); openReader(+a.getAttribute("data-chap"),[]); }); }
var RAWQ2="";
var lastTerms=[], lastHi=[];
function run(){
  var typed=qel.value.trim();
  RAWQ=typed;
  var qobj=typed.length>=2?parseQuery(typed):{branches:[],phrases:[],phrasesExcl:[],excl:[]};
  var ts=[]; qobj.branches.forEach(function(b){b.forEach(function(c){ts.push(c[0]);});});
  qobj.phrases.forEach(function(p){p.forEach(function(s){if(ts.indexOf(s)<0)ts.push(s);});});
  var tt=selTag?rawTerms(selTag).filter(function(t){return !COMMON[t];}).map(stem):[];
  lastTerms=ts.concat(tt); lastHi=rawTerms(typed).concat(selTag?rawTerms(selTag):[]);
  if(!ts.length&&!tt.length){
    if(curProg||curJur!==""){
      var pd=[];
      for(var pdi=0;pdi<docs.length;pdi++){ if((!curProg||docs[pdi].g===curProg)&&(curJur===""||(docs[pdi].j==null?2:docs[pdi].j)===curJur)) pd.push(pdi); }
      cnt.textContent=pd.length+" result"+(pd.length===1?"":"s");
      res.innerHTML=pd.slice(0,100).map(function(di){
        var d=docs[di], ei=extInfo(d);
        return '<div class="card"><span class="badge '+(BCLS[d.s]||"b-ref")+'">'+esc(SLABEL[d.s]||d.s||"Document")+'</span>'+
          '<h3><a href="'+docHref(di)+'">'+esc(d.t)+'</a></h3>'+
          '<div class="url"><a href="'+esc(ei.href)+'" target="_blank" rel="noopener" style="color:var(--accent)">'+ei.label+' &#x2197;</a></div>'+
          '<div class="snip">'+snippet(texts[di],[])+'</div></div>';
      }).join("");
      return;
    }
    res.innerHTML='<div class="empty"><span class="big">&#x1f50d;</span>Type at least 2 characters to search '+N+' documents, or tap a topic.</div>';
    cnt.textContent=""; return;
  }
  var r=search(qobj,tt), cards=answerCards(lastTerms);
  var label=r.length+(r.length===50?"+":"")+" result"+(r.length===1?"":"s");
  if(selTag) label+=' · topic: "'+selTag+'"';
  if(curSrc) label+=" · "+SLABEL[curSrc];
  cnt.textContent=label;
  if(!r.length){
    var dym=(typeof didYouMean==="function")?didYouMean(qobj):[];
    var dymHtml="";
    if(dym.length){
      dymHtml=' Did you mean: '+dym.map(function(s){return '<a href="#" data-dym="'+esc(s)+'">'+esc(s)+'</a>';}).join(" or ")+'?';
    }
    res.innerHTML=cards+'<div class="empty"><span class="big">&#x1f937;</span>No documents match.'+dymHtml+'</div>';
    return;
  }
  res.innerHTML=cards+r.slice(0,100).map(function(x){
    var d=docs[x.di], ei=extInfo(d);
    return '<div class="card"><span class="badge '+(BCLS[d.s]||"b-ref")+'">'+esc(SLABEL[d.s]||d.s||"Document")+'</span>'+
      '<h3><a href="'+docHref(x.di)+'">'+esc(d.t)+'</a></h3>'+
      '<div class="url"><a href="'+esc(ei.href)+'" target="_blank" rel="noopener" style="color:var(--accent)">'+ei.label+' &#x2197;</a></div>'+
      '<div class="snip">'+snippet(texts[x.di],lastHi)+'</div></div>';
  }).join("");
}
var deb; qel.addEventListener("input",function(){clearTimeout(deb);deb=setTimeout(run,200);});
updateTagUI(); run();
