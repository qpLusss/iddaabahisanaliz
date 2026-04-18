(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const l of s.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&n(l)}).observe(document,{childList:!0,subtree:!0});function t(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(i){if(i.ep)return;i.ep=!0;const s=t(i);fetch(i.href,s)}})();async function na(e,a={},t){return window.__TAURI_INTERNALS__.invoke(e,a,t)}const yt=["BaÄŸlantÄ± Ã§ekiliyor ve sayfa iÃ§eriÄŸi ayrÄ±ÅŸtÄ±rÄ±lÄ±yor...","Son maÃ§ ritmi ve gol profili hesaplanÄ±yor...","Taktik denge, risk ve senaryolar oluÅŸturuluyor...","Yerel analiz tamamlanÄ±yor, AI katmanÄ± hazÄ±rlanÄ±yor..."],nn=["GÃ¼nlÃ¼k program okunuyor ve aday maÃ§lar Ã§Ä±kartÄ±lÄ±yor...","Lig filtresi ve minimum gÃ¼ven eÅŸiÄŸi uygulanacak havuz hazÄ±rlanÄ±yor...","Her maÃ§ iÃ§in form, pazar ve risk dengesi derinlemesine hesaplanÄ±yor...","En iyi 5 maÃ§ ve uzak durulacak 3 maÃ§ sÄ±ralanÄ±yor..."],sn=["CanlÄ± futbol programÄ± okunuyor...","CanlÄ± skor, dakika ve durum bilgisi eÅŸleÅŸtiriliyor...","Ä°lk yarÄ±, ikinci yarÄ± ve maÃ§ sonucu pazarlarÄ± canlÄ± akÄ±ÅŸa gÃ¶re Ã¶lÃ§Ã¼lÃ¼yor...","CanlÄ± maÃ§ yorumlarÄ± hazÄ±rlanÄ±yor..."],ln=3200,rn=4200,on=2600,cn=1e4,un=2e4,at=6e4,dn=9e4,Ga=120,wa=100,Ea=12,La=4,Ta=3,Le=30,mn=Object.freeze({topHitRate:{label:"Ana Ã¶neri isabeti",comparator:"min",target:62,minSample:24},playedHitRate:{label:"Kupon isabeti",comparator:"min",target:58,minSample:18},liveSuccessRate:{label:"CanlÄ± doÄŸruluk",comparator:"min",target:70,minSample:30},liveNotFoundRate:{label:"CanlÄ± not_found oranÄ±",comparator:"max",target:20,minSample:30},benchmarkHitRate:{label:"Sabit test seti isabeti",comparator:"min",target:60,minSample:18}});typeof globalThis<"u"&&typeof globalThis.mojibakeScore!="function"&&(globalThis.mojibakeScore=e=>(String(e??"").match(/[\u00C3\u00C2\u00C5\u00C4\u00E2\uFFFD]/g)??[]).length);const g={theme:"mertc-theme",aiEnabled:"mertc-ai-enabled",provider:"mertc-ai-provider",apiKey:"mertc-openai-key",model:"mertc-ai-model",baseUrl:"mertc-ai-base-url",scanLeagueFilter:"mertc-scan-league-filter",scanLeagueWhitelist:"mertc-scan-league-whitelist",scanLeagueBlacklist:"mertc-scan-league-blacklist",scanDate:"mertc-scan-date",scanMinConfidence:"mertc-scan-min-confidence",sharpMode:"mertc-sharp-mode",autoTrackScan:"mertc-auto-track-scan",scanTopOnly:"mertc-scan-top-only",liveBestOnly:"mertc-live-best-only",scanPresets:"mertc-scan-presets",scanPresetLast:"mertc-scan-preset-last",footballDataToken:"mertc-football-data-token",apiFootballKey:"mertc-api-football-key",apiFootballBaseUrl:"mertc-api-football-base-url",history:"mertc-analysis-history-v2",benchmarkSet:"mertc-benchmark-set-v1",liveDiagnostics:"mertc-live-diagnostics-v1"},pn=[["Ã¼","Ã¼"],["Ãœ","Ãœ"],["Ã¶","Ã¶"],["Ã–","Ã–"],["Ã§","Ã§"],["Ã‡","Ã‡"],["Ä±","Ä±"],["Ä°","Ä°"],["ÄŸ","ÄŸ"],["Äž","Ä"],["ÅŸ","ÅŸ"],["Åž","Å"],["â€¢","â€¢"],["â€“","-"],["â€”","-"],["â€™","'"],["â€œ",'"'],["â€",'"']],fn=/[\u00C3\u00C2\u00C5\u00C4\u00E2\uFFFD]/,kn=[["Ma�","MaÃ§"],["ma�","maÃ§"],["G�ven","GÃ¼ven"],["g�ven","gÃ¼ven"],["�st","Ãœst"],["�ST","ÃœST"],["�neri","Ã¶neri"],["�neriler","Ã¶neriler"],["�zeti","Ã¶zeti"],["��z�mleme","Ã§Ã¶zÃ¼mleme"],["canlÄ±","canlÄ±"],["CanlÄ±","CanlÄ±"],["Takipten Ã‡Ä±kar","Takipten Ã‡Ä±kar"],["Takibe AlÄ±ndÄ±","Takibe AlÄ±ndÄ±"],["Takibe alÄ±ndÄ±","Takibe alÄ±ndÄ±"]],St=document.documentElement,B=document.querySelector("#matchUrl"),ce=document.querySelector("#analyzeBtn"),ue=document.querySelector("#scanBtn"),J=document.querySelector("#liveScanBtn"),Te=document.querySelector("#scanDate"),Pe=document.querySelector("#scanLeagueFilter"),Y=document.querySelector("#scanLeagueWhitelist"),q=document.querySelector("#scanLeagueBlacklist"),F=document.querySelector("#scanPresetSelect"),N=document.querySelector("#scanPresetName"),hn=document.querySelector("#savePresetBtn"),vn=document.querySelector("#deletePresetBtn"),_e=document.querySelector("#scanMinConfidence"),ia=document.querySelector("#sharpModeToggle"),sa=document.querySelector("#autoTrackScanToggle"),he=document.querySelector("#scanTopOnlyToggle"),ve=document.querySelector("#liveBestOnlyToggle"),tt=document.querySelector("#statusText"),xa=document.querySelector("#emptyState"),Z=document.querySelector("#summaryContent"),Ra=document.querySelector("#modeTag"),bn=document.querySelector("#aiState"),$t=document.querySelector("#themeToggle"),wt=document.querySelector("#settingsToggle"),Ca=document.querySelector("#settingsPanel"),Fa=document.querySelector("#aiEnabled"),U=document.querySelector("#providerSelect"),gn=document.querySelector("#apiKeyField"),la=document.querySelector("#apiKeyInput"),le=document.querySelector("#modelInput"),Q=document.querySelector("#baseUrlInput"),ra=document.querySelector("#footballDataTokenInput"),Ce=document.querySelector("#apiFootballKeyInput"),Me=document.querySelector("#apiFootballBaseUrlInput"),yn=document.querySelector("#providerNote"),Ee=document.querySelector("#historyContent"),Ma=document.querySelector("#refreshTrackedBtn"),Lt=document.querySelector("#clearHistoryBtn"),Sn=document.querySelector("#liveHubToggle"),xe=document.querySelector("#liveHubDrawer"),$n=document.querySelector("#liveHubClose"),oe=document.querySelector("#liveHubContent"),pe=document.querySelector("#liveMatchCenterDrawer"),wn=document.querySelector("#liveMatchCenterClose"),x=document.querySelector("#liveMatchCenterContent"),qe=document.querySelector("#goalToastRoot"),Ne=document.querySelector("#busyOverlay"),nt=document.querySelector("#busyTitle"),it=document.querySelector("#busyText"),st=document.querySelector("#busyStep");let Re=null,de=null,Se=null,Ze=null,$e=null,Tt="",se=null,Aa=new Map,fe=null,je=null,z=null,lt=!1;Ln();function Ln(){Tn();try{Nn(),At(Gn()),Ws(),Da(),Mt(),Be("Yerel analiz motoru hazÄ±r."),te(j()),re(!1),y("HazÄ±r. BaÄŸlantÄ±yÄ± yapÄ±ÅŸtÄ±r veya gÃ¼nlÃ¼k programÄ± tara.","idle"),G(document.body)}catch(e){console.error("Bootstrap init error:",e),re(!1),Be("Yerel analiz motoru hazÄ±r."),y("HazÄ±r. BaÄŸlantÄ±yÄ± yapÄ±ÅŸtÄ±r veya gÃ¼nlÃ¼k programÄ± tara.","idle")}}function Tn(){lt||(lt=!0,ce?.addEventListener("click",za),ue?.addEventListener("click",rt),J?.addEventListener("click",ot),B?.addEventListener("keydown",e=>{if(e.key==="Enter"){const a=B.value.trim();if(Ua(a)){ot();return}if(Ya(a)){rt();return}za()}}),wt?.addEventListener("click",()=>{Ca.classList.toggle("hidden"),G(Ca)}),$t?.addEventListener("click",()=>{const e=St.dataset.theme==="light"?"dark":"light";At(e)}),Sn?.addEventListener("click",()=>Xe(!0)),$n?.addEventListener("click",()=>Xe(!1)),xe?.addEventListener("click",e=>{e.target===xe&&Xe(!1)}),oe?.addEventListener("click",ps),x?.addEventListener("click",e=>{Qi(e)}),wn?.addEventListener("click",()=>we(null)),pe?.addEventListener("click",e=>{e.target===pe&&we(null)}),document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!pe?.classList.contains("hidden")){we(null);return}e.key==="Escape"&&!xe?.classList.contains("hidden")&&Xe(!1)}),Fa?.addEventListener("change",C),he?.addEventListener("change",C),ve?.addEventListener("change",C),U?.addEventListener("change",()=>{Mt(),C()}),la?.addEventListener("input",C),le?.addEventListener("input",C),Q?.addEventListener("input",C),ra?.addEventListener("input",C),Ce?.addEventListener("input",C),Me?.addEventListener("input",C),Te?.addEventListener("input",C),Pe?.addEventListener("input",C),Y?.addEventListener("input",C),q?.addEventListener("input",C),F?.addEventListener("change",Mn),hn?.addEventListener("click",An),vn?.addEventListener("click",zn),_e?.addEventListener("input",C),ia?.addEventListener("change",C),sa?.addEventListener("change",C),Lt?.addEventListener("click",Xi),Ma?.addEventListener("click",()=>De(!1)),Ee?.addEventListener("click",ws),Z?.addEventListener("click",bs))}async function za(){const e=B.value.trim();if(!e){y("LÃ¼tfen Ã¶nce geÃ§miÅŸ skor baÄŸlantÄ±sÄ±nÄ± gir.","warn");return}if(Ya(e)){y("Bu baÄŸlantÄ± gÃ¼nlÃ¼k bÃ¼lten sayfasÄ±. Bu akÄ±ÅŸ iÃ§in MaÃ§larÄ± Tara butonunu kullan.","warn");return}re(!0,"analyze");const a=Ha(yt);try{const t=qa(j()),n=Ka("analyze_match",{url:e,ai:_a("analyze"),data:oa(e),options:Ba(),calibration:t},9e4,"Analiz"),[i]=await Promise.all([n,Pa(ln)]),s=be(i);a(),$e=s,Tt=e,It(s),G(Z),Oe(e,s),y("Analiz hazÄ±r. Yerel motor, gÃ¼ven kÄ±rÄ±lÄ±mÄ± ve AI katmanÄ± birlikte deÄŸerlendirildi.","ok")}catch(t){a(),console.error(t),y(`Analiz baÅŸarÄ±sÄ±z: ${ka(t,"Beklenmeyen hata")}`,"error")}finally{re(!1)}}async function rt(){const e="https://www.iddaa.com/program/futbol";B.value.trim()||(B.value=e);const a=B.value.trim();if(!a){y("LÃ¼tfen Ã¶nce gÃ¼nlÃ¼k program baÄŸlantÄ±sÄ±nÄ± gir.","warn");return}if(!Ya(a)){y("Tarama modu iÃ§in gÃ¼nlÃ¼k program baÄŸlantÄ±sÄ±nÄ± gir. Ã–rnek: https://www.iddaa.com/program/futbol","warn");return}re(!0,"scan");const t=Ha(nn);try{const n=qa(j()),i=Ka("scan_daily_program",{url:a,ai:_a("scan"),data:oa(a),scan:In(),options:Ba(),calibration:n},9e4,"GÃ¼nlÃ¼k tarama"),[s]=await Promise.all([i,Pa(rn)]),l=be(s),o=Yi(l);t(),zt(o),y(he?.checked?"GÃ¼nlÃ¼k tarama hazÄ±r. Sadece en gÃ¼venilir 3 maÃ§ gÃ¶steriliyor.":"GÃ¼nlÃ¼k tarama hazÄ±r. En gÃ¼venilir 5 maÃ§ ve uzak durulacak 3 maÃ§ sÄ±ralandÄ±.","ok")}catch(n){t(),console.error(n),y(`GÃ¼nlÃ¼k tarama baÅŸarÄ±sÄ±z: ${ka(n,"GÃ¼nlÃ¼k tarama hatasÄ±")}`,"error")}finally{re(!1)}}async function ot(){const e="https://www.iddaa.com/program/canli/futbol";B.value.trim()||(B.value=e);const a=B.value.trim();if(!a){y("LÃ¼tfen Ã¶nce canlÄ± futbol program baÄŸlantÄ±sÄ±nÄ± gir.","warn");return}if(!Ua(a)){y("CanlÄ± sorgu iÃ§in canlÄ± futbol program baÄŸlantÄ±sÄ±nÄ± gir. Ã–rnek: https://www.iddaa.com/program/canli/futbol","warn");return}re(!0,"live");const t=Ha(sn);try{const n=qa(j()),i=Ka("scan_live_matches",{url:a,ai:_a("live"),data:oa(a),options:Ba(),calibration:n},9e4,"CanlÄ± tarama"),[s]=await Promise.all([i,Pa(on)]),l=be(s),o=qi(l);t(),xn(o),y(ve?.checked?"CanlÄ± maÃ§ taramasÄ± hazÄ±r. En gÃ¼Ã§lÃ¼ tek canlÄ± maÃ§ Ã¶ne Ã§Ä±karÄ±ldÄ±.":"CanlÄ± maÃ§ taramasÄ± hazÄ±r. "+(o.analyzedCount??0)+" maÃ§ yorumlandÄ±.","ok")}catch(n){t(),console.error(n),y(`CanlÄ± maÃ§ taramasÄ± baÅŸarÄ±sÄ±z: ${ka(n,"CanlÄ± tarama hatasÄ±")}`,"error")}finally{re(!1)}}function _a(e="analyze"){return{enabled:!1,provider:U.value,apiKey:la.value.trim(),model:le.value.trim()||ua(U.value),baseUrl:Q.value.trim()||da(U.value)}}function oa(e=""){const a=ra?.value?.trim()||"",t=Ce?.value?.trim()||"",n=Me?.value?.trim()||"",i={};return a&&(i.footballDataToken=a),t&&(i.apiFootballKey=t,n&&(i.apiFootballBaseUrl=n)),Object.keys(i).length?i:null}function Ba(){return{sharpMode:!!ia?.checked,autoTrackScan:!!sa?.checked}}function ca(){const e=new Date,a=e.getTimezoneOffset()*6e4;return new Date(e.getTime()-a).toISOString().slice(0,10)}function ba(e){return String(e||"").split(",").map(a=>T(a).trim()).filter(Boolean)}function Ae(e){return T(e||"").trim()}function Ke(){const e=localStorage.getItem(g.scanPresets);if(!e)return[];try{const a=JSON.parse(e);return Array.isArray(a)?a.filter(t=>t&&typeof t.name=="string"&&t.name.trim().length):[]}catch{return[]}}function Ct(e){localStorage.setItem(g.scanPresets,JSON.stringify(e))}function Da(){if(!F)return;const e=Ke(),a=localStorage.getItem(g.scanPresetLast)??"";F.innerHTML=['<option value="">Bir ÅŸablon seÃ§</option>',...e.map(t=>`<option value="${$(t.name)}">${$(t.name)}</option>`)].join(""),a&&e.some(t=>t.name===a)&&(F.value=a,N&&!N.value&&(N.value=a))}function Cn(e){const a=Ae(e);if(!a)return;const n=Ke().find(i=>Ae(i.name)===a);n&&(Y&&(Y.value=n.whitelist??""),q&&(q.value=n.blacklist??""),N&&(N.value=n.name),localStorage.setItem(g.scanPresetLast,n.name),C(),y(`Åablon uygulandÄ±: ${n.name}`,"ok"))}function Mn(){F&&Cn(F.value)}function An(){if(!N)return;const e=Ae(N.value);if(!e){y("Åablon adÄ± gir.","warn");return}const a=Y?.value.trim()??"",t=q?.value.trim()??"",n=Ke(),i=n.findIndex(l=>Ae(l.name).toLowerCase()===e.toLowerCase()),s={name:e,whitelist:a,blacklist:t,updatedAt:new Date().toISOString()};i>=0?n[i]={...n[i],...s}:n.push(s),Ct(n),localStorage.setItem(g.scanPresetLast,e),F&&(F.value=e),Da(),y(`Åablon kaydedildi: ${e}`,"ok")}function zn(){const e=Ae(F?.value||N?.value||"");if(!e){y("Silmek iÃ§in ÅŸablon seÃ§.","warn");return}const a=Ke(),t=a.filter(n=>Ae(n.name).toLowerCase()!==e.toLowerCase());if(t.length===a.length){y("Bu isimde ÅŸablon bulunamadÄ±.","warn");return}Ct(t),localStorage.removeItem(g.scanPresetLast),F&&(F.value=""),N&&(N.value=""),Da(),y(`Åablon silindi: ${e}`,"ok")}function In(){const e=Number.parseInt(_e.value,10),a=Number.isInteger(e)?Math.max(42,Math.min(96,e)):74;return _e.value=String(a),{selectedDate:Te.value||ca(),leagueFilters:ba(Pe.value),leagueWhitelist:ba(Y?.value),leagueBlacklist:ba(q?.value),minConfidence:a}}function Nn(){Fa.checked=localStorage.getItem(g.aiEnabled)==="true",U.value=localStorage.getItem(g.provider)??"ollama",la.value=localStorage.getItem(g.apiKey)??"",le.value=localStorage.getItem(g.model)??ua(U.value),Q.value=localStorage.getItem(g.baseUrl)??da(U.value),Te.value=ca(),localStorage.setItem(g.scanDate,Te.value),Pe.value=localStorage.getItem(g.scanLeagueFilter)??"",Y&&(Y.value=localStorage.getItem(g.scanLeagueWhitelist)??""),q&&(q.value=localStorage.getItem(g.scanLeagueBlacklist)??""),N&&(N.value=localStorage.getItem(g.scanPresetLast)??""),_e.value=localStorage.getItem(g.scanMinConfidence)??"74",ia.checked=localStorage.getItem(g.sharpMode)!=="false",sa.checked=localStorage.getItem(g.autoTrackScan)==="true",he&&(he.checked=localStorage.getItem(g.scanTopOnly)==="true"),ve&&(ve.checked=localStorage.getItem(g.liveBestOnly)==="true"),ra.value=localStorage.getItem(g.footballDataToken)??"",Ce&&(Ce.value=localStorage.getItem(g.apiFootballKey)??""),Me&&(Me.value=localStorage.getItem(g.apiFootballBaseUrl)??"https://v3.football.api-sports.io")}function C(){localStorage.setItem(g.aiEnabled,String(Fa.checked)),localStorage.setItem(g.provider,U.value),localStorage.setItem(g.apiKey,la.value),localStorage.setItem(g.model,le.value||ua(U.value)),localStorage.setItem(g.baseUrl,Q.value||da(U.value)),localStorage.setItem(g.scanDate,Te.value||ca()),localStorage.setItem(g.scanLeagueFilter,Pe.value),Y&&localStorage.setItem(g.scanLeagueWhitelist,Y.value),q&&localStorage.setItem(g.scanLeagueBlacklist,q.value),localStorage.setItem(g.scanMinConfidence,_e.value||"74"),localStorage.setItem(g.sharpMode,String(!!ia.checked)),localStorage.setItem(g.autoTrackScan,String(!!sa.checked)),he&&localStorage.setItem(g.scanTopOnly,String(!!he.checked)),ve&&localStorage.setItem(g.liveBestOnly,String(!!ve.checked)),localStorage.setItem(g.footballDataToken,ra.value),Ce&&localStorage.setItem(g.apiFootballKey,Ce.value),Me&&localStorage.setItem(g.apiFootballBaseUrl,Me.value||"https://v3.football.api-sports.io")}function ua(e){return e==="openai"?"gpt-5-mini":"qwen2.5:7b"}function da(e){return e==="openai"?"https://api.openai.com/v1":"http://localhost:11434"}function Mt(){const e=U.value,a=e==="openai";gn.classList.toggle("hidden",!a),yn.innerHTML=T(a?"OpenAI iÃ§in geÃ§erli bir API anahtarÄ± gerekir. Kota veya bakiye yoksa ikinci katman Ã§alÄ±ÅŸmaz.":"Ollama iÃ§in en az bir modelin gerÃ§ekten kurulmuÅŸ olmasÄ± gerekir. Uygulama <code>/api/tags</code> ile kurulu modelleri okur; yalnÄ±zca indirilebilir listeyi gÃ¶rmek yetmez. Ã–rnek: <code>ollama pull gemma3:4b</code>"),(!Q.value.trim()||Q.value.trim()==="https://api.openai.com/v1"||Q.value.trim()==="http://localhost:11434"||Q.value.trim()==="http://localhost:11434/api"||Q.value.trim()==="http://localhost:11434/api/tags")&&(Q.value=da(e)),(!le.value.trim()||le.value.trim()==="gpt-5-mini"||le.value.trim()==="qwen2.5:7b")&&(le.value=ua(e)),G(Ca)}function Gn(){const e=localStorage.getItem(g.theme);return e==="light"||e==="dark"?e:window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}function At(e){St.dataset.theme=e,localStorage.setItem(g.theme,e),$t.textContent=e==="light"?"Koyu Mod":"AÃ§Ä±k Mod"}function En(e="analyze"){return e==="scan"?"MaÃ§lar sorgulanÄ±yor":e==="live"?"CanlÄ± maÃ§lar sorgulanÄ±yor":"MaÃ§ sorgulanÄ±yor"}function Ia(e){st&&(st.textContent=c(e,"Veri iÅŸleniyor..."))}function ct(e,a="analyze"){if(Ne){if(!e){z&&(z(),z=null),Ne.classList.add("hidden"),Ne.setAttribute("aria-hidden","true"),document.body.classList.remove("busy-open"),Ia("Veri iÅŸleniyor...");return}nt&&(nt.textContent=En(a)),it&&(it.textContent=a==="analyze"?"Tek maÃ§ verisi sorgulanÄ±yor, lÃ¼tfen bekleyin.":a==="scan"?"GÃ¼nlÃ¼k programdaki maÃ§lar sorgulanÄ±yor, lÃ¼tfen bekleyin.":"CanlÄ± listedeki maÃ§lar sorgulanÄ±yor, lÃ¼tfen bekleyin."),Ne.classList.remove("hidden"),Ne.setAttribute("aria-hidden","false"),document.body.classList.add("busy-open")}}function Ha(e=yt){z&&(z(),z=null);let a=0;const t=c(e[a],"Veri iÅŸleniyor...");Ia(t),y(t,"normal");const n=window.setInterval(()=>{a=(a+1)%e.length;const s=c(e[a],"Veri iÅŸleniyor...");Ia(s),y(s,"normal")},1e3),i=()=>{window.clearInterval(n),z===i&&(z=null)};return z=i,i}function Pa(e){return new Promise(a=>window.setTimeout(a,e))}function Ka(e,a,t=7e4,n="Ä°ÅŸlem"){return Promise.race([na(e,a),new Promise((i,s)=>{window.setTimeout(()=>{s(new Error(`${n} zaman aÅŸÄ±mÄ±na uÄŸradÄ±. AÄŸ baÄŸlantÄ±sÄ±nÄ± ve veri kaynaÄŸÄ±nÄ± kontrol et.`))},t)})])}function re(e,a="analyze"){ce.disabled=e,ue.disabled=e,J&&(J.disabled=e),ce.textContent=e&&a==="analyze"?"Analiz yapÄ±lÄ±yor...":"Analiz Et",ue.textContent="MaÃ§larÄ± Tara",J&&(J.textContent="CanlÄ± MaÃ§larÄ± Sorgula"),je&&(window.clearTimeout(je),je=null),e?je=window.setTimeout(()=>{z&&(z(),z=null),ce.disabled=!1,ue.disabled=!1,ce.textContent="Analiz Et",ue.textContent="MaÃ§larÄ± Tara",J&&(J.disabled=!1,J.textContent="CanlÄ± MaÃ§larÄ± Sorgula"),ct(!1,a),y("Ä°ÅŸlem zaman aÅŸÄ±mÄ±na uÄŸradÄ±. Veri kaynaÄŸÄ± yanÄ±t vermediÄŸi iÃ§in bekleme sonlandÄ±rÄ±ldÄ±.","error")},a==="scan"?1e5:8e4):z&&(z(),z=null),ct(e,a)}function y(e,a){tt.textContent=c(e,"HazÄ±r."),tt.style.color=a==="error"?"var(--danger)":a==="warn"?"var(--warning)":a==="ok"?"var(--accent)":"var(--muted)"}function Be(e){bn.textContent=c(e,"Yerel analiz motoru hazÄ±r.")}function zt(e){Se=e,xa.classList.add("hidden"),Z.classList.remove("hidden"),Ra.textContent="Istatistik taramasi",Be(e.displayMode==="top3"?`${c(e.scanDate,"-")} programÄ± tarandÄ± â€¢ en gÃ¼Ã§lÃ¼ 3 maÃ§ Ã¶ne Ã§Ä±karÄ±ldÄ±`:`${c(e.scanDate,"-")} programÄ± tarandÄ± â€¢ ${e.qualifiedCount} eÅŸik Ã¼stÃ¼ maÃ§ kaldÄ± â€¢ ${e.avoidPicks.length} uzak dur sinyali Ã¼retildi`);const a=[];Array.isArray(e.leagueFilters)&&e.leagueFilters.length&&a.push(...e.leagueFilters.map(l=>`<span class="source-pill strong">${r(l)}</span>`)),Array.isArray(e.leagueWhitelist)&&e.leagueWhitelist.length&&a.push(...e.leagueWhitelist.map(l=>`<span class="source-pill strong">Beyaz: ${r(l)}</span>`)),Array.isArray(e.leagueBlacklist)&&e.leagueBlacklist.length&&a.push(...e.leagueBlacklist.map(l=>`<span class="source-pill limited">Kara: ${r(l)}</span>`));const t=a.length?a.join(""):'<span class="source-pill limited">TÃ¼m ligler</span>',n=r(e.scanDate||Te.value||ca()),i=Hs(e),s=Array.isArray(e.couponPackages)?e.couponPackages:[];Z.innerHTML=`
    <div class="analysis-stack">
      <section class="match-shell">
        <div class="match-headline">
          <div>
            <div class="headline-pills">
              <span class="source-pill strong">${r(ie(e.sourceLabel))}</span>
              <span class="source-pill strong">${n}</span>
              <span class="source-pill strong">Minimum gÃ¼ven %${e.minConfidence}</span>
              ${t}
            </div>
            <h3>SeÃ§ili gÃ¼n tarama Ã¶zeti</h3>
            <p>${r(i)}</p>
          </div>
          <div class="meta-block">
            <div>Aday maÃ§: ${e.candidateCount}</div>
            <div>Taranan maÃ§: ${e.scannedCount}</div>
            <div>BaÅŸarÄ±lÄ± analiz: ${e.analyzedCount}</div>
          </div>
        </div>

        <div class="metric-strip">
          ${K("Aday",e.candidateCount,"GÃ¼nÃ¼n programÄ±ndaki maÃ§lar",{suffix:""})}
          ${K("Taranan",e.scannedCount,"DetaylÄ± incelenen maÃ§lar",{suffix:""})}
          ${K("Lig uyumu",e.matchedCount,"Lig politikasÄ±na uyan maÃ§lar",{suffix:""})}
          ${K("EÅŸik ÃœstÃ¼",e.qualifiedCount,"Minimum gÃ¼veni geÃ§en maÃ§lar",{suffix:""})}
        </div>
      </section>

      ${Qn(s,e.autoTrackScan)}

      ${ut(e.displayMode==="top3"?"SeÃ§ilen gÃ¼nÃ¼n en gÃ¼Ã§lÃ¼ 3 maÃ§Ä±":"SeÃ§ilen gÃ¼nÃ¼n en gÃ¼venilir 5 maÃ§Ä±",e.displayMode==="top3"?"Filtre aÃ§Ä±k olduÄŸu iÃ§in yalnÄ±zca en yÃ¼ksek gÃ¼venli 3 maÃ§ gÃ¶steriliyor.":`EÅŸik ÃœstÃ¼nde kalan ${e.qualifiedCount} maÃ§ iÃ§inden en saÄŸlam 5 seÃ§im listelendi.`,e.topPicks,"top",e.minConfidence)}

      ${e.displayMode==="top3"?"":ut("Uzak durulacak 3 maÃ§","Risk dengesi, dÃ¼ÅŸÃ¼k gÃ¼ven ve kÄ±rÄ±lgan pazar yapÄ±sÄ± nedeniyle uzak durulmasÄ± gereken maÃ§lar.",e.avoidPicks,"avoid",e.minConfidence)}
    </div>
  `,G(Z)}function xn(e){Ze=e,xa.classList.add("hidden"),Z.classList.remove("hidden"),Ra.textContent="CanlÄ± maÃ§ akÄ±ÅŸÄ±",Be(e.displayMode==="best1"?"CanlÄ± program tarandÄ± â€¢ en gÃ¼Ã§lÃ¼ tek canlÄ± maÃ§ Ã¶ne Ã§Ä±karÄ±ldÄ±.":`CanlÄ± programdan ${e.analyzedCount} maÃ§ yorumlandÄ±. Ä°lk yarÄ±, ikinci yarÄ± ve maÃ§ sonucu pazarlarÄ± canlÄ± akÄ±ÅŸa gÃ¶re gÃ¼ncellendi.`),Z.innerHTML=`
    <div class="analysis-stack">
      <section class="match-shell live-shell">
        <div class="match-headline">
          <div>
            <div class="headline-pills">
              <span class="source-pill strong">${r(ie(e.sourceLabel))}</span>
              <span class="source-pill strong">CanlÄ± futbol</span>
            </div>
            <h3 class="live-title"><span class="live-dot" aria-hidden="true"></span>${r(e.displayMode==="best1"?"En gÃ¼Ã§lÃ¼ canlÄ± maÃ§ seÃ§ildi":"CanlÄ± maÃ§lar yorumlandÄ±")}</h3>
            <p>${r(e.displayMode==="best1"?"Filtre aÃ§Ä±k olduÄŸu iÃ§in gÃ¼veni en yÃ¼ksek canlÄ± maÃ§ Ã¶ne Ã§Ä±karÄ±ldÄ±.":e.summaryNote||`${e.analyzedCount} canlÄ± maÃ§ dakika ve skor bilgisiyle yorumlandÄ±.`)}</p>
          </div>
          <div class="meta-block">
            <div>CanlÄ± maÃ§: ${e.liveCount}</div>
            <div>Yorumlanan: ${e.analyzedCount}</div>
          </div>
        </div>
      </section>

      <section class="scan-section live-section">
        <div class="scan-section-head">
          <div>
            <h3>${r(e.displayMode==="best1"?"Ã–ne Ã§Ä±kan canlÄ± maÃ§":"CanlÄ± futbol masasÄ±")}</h3>
            <p>${r(e.displayMode==="best1"?"Filtre aÃ§Ä±k. Åu anda en gÃ¼venilir canlÄ± senaryo tek kartta gÃ¶steriliyor.":"Dakika, skor ve oyun ritmine gÃ¶re ilk yarÄ±, ikinci yarÄ± ve maÃ§ sonucu pazarlarÄ± birlikte okunur.")}</p>
          </div>
          <span class="source-pill strong"><span class="live-dot inline-live-dot" aria-hidden="true"></span>${e.picks?.length??0} canlÄ± maÃ§</span>
        </div>
        <div class="live-picks-grid">
          ${(e.picks??[]).map((a,t)=>Fn(a,t)).join("")}
        </div>
      </section>
    </div>
  `,G(Z)}function A(e){const a=T(String(e??"")),t=c(a,"Belirsiz").replace(/[|]+/g," ").replace(/[?]+/g," ").replace(/\s+/g," ").trim();if(!t||ta(t)>=3||t.length>90)return"Belirsiz";const n=t.match(/(\d+)\.5/),i=/\balt\b/i.test(t)?"Alt":/\b(?:Ã¼st|Ã¼st|st)\b/i.test(t)?"Ãœst":"";return/\bkg\b/i.test(t)&&/\bvar\b/i.test(t)?"KG Var":/\bkg\b/i.test(t)&&/\byok\b/i.test(t)?"KG Yok":/\buzak\b/i.test(t)&&/\bdur\b/i.test(t)?"Uzak Dur":/\bberaber/i.test(t)?"Beraberlik":/\b1x\b/i.test(t)?"1X":/\bx2\b/i.test(t)?"X2":/\b2y\b/i.test(t)&&n&&i?`2Y ${n[1]}.5 ${i}`:/\b(?:ilk|iy|yarÄ±|yarÄ±|yar)\b/i.test(t)&&n&&i?`Ä°lk YarÄ± ${n[1]}.5 ${i}`:/\b(?:maÃ§|maÃ§|ma|ms)\b/i.test(t)&&/\bsonu\b/i.test(t)&&n&&i?`MaÃ§ Sonu ${n[1]}.5 ${i}`:/^1$/.test(t.trim())?"1":/^2$/.test(t.trim())?"2":/^(?:pazar|market|secim|seÃ§im|unknown|belirsiz)$/i.test(t.trim())?"Belirsiz":t.replace(/\bMa\?\s*Sonu\b/gi,"MaÃ§ Sonu").replace(/\bMaÃ§\?\s*Sonu\b/gi,"MaÃ§ Sonu").replace(/\bMa Sonu\b/gi,"MaÃ§ Sonu").replace(/\bÃœst\b/g,"Ãœst").replace(/\bÃœST\b/g,"ÃœST").replace(/\bÃ¼st\b/g,"Ã¼st").replace(/\?\s*st\b/gi,"Ãœst").replace(/\bCanli\b/gi,"CanlÄ±").replace(/\bCanl\?\b/gi,"CanlÄ±").replace(/\bIlk YarÄ±\b/gi,"Ä°lk YarÄ±").replace(/\bIlk Yar\?\b/gi,"Ä°lk YarÄ±").replace(/\b\Ä°lk Yar\?\b/gi,"Ä°lk YarÄ±").replace(/\bIlk Yar\b/gi,"Ä°lk YarÄ±").replace(/\bYari\b/gi,"YarÄ±").replace(/\bYar\?\b/gi,"YarÄ±").replace(/\bUzakDur\b/g,"Uzak Dur").replace(/\bUzak\s+Dur\b/gi,"Uzak Dur").replace(/\s+/g," ").trim()||"Belirsiz"}function Oa(e){const a=A(e).toLocaleLowerCase("tr-TR");return!a||a==="belirsiz"||a==="pazar"||a==="market"||a==="seÃ§im"}function ze(e){const a=String(e||"").match(/(\d+)\s*[-:]\s*(\d+)/);if(!a)return{homeGoals:0,awayGoals:0,totalGoals:0};const t=Number.parseInt(a[1],10)||0,n=Number.parseInt(a[2],10)||0;return{homeGoals:t,awayGoals:n,totalGoals:t+n}}function Je(e,a,t){const n=A(e),i=c(t.minuteLabel||t.trackedStatus?.statusLabel||"CanlÄ±","CanlÄ±"),s=D(t.minuteLabel||t.trackedStatus?.statusLabel||""),l=c(t.liveScore||"Skor bekleniyor","Skor bekleniyor"),o=Math.max(0,Math.min(100,Number(a)||0)),{totalGoals:u}=ze(l),p=c(t.halftimeScore||t.trackedStatus?.halftimeScore||"",""),k=ze(p),f=/(\d+)\s*[-:]\s*(\d+)/.test(p)?Math.max(0,u-k.totalGoals):null,v=t.trackedStatus?.state==="halftime"||/Ä°Y|Devre|HT/i.test(i),b=s>0&&s<45&&!v,S=s>=45||v;if(b){if(/(?:Ä°lk YarÄ±|Ä°Y) 0\.5 Alt/i.test(n)&&u>=1)return{label:"Ä°lk YarÄ± 0.5 Ãœst",probability:100,note:`Skor ${l}. Ä°lk yarÄ±da gol Ã§Ä±ktÄ±; bu Ã§izgi artÄ±k kapandÄ±.`};if(/(?:Ä°lk YarÄ±|Ä°Y) 1\.5 Alt/i.test(n)&&u>=2)return{label:"Ä°lk YarÄ± 1.5 Ãœst",probability:100,note:`Skor ${l}. Ä°lk yarÄ± 2 gole ulaÅŸtÄ±; bu Ã§izgi artÄ±k aÅŸÄ±ldÄ±.`};if(/(?:Ä°lk YarÄ±|Ä°Y) 2\.5 Alt/i.test(n)&&u>=3)return{label:"Ä°lk YarÄ± 2.5 Ãœst",probability:100,note:`Skor ${l}. Ä°lk yarÄ± 3 gole Ã§Ä±ktÄ±; alt tarafÄ± artÄ±k bitti.`};if(/(?:Ä°lk YarÄ±|Ä°Y) 0\.5 Ãœst/i.test(n)&&u>=1)return{label:n,probability:100,note:`Skor ${l}. Ä°lk yarÄ± 0.5 Ãœst zaten gerÃ§ekleÅŸti.`};if(/(?:Ä°lk YarÄ±|Ä°Y) 1\.5 Ãœst/i.test(n)&&u>=2)return{label:n,probability:100,note:`Skor ${l}. Ä°lk yarÄ± 1.5 Ãœst zaten gerÃ§ekleÅŸti.`};if(/(?:Ä°lk YarÄ±|Ä°Y) 2\.5 Ãœst/i.test(n)&&u>=3)return{label:n,probability:100,note:`Skor ${l}. Ä°lk yarÄ± 2.5 Ãœst zaten gerÃ§ekleÅŸti.`}}if(S){const h=n.match(/^2Y\s*(\d+)\.5\s*(Ãœst|Alt)$/i);if(h&&f!==null){const w=(Number(h[1])||0)+1,W=/Ãœst/i.test(h[2]);if(f>=w)return{label:`2Y ${h[1]}.5 Ãœst`,probability:100,note:`Ä°kinci yarÄ±da ${f} gol Ã§Ä±ktÄ±. Bu Ã§izgi artÄ±k gerÃ§ekleÅŸti.`};if(!W)return{label:n,probability:o,note:`Ä°kinci yarÄ±da ÅŸu ana kadar ${f} gol var. ${n} hÃ¢lÃ¢ oyunda.`}}if(/^2Y\s*0\.5\s*(Ãœst|Alt)$/i.test(n)&&f===null&&u>=4){const w=/Alt/i.test(n)?"Alt":"Ãœst";return{label:`MaÃ§ Sonu ${Math.max(2,u)}.5 ${w}`,probability:o,note:`Skor ${l}. Bu aÅŸamada ikinci yarÄ± Ã§izgisi yerine toplam gol Ã§izgisi daha anlamlÄ±.`}}}const m=n.match(/^MaÃ§ Sonu\s*(\d+)\.5\s*(Ãœst|Alt)$/i);if(m){const h=(Number(m[1])||0)+1,w=/Ãœst/i.test(m[2]);if(u>=h)return{label:`MaÃ§ Sonu ${m[1]}.5 Ãœst`,probability:100,note:`Skor ${l}. MaÃ§ sonu ${m[1]}.5 Ãœst Ã§izgisi zaten aÅŸÄ±ldÄ±.`};if(!w)return{label:n,probability:o,note:"",minute:i,score:l}}return{label:n,probability:o,note:"",minute:i,score:l}}function ga(e,a,t){const n=Je(e,a,t);if(n.note)return n.note;const i=n.label,s=n.minute||c(t.minuteLabel||t.trackedStatus?.statusLabel||"CanlÄ±","CanlÄ±"),l=n.score||c(t.liveScore||"Skor bekleniyor","Skor bekleniyor"),o=n.probability,u=ze(l);if(/(?:Ä°lk YarÄ±|Ä°Y) 0\.5 (?:Ãœst|Ãœst)/i.test(i))return`${s} ve skor ${l}. Devreye kadar en az bir gol daha Ã§Ä±kma ihtimali %${o}.`;if(/(?:Ä°lk YarÄ±|Ä°Y) 1\.5 (?:Ãœst|Ãœst)/i.test(i))return`${s} ve skor ${l}. Devreye kadar toplam 2 gole Ã§Ä±kma ihtimali %${o}.`;if(/(?:Ä°lk YarÄ±|Ä°Y) 0\.5 Alt/i.test(i))return`${s} ve skor ${l}. Devreye kadar yeni gol Ã§Ä±kmama ihtimali %${o}.`;if(/(?:Ä°lk YarÄ±|Ä°Y) 2\.5 Alt/i.test(i))return`${s} ve skor ${l}. Ä°lk yarÄ±nÄ±n bu Ã§izginin altÄ±nda kalma ihtimali %${o}.`;if(/^MaÃ§ Sonu\s*(\d+)\.5\s*Ãœst/i.test(i)){const p=Number(/^MaÃ§ Sonu\s*(\d+)\.5\s*Ãœst/i.exec(i)?.[1]||0),k=Math.max(1,p+1-u.totalGoals);return`${s} ve skor ${l}. Bu Ã§izginin gelmesi iÃ§in ${k} gol daha gerekiyor. Model bu ihtimali %${o} gÃ¶rÃ¼yor.`}if(/^MaÃ§ Sonu\s*(\d+)\.5\s*Alt/i.test(i)){const p=Number(/^MaÃ§ Sonu\s*(\d+)\.5\s*Alt/i.exec(i)?.[1]||0),k=Math.max(0,p-u.totalGoals);return`${s} ve skor ${l}. Bu Ã§izgide en fazla ${k} gol daha alan var. Model alt tarafÄ± %${o} ile Ã¶nde tutuyor.`}return/^2Y\s*(\d+)\.5\s*(Ãœst|Alt)/i.test(i)?`${s} ve skor ${l}. Ä°kinci yarÄ± Ã¶zel Ã§izgisinde ${i} olasÄ±lÄ±ÄŸÄ± %${o}.`:/Uzak Dur/i.test(i)?`${s} ve skor ${l}. Åu an net bir fiyat Ã¼stÃ¼nlÃ¼ÄŸÃ¼ yok; beklemek daha doÄŸru. GÃ¼ven %${o}.`:`${s} ve skor ${l}. ${i} ihtimali %${o}.`}function Rn(e,a){const t=c(e.minuteLabel||e.trackedStatus?.statusLabel||"CanlÄ±","CanlÄ±"),n=c(e.liveScore||"Skor bekleniyor","Skor bekleniyor"),i=a[0],s=A(i.label),l=c(i.note||"","");return c(`${t} itibarÄ±yla skor ${n}. Bu anda en net canlÄ± seÃ§enek ${s} (%${i.probability}). ${l}`,"CanlÄ± yorum Ã¼retilemedi.")}function Fn(e,a){const t=e.trackedStatus??{},n=e.analysis??{},i=t.state==="halftime"||/Ä°Y|Devre|HT/i.test(t.statusLabel||""),s=e.halftimeScore||t.halftimeScore||(i?e.liveScore||"Skor bekleniyor":null),l=Je(e.firstHalfMarketLabel||"Birincil canlÄ± pazar",e.firstHalfOver05Probability??0,e),o=Je(e.secondaryMarketLabel||"Ä°kinci pazar",e.secondaryMarketProbability??0,e),u=Je(e.resultMarketLabel||"MaÃ§ yÃ¶nÃ¼",e.resultMarketProbability??n.confidenceScore??0,e),p=[{label:l.label,probability:l.probability,note:l.note||ga(l.label,l.probability,e),tone:"primary-live-market"},{label:o.label,probability:o.probability,note:o.note||ga(o.label,o.probability,e),tone:"secondary-live-market"},{label:u.label,probability:u.probability,note:u.note||ga(u.label,u.probability,e),tone:"result-live-market"}],k=p[0],d=n.aiSummaryCards??[],f=d[0]??null,v=d[1]?.detail??"",b=c(e.liveComment||Rn(e,p)||k.note||[f?.detail,v].filter(Boolean).join(" "),"KÄ±sa yorum Ã¼retilemedi."),S="KÄ±sa yorum",m=ha(["CanlÄ± futbol",e.minuteLabel||t.statusLabel||"CanlÄ±",e.liveScore||"Skor bekleniyor"]);return`
    <article class="block-card live-pick-card ${t.state==="live"?"active-live-card":""}">
      <div class="mini-top">
        <div>
          <div class="headline-pills">
            <span class="source-pill strong">#${a+1}</span>
            <span class="source-pill ${t.state==="live"?"strong":"limited"}">${r(t.statusLabel||e.minuteLabel||"CanlÄ±")}</span>
          </div>
          <h3>${r(n.matchInfo?.homeTeam)} vs ${r(n.matchInfo?.awayTeam)}</h3>
          <p class="section-copy">${r(m)}</p>
        </div>
        <span class="source-pill strong">GÃ¼ven %${n.confidenceScore??0}</span>
      </div>

      <div class="live-score-strip compact-live-strip">
        <div>
          <span>Skor</span>
          <strong>${r(e.liveScore||"Skor bekleniyor")}</strong>
        </div>
        ${s?`<div><span>Ä°Y skoru</span><strong>${r(s)}</strong></div>`:""}
        <div class="live-status-cell">
          <span>CanlÄ± durum</span>
          <strong class="live-status-value">${r(e.minuteLabel||t.statusLabel||"CanlÄ±")}</strong>
        </div>
      </div>

      <div class="live-market-grid single-live-market-grid">
        ${_n(k)}
      </div>

      <article class="mini-card scan-copy-card live-comment-card compact-live-comment-card">
        <h4>${r(S)}</h4>
        <p>${r(b)}</p>
      </article>

      <div class="live-chip-row">
        <span class="history-chip">Ana Ã¶neri: ${r(A(k.label))} (%${r(String(k.probability))})</span>
      </div>

      <div class="history-actions live-card-actions">
        <button class="ghost-btn" type="button" data-action="track-live-match" data-live-index="${a}">Takibe Al</button>
        <button class="ghost-btn" type="button" data-action="analyze-live-match" data-live-index="${a}">Detay Analiz Et</button>
      </div>
    </article>
  `}function _n(e){const a=Number.isFinite(e.probability)?Math.max(0,Math.min(100,Number(e.probability))):0;return`
    <article class="mini-card scan-copy-card live-market-card ${e.tone}">
      <div class="live-market-head">
        <h4>${r(A(e.label))}</h4>
        <span class="prob-chip">%${r(String(a))}</span>
      </div>
      <p>${r(e.note)}</p>
      <span class="confidence-band-meta">Pazar gÃ¼ven bandÄ±</span>
      <div class="confidence-band" aria-hidden="true">
        <span class="confidence-fill" style="width:${a}%"></span>
      </div>
    </article>
  `}function It(e){$e=e,xa.classList.add("hidden"),Z.classList.remove("hidden");const a=e.matchInfo??{},t=e.sourceStatus??{label:"Kaynak bilgisi yok",detail:"Kaynak modu belirlenemedi.",health:"limited",fallbackUsed:!1},n=ie(e.sourceLabel,t,e.demoMode),i=ie(t.label,t,e.demoMode),s=Vs(e.matchInfo?.locationType,t),l=Ci(e),o=fa(a.matchDate,a.matchTime);Ra.textContent=T(e.demoMode?"Demo veri":t.fallbackUsed?"Yedek akÄ±ÅŸ":"CanlÄ± veri"),Be(e.aiStatusMessage||"Yerel analiz motoru hazÄ±r.");const u=e.probabilities??{},p=e.markets??{},k=Number.isFinite(p.over25)?p.over25:50,d=Number.isFinite(p.over35)?p.over35:50,f=p.projectedGoals??"-",v=Math.max(0,Math.min(100,100-k)),b=ki(k,f),S=e.recommendations??[],m=e.recentMatches??[],h=e.h2hMatches??[],w=e.leagueStandings??[],W=e.aiSummaryCards??[],H=e.marketSpecialists??[],P=e.modelExplainCards??[],E=e.netKpis??[],L=e.lineupVerification??null,_=e.leagueProfile??null,I=e.hardFilter??null,ee=e.detailModules??[],X=jn(e,"MaÃ§ detay motoru ana verileri birlikte okudu."),Za=Ai(e.oddsMovement??null,l?.oddsSnapshots??[]),va=Ue(e),et=qs(e),Ye=[{title:"KÄ±sa karar",detail:va.verdict},{title:"Neden bu Ã§Ä±ktÄ±?",detail:va.reason},{title:"Hangi durumda bozulur?",detail:va.risk}];et?.detail&&(Ye[1].detail=c(`${Ye[1].detail} ${et.detail}`,Ye[1].detail));const Xt=Ks(e,t),Jt=Us(e),Qt=Ys(e),Zt=Os(e),en=S.length?S.map(Jn).join(""):'<div class="scan-empty">Bu eÅŸleÅŸme iÃ§in gÃ¼venli Ã¶neri Ã§Ä±kmadÄ±.</div>',an=H.length?H.map(si).join(""):'<div class="scan-empty">Pazar uzmanlÄ±ÄŸÄ± iÃ§in ek veri Ã¼retilmedi.</div>';Z.innerHTML=`
    <div class="analysis-stack">
      <section class="match-shell">
        <div class="match-headline">
          <div>
            <div class="headline-pills">
              <span class="source-pill ${$(t.health)}">${r(n)}</span>
              <span class="source-pill ${$(t.health)}">${r(i)}</span>
            </div>
            <h3>${r(a.homeTeam)} vs ${r(a.awayTeam)}</h3>
            <p>${r(a.league)}</p>
          </div>
          <div class="meta-block">
            <div>${r(o)}</div>
            <div>${r(s)}</div>
            <div class="analysis-head-actions">${l?.tracked?'<span class="source-pill strong">Takipte</span>':'<button class="ghost-btn analysis-track-btn" type="button" data-action="track-analysis">Takibe Al</button>'}</div>
            <div>GÃ¼ven skoru: ${e.confidenceScore}%</div>
          </div>
        </div>

        <div class="metric-strip">
          ${K("1",u.homeWin??0,"Ev sahibi kazanÄ±r")}
          ${K("X",u.draw??0,"Beraberlik")}
          ${K("2",u.awayWin??0,"Deplasman kazanÄ±r")}
          ${K("KG Var",u.bttsYes??0,"Ä°ki takÄ±m da gol bulur")}
        </div>
        ${Nt(u)}
      </section>

      <section class="verdict-grid">
        ${Ye.map(Pn).join("")}
      </section>

      <section class="strategy-grid">
        ${I?ni(I):""}
        ${_?ii(_):""}
        ${Za?ai(Za):""}
      </section>

      <section class="detail-engine-card block-card">
        <div class="section-head compact-section-head">
          <h3>MaÃ§ detay motoru</h3>
          <span class="source-pill limited">${r(e.sharpMode?"Keskin filtre aktif":"Standart filtre")}</span>
        </div>
        <p class="section-copy">${r(X)}</p>
        <div class="detail-modules-grid">
          ${ee.length?ee.map(tn=>ti(tn,e)).join(""):'<div class="scan-empty">Detay modÃ¼lleri Ã¼retilmedi.</div>'}
        </div>
      </section>

      <section class="dual-grid">
        <article class="block-card">
          <div class="section-head compact-section-head">
            <h3>Model aÃ§Ä±klama kartlarÄ±</h3>
          </div>
          <div class="stack-list">
            ${P.length?P.map(Yn).join(""):'<div class="scan-empty">Model aÃ§Ä±klama kartÄ± bu analizde Ã¼retilmedi.</div>'}
          </div>
        </article>
        <article class="block-card">
          <div class="section-head compact-section-head">
            <h3>Net KPI</h3>
          </div>
          ${Un(L)}
          ${On(E)}
        </article>
      </section>

      <section class="analysis-meta-grid">
        ${qn(t)}
        ${Xt.map(Wn).join("")}
      </section>

      ${Bn(e.aiLayerUsed,e.aiModelLabel,W)}

      <section class="dual-grid">
        <article class="block-card">
          <div class="section-head compact-section-head">
            <h3>Ana Ã¶neriler</h3>
          </div>
          <div class="stack-list">
            ${en}
          </div>
        </article>

        <article class="block-card">
          <div class="section-head compact-section-head">
            <h3>Pazar uzmanlÄ±ÄŸÄ±</h3>
          </div>
          <div class="market-specialists-grid">
            ${an}
          </div>
          <div class="fact-row compact-fact-row">
            ${Sa("2.5 Ãœst",`${k}%`,p.over25Note,k>=58?"emerald":"neutral")}
            ${Sa("2.5 Alt",`${v}%`,b,v>=58?"calm":"neutral")}
            ${Sa("3.5 Ãœst",`${d}%`,p.over35Note,d>=52?"warm":"neutral")}
            ${ri("Gol beklentisi",f,"Tempo, savunma kÄ±rÄ±lganlÄ±ÄŸÄ± ve skor sÃ¼rekliliÄŸi birlikte iÅŸlendi.")}
          </div>
        </article>
      </section>

      <section class="triple-grid simplified-grid">
        <article class="block-card">
          <div class="section-head compact-section-head">
            <h3>Form tablosu</h3>
          </div>
          <p class="section-copy">${r(Jt)}</p>
          ${oi(m)}
        </article>

        <article class="block-card">
          <div class="section-head compact-section-head">
            <h3>H2H tablosu</h3>
          </div>
          <p class="section-copy">${r(Qt)}</p>
          ${ui(h)}
        </article>

        <article class="block-card">
          <div class="section-head compact-section-head">
            <h3>Puan tablosu</h3>
          </div>
          <p class="section-copy">${r(Zt)}</p>
          ${mi(w)}
        </article>
      </section>

      <p class="footer-note">Bu Ã§Ä±ktÄ±, linkte bulunan skor verilerini aÄŸÄ±rlÄ±klÄ± form modeliyle yorumlar. JS ile sonradan yÃ¼klenen veya eksik sayfalarda doÄŸruluk dÃ¼ÅŸer. Ã‡Ä±ktÄ± olasÄ±lÄ±ksaldÄ±r; kesin sonuÃ§ ya da bahis garantisi vermez.</p>
    </div>
  `}function Bn(e,a,t){return t.length?`
    <section class="ai-layer-card">
      <div class="section-head">
        <h3>Ä°kinci AI katmanÄ±</h3>
        <span class="ai-chip ${e?"active":"idle"}">${r(e?a||"AI aktif":"AI beklemede")}</span>
      </div>
      <div class="ai-card-grid">
        ${t.map(Xn).join("")}
      </div>
    </section>
  `:""}function ut(e,a,t,n,i){const s=n==="avoid"?"Risk havuzu":"GÃ¼ven havuzu";return`
    <section class="scan-section">
      <div class="scan-section-head">
        <div>
          <h3>${r(e)}</h3>
          <p>${r(a)}</p>
        </div>
        <span class="source-pill ${n==="avoid"?"fallback":"strong"}">${r(s)} â€¢ ${t.length}</span>
      </div>
      ${t?.length?`<div class="scan-picks-grid">${t.map(l=>Dn(l,n,i)).join("")}</div>`:`<div class="scan-empty">${r(n==="avoid"?"Uzak dur havuzuna dÃ¼ÅŸen maÃ§ Ã§Ä±kmadÄ±.":"Minimum gÃ¼ven eÅŸiÄŸini geÃ§en maÃ§ Ã§Ä±kmadÄ±.")}</div>`}
    </section>
  `}function Dn(e,a="top",t=74){const n=e.analysis,i=n.sourceStatus??{health:"limited"},s=a==="avoid",l=n.aiLayerUsed?(n.aiSummaryCards??[])[0]??null:null,o=Ue(n,s?"avoid":"scan"),u=O(o.verdict,120),p=O(o.reason,120),k=O(o.risk,120),d=Hn(e,n);return`
    <article class="block-card scan-pick-card ${s?"avoid-card":""} rank-${e.rank}">
      <div class="mini-top">
        <span class="scan-rank">#${e.rank}</span>
        <span class="source-pill ${$(i.health||"limited")}">${r(s?`GÃ¼ven %${e.reliabilityScore}`:`Tarama skoru %${e.reliabilityScore}`)}</span>
      </div>

      <div class="scan-headline">
        <h3>${r(n.matchInfo.homeTeam)} vs ${r(n.matchInfo.awayTeam)}</h3>
        <p class="section-copy">${r(ha([n.matchInfo.league,fa(n.matchInfo.matchDate,n.matchInfo.matchTime)]))}</p>
      </div>

      ${Nt(n.probabilities??{})}

      <div class="scan-badges">
        <span class="history-chip">${r(s?"KÄ±rÄ±lgan market":"Ana Ã¶neri")}: ${r(e.safeMarket)} (%${e.safeMarketProbability})</span>
        <span class="history-chip">${r(s?"Risk yÃ¶nÃ¼":"SonuÃ§ yÃ¶nÃ¼")}: ${r(d)} (%${e.resultProbability})</span>
        <span class="history-chip">${r(`Model gÃ¼veni: %${n.confidenceScore}`)}</span>
        ${s&&e.reliabilityScore<t?`<span class="history-chip">${r(`EÅŸik altÄ±: %${t}`)}</span>`:""}
      </div>

      <div class="scan-summary-stack">
        <article class="mini-card scan-copy-card">
          <h4>${r(s?"Uzak dur kararÄ±":"KÄ±sa karar")}</h4>
          <p>${r(u)}</p>
        </article>
        <article class="mini-card scan-copy-card">
          <h4>${r(s?"Neden riskli?":"Neden bu maÃ§?")}</h4>
          <p>${r(p)}</p>
        </article>
        <article class="mini-card scan-copy-card">
          <h4>Risk notu</h4>
          <p>${r(k)}</p>
        </article>
      </div>

      ${l?`
          <div class="scan-ai-callout">
            <strong>${r(l.title||"AI notu")}</strong>
            <p>${r(O(l.detail,135))}</p>
          </div>
        `:""}

        <div class="scan-card-actions">
          <button class="ghost-btn analysis-track-btn" type="button" data-action="track-scan-pick" data-variant="${$(a)}" data-rank="${e.rank}">
            Takibe Al
          </button>
        </div>
    </article>
  `}function Hn(e,a){const t=T(e.safeMarket||""),n=a.matchInfo?.homeTeam||"Ev sahibi",i=a.matchInfo?.awayTeam||"Deplasman";return t==="1X"?`${n} yenilmez`:t==="X2"?`${i} yenilmez`:t==="Beraberlik"?"Beraberlik senaryosu":t.startsWith("1 (")||t.startsWith("2 (")?e.resultLabel:e.resultCode==="1"?`${n} tarafÄ± Ã¶nde`:e.resultCode==="2"?`${i} tarafÄ± Ã¶nde`:"Denge yÃ¼ksek"}function Ua(e){if(!e)return!1;let a=String(e);try{a=decodeURIComponent(new URL(e).pathname)}catch{}return/\/program\/canl(?:i|\u0131)\//i.test(a)}function Ya(e){if(!e)return!1;let a=String(e);try{a=decodeURIComponent(new URL(e).pathname)}catch{}return/\/program\//i.test(a)&&!Ua(e)&&!/\/ma(?:c|\u00e7)-detay\//i.test(a)}function K(e,a,t,n={}){const i=n.suffix??"";return`
    <article class="metric-card">
      <span>${$(e)}</span>
      <strong>${r(`${a}${i}`)}</strong>
      <small>${r(t)}</small>
    </article>
  `}function ya(e){const a=Number(e);return!Number.isFinite(a)||a<=0?"-":(100/Math.min(95,Math.max(1,a))).toFixed(2)}function Nt(e){const a=R(e?.homeWin,0),t=R(e?.draw,0),n=R(e?.awayWin,0);return`
    <div class="metric-strip odds-strip">
      ${K("1 Oran",ya(a),`OlasÄ±lÄ±k %${a}`)}
      ${K("X Oran",ya(t),`OlasÄ±lÄ±k %${t}`)}
      ${K("2 Oran",ya(n),`OlasÄ±lÄ±k %${n}`)}
    </div>
  `}function Pn(e){return`
    <article class="mini-card verdict-card">
      <h4>${r(e.title)}</h4>
      <p>${r(e.detail)}</p>
    </article>
  `}function Kn(e,a){const t=R(a,0);return e==="hit"?`Hedefte %${t}`:e==="risk"?`Risk %${t}`:`Beklemede %${t}`}function On(e){return e?.length?`
    <div class="backtest-list">
      ${e.map(a=>`
        <div class="backtest-row">
          <span>${r(a.label||a.key||"KPI")}</span>
          <div>
            <strong class="kpi-status ${r(a.status||"waiting")}">${r(Kn(a.status||"waiting",a.value))}</strong>
            <small>${r(`${a.detail||""} â€¢ hedef ${a.target||"-"} â€¢ Ã¶rneklem ${a.sampleSize??0}`)}</small>
          </div>
        </div>
      `).join("")}
    </div>
  `:'<p class="panel-subtext backtest-empty">Net KPI verisi bu analizde oluÅŸmadÄ±.</p>'}function Un(e){if(!e)return'<p class="panel-subtext backtest-empty">Kadro doÄŸrulama verisi bu analizde bulunmadÄ±.</p>';const a=T(e.consistency||"single_source"),t=R(e.confidence,0),n=t>=75?"strong":t>=60?"limited":"fallback";return`
    <article class="mini-card source-status-card ${$(n)}">
      <div class="mini-top">
        <h4>Kadro doÄŸrulama</h4>
        <span class="pill status-pill ${$(n)}">%${r(String(t))}</span>
      </div>
      <strong>${r(`TutarlÄ±lÄ±k: ${a}`)}</strong>
      <p>${r(e.detail||"Kadro doÄŸrulamasÄ± tamamlandÄ±.")}</p>
      <small class="panel-subtext">${r(`Kaynaklar: ${e.primarySource||"-"} + ${e.secondarySource||"-"}`)}</small>
    </article>
  `}function Yn(e){const a=e?.tone||"medium";return`
    <article class="mini-card scan-copy-card ${$(a)}">
      <div class="mini-top">
        <h4>${r(e?.title||"Model kartÄ±")}</h4>
        <span class="history-chip">${r(e?.impact||"-")}</span>
      </div>
      <p>${r(e?.detail||"AÃ§Ä±klama bulunamadÄ±.")}</p>
    </article>
  `}function qn(e){const a=ie(e.label,e),t=e.fallbackUsed?"Ä°statistik servisi yerine HTML yedek akÄ±ÅŸ kullanÄ±ldÄ±.":a==="Ä°statistik API"?"Birincil istatistik akÄ±ÅŸÄ±yla son maÃ§ ve H2H verisi alÄ±ndÄ±.":a==="HTML Ã§Ã¶zÃ¼mleme"?"MaÃ§ verisi sayfa HTML iÃ§eriÄŸinden doÄŸrudan okundu.":c(e.detail);return`
    <article class="mini-card source-status-card ${$(e.health)}">
      <div class="mini-top">
        <h4>Kaynak dayanÄ±klÄ±lÄ±ÄŸÄ±</h4>
        <span class="pill status-pill ${$(e.health)}">${r(a)}</span>
      </div>
      <strong>${r(e.fallbackUsed?"Yedek akÄ±ÅŸ aktif":"Birincil akÄ±ÅŸ aktif")}</strong>
      <p>${r(t)}</p>
    </article>
  `}function R(e,a=0){const t=Number(e);return Number.isFinite(t)?Math.max(0,Math.min(99,Math.round(t))):a}function jn(e,a="MaÃ§ detay motoru ana verileri birlikte okudu."){const t=Ue(e),n=e.sharpMode?"Keskin mod aÃ§Ä±k.":"Standart mod aÃ§Ä±k.",i=t.marketLabel?"Bu maÃ§ta Ã¶ne Ã§Ä±kan yÃ¶n "+A(t.marketLabel)+".":"";return c(n+" Form, saha dengesi, puan tablosu ve gol ritmi birlikte deÄŸerlendirildi. "+i+" Genel gÃ¼ven %"+R(e.confidenceScore)+".",a)}function Vn(e,a=null){const t=c(e?.label,"Detay kartÄ±"),n=T(t).toLocaleLowerCase("tr-TR"),i=a?Vt(a):{formLine:""},s=a?Ja(a):{shortLine:"",reasonLine:""},l=a?.probabilities??{},o=a?.markets??{},u=R(o.over25,50),p=jt(o.projectedGoals,2.6),k=R(l.homeWin,0),d=R(l.draw,0),f=R(l.awayWin,0),v=Array.isArray(a?.h2hMatches)?a.h2hMatches.length:0;let b=c(e?.summary,"Detay bulunamadÄ±.");if(n.includes("form"))b=i.formLine?i.formLine.replace(/^Son maÃ§ formu:\s*/u,""):"Son maÃ§ formu bu tarafÄ± destekliyor.";else if(n.includes("iÃ§ dÄ±ÅŸ")||n.includes("ic dis")||n.includes("saha deng"))b="Ä°Ã§ saha ve deplasman verisi maÃ§Ä±n hangi tarafa kayabileceÄŸini gÃ¶steriyor.";else if(n.includes("puan"))b=s.reasonLine||s.shortLine||"Puan tablosu taraf seÃ§imini destekliyor.";else if(n.includes("gol ritmi")||n.includes("gol profili"))b=`Beklenen gol ${p.toFixed(2)} seviyesinde. 2.5 Ãœst tarafÄ± %${u} ile Ã¶nde.`;else if(n.includes("h2h"))b=v?`Ä°ki takÄ±m arasÄ±nda ${v} maÃ§lÄ±k geÃ§miÅŸ var; bu veri sadece destek sinyali veriyor.`:"Ä°ki takÄ±m geÃ§miÅŸi sÄ±nÄ±rlÄ±; bu baÅŸlÄ±k tek baÅŸÄ±na karar Ã¼retmez.";else if(n.includes("taraf ayr")){const S=Math.max(k,f)-Math.min(k,f);b=`1 %${k} â€¢ X %${d} â€¢ 2 %${f}. Taraf farkÄ± ${S>=20?"net":"temkinli"} gÃ¶rÃ¼nÃ¼yor.`}else n.includes("kaynak")?b=a?.sourceStatus?.fallbackUsed?"Yedek veri akÄ±ÅŸÄ± kullanÄ±ldÄ±; bu yÃ¼zden yorum daha dikkatli okunmalÄ±.":"Birincil veri akÄ±ÅŸÄ± aktif; veri kalitesi yeterli gÃ¶rÃ¼nÃ¼yor.":(n.includes("gÃ¼ven")||n.includes("gÃ¼ven"))&&(b=`Model gÃ¼veni %${R(a?.confidenceScore,0)}. Kaynak ve teyit katmanÄ± birlikte okundu.`);return{label:t,score:R(e?.score,0),summary:O(b,110)}}function Wn(e){return`
    <article class="mini-card confidence-card">
      <div class="mini-top">
        <h4>${r(e.label)}</h4>
        <span class="prob-chip">${R(e.score)}</span>
      </div>
      <p>${r(O(e.detail,130))}</p>
    </article>
  `}function Xn(e){return`
    <article class="mini-card ai-mini-card">
      <h4>${r(e.title)}</h4>
      <p>${r(e.detail)}</p>
    </article>
  `}function Jn(e){return`
    <article class="mini-card recommendation-card ${hi(e)}">
      <div class="mini-top">
        <h4>${r(e.market)}</h4>
        <span class="pill ${$(e.riskClass)}">${r(e.riskLabel)}</span>
      </div>
      <strong>${e.probability}%</strong>
      <p>${r(li(e))}</p>
    </article>
  `}function Qn(e,a=!1){return e.length?`
    <section class="scan-section">
      <div class="scan-section-head">
        <div>
          <h3>Kupon modu</h3>
          <p>Tarama havuzundan otomatik oluÅŸturulan gÃ¼venli, dengeli ve deÄŸer odaklÄ± kupon paketleri.</p>
        </div>
        <span class="source-pill strong">Kupon ${e.length}</span>
      </div>
      <div class="coupon-grid">
        ${e.map((t,n)=>Zn(t,n,a)).join("")}
      </div>
    </section>
  `:""}function Zn(e,a,t=!1){return`
    <article class="block-card coupon-card">
      <div class="mini-top">
        <div>
          <h4>${r(e.title)}</h4>
          <p class="section-copy">${r(e.strategy)}</p>
        </div>
        <span class="source-pill strong">${r(e.riskLabel)} â€¢ %${e.combinedConfidence}</span>
      </div>
      <p class="section-copy">${r(e.autoTrackHint||(t?"Tarama sonrasÄ± bu paket otomatik takibe alÄ±nÄ±r.":"Bu paket tek tÄ±kla takibe alÄ±nabilir."))}</p>
      <button class="ghost-btn coupon-track-btn" type="button" data-action="track-coupon" data-coupon-index="${a}">Kuponu Takibe Al</button>
      <div class="coupon-legs">
        ${(e.legs??[]).map(n=>`
          <div class="coupon-leg">
            <strong>${r(n.matchLabel)}</strong>
            <span>${r(n.market)} â€¢ %${n.probability}</span>
            <p>${r(O(ei(n),120))}</p>
          </div>
        `).join("")}
      </div>
    </article>
  `}function ei(e){const a=c(e?.market||"","Ã¶neri"),t=c(e?.summary||"","");if(!t)return`${a} tarafÄ± bu kupon iÃ§in daha gÃ¼venli bulundu.`;const n=a.toLocaleLowerCase("tr-TR");return n==="1x"||n==="x2"?`${a} tarafÄ±, doÄŸrudan sonuca gÃ¶re daha gÃ¼venli bulundu.`:n.includes("Ãœst")?`${a} seÃ§imi, maÃ§Ä±n gollÃ¼ geÃ§me ihtimali daha yÃ¼ksek gÃ¶rÃ¼ldÃ¼ÄŸÃ¼ iÃ§in Ã¶ne Ã§Ä±ktÄ±.`:n.includes("alt")?`${a} seÃ§imi, maÃ§ temposunun daha kontrollÃ¼ kalma ihtimali nedeniyle Ã¶ne Ã§Ä±ktÄ±.`:n.includes("kg var")?"Ä°ki takÄ±mÄ±n da skor bulma ihtimali yÃ¼ksek gÃ¶rÃ¼ndÃ¼.":n.includes("kg yok")?"Taraflardan birinin skor Ã¼retememe ihtimali daha yÃ¼ksek gÃ¶rÃ¼ndÃ¼.":t}function ai(e){return`
    <article class="block-card strategy-card odds-movement-card ${$(e.direction||"neutral")}">
      <div class="mini-top">
        <div>
          <h4>${r(e.label||"Oran akÄ±ÅŸÄ±")}</h4>
          <p class="section-copy">${r(e.source||"")}</p>
        </div>
        <span class="source-pill strong">%${e.score}</span>
      </div>
      <p>${r(e.detail)}</p>
    </article>
  `}function ti(e,a=null){const t=Vn(e,a);return`
    <article class="mini-card detail-module-card ${$(e.tone||"neutral")}">
      <div class="mini-top">
        <h4>${r(t.label)}</h4>
        <span class="prob-chip">${t.score}</span>
      </div>
      <p>${r(t.summary)}</p>
    </article>
  `}function ni(e){const a=e.allow?"strong":"fallback",t=e.allow?e.title||"Filtre onayÄ±":e.title||"Sert filtre aktif";return`
    <article class="block-card strategy-card ${e.allow?"filter-pass":"filter-block"}">
      <div class="mini-top">
        <h4>${r(t)}</h4>
        <span class="source-pill ${a}">${r(e.allow?"AÃ§Ä±k":"Bloklu")}</span>
      </div>
      <p>${r(e.reason)}</p>
    </article>
  `}function ii(e){return`
    <article class="block-card strategy-card league-profile-card">
      <div class="mini-top">
        <h4>${r(e.title||"Lig profili")}</h4>
        <span class="source-pill limited">${r(e.style||"Dengeli oyun")}</span>
      </div>
      <p>${r(e.summary)}</p>
      <div class="strategy-subline">
        <span>${r(`Bias: ${e.biasMarket||"-"}`)}</span>
        <span>${r(e.caution||"")}</span>
      </div>
    </article>
  `}function si(e){return`
    <article class="mini-card market-insight-card market-specialist-card ${$(e.tone||"neutral")}">
      <div class="market-specialist-head">
        <div>
          <h4>${r(e.slot)}</h4>
          <div class="market-specialist-market">${r(e.market)}</div>
        </div>
        <strong class="market-specialist-prob">%${e.probability}</strong>
      </div>
      <p>${r(O(e.summary,120))}</p>
    </article>
  `}function li(e){const a=T(e.market||""),t=Number(e.probability)||0;return a==="Uzak Dur"?`Bu eÅŸleÅŸmede fiyat kovalamak yerine disiplinli ÅŸekilde pas geÃ§mek daha doÄŸru. GÃ¼ven %${t}.`:a==="1X"||a==="X2"?`Taraf pazarÄ± tam kopmadÄ±ÄŸÄ± iÃ§in korumalÄ± Ã§izgi tercih edildi. GÃ¼ven %${t}.`:a.includes("Ãœst")||a.includes("Ãœst")?`Gol ritmi aÃ§Ä±k oyunu destekliyor. Ana gol pazarÄ± %${t} bandÄ±nda.`:a.includes("Alt")?`Tempo kontrollÃ¼ kaldÄ±ÄŸÄ± iÃ§in alt senaryosu Ã¶ne Ã§Ä±kÄ±yor. GÃ¼ven %${t}.`:a.includes("KG")?`Ä°ki takÄ±mÄ±n skor Ã¼retim eÅŸiÄŸine gÃ¶re KG pazarÄ± %${t} bandÄ±nda deÄŸerlendirildi.`:`Ana Ã¶neri ${a}. Model bu pazarÄ± %${t} bandÄ±nda tutuyor.`}function Sa(e,a,t,n="neutral"){return`
    <article class="fact-card ${n}">
      <h4>${$(e)}</h4>
      <strong>${r(a)}</strong>
      <p>${r(t)}</p>
    </article>
  `}function ri(e,a,t){return`
    <article class="fact-card">
      <h4>${$(e)}</h4>
      <strong>${r(a)}</strong>
      <p>${r(t)}</p>
    </article>
  `}function oi(e){return`
    <table class="list-table compact-list-table recent-table">
      <thead>
        <tr>
          <th>TakÄ±m</th>
          <th>Form</th>
          <th>Gol / momentum</th>
        </tr>
      </thead>
      <tbody>
        ${e.map(a=>ci(a)).join("")}
      </tbody>
    </table>
  `}function ci(e){const a=Gt(e);return`
    <tr>
      <td>
        <div class="table-cell-title">${r(a.team)}</div>
      </td>
      <td>
        <div class="table-cell-title">${r(a.formLine)}</div>
        <div class="table-cell-sub">${r(a.pointsLine)}</div>
      </td>
      <td>
        <div class="table-cell-title">${r(a.goalLine)}</div>
        <div class="table-cell-sub">${r(a.momentumLine)}</div>
      </td>
    </tr>
  `}function ui(e){return!e.length||e.length===1&&c(e[0]?.score,"-")==="Veri yok"?'<div class="scan-empty">Bu eÅŸleÅŸme iÃ§in H2H verisi bulunamadÄ±.</div>':`
    <table class="list-table compact-list-table h2h-table">
      <thead>
        <tr>
          <th>Tarih</th>
          <th>Skor</th>
          <th>SonuÃ§</th>
        </tr>
      </thead>
      <tbody>
        ${e.map(a=>di(a)).join("")}
      </tbody>
    </table>
  `}function di(e){const a=fi(e);return`
    <tr>
      <td>
        <div class="table-cell-title">${r(a.date)}</div>
      </td>
      <td>
        <div class="table-cell-title">${r(a.scoreLine)}</div>
        <div class="table-cell-sub">${r(a.fixtureLine)}</div>
      </td>
      <td>
        <div class="table-cell-title">${r(a.outcome)}</div>
      </td>
    </tr>
  `}function mi(e){return e.length?`
    <table class="list-table standings-table">
      <thead>
        <tr>
          <th>#</th>
          <th>TakÄ±m</th>
          <th>O</th>
          <th>P</th>
        </tr>
      </thead>
      <tbody>
        ${e.map(a=>pi(a)).join("")}
      </tbody>
    </table>
  `:'<div class="scan-empty">Okunabilir puan tablosu verisi Ã§Ä±kmadÄ±.</div>'}function pi(e){return`
    <tr class="${e.highlight?"standings-highlight":""}">
      <td><div class="table-cell-title">${r(e.position)}</div></td>
      <td>
        <div class="table-cell-title">${r(e.team)}</div>
        <div class="table-cell-sub">${r(`${e.won}G ${e.draw}B ${e.lost}M â€¢ Av ${e.goalDiff>=0?`+${e.goalDiff}`:e.goalDiff} â€¢ Form ${e.form}`)}</div>
      </td>
      <td><div class="table-cell-title">${r(e.played)}</div></td>
      <td><div class="table-cell-title">${r(e.points)}</div></td>
    </tr>
  `}function dt(e){return(c(e,"").match(/-?\d+(?:[.,]\d+)?/g)??[]).map(a=>Number.parseFloat(a.replace(",",".")))}function Gt(e){const a=c(e.team,"TakÄ±m"),t=dt(e.form),n=dt(e.goalAverage),i=Number.isFinite(t[0])?Math.round(t[0]):0,s=Number.isFinite(t[1])?Math.round(t[1]):0,l=Number.isFinite(t[2])?Math.round(t[2]):0,o=Number.isFinite(t.at(-1))?t.at(-1):null,u=Number.isFinite(n[0])?n[0]:null,p=Number.isFinite(n[1])?n[1]:null,k=Number.isFinite(n.at(-1))?Math.round(n.at(-1)):null;return{team:a,formLine:`${i}G ${s}B ${l}M`,pointsLine:o!==null?`${o.toFixed(2)} puan`:c(e.form,"-"),goalLine:u!==null&&p!==null?`${u.toFixed(2)} atÄ±yor â€¢ ${p.toFixed(2)} yiyor`:c(e.goalAverage,"-"),momentumLine:k!==null?`Momentum ${k}`:"Momentum verisi yok"}}function fi(e){const a=c(e.date,"-"),t=c(e.score,"-"),n=c(e.outcome,"-"),i=Qa(n)||n==="-"?"SonuÃ§ bilgisi sÄ±nÄ±rlÄ±.":n,s=t==="Veri yok"||/h2h/i.test(n)||/bulunamad/i.test(n),l=t.match(/(.+?)\s+(\d+)\s*[-:]\s*(\d+)\s+(.+)/);if(s)return{date:"-",scoreLine:"Veri yok",fixtureLine:"-",outcome:"Bu eÅŸleÅŸme iÃ§in H2H verisi bulunamadÄ±."};if(!l)return{date:a,scoreLine:t,fixtureLine:"-",outcome:i};const o=c(l[1],"Ev sahibi"),u=Number.parseInt(l[2],10),p=Number.parseInt(l[3],10),k=c(l[4],"Deplasman");let d="Beraberlik";return u>p?d=`${o} kazandÄ±`:p>u&&(d=`${k} kazandÄ±`),{date:a,scoreLine:`${u}-${p}`,fixtureLine:`${o} â€¢ ${k}`,outcome:d}}function ki(e,a){const t=Number.parseFloat(String(a).replace(",","."));return 100-e>=58||!Number.isNaN(t)&&t<=2.45?"2.5 alt tarafÄ± daha dengeli. MaÃ§Ä±n kontrollÃ¼ akma ihtimali canlÄ±.":100-e>=50?"2.5 alt senaryosu masada. Ã–zellikle ilk bÃ¶lÃ¼m yavaÅŸ geÃ§erse deÄŸer kazanÄ±r.":"2.5 alt tarafÄ± ikinci planda kalÄ±yor; erken gol Ã¼st ihtimalini bÃ¼yÃ¼tÃ¼r."}function hi(e){const a=c(e.market,"");return a.includes("2.5 Ãœst")&&e.probability>=58?"emerald-signal":a.includes("2.5 Alt")&&e.probability>=56?"calm-signal":""}function qa(e){const a=Et(Array.isArray(e)?e:[]);if(!a?.calibrationReady||!a.resolvedCount)return null;const t=(a.markets||[]).filter(i=>i.sampleSize>=Ta).map(i=>({marketGroup:i.key,sampleSize:i.sampleSize,hitRate:i.hitRate})),n=(a.leagues||[]).filter(i=>i.sampleSize>=La).map(i=>{const s=(i.marketStats||[]).filter(l=>l.sampleSize>=Ta).map(l=>({marketGroup:l.key,sampleSize:l.sampleSize,hitRate:l.hitRate}));return{league:ja(i.league),sampleSize:i.sampleSize,topHitRate:i.hitRate,marketProfiles:s.length?s:null}});return!t.length&&!n.length?null:{sampleSize:a.resolvedCount,overallTopHitRate:a.topHitRate,marketProfiles:t.length?t:null,leagueProfiles:n.length?n:null}}function Et(e){const a=[...e].filter(m=>m?.result&&m?.topRecommendation?.market).sort((m,h)=>new Date(h.result?.savedAt||h.analyzedAt||0)-new Date(m.result?.savedAt||m.analyzedAt||0)).slice(0,wa),t=new Map,n=new Map,i=new Map,s=new Map,l=new Map,o=new Map,u=new Map;let p=0,k=0,d=0,f=0,v=0;for(const m of a){const h=ke(m.topRecommendation?.market,m.result,m);if(!h)continue;const w=xt(m),W=w==="live"?"CanlÄ±":"Prematch",H=gi(m.matchTime),P=wi(H);if(p+=1,v+=Number(m.confidenceScore)||0,h.hit)k+=1;else{const X=Li(m,h);vi(l,X.key,X.label,m.confidenceScore)}const E=ke(m.playedMarket,m.result,m);E&&(d+=1,E.hit&&(f+=1));const L=Rt(m.topRecommendation?.market),_=Ti(L);if(ge(t,L,_,h.hit,m.confidenceScore),ge(i,w,W,h.hit,m.confidenceScore),ge(s,H,P,h.hit,m.confidenceScore),w==="live"){const X=$i(m.capturedScore||m.liveScore,m.capturedMinuteLabel||m.liveStatusLabel||"",m.halftimeScore||"");X.key&&(ge(o,X.key,X.label,h.hit,m.confidenceScore),ge(u,`${X.key}::${L}`,`${X.label} â€¢ ${_}`,h.hit,m.confidenceScore))}const I=ja(m.league);n.has(I)||n.set(I,{key:I,league:I,sampleSize:0,hits:0,playedSampleSize:0,playedHits:0,confidenceTotal:0,marketBuckets:new Map});const ee=n.get(I);ee.sampleSize+=1,ee.confidenceTotal+=Number(m.confidenceScore)||0,h.hit&&(ee.hits+=1),E&&(ee.playedSampleSize+=1,E.hit&&(ee.playedHits+=1)),ge(ee.marketBuckets,L,_,h.hit,m.confidenceScore)}const b=ye(t),S=[...n.values()].map(m=>({league:m.league,sampleSize:m.sampleSize,hits:m.hits,hitRate:ae(m.hits,m.sampleSize),playedSampleSize:m.playedSampleSize,playedHits:m.playedHits,playedHitRate:ae(m.playedHits,m.playedSampleSize),avgConfidence:m.sampleSize?Math.round(m.confidenceTotal/m.sampleSize):0,marketStats:ye(m.marketBuckets)})).sort((m,h)=>h.hitRate!==m.hitRate?h.hitRate-m.hitRate:h.sampleSize-m.sampleSize);return{resolvedCount:p,topHits:k,topHitRate:ae(k,p),playedResolvedCount:d,playedHits:f,playedHitRate:ae(f,d),avgConfidence:p?Math.round(v/p):0,calibrationReady:p>=Ea,markets:b,leagues:S,modeStats:ye(i),hourBands:ye(s),liveScenarios:ye(o),liveScenarioMarkets:ye(u),missReasons:bi(l)}}function ge(e,a,t,n,i){e.has(a)||e.set(a,{key:a,label:t,sampleSize:0,hits:0,confidenceTotal:0});const s=e.get(a);s.sampleSize+=1,s.confidenceTotal+=Number(i)||0,n&&(s.hits+=1)}function vi(e,a,t,n=0){e.has(a)||e.set(a,{key:a,label:t,sampleSize:0,hits:0,confidenceTotal:0});const i=e.get(a);i.sampleSize+=1,i.confidenceTotal+=Number(n)||0}function ye(e){return[...e.values()].map(a=>({key:a.key,label:a.label,sampleSize:a.sampleSize,hits:a.hits,hitRate:ae(a.hits,a.sampleSize),avgConfidence:a.sampleSize?Math.round(a.confidenceTotal/a.sampleSize):0})).sort((a,t)=>t.hitRate!==a.hitRate?t.hitRate-a.hitRate:t.sampleSize-a.sampleSize)}function bi(e){return[...e.values()].map(a=>({key:a.key,label:a.label,sampleSize:a.sampleSize,avgConfidence:a.sampleSize?Math.round(a.confidenceTotal/a.sampleSize):0})).sort((a,t)=>t.sampleSize-a.sampleSize)}function xt(e){const a=T(`${e?.analysisMode||""} ${e?.trackingSource||""} ${e?.sourceStatus?.label||""} ${e?.sourceStatus?.mode||""} ${e?.sourceLabel||""}`).toLowerCase();return a.includes("canlÄ±")||a.includes("canlÄ±")?"live":"prematch"}function gi(e=""){return Oi(e||"")}function yi(e=0,a=0,t=0,n=!1){return e<15?a===0?"fh_early_cagey":"fh_early_open":e<45?a===0?"fh_cagey":a===1?"fh_single_goal":a===2?"fh_two_goal":"fh_open_trade":n?e<60?a>=4?"sh_open_trade":t>=2?"sh_one_side":"sh_balanced":e<78?a>=4&&t<=1?"late_goal_trade":t>=2?"late_lead_control":a<=2?"late_tight":"late_balanced":t>=2?"closing_lead":"closing_total":a>=3?"live_total_focus":"live_result_focus"}function Si(e){switch(e){case"fh_early_cagey":return"Erken ilk yarÄ± - kapalÄ± akÄ±ÅŸ";case"fh_early_open":return"Erken ilk yarÄ± - aÃ§Ä±k giriÅŸ";case"fh_cagey":return"Ä°lk yarÄ± - dÃ¼ÅŸÃ¼k tempo";case"fh_single_goal":return"Ä°lk yarÄ± - tek gollÃ¼ denge";case"fh_two_goal":return"Ä°lk yarÄ± - iki gollÃ¼ Ã§izgi";case"fh_open_trade":return"Ä°lk yarÄ± - aÃ§Ä±k gol trafiÄŸi";case"sh_one_side":return"Ä°kinci yarÄ± - tek taraflÄ± baskÄ±";case"sh_balanced":return"Ä°kinci yarÄ± - dengeli tempo";case"sh_open_trade":return"Ä°kinci yarÄ± - aÃ§Ä±k gol trafiÄŸi";case"late_goal_trade":return"Son bÃ¶lÃ¼m - gol trafiÄŸi";case"late_lead_control":return"Son bÃ¶lÃ¼m - skor koruma";case"late_tight":return"Son bÃ¶lÃ¼m - dÃ¼ÅŸÃ¼k tempo";case"late_balanced":return"Son bÃ¶lÃ¼m - dengeli akÄ±ÅŸ";case"closing_lead":return"KapanÄ±ÅŸ - tek taraflÄ± skor";case"closing_total":return"KapanÄ±ÅŸ - toplam Ã§izgisi";case"live_total_focus":return"CanlÄ± - toplam Ã§izgisi";case"live_result_focus":return"CanlÄ± - sonuÃ§ Ã§izgisi";default:return"CanlÄ± senaryo"}}function $i(e,a,t=""){const n=D(a||""),i=typeof e=="string"?e:Number.isInteger(e?.homeGoals)&&Number.isInteger(e?.awayGoals)?`${e.homeGoals}-${e.awayGoals}`:"",s=ze(i),l=c(t||"",""),o=/(\d+)\s*[-:]\s*(\d+)/.test(l),u=yi(n,s.totalGoals,Math.abs(s.homeGoals-s.awayGoals),o);return{key:u,label:Si(u),minute:n,totalGoals:s.totalGoals,goalDiff:Math.abs(s.homeGoals-s.awayGoals),hasHalftimeScore:o}}function wi(e){switch(e){case"morning":return"Sabah-Ã¶ÄŸle";case"afternoon":return"Ã–ÄŸleden sonra";case"prime":return"AkÅŸam prime";case"late":return"GeÃ§ saat";default:return"Saat belirsiz"}}function Li(e,a){const t=A(e?.topRecommendation?.market||""),n=e?.result||{},i=(Number(n.homeGoals)||0)+(Number(n.awayGoals)||0),s=xt(e)==="live",l=Rt(t),o=Number(e?.confidenceScore)||0;return e?.sourceStatus?.fallbackUsed||/not found|eÅŸleÅŸmedi|doÄŸrulanamadÄ±|dogrulanamadi/i.test(String(e?.liveNote||""))?{key:"source_drift",label:"CanlÄ± veri sapmasÄ±"}:l==="totals_over"&&!a.hit?i<=1?{key:"tempo_drop",label:"Tempo dÃ¼ÅŸtÃ¼"}:{key:"line_high",label:"Ã‡izgi fazla yukarÄ±daydÄ±"}:l==="totals_under"&&!a.hit?i>=4?{key:"early_goal",label:"Erken gol maÃ§Ä± aÃ§tÄ±"}:{key:"late_break",label:"GeÃ§ kÄ±rÄ±lma geldi"}:(l==="hard_side"||l==="double_chance"||l==="draw")&&!a.hit?o>=72?{key:"wrong_side",label:"YanlÄ±ÅŸ market seÃ§imi"}:{key:"weak_edge",label:"Taraf ayrÄ±ÅŸmasÄ± zayÄ±ftÄ±"}:(l==="btts_yes"||l==="btts_no")&&!a.hit?{key:"goal_profile",label:"Gol profili ters aktÄ±"}:s?{key:"live_shift",label:"CanlÄ± akÄ±ÅŸ yÃ¶n deÄŸiÅŸtirdi"}:{key:"other",label:"DiÄŸer"}}function ae(e,a){return a?Math.round(e/a*100):0}function Rt(e){const a=T(String(e||""));return a.startsWith("1X")||a.startsWith("X2")?"double_chance":a.startsWith("1 (")||a.startsWith("2 (")||a==="1"||a==="2"?"hard_side":a==="Beraberlik"?"draw":a.includes("Ãœst")||a.includes("Ãœst")?"totals_over":a.includes("Alt")?"totals_under":a==="KG Var"?"btts_yes":a==="KG Yok"?"btts_no":a==="Uzak Dur"?"avoid":"other"}function Ti(e){switch(e){case"hard_side":return"Direkt taraf";case"double_chance":return"Ã‡ifte ÅŸans";case"draw":return"Beraberlik";case"totals_over":return"Ãœst pazarlarÄ±";case"totals_under":return"Alt pazarlarÄ±";case"btts_yes":return"KG Var";case"btts_no":return"KG Yok";case"avoid":return"Uzak Dur";default:return"DiÄŸer"}}function ja(e){return c(e,"Bilinmeyen lig")||"Bilinmeyen lig"}function Ci(e,a=null){const t=Array.isArray(a)?a:j(),n=e?.analysisId||qt(e?.matchInfo||{});return t.find(i=>i.id===n)??null}function Ft(e,a=new Date().toISOString()){return e?{sampledAt:a,score:Number(e.score)||0,direction:c(e.direction,"stabil"),source:c(e.source,"iddaa sportsbook"),marketDepth:Number(e.marketDepth)||0,oddsChannels:Number(e.oddsChannels)||0,liveOdds:!!e.liveOdds}:null}function Mi(e=[],a=null){const t=Array.isArray(e)?e.filter(Boolean):[];if(!a)return t.slice(-8);const n=t.at(-1);return n&&n.marketDepth===a.marketDepth&&n.oddsChannels===a.oddsChannels&&!!n.liveOdds==!!a.liveOdds&&c(n.direction,"")===c(a.direction,"")?t.slice(-8):[...t,a].slice(-8)}function Ai(e,a=[]){if(!e)return null;const t=Ft(e),n=Array.isArray(a)?a.filter(Boolean):[],i=n.at(-1)??null,s={...e};if(!i||!t)return{...s,detail:c(s.detail),source:c(s.source)};const l=t.marketDepth-(Number(i.marketDepth)||0),o=t.oddsChannels-(Number(i.oddsChannels)||0),u=!!t.liveOdds!=!!i.liveOdds,p=l>=1||o>=2||u&&t.liveOdds,k=l<=-1||o<=-2||u&&!t.liveOdds;let d=c(s.direction,"stabil");p?d=t.liveOdds?"sert":"yukari":k&&(d="daralan");const f=[];l!==0&&f.push(`market derinligi ${i.marketDepth} -> ${t.marketDepth}`),o!==0&&f.push(`oran kanali ${i.oddsChannels} -> ${t.oddsChannels}`),u&&f.push(t.liveOdds?"canlÄ± oran akÄ±ÅŸÄ± aÃ§Ä±ldÄ±":"canlÄ± oran akÄ±ÅŸÄ± kapandÄ±");const v=p?5:k?-4:0,b=Math.max(34,Math.min(95,(Number(s.score)||0)+v)),S=f.length?`Snapshot farki: ${f.join(", ")}.`:"Son snapshot ile ayni pazar derinligi korunuyor.";return{...s,score:b,direction:d,detail:c(`${s.detail} ${S}`),source:c(`${s.source} â€¢ ${n.length+1} snapshot`)}}function zi(e,a=[]){if(!e.resolvedCount)return`
      <article class="history-card backtest-card compact-backtest-card">
        <div class="mini-top">
          <div>
            <h4>Backtest Ã¶zeti</h4>
            <p class="history-meta">HenÃ¼z sonuÃ§ girilmiÅŸ kayÄ±t yok. Final skor geldikÃ§e lig, market ve canlÄ±/prematch performansÄ± burada Ã¶lÃ§Ã¼lecek.</p>
          </div>
          <span class="pill calm">Beklemede</span>
        </div>
      </article>
    `;const t=e.markets.filter(m=>m.sampleSize>=Ta).slice(0,3),n=e.leagues.filter(m=>m.sampleSize>=La).slice(0,3),i=e.leagues.filter(m=>m.sampleSize>=La&&m.hitRate<=50).slice(0,3),s=e.calibrationReady?"Kalibrasyon aktif":"Veri birikiyor",l=e.calibrationReady?"safe":"medium",o=e.resolvedCount>=wa?`Son ${wa} sonuÃ§ kullanÄ±ldÄ±`:"Mevcut tÃ¼m sonuÃ§lar kullanÄ±ldÄ±",u=e.calibrationReady?"Lig, market, saat bandÄ± ve canlÄ±/prematch ayrÄ±mÄ± artÄ±k skora etkili ÅŸekilde kalibre ediliyor.":`Kalibrasyon iÃ§in en az ${Ea} sonuÃ§ gerekiyor.`,p=e.playedResolvedCount?`${e.playedHits}/${e.playedResolvedCount} kupon marketi tuttu`:"HenÃ¼z kaydedilmiÅŸ kupon marketi yok",k=Ki(),d=Bi(a),f=Ei(a),v=xi(a),b=_t(e,k,d),S=Ii(e,k,d,b);return`
    <article class="history-card backtest-card compact-backtest-card">
      <div class="mini-top">
        <div>
          <h4>Backtest Ã¶zeti</h4>
          <p class="history-meta">SonuÃ§ girilmiÅŸ ${e.resolvedCount} kayÄ±t Ã¶lÃ§Ã¼ldÃ¼. Ana Ã¶neri, kupon tercihi ve canlÄ±/prematch ayrÄ±mÄ± birlikte izleniyor.</p>
        </div>
        <span class="pill ${l}">${s}</span>
      </div>

      <div class="history-tags backtest-roadmap">
        ${S.map(m=>`<span class="history-chip ${m.done?"hit":""}">${r(m.label)}: ${r(m.status)}</span>`).join("")}
      </div>

      <div class="backtest-stat-grid compact-backtest-stats backtest-stat-grid-4">
        ${Ve("Ã–rneklem",e.resolvedCount,o)}
        ${Ve("Ana isabet",`%${e.topHitRate}`,`${e.topHits}/${e.resolvedCount} ana Ã–neri tuttu`)}
        ${Ve("Kupon isabeti",e.playedResolvedCount?`%${e.playedHitRate}`:"-",p)}
        ${Ve("Ortalama gÃ¼ven",`%${e.avgConfidence}`,"Kaydedilen analiz gÃ¼ven ortalamasÄ±")}
      </div>

      <div class="backtest-inline-grid">
        <div class="mini-card backtest-inline-card">
          <strong>Net KPI panosu</strong>
          <p>${r(b.summary)}</p>
          ${Gi(b.items)}
        </div>
        <div class="mini-card backtest-inline-card">
          <strong>Kalibrasyon omurgasÄ±</strong>
          <p>${r(u)}</p>
        </div>
        <div class="mini-card backtest-inline-card">
          <strong>GÃ¼Ã§lÃ¼ marketler</strong>
          ${We(t,"HenÃ¼z yeterli market Ã¶rneklemi yok.")}
        </div>
        <div class="mini-card backtest-inline-card">
          <strong>GÃ¼Ã§lÃ¼ ligler</strong>
          ${We(n.map(m=>({...m,label:m.league})),"HenÃ¼z yeterli lig Ã¶rneklemi yok.")}
        </div>
      </div>

      <div class="backtest-inline-grid">
        <div class="mini-card backtest-inline-card">
          <strong>CanlÄ± / prematch</strong>
          ${We(e.modeStats,"CanlÄ± ve prematch ayrÄ±mÄ± iÃ§in veri yok.")}
        </div>
        <div class="mini-card backtest-inline-card">
          <strong>Saat aralÄ±klarÄ±</strong>
          ${We(e.hourBands,"Saat bandÄ± verisi oluÅŸmadÄ±.")}
        </div>
        <div class="mini-card backtest-inline-card">
          <strong>Neden kaÃ§tÄ±?</strong>
          ${Ni(e.missReasons,"Belirgin kaÃ§Ä±ÅŸ nedeni oluÅŸmadÄ±.")}
        </div>
      </div>

      <div class="backtest-inline-grid">
        <div class="mini-card backtest-inline-card">
          <strong>CanlÄ± doÄŸruluk turu</strong>
          <p>${r(`Son ${k.sample} sorguda baÅŸarÄ± %${k.successRate}, bulunamayan veri %${k.notFoundRate}.`)}</p>
          <small class="panel-subtext">${r(k.topReasons.length?k.topReasons.map(m=>`${m.label} (${m.count})`).join(" â€¢ "):"Belirgin hata nedeni yok.")}</small>
        </div>
        <div class="mini-card backtest-inline-card">
          <strong>Sabit test seti</strong>
          <p>${r(`Set: ${d.size}/${Le} â€¢ Ã§Ã¶zÃ¼len ${d.resolved} â€¢ isabet %${d.hitRate}`)}</p>
          <small class="panel-subtext">${r(d.pending?`${d.pending} maÃ§ sonucu bekleniyor.`:"Set dolu ve aktif.")}</small>
        </div>
        <div class="mini-card backtest-inline-card">
          <strong>Lig kalite skoru</strong>
          <p>${r(i.length?`DÃ¼ÅŸÃ¼k kalite uyarÄ±sÄ±: ${i.map(m=>`${m.league} %${m.hitRate}`).join(" â€¢ ")}`:"Otomatik kara listeye girecek lig sinyali oluÅŸmadÄ±.")}</p>
        </div>
      </div>

      <div class="backtest-inline-grid">
        <div class="mini-card backtest-inline-card">
          <strong>Kupon performansÄ±</strong>
          <p>${r(f.summary)}</p>
          <small class="panel-subtext">${r(f.detail)}</small>
        </div>
        <div class="mini-card backtest-inline-card">
          <strong>Oran akÄ±ÅŸÄ± snapshot</strong>
          <p>${r(v.summary)}</p>
          <small class="panel-subtext">${r(v.detail)}</small>
        </div>
        <div class="mini-card backtest-inline-card">
          <strong>CanlÄ± olay akÄ±ÅŸÄ±</strong>
          <p>${r(`Gol bildirimi, devre, maÃ§ sonu ve senaryo kÄ±rÄ±lmasÄ± takibe iÅŸlendi. Aktif olay sayÄ±sÄ± ${v.liveTracked}.`)}</p>
          <small class="panel-subtext">${r("Bir sonraki turda kÄ±rmÄ±zÄ± kart ve ana Ã¶neri bozuldu alarmÄ± ayrÄ± olay tÃ¼rÃ¼ olarak sertleÅŸtirilecek.")}</small>
        </div>
      </div>
    </article>
  `}function Ii(e,a,t,n=null){const i=Ke(),s=Object.keys(i||{}).length,l=a.sample>=8,o=a.sample>=8&&a.successRate>=65,u=t.size>=Math.min(10,Le),p=n||_t(e,a,t),k=p.readyCount>=3,d=k&&p.passRate>=75;return[{label:"1) Kalibrasyon",done:e.calibrationReady,status:e.calibrationReady?"aktif":`beklemede (${e.resolvedCount}/${Ea})`},{label:"2) CanlÄ± doÄŸruluk",done:o,status:l?`%${a.successRate}`:`veri toplanÄ±yor (${a.sample})`},{label:"3) Lig ÅŸablonu",done:s>0,status:s>0?`${s} kayÄ±tlÄ±`:"yok"},{label:"4) Net KPI",done:d,status:k?`${p.passCount}/${p.readyCount} hedefte`:"Ã¶rneklem bekleniyor"},{label:"5) Test seti",done:u,status:`${t.size}/${Le}`}]}function Ve(e,a,t){return`
    <article class="mini-card backtest-stat-card">
      <span>${r(e)}</span>
      <strong>${r(String(a))}</strong>
      <p>${r(t)}</p>
    </article>
  `}function We(e,a){return e.length?`
    <div class="backtest-list">
      ${e.map(t=>`
        <div class="backtest-row">
          <span>${r(t.label)}</span>
          <div>
            <strong>%${t.hitRate}</strong>
            <small>${t.hits}/${t.sampleSize}</small>
          </div>
        </div>
      `).join("")}
    </div>
  `:`<p class="panel-subtext backtest-empty">${r(a)}</p>`}function Ni(e,a){return e.length?`
    <div class="backtest-list">
      ${e.map(t=>`
        <div class="backtest-row">
          <span>${r(t.label)}</span>
          <div>
            <strong>${t.sampleSize}</strong>
            <small>kaÃ§Ä±ÅŸ</small>
          </div>
        </div>
      `).join("")}
    </div>
  `:`<p class="panel-subtext backtest-empty">${r(a)}</p>`}function Ge(e,a,t,n=null,i=null){const s=mn[e];if(!s)return null;const l=Number(a)||0,o=Number(t)||0,u=o<s.minSample,p=u?!1:s.comparator==="max"?l<=s.target:l>=s.target;let k="waiting";u||(k=p?"hit":"risk");const d=s.comparator==="max"?`â‰¤%${s.target}`:`â‰¥%${s.target}`,f=`${o}/${s.minSample}`,v=`%${Math.round(l)}`,b=Number.isInteger(n)&&Number.isInteger(i)?`${n}/${i}`:null;return{key:e,label:s.label,status:k,pass:p,waiting:u,value:Math.round(l),sample:o,minSample:s.minSample,statusText:u?`Beklemede ${v}`:p?`Hedefte ${v}`:`Risk ${v}`,detail:b?`${b} â€¢ hedef ${d} â€¢ Ã¶rneklem ${f}`:`hedef ${d} â€¢ Ã¶rneklem ${f}`}}function _t(e,a,t){const n=[Ge("topHitRate",e.topHitRate,e.resolvedCount,e.topHits,e.resolvedCount),Ge("playedHitRate",e.playedHitRate,e.playedResolvedCount,e.playedHits,e.playedResolvedCount),Ge("liveSuccessRate",a.successRate,a.sample),Ge("liveNotFoundRate",a.notFoundRate,a.sample),Ge("benchmarkHitRate",t.hitRate,t.resolved)].filter(Boolean),i=n.filter(d=>!d.waiting),s=i.filter(d=>d.pass),l=n.length-i.length,o=i.length?Math.round(s.length/i.length*100):0,u=i.length>0&&s.length===i.length,p=u?`Net KPI gÃ¼Ã§lÃ¼: ${s.length}/${i.length} hedefte.`:i.length?`Net KPI dengede: ${s.length}/${i.length} hedefte, ${i.length-s.length} riskte, ${l} beklemede.`:`Net KPI iÃ§in Ã¶rneklem toplanÄ±yor (${l} metrik beklemede).`,k=u?"hit":i.length?"risk":"waiting";return{items:n,summary:p,status:k,readyCount:i.length,passCount:s.length,waitingCount:l,passRate:o}}function Gi(e){return e?.length?`
    <div class="backtest-list">
      ${e.map(a=>`
        <div class="backtest-row">
          <span>${r(a.label)}</span>
          <div>
            <strong class="kpi-status ${r(a.status)}">${r(a.statusText)}</strong>
            <small>${r(a.detail)}</small>
          </div>
        </div>
      `).join("")}
    </div>
  `:'<p class="panel-subtext backtest-empty">KPI verisi henÃ¼z oluÅŸmadÄ±.</p>'}function Ei(e=[]){const a=(e||[]).filter(i=>i?.result&&i?.playedMarket);if(!a.length)return{summary:"HenÃ¼z kupon performans verisi yok.",detail:"Benim oynadÄ±ÄŸÄ±m market kaydedildikÃ§e ayrÄ± isabet raporu Ã¼retilecek."};const t=a.reduce((i,s)=>i+(ke(s.playedMarket,s.result,s)?.hit?1:0),0),n=ae(t,a.length);return{summary:`${a.length} kupon kaydÄ±nda isabet %${n}.`,detail:`${t}/${a.length} kayÄ±t tuttu. Program ana Ã¶nerisi ile senin pazarÄ±n artÄ±k ayrÄ± takip ediliyor.`}}function xi(e=[]){const a=(e||[]).flatMap(s=>(s?.oddsSnapshots||[]).map(l=>({...l,tracked:!!s?.tracked})));if(!a.length)return{summary:"HenÃ¼z oran snapshot geÃ§miÅŸi yok.",detail:"Program analiz Ã¼retirken alÄ±nan oran akÄ±ÅŸÄ± burada snapshot geÃ§miÅŸi olarak birikecek.",liveTracked:0};const t=new Map;let n=0;for(const s of a){const l=c(s.direction,"stabil");t.set(l,(t.get(l)||0)+1),s.tracked&&(n+=1)}const i=[...t.entries()].sort((s,l)=>l[1]-s[1]).slice(0,3).map(([s,l])=>`${s} (${l})`).join(" â€¢ ");return{summary:`${a.length} snapshot kaydÄ± var. BaskÄ±n akÄ±ÅŸ: ${i||"stabil"}.`,detail:"Steam move, fake move ve late drift katmanÄ± bu birikim Ã¼stÃ¼ne sertleÅŸtirilecek.",liveTracked:n}}function Bt(e,a){try{const t=localStorage.getItem(e);return t?JSON.parse(t)??a:a}catch{return a}}function Dt(e,a){try{localStorage.setItem(e,JSON.stringify(a))}catch{}}function Ri(){const e=Bt(g.benchmarkSet,[]);return Array.isArray(e)?e.filter(a=>typeof a=="string"&&a.trim()):[]}function Fi(e){const a=[...new Set((e||[]).filter(t=>typeof t=="string"&&t.trim()))].slice(0,Le);return Dt(g.benchmarkSet,a),a}function _i(e){const a=Ri(),t=(e||[]).filter(i=>i?.result&&i?.topRecommendation?.market).sort((i,s)=>new Date(s.result?.savedAt||s.analyzedAt||0)-new Date(i.result?.savedAt||i.analyzedAt||0)).map(i=>i.id);if(a.length>=Le)return a;const n=[...a];for(const i of t)if(n.includes(i)||n.push(i),n.length>=Le)break;return Fi(n)}function Bi(e){const a=_i(e),t=(e||[]).filter(i=>a.includes(i.id)&&i?.result&&i?.topRecommendation?.market);if(!t.length)return{size:a.length,resolved:0,hitRate:0,hitCount:0,pending:Math.max(0,a.length)};let n=0;for(const i of t)ke(i.topRecommendation?.market,i.result)?.hit&&(n+=1);return{size:a.length,resolved:t.length,hitRate:ae(n,t.length),hitCount:n,pending:Math.max(0,a.length-t.length)}}function Ht(){const e=Bt(g.liveDiagnostics,[]);return Array.isArray(e)?e:[]}function Di(e){const a=(e||[]).slice(-180);return Dt(g.liveDiagnostics,a),a}function Hi(e){const a=c(e||"","").toLocaleLowerCase("tr-TR");return a?a.includes("eÅŸleÅŸ")||a.includes("esles")?"not_eslesme":a.includes("saat")||a.includes("tarih")?"not_saat_tarih":a.includes("lig")?"not_lig":a.includes("kaynak")||a.includes("api")?"not_kaynak":"not_diger":"not_belirsiz"}function Pi(e,a){const t=Ht(),n=new Map((a||[]).map(s=>[s.id,ja(s.league)])),i=new Date().toISOString();for(const s of e||[]){const l=c(s?.state||"","unknown"),o=Number.isInteger(s?.homeGoals)&&Number.isInteger(s?.awayGoals),u=l==="not_found"?Hi(s?.note):o?"ok":"score_missing";t.push({id:String(s?.id||""),at:i,league:n.get(s?.id)||"Bilinmeyen lig",source:c(s?.source||"","bilinmeyen"),state:l,reason:u})}Di(t)}function Ki(){const a=Ht().slice(-180);if(!a.length)return{sample:0,successRate:0,notFoundRate:0,topReasons:[]};const t=a.filter(l=>l.reason.startsWith("not_")).length,n=a.filter(l=>l.reason==="ok").length,i=new Map;for(const l of a){const o=l.reason;i.set(o,(i.get(o)||0)+1)}const s=[...i.entries()].filter(([l])=>l!=="ok").sort((l,o)=>o[1]-l[1]).slice(0,3).map(([l,o])=>({key:l,count:o,label:l.replace("not_eslesme","EÅŸleÅŸme kaÃ§Ä±rtma").replace("not_saat_tarih","Saat/Tarih uyuÅŸmazlÄ±ÄŸÄ±").replace("not_lig","Lig adÄ± farklÄ±lÄ±ÄŸÄ±").replace("not_kaynak","Kaynak yanÄ±tÄ± zayÄ±f").replace("score_missing","Skor eksik").replace("not_diger","DiÄŸer").replace("not_belirsiz","Belirsiz")}));return{sample:a.length,successRate:ae(n,a.length),notFoundRate:ae(t,a.length),topReasons:s}}function Oi(e=""){const a=String(e||"").trim(),t=Number.parseInt(a.split(":")[0],10);return Number.isInteger(t)?t<15?"morning":t<19?"afternoon":t<22?"prime":"late":"unknown"}function Ui(e){const a=T(`${e?.sourceLabel||""} ${e?.sourceStatus?.label||""}`);return a.toLowerCase().includes("canlÄ±")||a.toLowerCase().includes("canlÄ±")||a.toLowerCase().includes("live")}function Yi(e){if(!e)return e;const a={...e,topPicks:Array.isArray(e.topPicks)?[...e.topPicks]:[],avoidPicks:Array.isArray(e.avoidPicks)?[...e.avoidPicks]:[]};return he?.checked&&(a.topPicks=a.topPicks.slice(0,3),a.avoidPicks=[],a.displayMode="top3"),a}function qi(e){if(!e)return e;const a={...e,picks:Array.isArray(e.picks)?[...e.picks]:[]};return a.picks=a.picks.filter(t=>{const n=String(t?.trackedStatus?.state||"").toLowerCase(),i=D(t?.minuteLabel||t?.trackedStatus?.statusLabel||"");return n==="halftime"?!0:n==="live"?i>0&&i<=77:!1}),a.picks.sort((t,n)=>{const i=D(t?.minuteLabel||t?.trackedStatus?.statusLabel||""),s=D(n?.minuteLabel||n?.trackedStatus?.statusLabel||"");return(n.analysis?.confidenceScore||0)-(t.analysis?.confidenceScore||0)||i-s}),ve?.checked&&(a.picks=a.picks.slice(0,1),a.displayMode="best1"),a.analyzedCount=a.picks.length,a.liveCount=a.picks.length,a.summaryNote=a.picks.length?a.displayMode==="best1"?"Filtre aktif. En gÃ¼venilir canlÄ± maÃ§ Ã¶ne Ã§Ä±karÄ±ldÄ±.":"Sadece aktif canlÄ± veya devre arasÄ±ndaki maÃ§lar gÃ¶steriliyor.":"Filtreyi geÃ§en aktif canlÄ± maÃ§ bulunamadÄ±.",a}function ji(){try{const e=localStorage.getItem(g.history),a=JSON.parse(e??"[]"),t=Array.isArray(a)?a:[],n=be(t);return JSON.stringify(t)!==JSON.stringify(n)&&localStorage.setItem(g.history,JSON.stringify(n.slice(0,Ga))),n}catch{return[]}}async function Vi(e){return!1}async function Wi(){return!1}function j(){if(Re!==null)return Re;const e=ji();return Re=e,e}function me(e){const a=e.slice(0,Ga);Re=a,Vi().then(t=>{t?localStorage.removeItem(g.history):localStorage.setItem(g.history,JSON.stringify(a))}).catch(()=>{localStorage.setItem(g.history,JSON.stringify(a))})}function Xi(){localStorage.removeItem(g.history),Re=[],Wi(),de&&(window.clearInterval(de),de=null),te([]),y("MaÃ§ takibi ve analiz geÃ§miÅŸi temizlendi.","ok")}function Oe(e,a,t={}){const n=j(),i=a.analysisId||qt(a.matchInfo),s=n.find(v=>v.id===i)??null,l=Ue(a),o=new Date().toISOString(),u=Ft(a.oddsMovement,o),p=ze(t.capturedScore||s?.capturedScore||""),k=p.totalGoals>0?{homeGoals:p.homeGoals,awayGoals:p.awayGoals}:null,f=[{id:i,analyzedAt:o,url:e,homeTeam:a.matchInfo.homeTeam,awayTeam:a.matchInfo.awayTeam,homeTeamId:s?.homeTeamId??null,awayTeamId:s?.awayTeamId??null,homeLogoUrl:s?.homeLogoUrl??c(a.matchInfo?.homeLogoUrl||"",""),awayLogoUrl:s?.awayLogoUrl??c(a.matchInfo?.awayLogoUrl||"",""),league:a.matchInfo.league,matchDate:a.matchInfo.matchDate,matchTime:a.matchInfo.matchTime||"",confidenceScore:a.confidenceScore,sourceLabel:c(a.sourceLabel||s?.sourceLabel||"",s?.sourceLabel||""),sourceStatus:a.sourceStatus??s?.sourceStatus??null,topRecommendation:a.recommendations?.[0]??null,recommendations:(a.recommendations??[]).map(v=>({market:v.market,probability:v.probability})),verdict:l.verdict,analysisMode:t.analysisMode??s?.analysisMode??(Ui(a)?"live":"prematch"),tracked:t.tracked??s?.tracked??!1,liveState:s?.liveState??null,liveStatusLabel:s?.liveStatusLabel??"",liveNote:s?.liveNote??"",liveSource:s?.liveSource??"",liveScore:s?.liveScore??k??null,capturedMinuteLabel:c(t.capturedMinuteLabel||s?.capturedMinuteLabel||"",s?.capturedMinuteLabel||""),capturedScore:c(t.capturedScore||s?.capturedScore||"",s?.capturedScore||""),halftimeScore:c(t.halftimeScore||s?.halftimeScore||"",s?.halftimeScore||""),lastSyncedAt:s?.lastSyncedAt??null,trackingSource:t.trackingSource??s?.trackingSource??"",playedMarket:t.playedMarket??s?.playedMarket??null,oddsSnapshots:Mi(s?.oddsSnapshots??[],u),goalEvents:Array.isArray(s?.goalEvents)?s.goalEvents.slice(-24):[],autoClosedAt:s?.autoClosedAt??null,result:s?.result??null},...n.filter(v=>v.id!==i)].slice(0,Ga);me(f),te(f)}function te(e){const a=e.filter(s=>s.tracked),t=e.filter(s=>!s.tracked);if(Ma&&(Ma.disabled=!a.length),!e.length){Ee.innerHTML=`
      <div class="empty-state compact-empty">
        <p>HenÃ¼z kayÄ±t yok. Bir maÃ§Ä± analiz edip Takibe Al dediÄŸinde burada gÃ¶rÃ¼nÃ¼r.</p>
      </div>
    `,gt([]),pt([]),G(Ee),kt([]);return}const n=Et(e),i=[ft("Takipteki maÃ§lar",a.length?"CanlÄ± skor ve maÃ§ sonu sonucu Mackolik akÄ±ÅŸÄ±yla yenilenir.":"HenÃ¼z takibe alÄ±nan maÃ§ yok. Bir karttaki Takibe Al butonunu kullan.",a,"tracked")];n.resolvedCount&&i.push(zi(n,e)),t.length&&i.push(ft("Son analizler","Takipte olmayan kayÄ±tlar burada saklanÄ±r.",t.slice(0,6),"archive")),He(Ee,i.join("")),gt(e),pt(e),G(Ee),kt(e)}function Xe(e){xe&&(xe.classList.toggle("hidden",!e),document.body.classList.toggle("live-hub-open",e))}async function Ji(e){const a=c(e,"").trim();if(!a)return!1;try{return await na("open_external_url",{url:a}),!0}catch{try{return!!window.open(a,"_blank","noopener,noreferrer")}catch{return!1}}}async function Qi(e){const a=e.target.closest("[data-open-url]");if(!a)return;e.preventDefault();const t=c(a.getAttribute("data-open-url")||"","").trim();if(!t){y("Mackolik baÄŸlantÄ±sÄ± bu maÃ§ iÃ§in henÃ¼z hazÄ±r deÄŸil.","warn");return}await Ji(t)||y("Mackolik baÄŸlantÄ±sÄ± aÃ§Ä±lamadÄ±.","error")}async function we(e){if(!pe||!x)return;const a=!!e;if(pe.classList.toggle("hidden",!a),document.body.classList.toggle("live-center-open",a),!a){fe=null,x.innerHTML='<div class="empty-state compact-empty"><p>Bir canlÄ± maÃ§ seÃ§.</p></div>';return}fe=e.id;const t=Aa.get(e.id)||c(e.matchcastUrl||"",""),n=t?{...e,matchcastUrl:t}:e;He(x,Na(n)),G(x),aa(x),await Zi(e)}async function Zi(e){if(!e||!e.id||!x||fe!==e.id)return;const a=Aa.get(e.id)||c(e.matchcastUrl||"","");if(a){fe===e.id&&(He(x,Na({...e,matchcastUrl:a})),G(x),aa(x));return}if(!(!Number.isInteger(e.mackolikMatchPageId)||!Number.isInteger(e.matchcastId)))try{const t=await na("resolve_matchcast_url",{matchPageId:e.mackolikMatchPageId,matchcastId:e.matchcastId,homeTeam:e.homeTeam,awayTeam:e.awayTeam,width:760}),n=c(t,"").trim();if(!n||fe!==e.id)return;Aa.set(e.id,n),He(x,Na({...e,matchcastUrl:n})),G(x),aa(x)}catch{}}function es(e){const a=c(e||"",""),t=a.match(/(\d+)\s*\+\s*(\d+)/);if(t)return(Number.parseInt(t[1],10)||0)+(Number.parseInt(t[2],10)||0);const n=a.match(/(\d+)/);return n?Number.parseInt(n[1],10)||0:/MS/i.test(a)?95:0}function as(e){const a=c(e||"","").toLocaleLowerCase("tr-TR");return a?a.includes("penaltÄ±")||a.includes("penalti")||a.includes("penalty")||a.includes("seri penalt")?"penalty":a.includes("gol")?"goal":a.includes("sarÄ± kart")||a.includes("sari kart")?"yellow":a.includes("kÄ±rmÄ±zÄ± kart")||a.includes("kirmizi kart")?"red":a.includes("deÄŸiÅŸiklik")||a.includes("degisiklik")?"sub":a.includes("korner")||a.includes("corner")?"corner":a.includes("devre")||a.includes("half time")?"halftime":a.includes("maÃ§ sonu")||a.includes("mac sonu")||a.includes("final skor")||a.includes("full time")?"fulltime":"update":"update"}function Pt(e){const a=c(e||"","").toLowerCase();return a?["goal","gol"].includes(a)?"goal":["yellow","yellow_card","card_yellow","sari","sarÄ±"].includes(a)?"yellow":["red","red_card","card_red","kirmizi","kÄ±rmÄ±zÄ±"].includes(a)?"red":["sub","substitution","degisiklik","deÄŸiÅŸiklik","change"].includes(a)?"sub":["corner","corner_kick","korner"].includes(a)?"corner":["penalty","pen","penalti","penaltÄ±","penalty_goal","penalty_missed"].includes(a)?"penalty":["halftime","half_time","ht","iy","ilk_yari"].includes(a)?"halftime":["fulltime","full_time","ft","ms","final"].includes(a)?"fulltime":["update","status"].includes(a)?"update":a:""}function ts(e,a,t="neutral"){const n=c(a||"","").toLocaleLowerCase("tr-TR"),i=c(e.homeTeam,"").toLocaleLowerCase("tr-TR"),s=c(e.awayTeam,"").toLocaleLowerCase("tr-TR");return n&&i&&n.includes(i)?"home":n&&s&&n.includes(s)?"away":t}function ns(e){switch(e){case"goal":return"Gol";case"yellow":return"SarÄ± kart";case"red":return"KÄ±rmÄ±zÄ± kart";case"sub":return"Oyuncu deÄŸiÅŸikliÄŸi";case"corner":return"Korner";case"penalty":return"PenaltÄ±";case"halftime":return"Ä°lk yarÄ±";case"fulltime":return"MaÃ§ sonu";default:return"CanlÄ± olay"}}function is(e){switch(e){case"goal":return"âš½";case"yellow":return"YC";case"red":return"RC";case"sub":return"â†”";case"corner":return"âš‘";case"penalty":return"PEN";case"halftime":return"HT";case"fulltime":return"MS";default:return"â€¢"}}function ss(e){const t=(Array.isArray(e?.timelineEvents)&&e.timelineEvents.length?e.timelineEvents.slice(-24):Array.isArray(e?.goalEvents)?e.goalEvents.slice(-12):[]).map((i,s)=>{const l=c(i?.note||i?.message||"","CanlÄ± olay"),o=Pt(i?.type||i?.eventType||""),u=["goal","yellow","red","sub","corner","penalty","halftime","fulltime","update"].includes(o)?o:as(l),p=c(i?.minute||"-","-"),k=c(i?.side||"","").toLowerCase();return{id:c(i?.at||"",`event-${s}-${p}`),type:u,label:ns(u),icon:is(u),minute:p,minuteValue:es(p),score:c(i?.score||e?.liveScore||"-","-"),note:l,side:["home","away","neutral"].includes(k)?k:ts(e,l,"neutral")}}),n=c(e?.halftimeScore||"","");if(n&&!t.some(i=>i.type==="halftime")&&t.push({id:"halftime",type:"halftime",label:"Ä°lk yarÄ±",icon:"HT",minute:"45+",minuteValue:45,score:n,note:`Ä°lk yarÄ± ${n} skoruyla kapandÄ±.`,side:"neutral"}),V(e)==="finished"){const i=M(e);i&&!t.some(s=>s.type==="fulltime")&&t.push({id:"fulltime",type:"fulltime",label:"MaÃ§ sonu",icon:"MS",minute:"90+",minuteValue:95,score:`${i.homeGoals}-${i.awayGoals}`,note:`MaÃ§ ${i.homeGoals}-${i.awayGoals} skoruyla bitti.`,side:"neutral"})}return t.sort((i,s)=>i.minuteValue-s.minuteValue),t}function ls(e,a){const t=M(e),n=Number(t?.homeGoals||0)+Number(t?.awayGoals||0),i=a.filter(k=>k.type==="yellow").length,s=a.filter(k=>k.type==="red").length,l=a.filter(k=>k.type==="corner").length,o=a.filter(k=>k.type==="penalty").length,u=a.filter(k=>k.type==="sub").length,p=a.at(-1);return[{label:"Goller",value:String(n),note:n?`${n} gol iÅŸlendi.`:"HenÃ¼z gol yok.",tone:"goal"},{label:"Kartlar",value:`${i}/${s}`,note:i||s?`SarÄ± ${i} â€¢ KÄ±rmÄ±zÄ± ${s}`:"Kart olayÄ± henÃ¼z yok.",tone:"card"},{label:"Korner",value:String(l),note:l?`${l} korner olayÄ± iÅŸlendi.`:"Korner verisi henÃ¼z yok.",tone:"corner"},{label:"PenaltÄ±",value:String(o),note:o?`${o} penaltÄ± olayÄ± iÅŸlendi.`:"PenaltÄ± olayÄ± henÃ¼z yok.",tone:"penalty"},{label:"DeÄŸiÅŸiklik",value:String(u),note:u?`${u} oyuncu deÄŸiÅŸikliÄŸi iÅŸlendi.`:"DeÄŸiÅŸiklik verisi henÃ¼z yok.",tone:"sub"},{label:"Son olay",value:p?p.minute:"-",note:p?`${p.label}: ${p.note}`:"HenÃ¼z olay akÄ±ÅŸÄ± oluÅŸmadÄ±.",tone:"summary"}]}function rs(e){const a=ss(e),t=ls(e,a),n=a.length?[...a].reverse().map(s=>`
        <li class="live-center-event-item ${r(s.side)} ${r(s.type)}">
          <div class="live-center-event-minute">${r(s.minute)}</div>
          <div class="live-center-event-icon ${r(s.type)}">${r(s.icon)}</div>
          <div class="live-center-event-copy">
            <strong>${r(s.label)}</strong>
            <p>${r(s.note)}</p>
          </div>
          <div class="live-center-event-score">${r(s.score)}</div>
        </li>
      `).join(""):`
      <li class="live-center-event-item neutral empty">
        <div class="live-center-event-minute">-</div>
        <div class="live-center-event-icon update">â€¢</div>
        <div class="live-center-event-copy">
          <strong>Olay akÄ±ÅŸÄ± bekleniyor</strong>
          <p>Bu maÃ§ iÃ§in henÃ¼z zaman damgalÄ± olay verisi yakalanmadÄ±.</p>
        </div>
        <div class="live-center-event-score">-</div>
      </li>
    `,i=a.map(s=>{const l=Math.max(2,Math.min(98,s.minuteValue||0));return`
      <span class="live-center-event-marker ${r(s.type)} ${r(s.side)}" style="left:${l}%">
        <i>${r(s.icon)}</i>
      </span>
    `}).join("");return`
    <section class="live-center-event-board">
      <div class="live-center-event-strip">
        <div class="live-center-event-strip-head">
          <h4>Goller, kartlar ve kritik olaylar</h4>
          <span>${r(a.length?`${a.length} olay iÅŸlendi`:"HenÃ¼z olay yok")}</span>
        </div>
        <div class="live-center-event-strip-track">
          <span class="live-center-event-strip-mid"></span>
          ${i}
        </div>
        <div class="live-center-event-strip-scale">
          <span>0'</span><span>15'</span><span>30'</span><span>45'</span><span>60'</span><span>75'</span><span>90'</span>
        </div>
      </div>

      <div class="live-center-summary-grid">
        ${t.map(s=>`
          <article class="live-center-summary-card ${r(s.tone)}">
            <span>${r(s.label)}</span>
            <strong>${r(s.value)}</strong>
            <p>${r(s.note)}</p>
          </article>
        `).join("")}
      </div>

      <div class="live-center-event-feed">
        <div class="live-center-event-feed-head">
          <h4>Etkinlikler</h4>
          <span>CanlÄ± akÄ±ÅŸ</span>
        </div>
        <ul class="live-center-event-list">${n}</ul>
      </div>
    </section>
  `}function os(e){if(V(e)==="finished"){const t=M(e);return t?`MaÃ§ sonu skoru ${t.homeGoals}-${t.awayGoals}.`:"MaÃ§ sonucu iÅŸlendi."}const a=c(e.halftimeScore||"","");return a?`Ä°lk yarÄ± skoru ${a}.`:"Ä°lk yarÄ± skoru henÃ¼z oluÅŸmadÄ±."}function Na(e){const a=M(e),t=Number.isInteger(a?.homeGoals)?a.homeGoals:"-",n=Number.isInteger(a?.awayGoals)?a.awayGoals:"-",i=V(e),s=i==="finished"?"MS":Kt(e),l=i==="finished"?"MaÃ§ sonu":c(pa(e),"Takipte"),o=c(e.halftimeScore||"",""),u=c(e.goalAlertMessage||e.liveNote||e.verdict||"","CanlÄ± akÄ±ÅŸ burada gÃ¶rselleÅŸtirilir."),p=A(e.topRecommendation?.market||"CanlÄ± izleme"),k=Number.isInteger(e.confidenceScore)?e.confidenceScore:0,d=ha([e.league,fa(e.matchDate,e.matchTime),Xa(e.lastSyncedAt||e.analyzedAt)]),f=i==="finished"?90:Math.max(0,Math.min(D(e?.liveStatusLabel||""),90));return`
    <section class="live-center-card">
      <div class="live-center-hero">
        <div class="live-center-scoreboard">
          <div class="live-center-side home">
            ${ea(e,"home")}
            <strong>${r(e.homeTeam)}</strong>
            <small>Ev sahibi</small>
          </div>
          <div class="live-center-middle">
            <span class="live-center-minute">${r(s)}</span>
            <div class="live-center-score"><strong>${r(String(t))}</strong><span>-</span><strong>${r(String(n))}</strong></div>
            <div class="live-center-meta">
              <span class="history-chip">${r(l)}</span>
              <span class="history-chip">Ana Ã¶neri: ${r(p)}</span>
              <span class="history-chip">GÃ¼ven %${r(String(k))}</span>
              ${o?`<span class="history-chip">Ä°Y ${r(o)}</span>`:""}
            </div>
          </div>
          <div class="live-center-side away">
            ${ea(e,"away")}
            <strong>${r(e.awayTeam)}</strong>
            <small>Deplasman</small>
          </div>
        </div>

        <div class="live-center-timeline">
          <div class="live-center-timeline-scale">
            <span>0</span><span>15</span><span>30</span><span>45</span><span>60</span><span>75</span><span>90</span>
          </div>
          <div class="live-center-timeline-track">
            <span class="live-center-timeline-progress" style="width:${f}%"></span>
            <span class="live-center-timeline-dot" style="left:${f}%"></span>
          </div>
        </div>
      </div>

      

      ${rs(e)}
      <div class="live-center-insights">
        <article class="live-center-metric">
          <span>AnlÄ±k okuma</span>
          <strong>${r(p)}</strong>
          <p>${r(u)}</p>
        </article>
        <article class="live-center-metric">
          <span>GÃ¼ncelleme</span>
          <strong>${r(d)}</strong>
          <p>${r(os(e))}</p>
        </article>
      </div>
    </section>
  `}function Kt(e){const a=String(V(e)||"").toLowerCase(),t=c(e?.liveStatusLabel||"","");return a==="live"?t||"CanlÄ±":a==="halftime"?"Devre":a==="finished"?"MS":a==="scheduled"?e?.matchTime||t||"-":t||"-"}function cs(e){const a=String(e||"").trim().split(/\s+/).filter(Boolean);return a.length?a.length===1?a[0].slice(0,2).toUpperCase():`${a[0][0]||""}${a[1][0]||""}`.toUpperCase():"TA"}function mt(e,a="buyuk"){return!Number.isInteger(e)||e<=0?"":`https://im.mackolik.com/img/logo/${a==="kucuk"?"kucuk":"buyuk"}/${e}.gif`}function $a(e){return T(e||"").toLocaleLowerCase("tr-TR").replace(/[^\p{L}\p{N}]+/gu," ").replace(/\s+/g," ").trim()}function us(e,a="home"){const t=$a(e);if(!t)return"";const n=j();for(const i of n){const s=$a(i.homeTeam),l=$a(i.awayTeam);if(a==="home"&&s===t&&i.homeLogoUrl)return c(i.homeLogoUrl,"");if(a==="away"&&l===t&&i.awayLogoUrl)return c(i.awayLogoUrl,"");if(s===t&&i.homeLogoUrl)return c(i.homeLogoUrl,"");if(l===t&&i.awayLogoUrl)return c(i.awayLogoUrl,"")}return""}function ds(e,a){const t=a==="home"?e.homeTeam:e.awayTeam,n=a==="home"?e.homeTeamId:e.awayTeamId,i=c(a==="home"?e.homeLogoUrl||"":e.awayLogoUrl||"","").trim(),s=us(t,a),l=mt(n,"buyuk"),o=mt(n,"kucuk");return{primary:l||i||s,fallback:o||s||i}}function ea(e,a){const t=a==="home"?e.homeTeam:e.awayTeam,n=cs(t),i=ds(e,a);if(!i.primary)return`<span class="live-hub-logo-fallback">${r(n)}</span>`;const s=i.fallback?` data-fallback="${$(i.fallback)}"`:"";return`
    <span class="live-hub-logo-wrap">
      <img class="live-hub-logo" src="${$(i.primary)}" alt="${r(t)} logosu"${s} loading="lazy" />
      <span class="live-hub-logo-fallback">${r(n)}</span>
    </span>
  `}function aa(e){if(!e)return;e.querySelectorAll(".live-hub-logo").forEach(t=>{const n=()=>{t.classList.add("hidden");const s=t.nextElementSibling;s&&s.classList.contains("live-hub-logo-fallback")&&s.classList.remove("hidden")},i=()=>{const s=t.nextElementSibling;s&&s.classList.contains("live-hub-logo-fallback")&&s.classList.add("hidden"),t.classList.remove("hidden")};t.addEventListener("error",()=>{const s=t.dataset.fallback||"";if(!t.dataset.fallbackTried&&s&&t.src!==s){t.dataset.fallbackTried="1",t.src=s;return}n()}),t.addEventListener("load",i),t.complete&&t.naturalWidth>0&&t.naturalHeight>0?i():n()})}function ma(e){const a=String(e?.goalAlertAt||"").trim();if(!a)return!1;const t=Date.parse(a);return Number.isNaN(t)?!1:Date.now()-t<=dn}function ms(e){const a=M(e),t=Number.isInteger(a?.homeGoals)?a.homeGoals:"-",n=Number.isInteger(a?.awayGoals)?a.awayGoals:"-",i=Kt(e),s=ma(e),l=c(e.goalAlertMessage||"",""),o=c(pa(e),"Takipte"),u=V(e),p=u==="live"?"live":u==="halftime"?"halftime":u==="finished"?"finished":"waiting",k=c(e.halftimeScore||"","");return`
    <article class="live-hub-row ${s?"goal":""}" data-history-id="${$(e.id)}">
      <div class="live-hub-mainline">
        <div class="live-hub-team home">
          <strong>${r(e.homeTeam)}</strong>
          <small>Ev sahibi</small>
        </div>

        <div class="live-hub-center" aria-label="Skor ve dakika">
          <span class="live-hub-time-badge">${r(i)}</span>
          <div class="live-hub-logo-row">
            ${ea(e,"home")}
            <div class="live-hub-scoreline">
              <strong>${r(String(t))}</strong>
              <span>-</span>
              <strong>${r(String(n))}</strong>
            </div>
            ${ea(e,"away")}
          </div>
          <div class="live-hub-meta-row">
            <span class="live-hub-state ${p}">${r(o)}</span>
            ${k?`<span class="live-hub-half-score">Ä°Y ${r(k)}</span>`:""}
          </div>
        </div>

        <div class="live-hub-team away">
          <strong>${r(e.awayTeam)}</strong>
          <small>Deplasman</small>
        </div>

        <div class="live-hub-row-actions">
          <button class="ghost-btn tiny-btn" type="button" data-live-hub-action="focus-match">AÃ§</button>
          <button class="ghost-btn tiny-btn" type="button" data-live-hub-action="refresh-match">Yenile</button>
          <button class="ghost-btn tiny-btn live-remove-btn" type="button" data-live-hub-action="remove-match">Ã‡Ä±kar</button>
        </div>
      </div>
      ${s?`
        <div class="live-hub-goal-note">
          <span class="goal-alert-dot" aria-hidden="true"></span>
          <span>${r(l||"Gol bildirimi")}</span>
        </div>
      `:""}
    </article>
  `}function pt(e){if(!oe)return;const a=(e||[]).filter(i=>i.tracked);if(!a.length){oe.innerHTML='<div class="empty-state compact-empty"><p>Takipte maÃ§ yok.</p></div>',G(oe);return}const t=new Map;for(const i of a){const s=c(i.league||"","").trim()||"DiÄŸer ligler";t.has(s)||t.set(s,[]),t.get(s).push(i)}const n=Array.from(t.entries()).map(([i,s])=>{const l=[...s].sort((o,u)=>{const p=o.liveState==="live"?0:o.liveState==="halftime"?1:2,k=u.liveState==="live"?0:u.liveState==="halftime"?1:2;return p!==k?p-k:D(u.liveStatusLabel)-D(o.liveStatusLabel)});return`
      <section class="live-hub-league-block">
        <div class="live-hub-league-head">
          <h4>${r(i)}</h4>
          <span class="source-pill strong">${l.length} maÃ§</span>
        </div>
        <div class="live-hub-match-list">
          ${l.map(ms).join("")}
        </div>
      </section>
    `});He(oe,n.join("")),G(oe),aa(oe)}function ps(e){const a=e.target.closest("[data-live-hub-action]");if(!a)return;const t=a.dataset.liveHubAction,i=a.closest("[data-history-id]")?.dataset?.historyId;if(i){if(t==="focus-match"){const l=j().find(o=>o.id===i);l&&we(l);return}if(t==="refresh-match"){De(!1,[i]);return}if(t==="remove-match"){const l=j().map(o=>o.id===i?{...o,tracked:!1}:o);me(l),te(l),y("MaÃ§ canlÄ± takip listesinden Ã§Ä±karÄ±ldÄ±.","ok")}}}function fs(e){const a=new Set,t=[],n=i=>{const s=A(i||"").trim();if(!s||Oa(s)||/^pazar(?: yok)?$/i.test(s)||/^belirsiz$/i.test(s))return;const l=s.toLocaleLowerCase("tr-TR");a.has(l)||(a.add(l),t.push(s))};n(e?.topRecommendation?.market);for(const i of e?.recommendations??[])n(i?.market);return e?.playedMarket&&n(e.playedMarket),t}function ks(e){const a=fs(e);if(!a.length)return"";const t=T(e.playedMarket||"").trim();return a.map(n=>`<option value="${$(n)}" ${n===t?"selected":""}>${r(n)}</option>`).join("")}function ft(e,a,t,n){return`
    <section class="history-section history-section-${$(n)}">
      <div class="scan-section-head history-section-head">
        <div>
          <h3>${r(e)}</h3>
          <p>${r(a)}</p>
        </div>
        <span class="source-pill ${n==="tracked"?"strong":"limited"}">${r(n==="tracked"?`Takipte ${t.length}`:`KayÄ±t ${t.length}`)}</span>
      </div>
      ${t.length?`<div class="history-list">${t.map(vs).join("")}</div>`:`<div class="scan-empty">${r(n==="tracked"?"Takip listesi ÅŸu an boÅŸ.":"ArÅŸivde gÃ¶sterilecek kayÄ±t yok.")}</div>`}
    </section>
  `}function hs(e,a){if(a?.summary)return O(a.summary,88);const t=A(e.topRecommendation?.market||"Belirsiz"),n=Number(e.confidenceScore)||0,i=pa(e);return`${t} â€¢ GÃ¼ven %${n} â€¢ ${i}`}function vs(e){const a=Ds(e),t=e.sourceStatus??{label:"Kaynak yok",health:"limited"},n=e.result,i=V(e)==="finished"?e.liveScore:null,s=n??i??null,l=s?String(s.homeGoals):"",o=s?String(s.awayGoals):"",u=Bs(e,a),p=a?a.summary:e.tracked?"Takipte. CanlÄ± skor ve maÃ§ sonu sonucu geldikÃ§e kart otomatik gÃ¼ncellenir.":"Bu kaydÄ± takibe alÄ±rsan canlÄ± skor ve maÃ§ sonu sonucu otomatik izlenir.",k=js(e),d=M(e),f=d?`${d.homeGoals}-${d.awayGoals}`:"-",v=Fs(e),b=_s(e,a),S=e.tracked?O(b,96):b,m=e.tracked?hs(e,a):O(a?.summary||k,110),h=A(e.playedMarket||"").trim(),w=Oa(h)?"":h,W=ks(e),H=ma(e),P=c(e.goalAlertMessage||"",""),E=pa(e),L=e.liveState==="live"||e.liveState==="halftime";return`
    <article class="history-card ${e.tracked?"tracked-card":""} ${H?"goal-alert-active":""}" data-history-id="${$(e.id)}">
      <div class="mini-top history-card-head">
        <div>
          <h4>${r(e.homeTeam)} vs ${r(e.awayTeam)}</h4>
          <p class="history-meta">${r(ha([e.league,fa(e.matchDate,e.matchTime),Xa(e.analyzedAt)]))}</p>
        </div>
        <div class="history-head-badges">
          <span class="source-pill ${$(t.health||"limited")}">${r(ie(t.label,t))}</span>
          ${e.tracked?'<span class="source-pill strong">Takipte</span>':""}
        </div>
      </div>

      <div class="history-tags compact-history-tags">
        <span class="history-chip">Ana Ã¶neri: ${r(A(e.topRecommendation?.market||"Yok"))}</span>
        <span class="history-chip">GÃ¼ven: %${e.confidenceScore}</span>
        ${w?`<span class="history-chip">Benim kuponum: ${r(w)}</span>`:""}
        ${!e.tracked&&e.liveStatusLabel?`<span class="history-chip">Durum: ${r(e.liveStatusLabel)}</span>`:""}
      </div>

      <p class="history-summary">${r(m)}</p>

      <div class="history-live-box ${$(u)}">
        ${e.tracked?`
          <div class="tracked-live-strip">
            <div class="tracked-live-state ${L?"active":""}">
              ${L?'<span class="live-dot inline-live-dot"></span>':""}
              <span>${r(E)}</span>
            </div>
            ${H?`
              <div class="goal-alert-pill">
                <span class="goal-alert-dot" aria-hidden="true"></span>
                <span>${r(P||"Gol bildirimi")}</span>
              </div>
            `:""}
          </div>
        `:""}
        <div class="history-live-copy">
          <span class="history-live-kicker">MaÃ§ durumu</span>
          <strong class="history-live-title">${r(v)}</strong>
          <p>${r(S)}</p>
          ${e.halftimeScore?`<p class="history-half-score">Ä°Y skoru: ${r(e.halftimeScore)}</p>`:""}
        </div>
        <div class="history-live-score compact-live-score">
          <span>${r(e.homeTeam)}</span>
          <strong>${r(f)}</strong>
          <span>${r(e.awayTeam)}</span>
        </div>
      </div>

      <div class="history-actions compact-history-actions">
        <button class="ghost-btn history-action-btn history-track-btn" type="button" data-action="toggle-track">${e.tracked?"Takipten Ã‡Ä±kar":"Takibe Al"}</button>
        ${e.tracked?'<button class="ghost-btn history-action-btn history-refresh-btn" type="button" data-action="refresh-live">CanlÄ±yÄ± GÃ¼ncelle</button>':""}
        <button class="ghost-btn history-action-btn history-delete-btn danger" type="button" data-action="delete-entry">KaydÄ± Sil</button>
      </div>

      <div class="history-market-row">
        <label class="score-input-wrap history-market-wrap">
          <span>Benim oynadÄ±ÄŸÄ±m market</span>
          <select class="text-input select-input history-market-select" data-market-select>
            <option value="">SeÃ§im yap</option>
            ${W}
          </select>
        </label>
        <label class="score-input-wrap history-market-wrap history-market-custom-wrap">
          <span>Serbest giriÅŸ</span>
          <input class="text-input history-market-custom-input" data-market-custom type="text" value="" placeholder="Ã–rnek: Ä°lk YarÄ± 0.5 Ãœst" />
        </label>
        <button class="ghost-btn history-market-btn" type="button" data-action="save-played-market">Kuponumu Kaydet</button>
      </div>

      <div class="history-score-row compact-history-score-row">
        <label class="score-input-wrap">
          <span>${r(e.homeTeam)}</span>
          <input class="history-score-input" data-score-side="home" type="number" min="0" max="20" value="${$(l)}" />
        </label>
        <span class="score-separator">-</span>
        <label class="score-input-wrap">
          <span>${r(e.awayTeam)}</span>
          <input class="history-score-input" data-score-side="away" type="number" min="0" max="20" value="${$(o)}" />
        </label>
        <button class="ghost-btn history-save-btn" type="button" data-action="save-result">${n?"Sonucu GÃ¼ncelle":"Sonucu Kaydet"}</button>
      </div>

      <div class="history-outcome ${u}">${r(p)}</div>
    </article>
  `}function bs(e){const a=e.target.closest("[data-action]");if(!a)return;const t=a.dataset.action;if(t==="track-coupon"){const n=Number.parseInt(a.dataset.couponIndex,10);if(!Number.isInteger(n))return;$s(n);return}if(t==="track-analysis"){gs();return}if(t==="track-scan-pick"){const n=Number.parseInt(a.dataset.rank,10),i=a.dataset.variant||"top";if(!Number.isInteger(n))return;ys(n,i);return}if(t==="track-live-match"){const n=Number.parseInt(a.dataset.liveIndex,10);if(!Number.isInteger(n))return;Ss(n);return}if(t==="analyze-live-match"){const n=Number.parseInt(a.dataset.liveIndex,10);if(!Number.isInteger(n)||!Ze?.picks?.[n])return;const i=Ze.picks[n],s=c(i.detailUrl||"","").trim();if(!s||!/^https?:\/\//i.test(s)){y("Detay analiz baÄŸlantÄ±sÄ± bu maÃ§ iÃ§in bulunamadÄ±.","warn");return}B.value=s,za();return}}function gs(){if(!$e){y("Analiz kartÄ± bulunamadÄ±.","warn");return}Oe(Tt||B.value.trim(),$e,{tracked:!0,trackingSource:"Analiz Ã¶zeti"});const e=$e.matchInfo??{};y(`${e.homeTeam||"MaÃ§"} - ${e.awayTeam||""} takibe alÄ±ndÄ±.`,"ok"),It($e)}function ys(e,a="top"){const n=(a==="avoid"?Se?.avoidPicks??[]:Se?.topPicks??[]).find(s=>s.rank===e);if(!n?.analysis){y("Tarama kartÄ± bulunamadÄ±.","warn");return}Oe(n.detailUrl,n.analysis,{tracked:!0,trackingSource:a==="avoid"?"Tarama Ã¶zeti - uzak dur":"Tarama Ã¶zeti"});const i=n.analysis.matchInfo??{};y(`${i.homeTeam||"MaÃ§"} - ${i.awayTeam||""} takibe alÄ±ndÄ±.`,"ok"),Se&&zt(Se)}function Ss(e,a=Ze){const t=a?.picks?.[e];if(!t?.analysis){y("CanlÄ± maÃ§ kartÄ± bulunamadÄ±.","warn");return}Oe(t.detailUrl,t.analysis,{tracked:!0,trackingSource:"CanlÄ± maÃ§ sorgusu",analysisMode:"live",capturedMinuteLabel:c(t.minuteLabel||t.trackedStatus?.statusLabel||"",""),capturedScore:c(t.liveScore||"",""),halftimeScore:c(t.halftimeScore||t.trackedStatus?.halftimeScore||"","")}),y(`${t.analysis.matchInfo?.homeTeam||"MaÃ§"} - ${t.analysis.matchInfo?.awayTeam||""} takibe alÄ±ndÄ±.`,"ok")}function $s(e,a=Se,t=!1){if(!a?.couponPackages?.[e]){t||y("Kupon paketi bulunamadÄ±.","warn");return}const n=a.couponPackages[e],i=[...a.topPicks??[],...a.avoidPicks??[]];let s=0;for(const l of n.legs??[]){const o=Fe(l.matchLabel||""),u=i.find(p=>{const k=`${p.analysis?.matchInfo?.homeTeam||""} - ${p.analysis?.matchInfo?.awayTeam||""}`;return Fe(k)===o});u?.analysis&&(Oe(u.detailUrl,u.analysis,{tracked:!0,trackingSource:n.title}),s+=1)}t||y(s?`${n.title} takibe alÄ±ndÄ±. ${s} ayak canlÄ± izlenecek.`:"Kupon iÃ§in izlenecek ayak bulunamadÄ±.",s?"ok":"warn")}async function ws(e){const a=e.target.closest("[data-action]");if(!a)return;const t=a.dataset.action,n=a.closest("[data-history-id]");if(!n)return;const i=n.dataset.historyId,s=j(),l=s.find(f=>f.id===i);if(!l)return;if(t==="delete-entry"){const f=s.filter(v=>v.id!==i);me(f),te(f),y("KayÄ±t geÃ§miÅŸten kaldÄ±rÄ±ldÄ±.","ok");return}if(t==="save-played-market"){const f=n.querySelector("[data-market-select]"),v=n.querySelector("[data-market-custom]"),b=T(v?.value||f?.value||"").trim(),S=Oa(b)?"":A(b),m=s.map(h=>h.id===i?{...h,playedMarket:S||null}:h);me(m),te(m),y(S?"Benim oynadÄ±ÄŸÄ±m market kaydedildi.":"KayÄ±tlÄ± kupon marketi temizlendi.","ok");return}if(t==="toggle-track"){const f=!l.tracked,v=s.map(b=>b.id===i?{...b,tracked:f,...f?{autoClosedAt:null,matchcastUrl:"",...b.result?.source!=="manual"?{result:null}:{},...b.liveState==="finished"?{liveState:"scheduled",liveStatusLabel:b.matchTime||"BaÅŸlama bekleniyor",liveScore:null,halftimeScore:""}:{}}:{}}:b);me(v),te(v),y(f?"MaÃ§ takibe alÄ±ndÄ±. CanlÄ± skor ve maÃ§ sonu sonucu gÃ¼ncellenecek.":"MaÃ§ takip listesinden Ã§Ä±karÄ±ldÄ±.","ok"),f&&await De(!0,[i]);return}if(t==="refresh-live"){await De(!1,[i]);return}if(t!=="save-result")return;const o=n.querySelector('[data-score-side="home"]'),u=n.querySelector('[data-score-side="away"]'),p=Number.parseInt(o.value,10),k=Number.parseInt(u.value,10);if(!Number.isInteger(p)||!Number.isInteger(k)||p<0||k<0){y("Final skor iÃ§in iki tarafa da geÃ§erli sayÄ± girmelisin.","warn");return}const d=s.map(f=>f.id===i?{...f,result:{homeGoals:p,awayGoals:k,savedAt:new Date().toISOString(),source:"manual"}}:f);me(d),te(d),y("Final skor kaydedildi. Tahmin isabeti gÃ¼ncellendi.","ok")}function Ls(e,a){const t=new Map((e||[]).map(n=>[n.id,n]));return(a||[]).filter(n=>!n?.tracked||!n.goalAlertAt||!ma(n)?!1:t.get(n.id)?.goalAlertAt!==n.goalAlertAt).map(n=>({id:n.id,homeTeam:n.homeTeam,awayTeam:n.awayTeam,score:M(n),minuteLabel:c(n.liveStatusLabel||"",""),message:c(n.goalAlertMessage||"Gol bildirimi","Gol bildirimi")}))}function Ts(e){e?.length&&e.forEach((a,t)=>{window.setTimeout(()=>{Cs(a),Ms()},t*220)})}function Cs(e){if(!qe)return;const a=Number.isInteger(e?.score?.homeGoals)&&Number.isInteger(e?.score?.awayGoals)?`${e.score.homeGoals}-${e.score.awayGoals}`:"-",t=`${c(e.homeTeam,"Ev sahibi")} vs ${c(e.awayTeam,"Deplasman")}`,n=c(e?.message||"Gol bildirimi","Gol bildirimi"),i=n.match(/^Gol:\s*(.+?)(?:\s*[â€¢\uFFFD]\s*|$)/i),s=i?i[1]:"Gol oldu",l=i?n.replace(/^Gol:\s*.+?(?:\s*[â€¢\uFFFD]\s*)?/i,""):n,o=c(e?.minuteLabel||"",""),u=document.createElement("div");for(u.className="goal-toast",u.innerHTML=`
    <span class="goal-toast-kicker">CANLI GOL</span>
    <strong>${r(s)}</strong>
    <p class="goal-toast-match">${r(t)}</p>
    <p class="goal-toast-meta">${r(l)}${o?` â€¢ ${r(o)}`:""} â€¢ Skor ${r(a)}</p>
  `,qe.appendChild(u);qe.childElementCount>5;)qe.firstElementChild?.remove();window.setTimeout(()=>u.classList.add("hide"),9200),window.setTimeout(()=>u.remove(),1e4)}function Ms(){if(typeof window>"u")return;const e=window.AudioContext||window.webkitAudioContext;if(e)try{se||(se=new e),se.state==="suspended"&&se.resume().catch(()=>{});const a=se.currentTime,t=se.createGain();t.gain.setValueAtTime(1e-4,a),t.connect(se.destination),[740,988].forEach((i,s)=>{const l=se.createOscillator(),o=a+s*.12,u=o+.1;l.type="triangle",l.frequency.setValueAtTime(i,o),l.connect(t),t.gain.setValueAtTime(1e-4,o),t.gain.linearRampToValueAtTime(.14,o+.02),t.gain.exponentialRampToValueAtTime(1e-4,u),l.start(o),l.stop(u+.02)})}catch(a){console.debug("Sesli gol bildirimi devreye alÄ±namadÄ±:",a)}}async function De(e=!1,a=null){const t=j(),n=t.filter(i=>i.tracked&&(!a||a.includes(i.id)));if(!n.length){e||y("Takipte gÃ¼ncellenecek maÃ§ yok.","warn");return}e||y("Takipteki maÃ§larÄ±n canlÄ± skoru gÃ¼ncelleniyor...","normal");try{const i=await na("refresh_tracked_matches",{matches:n.map(u=>({id:u.id,homeTeam:u.homeTeam,awayTeam:u.awayTeam,matchDate:u.matchDate,matchTime:u.matchTime||"",league:u.league,url:u.url||"",mackolikMatchPageId:Number.isInteger(u.mackolikMatchPageId)?u.mackolikMatchPageId:null,matchcastId:Number.isInteger(u.matchcastId)?u.matchcastId:null})),data:oa()}),s=be(i);Pi(s,n);const l=Es(t,s),o=Ls(t,l);me(l),te(l),o.length&&Ts(o),e||y("Takipteki maÃ§larÄ±n canlÄ± skor bilgisi gÃ¼ncellendi.","ok")}catch(i){console.error(i),e||y(`CanlÄ± skor gÃ¼ncellenemedi: ${ka(i,"CanlÄ± skor akÄ±ÅŸÄ± yanÄ±t vermedi")}`,"error")}}function kt(e){if(!fe||!pe||pe.classList.contains("hidden"))return;const a=e.find(t=>t.id===fe);if(!a){we(null);return}we(a)}function D(e){const a=String(e||"").match(/(\d{1,3})/);return a?Number.parseInt(a[1],10):0}function pa(e){const a=c(e?.liveStatusLabel||"","");switch(V(e)){case"live":return a?`CanlÄ± ${a}`:"CanlÄ±";case"halftime":return a?`Devre arasÄ± â€¢ ${a}`:"Devre arasÄ±";case"scheduled":return a?`BaÅŸlama â€¢ ${a}`:"BaÅŸlama bekleniyor";case"finished":return"MaÃ§ sonu";case"not_found":return M(e)?"Son bilinen veri":"CanlÄ± veri bekleniyor";default:return a||"Takip beklemede"}}function As(e,a,t){const n=t.homeGoals-a.homeGoals,i=t.awayGoals-a.awayGoals,s=`${t.homeGoals}-${t.awayGoals}`;return n>0&&i>0?`Gol: Her iki taraf â€¢ peÅŸ peÅŸe goller geldi â€¢ ${s}`:n>0?`Gol: ${e.homeTeam} â€¢ golÃ¼ buldu â€¢ ${s}`:i>0?`Gol: ${e.awayTeam} â€¢ golÃ¼ buldu â€¢ ${s}`:`Skor gÃ¼ncellendi â€¢ ${s}`}function zs(e,a){const t=D(e);if(Number.isInteger(t)&&t>0)return`${t}'`;const n=String(a||"").toLowerCase();return n==="halftime"?"45+":n==="finished"?"90+":"-"}function ht(e,a,t,n,i){const s=Array.isArray(e?.goalEvents)?e.goalEvents:[],l=zs(a?.statusLabel||e?.liveStatusLabel||"",a?.state||e?.liveState||""),o={at:new Date().toISOString(),minute:l,score:`${n.homeGoals}-${n.awayGoals}`,note:c(i||"Gol bildirimi","Gol bildirimi")};return[...s,o].slice(-24)}function Is(e){const a=String(e||"").toLowerCase();return a.includes("mackolik_canli_sonuclar")||a.includes("iddaa_statistics_api")||a.includes("manual")}function vt(e,a){return String(a?.source||"").toLowerCase().includes("iddaa_statistics_api")?a?.state==="finished"?Yt(e,a)||ne(e):!1:!0}function bt(e,a){if(!Number.isInteger(e?.homeGoals)||!Number.isInteger(e?.awayGoals)||!Number.isInteger(a?.homeGoals)||!Number.isInteger(a?.awayGoals))return!1;const t=e.homeGoals+e.awayGoals;return a.homeGoals+a.awayGoals<t?!0:a.homeGoals<e.homeGoals||a.awayGoals<e.awayGoals}function Qe(e){const a=String(e||"").toLowerCase();return a==="not_found"||a==="missing"}function Ie(e,a=null){const t=String(e?.liveState||"").toLowerCase(),n=String(a?.state||"").toLowerCase();if(t==="live"||t==="halftime"||n==="live"||n==="halftime")return!0;const i=c(a?.statusLabel||e?.liveStatusLabel||"","");return D(i)>=45||c(a?.halftimeScore||e?.halftimeScore||"","")||(Array.isArray(a?.timelineEvents)?a.timelineEvents:Array.isArray(e?.timelineEvents)?e.timelineEvents:[]).some(o=>c(o?.type||o?.eventType||"","").toLowerCase()==="goal")?!0:Array.isArray(e?.goalEvents)&&e.goalEvents.length>0}function Va(e){const a=c(e||"","").toLocaleLowerCase("tr-TR");return a?/\b(ms|ft)\b/.test(a)||a.includes("maÃ§ sonu")||a.includes("mac sonu")||a.includes("final skor")||a.includes("full time")||a.includes("penalt"):!1}function Ot(e,a=null){return(Array.isArray(a?.timelineEvents)?a.timelineEvents:Array.isArray(e?.timelineEvents)?e.timelineEvents:[]).some(n=>{if(Pt(n?.type||n?.eventType||"")==="fulltime")return!0;const s=c(n?.note||n?.message||"","");return Va(s)})}function Ut(e){const a=Wa(e);return a?(Date.now()-a.getTime())/(60*1e3):null}function Ns(e,a){if(String(a?.state||"").toLowerCase()!=="scheduled"||ne(e))return!1;if(e?.liveState==="live"||e?.liveState==="halftime")return!0;const n=M(e);if(Number.isInteger(n?.homeGoals)&&Number.isInteger(n?.awayGoals))return!0;const i=Ut(e);return Number.isFinite(i)&&i>=70&&Ie(e,a)}function Gs(e,a){if(ne(e))return!0;if(String(a?.state||"").toLowerCase()!=="finished"||!Is(a?.source)||!Number.isInteger(a?.homeGoals)||!Number.isInteger(a?.awayGoals))return!1;if(Va(a?.statusLabel)||Ot(e,a))return!0;const n=Ut(e);return!Number.isFinite(n)||n<95?!1:Ie(e,a)||D(a?.statusLabel||e?.liveStatusLabel||"")>=85}function Es(e,a){const t=new Map((a??[]).map(n=>[n.id,n]));return e.map(n=>{if(!n.tracked)return n;const i=t.get(n.id);if(!i)return n;const s=String(i.state||"").toLowerCase(),l=Yt(n,i),o=ne(n),u=Ns(n,i),p=Gs(n,i);if(o&&s!=="finished"){const f=M(n);return{...n,tracked:!1,liveState:"finished",liveStatusLabel:"MS",liveScore:f||n.liveScore||null,lastSyncedAt:new Date().toISOString(),liveNote:c("MaÃ§ sonucu sabitlendi; canlÄ± akÄ±ÅŸ bu kartta yeniden aÃ§Ä±lmadÄ±.","MaÃ§ sonucu sabitlendi.")}}if((Qe(s)||u)&&!l&&(n.liveState==="live"||n.liveState==="halftime"||Ie(n,i)||n.liveScore&&Number.isInteger(n.liveScore.homeGoals)&&Number.isInteger(n.liveScore.awayGoals)&&(n.liveState==="live"||n.liveState==="halftime")))return{...n,liveState:n.liveState||"not_found",liveStatusLabel:n.liveStatusLabel||"DoÄŸrulanamadÄ±",liveNote:c(u?"Kaynak bu turda maÃ§Ä± planlÄ± gÃ¶sterdi; yanlÄ±ÅŸ geri dÃ¶nÃ¼ÅŸÃ¼ Ã¶nlemek iÃ§in son canlÄ± veri korunuyor.":"Kaynak bu turda eÅŸleÅŸmedi; son bilinen skor korunuyor.","Kaynak bu turda eÅŸleÅŸmedi."),lastSyncedAt:n.lastSyncedAt||new Date().toISOString(),halftimeScore:c(i.halftimeScore||n.halftimeScore||"",n.halftimeScore||""),goalEvents:Array.isArray(n.goalEvents)?n.goalEvents.slice(-24):[],timelineEvents:Array.isArray(n.timelineEvents)?n.timelineEvents.slice(-32):[]};const d={...n,liveState:s||n.liveState||null,liveStatusLabel:c(i.statusLabel||n.liveStatusLabel||"",n.liveStatusLabel||""),liveNote:c(i.note||n.liveNote||"",n.liveNote||""),liveSource:c(i.source||n.liveSource||"",n.liveSource||""),homeTeamId:Number.isInteger(i.homeTeamId)?i.homeTeamId:n.homeTeamId??null,awayTeamId:Number.isInteger(i.awayTeamId)?i.awayTeamId:n.awayTeamId??null,homeLogoUrl:c(i.homeLogoUrl||n.homeLogoUrl||"",n.homeLogoUrl||""),awayLogoUrl:c(i.awayLogoUrl||n.awayLogoUrl||"",n.awayLogoUrl||""),mackolikMatchPageId:Number.isInteger(i.mackolikMatchPageId)?i.mackolikMatchPageId:n.mackolikMatchPageId??null,matchcastId:Number.isInteger(i.matchcastId)?i.matchcastId:n.matchcastId??null,matchcastUrl:c(n.matchcastUrl||"",""),lastSyncedAt:Qe(s)?n.lastSyncedAt||new Date().toISOString():new Date().toISOString(),halftimeScore:c(i.halftimeScore||n.halftimeScore||"",n.halftimeScore||""),goalEvents:Array.isArray(n.goalEvents)?n.goalEvents.slice(-24):[],timelineEvents:Array.isArray(i.timelineEvents)?i.timelineEvents.slice(-32):Array.isArray(n.timelineEvents)?n.timelineEvents.slice(-32):[]};if(!Number.isInteger(i.homeGoals)||!Number.isInteger(i.awayGoals)){const f=(Qe(s)||u)&&!l&&(n.liveState==="live"||n.liveState==="halftime"||Ie(n,i));["scheduled","not_found","missing","unknown","suspended"].includes(s)&&!f&&!l&&(d.liveScore=null,d.goalAlertAt=null,d.goalAlertMessage=""),s==="scheduled"&&(d.halftimeScore="")}if(Number.isInteger(i.homeGoals)&&Number.isInteger(i.awayGoals)&&vt(n,i)){const f=M(n),v={homeGoals:i.homeGoals,awayGoals:i.awayGoals},b=s==="finished"&&p;if(f&&bt(f,v)&&!b)d.liveScore={homeGoals:f.homeGoals,awayGoals:f.awayGoals},d.liveNote=c(`${i.note||"CanlÄ± akÄ±ÅŸ gÃ¼ncellendi."} â€¢ Skor geriye dÃ¼ÅŸtÃ¼ÄŸÃ¼ iÃ§in son gÃ¼venilir skor korundu.`,"Skor geriye dÃ¼ÅŸtÃ¼ÄŸÃ¼ iÃ§in son gÃ¼venilir skor korundu.");else{d.liveScore=v;const m=v.homeGoals+v.awayGoals;if(f&&Number.isInteger(f.homeGoals)&&Number.isInteger(f.awayGoals)){const h=f.homeGoals+f.awayGoals;if(m>h){const w=c(As(n,f,d.liveScore),"Gol bildirimi");d.goalAlertAt=new Date().toISOString(),d.goalAlertMessage=w,d.goalEvents=ht(n,i,f,d.liveScore,w)}}else if(m>0&&(!Array.isArray(d.goalEvents)||!d.goalEvents.length)){const h=c(`Ä°lk yakalanan skor ${v.homeGoals}-${v.awayGoals}. Ã–nceki gol dakikalarÄ± kaynaktan alÄ±namadÄ±.`,"Ä°lk yakalanan skor.");d.goalEvents=ht(n,i,{},d.liveScore,h)}}if(s==="halftime"&&!d.halftimeScore){const m=Number.isInteger(d.liveScore?.homeGoals)?d.liveScore.homeGoals:i.homeGoals,h=Number.isInteger(d.liveScore?.awayGoals)?d.liveScore.awayGoals:i.awayGoals;d.halftimeScore=`${m}-${h}`}}if(s==="finished"&&Number.isInteger(i.homeGoals)&&Number.isInteger(i.awayGoals)&&(!n.result||n.result.source!=="manual")&&p&&vt(n,i)){const f=M(n),v={homeGoals:i.homeGoals,awayGoals:i.awayGoals};f&&bt(f,v)?(d.liveState=n.liveState||"not_found",d.liveStatusLabel=c(n.liveStatusLabel||"DoÄŸrulanamadÄ±","DoÄŸrulanamadÄ±"),d.liveScore={homeGoals:f.homeGoals,awayGoals:f.awayGoals},d.liveNote=c("Final sinyali geldi ama skor geriye dÃ¼ÅŸtÃ¼; yanlÄ±ÅŸ maÃ§ sonu kapanÄ±ÅŸÄ±nÄ± Ã¶nlemek iÃ§in son gÃ¼venilir canlÄ± skor korundu.","Skor geriye dÃ¼ÅŸtÃ¼ÄŸÃ¼ iÃ§in maÃ§ sonu otomatik kapanÄ±ÅŸ uygulanmadÄ±.")):(d.result={homeGoals:i.homeGoals,awayGoals:i.awayGoals,savedAt:new Date().toISOString(),source:i.source||"live_feed"},d.autoClosedAt=new Date().toISOString(),d.tracked=!1,d.liveNote=c(`${i.note||"MaÃ§ sonucu iÅŸlendi."} â€¢ Takip otomatik kapatÄ±ldÄ±.`,"MaÃ§ sonucu iÅŸlendi."))}else s==="finished"&&!p&&!ne(n)&&(d.liveState=n.liveState||"not_found",d.liveStatusLabel=c(n.liveStatusLabel||i.statusLabel||"DoÄŸrulanamadÄ±","DoÄŸrulanamadÄ±"),d.liveNote=c("Final sinyali alÄ±ndÄ± ancak kapanÄ±ÅŸ iÃ§in ek doÄŸrulama bekleniyor; yanlÄ±ÅŸ maÃ§ sonu kapanÄ±ÅŸÄ±nÄ± Ã¶nlemek iÃ§in takip aÃ§Ä±k tutuldu.","Final kapanÄ±ÅŸÄ± iÃ§in ek doÄŸrulama bekleniyor."));if(l){const f=Number.isInteger(i.homeGoals)&&Number.isInteger(i.awayGoals)?{homeGoals:i.homeGoals,awayGoals:i.awayGoals}:M(n)||M(d);f&&(d.liveState="finished",d.liveStatusLabel="MS",d.liveScore=f,d.result={homeGoals:f.homeGoals,awayGoals:f.awayGoals,savedAt:new Date().toISOString(),source:"stale_live_freeze"},d.autoClosedAt=new Date().toISOString(),d.tracked=!1,d.liveNote=c("CanlÄ± kaynak kapanmadÄ±; son bilinen skor maÃ§ sonu olarak sabitlendi.","MaÃ§ sonu sabitlendi."))}return ma(d)||(delete d.goalAlertAt,delete d.goalAlertMessage),d})}function xs(e){const a=e.filter(t=>t.tracked&&t.liveState!=="finished");return a.length?a.reduce((t,n)=>{const i=n.liveState==="live"?cn:n.liveState==="halftime"?un:at;return Math.min(t,i)},at):null}function gt(e){de&&(window.clearInterval(de),de=null);const a=xs(e);a&&(de=window.setInterval(()=>{De(!0)},a))}function ne(e){const a=!!(e?.result&&Number.isInteger(e.result.homeGoals)&&Number.isInteger(e.result.awayGoals));return!(!e?.autoClosedAt&&!a||e?.result?.source==="manual"&&!e?.autoClosedAt&&e?.tracked&&e?.liveState&&e.liveState!=="finished")}function Rs(e){if(ne(e))return!0;if(e?.tracked||!Ie(e))return!1;const a=Wa(e);if(!a)return!1;const t=M({...e,autoClosedAt:null,result:null})||e?.result||null;if(!t||!Number.isInteger(t.homeGoals)||!Number.isInteger(t.awayGoals))return!1;const n=new Date;if(n.getTime()-a.getTime()<10800*1e3)return!1;const s=new Date(e?.lastSyncedAt||0);if(Number.isFinite(s.getTime())&&n.getTime()-s.getTime()<1800*1e3)return!1;const l=D(e?.liveStatusLabel||"");return!(!Va(e?.liveStatusLabel)&&!Ot(e)&&l<85)}function V(e){return e?.tracked&&e?.liveState?e.liveState:ne(e)||!e?.tracked&&Rs(e)?"finished":e?.liveState||null}function Wa(e){const a=c(e?.matchDate||"","");if(!/^\d{4}-\d{2}-\d{2}$/.test(a))return null;const[t,n,i]=a.split("-").map(Number),s=c(e?.matchTime||"","00:00"),[l,o]=s.split(":").map(Number),u=new Date(t,(n||1)-1,i||1,l||0,o||0,0,0);return Number.isNaN(u.getTime())?null:u}function Yt(e,a){if(ne(e))return!1;const t=String(a?.state||e?.liveState||"").toLowerCase();if(!t||t==="finished"||t==="scheduled"||!Qe(t)&&t!=="unknown"||!(Number.isInteger(a?.homeGoals)&&Number.isInteger(a?.awayGoals)?{homeGoals:a.homeGoals,awayGoals:a.awayGoals}:M(e))||!Ie(e,a))return!1;const i=Wa(e);if(!i)return!1;const s=new Date;if(s.getTime()-i.getTime()<9900*1e3)return!1;const o=new Date(a?.syncedAt||e?.lastSyncedAt||0);return!(Number.isFinite(o.getTime())&&s.getTime()-o.getTime()<1500*1e3)}function M(e){return e?.tracked&&e?.liveState&&e.liveState!=="finished"?e.liveScore&&Number.isInteger(e.liveScore.homeGoals)&&Number.isInteger(e.liveScore.awayGoals)?e.liveScore:e.result?.source==="manual"&&Number.isInteger(e.result.homeGoals)&&Number.isInteger(e.result.awayGoals)?e.result:null:ne(e)?e.result||e.liveScore||null:e.liveScore&&Number.isInteger(e.liveScore.homeGoals)&&Number.isInteger(e.liveScore.awayGoals)?e.liveScore:e.result&&Number.isInteger(e.result.homeGoals)&&Number.isInteger(e.result.awayGoals)?e.result:null}function Fs(e){switch(V(e)){case"live":return`CanlÄ± â€¢ ${c(e.liveStatusLabel||"-","-")}`;case"halftime":return"Devre arasÄ±";case"finished":return"MaÃ§ sonucu kesinleÅŸti";case"scheduled":return`BaÅŸlama bilgisi â€¢ ${c(e.liveStatusLabel||"-","-")}`;case"suspended":return c(e.liveStatusLabel||"MaÃ§ askÄ±da","MaÃ§ askÄ±da");case"not_found":return M(e)?"Son bilinen canlÄ± veri":"CanlÄ± veri bulunamadÄ±";default:return e.tracked?"Takip beklemede":"Takibe alÄ±nmadÄ±"}}function _s(e,a){const t=[];return V(e)==="finished"?t.push("MaÃ§ sonucu iÅŸlendi ve takip otomatik kapatÄ±ldÄ±."):e.liveNote&&t.push(c(e.liveNote,"")),e.lastSyncedAt&&t.push(`Son gÃ¼ncelleme ${Xa(e.lastSyncedAt)}`),a?.summary&&e.result&&t.push(c(a.summary,"")),t.join(" â€¢ ")||(e.liveState==="not_found"&&M(e)?"Kaynak bu turda eÅŸleÅŸemedi; son bilinen skor gÃ¶steriliyor.":"CanlÄ± skor henÃ¼z Ã§ekilemedi.")}function Bs(e,a){if(a?.topHit===!0)return"hit";if(a?.topHit===!1)return"miss";const t=V(e);return t==="live"||t==="halftime"?"live":V(e)==="finished"?"neutral":"pending"}function Ds(e){if(!e?.result)return null;const a=(e.recommendations??[]).map(o=>ke(o.market,e.result)).filter(Boolean);if(!a.length)return{topHit:null,playedHit:null,summary:"Bu kayÄ±t iÃ§in otomatik karÅŸÄ±laÅŸtÄ±rma yapÄ±lamadÄ±."};const t=a.filter(o=>o.hit).length,n=ke(e.topRecommendation?.market,e.result),i=ke(e.playedMarket,e.result),s=n?.hit===!0?"Ana Ã¶neri tuttu":n?.hit===!1?"Ana Ã¶neri tutmadÄ±":"Ana Ã¶neri Ã¶lÃ§Ã¼lemedi",l=e.playedMarket?i?.hit===!0?`Senin kuponun tuttu (${e.playedMarket})`:i?.hit===!1?`Senin kuponun tutmadÄ± (${e.playedMarket})`:`Senin kuponun Ã¶lÃ§Ã¼lemedi (${e.playedMarket})`:"";return{topHit:n?.hit??null,playedHit:i?.hit??null,summary:`${s}${l?` â€¢ ${l}`:""} â€¢ ${t}/${a.length} Ã¶neri isabetli. Final skor: ${e.result.homeGoals}-${e.result.awayGoals}`}}function ke(e,a,t=null){if(!e||!a)return null;const n=A(String(e)),i=Number(a.homeGoals||0)+Number(a.awayGoals||0),s=Number(a.homeGoals||0)>Number(a.awayGoals||0),l=Number(a.homeGoals||0)===Number(a.awayGoals||0),o=Number(a.awayGoals||0)>Number(a.homeGoals||0),u=Number(a.homeGoals||0)>0&&Number(a.awayGoals||0)>0,p=ze(t?.halftimeScore||""),k=p.totalGoals||i,d=p.totalGoals?Math.max(0,i-p.totalGoals):null;if(n.startsWith("1X"))return{market:e,hit:s||l};if(n.startsWith("X2"))return{market:e,hit:o||l};if(n.startsWith("1 (")||n==="1")return{market:e,hit:s};if(n.startsWith("2 (")||n==="2")return{market:e,hit:o};if(n==="Beraberlik")return{market:e,hit:l};if(n==="2.5 Ãœst")return{market:e,hit:i>=3};if(n==="2.5 Alt")return{market:e,hit:i<=2};if(n==="3.5 Ãœst")return{market:e,hit:i>=4};if(n==="3.5 Alt")return{market:e,hit:i<=3};if(n==="KG Var")return{market:e,hit:u};if(n==="KG Yok")return{market:e,hit:!u};const f=n.match(/^(?:Ä°lk YarÄ±|Ä°Y)\s*(\d+)\.5\s*(Ãœst|Alt)$/i);if(f){const S=(Number(f[1])||0)+1,m=/Ãœst/i.test(f[2]);return{market:e,hit:m?k>=S:k<S}}const v=n.match(/^2Y\s*(\d+)\.5\s*(Ãœst|Alt)$/i);if(v&&d!==null){const S=(Number(v[1])||0)+1,m=/Ãœst/i.test(v[2]);return{market:e,hit:m?d>=S:d<S}}const b=n.match(/^MaÃ§ Sonu\s*(\d+)\.5\s*(Ãœst|Alt)$/i);if(b){const S=(Number(b[1])||0)+1,m=/Ãœst/i.test(b[2]);return{market:e,hit:m?i>=S:i<S}}return null}function qt(e){const a=t=>String(t??"").toLowerCase().replaceAll(/[^a-z0-9]+/g,"-").replaceAll(/^-+|-+$/g,"");return[e.homeTeam,e.awayTeam,e.matchDate].map(a).join("__")}function fa(e,a=""){const t=c(e,"-"),n=c(a,"");return n&&n!=="-"?`${t} â€¢ ${n}`:t}function Xa(e){const a=e?new Date(e):null;return!a||Number.isNaN(a.getTime())?"-":a.toLocaleString("tr-TR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}function Hs(e){const a=Array.isArray(e.topPicks)?e.topPicks.length:0,t=Array.isArray(e.avoidPicks)?e.avoidPicks.length:0;return`${e.scannedCount} maÃ§ incelendi. EÅŸik Ã¼stÃ¼nde kalan havuzdan en gÃ¼venilir ${a} seÃ§im ve uzak durulacak ${t} maÃ§ ayrÄ±ldÄ±.`}function jt(e,a=0){const t=String(e??"").replace(",",".").replace(/[^\d.+-]/g,""),n=Number.parseFloat(t);return Number.isFinite(n)?n:a}function Ps(e={},a={}){return[{code:"1",label:`${a.homeTeam||"Ev sahibi"} kazanÄ±r`,probability:Number(e.homeWin)||0,team:a.homeTeam||"Ev sahibi"},{code:"X",label:"Beraberlik",probability:Number(e.draw)||0,team:null},{code:"2",label:`${a.awayTeam||"Deplasman"} kazanÄ±r`,probability:Number(e.awayWin)||0,team:a.awayTeam||"Deplasman"}].sort((t,n)=>n.probability-t.probability)}function Vt(e){const a=Array.isArray(e.recentMatches)?e.recentMatches.map(i=>Gt(i)).slice(0,2):[];if(a.length<2)return{formLine:"",goalLine:""};const[t,n]=a;return{formLine:`Son maÃ§ formu: ${t.team} ${t.formLine}, ${n.team} ${n.formLine}.`,goalLine:`Gol ritmi: ${t.team} ${t.goalLine}; ${n.team} ${n.goalLine}.`}}function Fe(e){return T(e).toLowerCase().replaceAll(/[^a-z0-9]+/g," ").trim()}function Ja(e){const a=Array.isArray(e.leagueStandings)?e.leagueStandings:[],t=Fe(e.matchInfo?.homeTeam||""),n=Fe(e.matchInfo?.awayTeam||""),i=m=>a.find(h=>{const w=Fe(h.team);return w&&m&&(w.includes(m)||m.includes(w))})??null,s=i(t),l=i(n),o=c(e.standingsSummary,"");if(!s||!l)return{score:Math.max(40,Math.min(92,Number(e.confidenceScore)||0)),shortLine:o,reasonLine:o||"Puan tablosu verisi sÄ±nÄ±rlÄ± kaldÄ±."};const u=Number(s.points)||0,p=Number(l.points)||0,k=Number(s.position)||0,d=Number(l.position)||0,f=Math.abs(u-p),v=Math.abs(k-d),b=u===p&&k===d?"denge":u>p||k<d?"home":"away",S=b==="home"?e.matchInfo?.homeTeam||s.team:b==="away"?e.matchInfo?.awayTeam||l.team:"iki taraf";return{score:Math.max(42,Math.min(94,48+f*3+v*2)),shortLine:b==="denge"?`Puan tablosu dengede: ${s.team} ${s.position}. sÄ±ra ${s.points} puan, ${l.team} ${l.position}. sÄ±ra ${l.points} puan.`:`Puan tablosunda ${S} tarafÄ± Ã¶nde: ${f} puan ve ${v} sÄ±ra farkÄ± var.`,reasonLine:o||(b==="denge"?`Puan tablosunda net kopuÅŸ gÃ¶rÃ¼nmÃ¼yor; ${s.team} ${s.points}, ${l.team} ${l.points} puanda.`:`${S} puan tablosunda daha saÄŸlam konumda. ${f} puan ve ${v} sÄ±ra farkÄ± karar tarafÄ±nÄ± destekliyor.`)}}function Ue(e,a="analysis"){const t=e.matchInfo??{},n=e.probabilities??{},i=e.markets??{},s=e.recommendations?.[0]??null,l=Ps(n,t),o=l[0]??{label:"taraf pazarÄ±",probability:0,team:t.homeTeam||"Ev sahibi"},u=l[1]??{probability:0},p=Math.max(0,o.probability-u.probability),k=Number.isFinite(i.over25)?i.over25:50,d=Math.max(0,Math.min(100,100-k)),f=jt(i.projectedGoals,2.6),v=e.sourceStatus?.fallbackUsed||e.sourceStatus?.health==="limited",b=Number(e.confidenceScore)||0,S=Number(n.draw)||0,m=Number(n.bttsYes)||0,h=A(s?.market||o.label||""),w=c(e.decisionFactors?.[0]?.value,"veri sÄ±nÄ±rlÄ±"),W=c(e.decisionFactors?.[2]?.value,"veri sÄ±nÄ±rlÄ±"),H=h.startsWith("1 (")||h.startsWith("2 ("),P=Vt(e),E=Ja(e);let L=`${A(o.label)} tarafÄ± bir adÄ±m Ã¶nde gÃ¶rÃ¼nÃ¼yor.`;a==="avoid"||h.includes("Uzak Dur")?L="Bu maÃ§ta net avantaj yok; kupona zorla eklemek doÄŸru gÃ¶rÃ¼nmÃ¼yor.":h.includes("1X")?L=`${t.homeTeam||o.team} tarafÄ±nda doÄŸrudan sonuÃ§ yerine yenilmez Ã§izgi daha gÃ¼venli duruyor.`:h.includes("X2")?L=`${t.awayTeam||o.team} tarafÄ±nda doÄŸrudan sonuÃ§ yerine yenilmez Ã§izgi daha gÃ¼venli duruyor.`:h.includes("2.5 Alt")?L="MaÃ§Ä±n kontrollÃ¼ tempoda kalma ihtimali daha yÃ¼ksek; ana yÃ¶n 2.5 Alt.":h.includes("3.5 Alt")?L="Skor yÃ¼kselebilir ama 4 gole Ã§Ä±kacak kadar sert bir tempo gÃ¶rÃ¼nmÃ¼yor.":h.includes("2.5 Ãœst")||h.includes("2.5 Ãœst")?L="MaÃ§ aÃ§Ä±k oyuna daha yakÄ±n; ana yÃ¶n 2.5 Ãœst.":h.includes("KG Var")?L="Ä°ki takÄ±mÄ±n da gol bulma ihtimali canlÄ± gÃ¶rÃ¼nÃ¼yor.":h.includes("KG Yok")?L="Skor akÄ±ÅŸÄ± tek tarafa sÄ±kÄ±ÅŸabilir; karÅŸÄ±lÄ±klÄ± gol zor gÃ¶rÃ¼nÃ¼yor.":H&&(L=`${o.team} doÄŸrudan sonuÃ§ tarafÄ±nda bir adÄ±m Ã¶nde.`);let _=`Model ilk senaryoyu %${o.probability}, ikinci senaryoyu %${u.probability} gÃ¶rÃ¼yor.`;h.includes("Alt")?_=`Beklenen gol ${f.toFixed(2)} seviyesinde. ${P.goalLine||""} ${E.reasonLine||""} Alt tarafÄ±nÄ± %${d} destekliyor.`:h.includes("Ãœst")||h.includes("Ãœst")||h.includes("KG Var")?_=`Beklenen gol ${f.toFixed(2)} seviyesinde. ${P.goalLine||""} ${E.reasonLine||""} Ãœst tarafÄ±nÄ± %${k}, KG Var tarafÄ±nÄ± %${m} destekliyor.`:h.includes("1X")||h.includes("X2")||H?_=`Taraf ayrÄ±ÅŸmasÄ± %${p} seviyesinde. ${P.formLine||""} ${E.reasonLine||""} AÄŸÄ±rlÄ±klÄ± form ${w}.`:h.includes("Uzak Dur")&&(_=`Taraf ayrÄ±ÅŸmasÄ± yalnÄ±zca %${p}. ${P.formLine||""} ${E.reasonLine||""} Temiz fiyat avantajÄ± oluÅŸmuyor.`);let I=`Beraberlik oranÄ± hÃ¢lÃ¢ %${S}. Erken gol veya kÄ±rmÄ±zÄ± kart mevcut planÄ± hÄ±zlÄ± bozar.`;return v?I="Veri yedek akÄ±ÅŸtan geldiÄŸi iÃ§in maÃ§ ritmi deÄŸiÅŸirse bu yorum daha hÄ±zlÄ± bozulabilir.":a==="avoid"||h.includes("Uzak Dur")?I=`Model gÃ¼veni %${b} olsa da maÃ§Ä±n kÄ±rÄ±lma eÅŸiÄŸi dÃ¼ÅŸÃ¼k. Savunma dengesi ${W}.`:h.includes("Alt")?I="Erken gol gelirse maÃ§ aÃ§Ä±lÄ±r ve alt senaryosu hÄ±zla deÄŸer kaybeder.":(h.includes("Ãœst")||h.includes("Ãœst")||h.includes("KG Var"))&&(I="Taraflardan biri Ã¼retimde kilitlenirse aÃ§Ä±k oyun senaryosu beklenenden erken sÃ¶ner."),{verdict:c(L),reason:c(_),risk:c(I),marketLabel:h||o.label,primary:o,edge:p,projectedGoals:f,over25:k,under25:d}}function Ks(e,a){const t=Ue(e),n=e.probabilities??{},i=c(e.decisionFactors?.[2]?.value,"-"),s=c(e.decisionFactors?.[3]?.value,`${t.projectedGoals.toFixed(2)} gol`),l=Ja(e),o=e.aiLayerUsed?`${ie(a.label,a)} ve AI teyidi aktif.`:`${ie(a.label,a)} kullanÄ±ldÄ±. AI teyidi devrede deÄŸil.`;return[{label:"Kaynak ve gÃ¼ven",score:Number(e.confidenceScore)||0,detail:`${o} Genel model gÃ¼veni %${e.confidenceScore}.`},{label:"Taraf ayrÄ±ÅŸmasÄ±",score:Math.max(t.primary.probability,t.edge+45),detail:`1 %${n.homeWin??0} â€¢ X %${n.draw??0} â€¢ 2 %${n.awayWin??0}.`},{label:"Gol profili",score:Math.max(t.over25,t.under25),detail:`Gol beklentisi ${t.projectedGoals.toFixed(2)}. Tempo profili ${s}. Savunma dengesi ${i}.`},{label:"Puan tablosu",score:l.score,detail:l.reasonLine||`Ana Ã¶neri ${t.marketLabel}. Puan tablosu taraf gÃ¼cÃ¼nÃ¼ destekliyor.`}]}function Os(e){const a=c(e.standingsSummary,"");return a||"Puan tablosu verisi Ã§Ä±kmadÄ±. Bu analiz son maÃ§ formu ve skor ritmi Ã¼zerinden kuruldu."}function Us(e){const a=e.matchInfo?.homeTeam||"Ev sahibi",t=e.matchInfo?.awayTeam||"Deplasman",n=c(e.decisionFactors?.[0]?.value,"");return n?`${a} ve ${t} iÃ§in son form ritmi ${n} bandÄ±nda okunuyor. Tablo, kÄ±sa vade form yÃ¶nÃ¼nÃ¼ gÃ¶sterir.`:"Tablo, iki tarafÄ±n son form ritmini ve skor Ã¼retim dÃ¼zeyini birlikte gÃ¶sterir."}function Ys(e){const a=Array.isArray(e.h2hMatches)?e.h2hMatches.length:0;return a?`${a} H2H kaydÄ± bulundu. Bu tablo tek baÅŸÄ±na karar vermez; yalnÄ±z eÅŸleÅŸme hafÄ±zasÄ±nÄ± gÃ¶sterir.`:"Bu eÅŸleÅŸme iÃ§in okunabilir H2H verisi Ã§Ä±kmadÄ±. Karar yalnÄ±z gÃ¼ncel forma dayanÄ±yor."}function qs(e){const a=c(e?.matchInfo?.league,"").toLocaleLowerCase("tr-TR");if(!/(kupa|cup|eleme|play[ -]?off|rÃ¶vanÅŸ|yar[Ä±i] final|Ã§eyrek final|son 16|son 32|tur)/i.test(a))return null;const n=c(e?.matchInfo?.homeTeam,""),i=c(e?.matchInfo?.awayTeam,""),s=n.toLocaleLowerCase("tr-TR"),l=i.toLocaleLowerCase("tr-TR"),o=Array.isArray(e?.h2hMatches)?e.h2hMatches:[];for(const u of o){const p=c(u?.score,""),k=p.match(/(\d+)\s*[-:]\s*(\d+)/);if(!k)continue;const d=Number.parseInt(k[1],10)||0,f=Number.parseInt(k[2],10)||0,v=p.toLocaleLowerCase("tr-TR"),b=v.slice(0,k.index).trim(),S=v.slice((k.index||0)+k[0].length).trim();if(!(!b||!S)){if(b.includes(s)&&S.includes(l)){const m=d-f;return{detail:m===0?`Ä°lk maÃ§ dengede kapandÄ± (${d}-${f}). RÃ¶vanÅŸ senaryosu bu dengeyi doÄŸrudan etkiler.`:m>0?`Ä°lk maÃ§ta ${n} ${d}-${f} Ã¼stÃ¼nlÃ¼k aldÄ±. RÃ¶vanÅŸta korumalÄ± senaryolar daha deÄŸerli olabilir.`:`Ä°lk maÃ§ta ${i} ${f}-${d} Ã¼stÃ¼nlÃ¼k aldÄ±. RÃ¶vanÅŸ baskÄ±sÄ± oyunun yÃ¶nÃ¼nÃ¼ hÄ±zla deÄŸiÅŸtirebilir.`}}if(b.includes(l)&&S.includes(s)){const m=f-d;return{detail:m===0?`Ä°lk maÃ§ dengede kapandÄ± (${f}-${d}). RÃ¶vanÅŸ senaryosu bu dengeyi doÄŸrudan etkiler.`:m>0?`Ä°lk maÃ§ta ${i} ${f}-${d} Ã¼stÃ¼nlÃ¼k aldÄ±. RÃ¶vanÅŸta korumalÄ± senaryolar daha deÄŸerli olabilir.`:`Ä°lk maÃ§ta ${n} ${d}-${f} Ã¼stÃ¼nlÃ¼k aldÄ±. RÃ¶vanÅŸ baskÄ±sÄ± oyunun yÃ¶nÃ¼nÃ¼ hÄ±zla deÄŸiÅŸtirebilir.`}}}}return{detail:"Bu eÅŸleÅŸme eleme/kupa dinamiÄŸinde. Ä°lk maÃ§ skoru ve tur baskÄ±sÄ± normal lig maÃ§larÄ±na gÃ¶re daha fazla aÄŸÄ±rlÄ±k taÅŸÄ±r."}}function js(e){const a=A(e.topRecommendation?.market||"");return a?a.includes("1X")?`${e.homeTeam} yenilmez Ã§izgisi Ã¶ne Ã§Ä±ktÄ±. Model gÃ¼veni %${e.confidenceScore}.`:a.includes("X2")?`${e.awayTeam} yenilmez Ã§izgisi Ã¶ne Ã§Ä±ktÄ±. Model gÃ¼veni %${e.confidenceScore}.`:a.includes("Uzak Dur")?`Bu eÅŸleÅŸme iÃ§in uzak dur sinyali Ã¼retildi. Model gÃ¼veni %${e.confidenceScore}.`:`Ana Ã¶neri ${a}. Model gÃ¼veni %${e.confidenceScore}.`:`Ana Ã¶neri kaydÄ± yok. Model gÃ¼veni %${e.confidenceScore}.`}function be(e){if(e==null)return e;if(typeof e=="string")return T(e);if(Array.isArray(e))return e.map(a=>be(a));if(typeof e=="object"){const a={};for(const[t,n]of Object.entries(e))a[t]=be(n);return a}return e}function Qa(e){const a=String(e??"");if(!a.trim())return!1;const t=(a.match(/[\u00C3\u00C2\u00C5\u00C4\u00E2\uFFFD]/g)??[]).length,n=(a.match(/\uFFFD/g)??[]).length,i=(a.match(/[\x00-\x08\x0B-\x1F\x7F-\x9F]/g)??[]).length,s=(a.match(/\?{3,}/g)??[]).length*2,l=t+n+i+s;return t>=2?!0:l>=4}function ka(e,a="Beklenmeyen hata"){const t=String(e??"").replace(/^Error:\s*/i,"").trim(),n=c(t,"");return!n||Qa(n)?a:n}function c(e,a="-"){const t=T(e??""),n=String(t).replaceAll("\uFEFF","").replaceAll("�","").replaceAll("â€¢","â€¢").replaceAll("Ã¢‚¬¢","â€¢").replaceAll("â€“","-").replaceAll("â€”","-").replaceAll("â€™","'").replaceAll("â€œ",'"').replaceAll("â€",'"').replace(/\s*â€¢\s*/g," â€¢ ").replace(/\s+/g," ").trim();return Qa(n)?a:n||a}function O(e,a=170){const t=c(e,"");if(t.length<=a)return t;const n=t.slice(0,a),i=Math.max(n.lastIndexOf(". "),n.lastIndexOf(", "),n.lastIndexOf(" ")),s=i>=Math.floor(a*.55)?i:a;return`${n.slice(0,s).trimEnd()}...`}function ha(e){return e.map(a=>c(a,"")).filter(Boolean).join(" â€¢ ")}function ie(e,a=null,t=!1){if(t)return"Demo veri";const n=c(a?.mode,"").toLowerCase();if(n==="statistics_api")return"Ä°statistik API";if(n==="html_fallback")return"HTML yedek akÄ±ÅŸ";if(n==="html_direct")return"HTML Ã§Ã¶zÃ¼mleme";if(n==="html_source")return"Harici sayfa";const i=c(e,""),s=i.toLocaleLowerCase("tr-TR");if(s.includes("statistics")||s.includes("istatistik"))return"Ä°statistik API";if(s.includes("gÃ¼nlÃ¼k program")||s.includes("gÃ¼nlÃ¼k program")){const o=i.split("-").map(u=>c(u,"")).filter(Boolean).at(-1);return o?"Ä°ddaa gÃ¼nlÃ¼k programÄ± â€¢ "+o:"Ä°ddaa gÃ¼nlÃ¼k programÄ±"}return s.includes("yedek")?"HTML yedek akÄ±ÅŸ":s.includes("html")?"HTML Ã§Ã¶zÃ¼mleme":s.includes("harici")?"Harici sayfa":c(a?.label,"")||i||"Veri kaynaÄŸÄ±"}function Vs(e,a){const t=c(e,"");if(!t)return ie(a?.label,a);const n=t.replace(/^iddaa(?:\.com)?\s+istatistik servisi\s*/i,"").trim();if(n&&n!==t&&/(stad|stadyum|arena|park)/i.test(n))return n;const i=t.split(/\s(?:â€¢|-)\s/g).map(l=>c(l,"")).filter(Boolean);return i.find(l=>/(stad|stadyum|arena|park)/i.test(l))||i.at(-1)||t}function r(e){return $(c(e))}function He(e,a){e&&(e.innerHTML=T(String(a??"")),G(e))}function Ws(){wt.textContent="AI AyarlarÄ±",Lt.textContent="Temizle",ce&&(ce.textContent="Analiz Et"),ue&&(ue.textContent="MaÃ§larÄ± Tara"),J&&(J.textContent="CanlÄ± MaÃ§larÄ± Sorgula"),B.placeholder="GeÃ§miÅŸ skor, maÃ§ detay, gÃ¼nlÃ¼k program veya canlÄ± program baÄŸlantÄ±sÄ±nÄ± yapÄ±ÅŸtÄ±r",Pe.placeholder="Ã–rnek: SÃ¼per Lig, Premier League, Serie A",Y&&(Y.placeholder="Ã–rnek: Premier League, SÃ¼per Lig"),q&&(q.placeholder="Ã–rnek: U19, KadÄ±n, GenÃ§ler"),N&&(N.placeholder="Ã–rnek: Avrupa Ã¼st ligler");const e=document.querySelector('label[for="scanPresetSelect"] span');e&&(e.textContent="Lig ÅŸablonu");const a=document.querySelector('label[for="scanPresetName"] span');if(a&&(a.textContent="Åablon adÄ±"),F){const t=F.querySelector('option[value=""]');t&&(t.textContent="Bir ÅŸablon seÃ§")}}function G(e){if(!e||typeof document>"u")return;const a=e.nodeType===1||e.nodeType===9?e:document.body;if(!a)return;const t=l=>T(String(l??"")).replaceAll("�"," ").replaceAll("�"," ").replace(/\s{2,}/g," ").trim(),n=document.createTreeWalker(a,NodeFilter.SHOW_TEXT,{acceptNode(l){if(!l||!l.nodeValue)return NodeFilter.FILTER_REJECT;const o=l.parentElement;if(!o)return NodeFilter.FILTER_REJECT;const u=o.tagName;return u==="SCRIPT"||u==="STYLE"||u==="NOSCRIPT"||u==="TEXTAREA"?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}}),i=[];for(;n.nextNode();){const l=n.currentNode,o=l.nodeValue??"",u=t(o);u&&u!==o&&i.push([l,u])}i.forEach(([l,o])=>{l.nodeValue=o});const s=["placeholder","title","aria-label","aria-description"];a.querySelectorAll?.("*")?.forEach(l=>{if(s.forEach(o=>{const u=l.getAttribute?.(o);if(!u)return;const p=t(u);p&&p!==u&&l.setAttribute(o,p)}),l instanceof HTMLInputElement&&(l.type==="button"||l.type==="submit"||l.type==="reset")&&l.value){const u=t(l.value);u&&u!==l.value&&(l.value=u)}})}function ta(e){return(String(e??"").match(/[\u00C3\u00C2\u00C5\u00C4\u00E2\uFFFD]/g)??[]).length}function Wt(e){return ta(e)}typeof globalThis<"u"&&(globalThis.mojibakeScore=Wt);typeof window<"u"&&(window.mojibakeScore=Wt);const Xs=Object.freeze({8364:128,8218:130,402:131,8222:132,8230:133,8224:134,8225:135,710:136,8240:137,352:138,8249:139,338:140,381:142,8216:145,8217:146,8220:147,8221:148,8226:149,8211:150,8212:151,732:152,8482:153,353:154,8250:155,339:156,382:158,376:159});function Js(e){const a=String(e??""),t=[];for(const n of a){const i=n.charCodeAt(0);if(i<=255){t.push(i);continue}const s=Xs[i];if(s==null)return a;t.push(s)}try{return new TextDecoder("utf-8",{fatal:!1}).decode(new Uint8Array(t))}catch{return a}}function Qs(e){let a=String(e??"");for(let t=0;t<6;t+=1){let n=a;for(const[s,l]of pn)n=n.replaceAll(s,l);const i=Js(n);if(i&&i!==n){const s=ta(n),l=ta(i);(l<s||l===s&&i.length>=n.length-2)&&(n=i)}if(n===a)break;a=n}return a.normalize("NFC")}function T(e){const a=String(e??"");if(!a)return"";let t=a;if(fn.test(a)){const i=Qs(a);i&&i.length>=Math.max(1,a.length-4)&&(t=i)}return kn.reduce((i,[s,l])=>i.replaceAll(s,l),t)}function $(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}
