var e=Object.defineProperty,t=(t,n)=>{let r={};for(var i in t)e(r,i,{get:t[i],enumerable:!0});return n||e(r,Symbol.toStringTag,{value:`Module`}),r};(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var n=class extends Error{},r=`armory-app:data:v1`,i=`armory-app:unreadable-copy`,a={in_store:{label:`في المستودع`,tone:`ok`},issued:{label:`مسلّم`,tone:`warn`},maintenance:{label:`في الصيانة`,tone:`info`},unserviceable:{label:`عاطل`,tone:`muted`},lost:{label:`مفقود`,tone:`danger`}},o={w_add:{label:`إدخال سلاح`,icon:`plus`,group:`weapons`},w_issue:{label:`تسليم سلاح`,icon:`issue`,group:`weapons`},w_return:{label:`إرجاع سلاح`,icon:`return`,group:`weapons`},w_status:{label:`تغيير حالة سلاح`,icon:`wrench`,group:`weapons`},w_remove:{label:`شطب سلاح`,icon:`trash`,group:`weapons`},a_in:{label:`استلام عتاد وارد`,icon:`receive`,group:`ammo`},a_issue:{label:`صرف عتاد`,icon:`issue`,group:`ammo`},a_return:{label:`إرجاع عتاد`,icon:`return`,group:`ammo`},a_consume:{label:`استهلاك عتاد`,icon:`flame`,group:`ammo`},a_out:{label:`إخراج عتاد`,icon:`send`,group:`ammo`},a_adjust:{label:`تسوية جرد`,icon:`scale`,group:`ammo`}},s=e=>String(e??``).replace(/[٠-٩]/g,e=>String(e.charCodeAt(0)-1632)).replace(/[۰-۹]/g,e=>String(e.charCodeAt(0)-1776)),c=e=>String(e??``).replace(/[\u2066-\u2069]/g,``).trim().replace(/\s+/g,` `),l=e=>s(c(e)),u=()=>globalThis.crypto?.randomUUID?.()??`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`,d=e=>[e.rank,e.name].filter(Boolean).join(` `),f=e=>`${e.model||e.type} — ${e.serial}`,p=e=>[e.name,e.caliber].filter(Boolean).join(` `)+(e.lot?` (وجبة ${e.lot})`:``);function m(e,t,{allowZero:r=!1}={}){let i=s(e).trim().replace(/[,،]/g,``),a=i===``?NaN:Number(i);if(!Number.isInteger(a)||a<0||!r&&a===0)throw new n(`${t} يجب أن تكون عدداً صحيحاً ${r?`لا يقل عن صفر`:`أكبر من صفر`}`);return a}function h(e,t){if(!e)return t().toISOString();let r=new Date(e);if(Number.isNaN(r.getTime()))throw new n(`التاريخ غير صحيح`);return r.toISOString()}function g(){return{version:1,settings:{unitName:``,keeperName:``,commanderName:``,lastBackupAt:null,lock:null},people:[],weapons:[],ammo:[],log:[]}}function _(e){if(!e||typeof e!=`object`||[`people`,`weapons`,`ammo`,`log`].some(t=>!Array.isArray(e[t])))throw new n(`الملف ليس نسخة احتياطية من هذا التطبيق`);let t=g(),r=e=>e&&typeof e==`object`&&typeof e.id==`string`;return{version:1,settings:{...t.settings,...e.settings&&typeof e.settings==`object`?e.settings:{}},people:e.people.filter(e=>r(e)&&e.name),weapons:e.weapons.filter(e=>r(e)&&e.serial).map(e=>a[e.status]?e:{...e,status:`in_store`,holderId:null}),ammo:e.ammo.filter(e=>r(e)&&e.name),log:e.log.filter(e=>r(e)&&o[e.kind]&&!Number.isNaN(new Date(e.at).getTime()))}}function ee({storage:e=globalThis.localStorage,now:t=()=>new Date}={}){let s=!0,ee=null,v=null,y=te(),b=null,x=new Set;function te(){let t=null;try{t=e?e.getItem(r):null,e||(s=!1)}catch{s=!1}if(!t)return g();try{let e=_(JSON.parse(t));return v=t,e}catch{try{e.setItem(i,t)}catch{}return ee=`تعذّرت قراءة البيانات المحفوظة، فبدأ التطبيق بسجل فارغ. احتُفظ بالنسخة التالفة على الجهاز.`,g()}}function S(t){let i=t();if(b=null,s){let t=JSON.stringify(y);try{e.setItem(r,t),v=t}catch{throw y=v?_(JSON.parse(v)):g(),x.forEach(e=>e()),new n(`تعذّر الحفظ: مساحة التخزين على هذا الجهاز ممتلئة أو محجوبة`)}}return x.forEach(e=>e()),i}let C=e=>y.log.push({id:u(),...e}),w=e=>y.people.find(t=>t.id===e),T=e=>y.weapons.find(t=>t.id===e),E=e=>y.ammo.find(t=>t.id===e),D=(e,t)=>{if(!e)throw new n(t);return e};function O(){if(b)return b;let e=new Map;for(let t of y.log){if(!t.ammoId)continue;let n=e.get(t.ammoId);n||e.set(t.ammoId,n={store:0,issued:0,byPerson:new Map});let r=t.qty||0,i=e=>{let r=(n.byPerson.get(t.personId)||0)+e;r?n.byPerson.set(t.personId,r):n.byPerson.delete(t.personId),n.issued+=e};switch(t.kind){case`a_in`:case`a_adjust`:n.store+=r;break;case`a_out`:n.store-=r;break;case`a_issue`:n.store-=r,i(r);break;case`a_return`:n.store+=r,i(-r);break;case`a_consume`:i(-r)}}return b=e}let k=e=>O().get(e)||{store:0,issued:0,byPerson:new Map};function A(e){let t=y.weapons.filter(t=>t.status===`issued`&&t.holderId===e),n=[];for(let t of y.ammo){let r=k(t.id).byPerson.get(e)||0;r&&n.push({ammo:t,qty:r})}return{weapons:t,ammo:n}}function j(e,t){let r={name:c(e.name),rank:c(e.rank),milNo:l(e.milNo),platoon:c(e.platoon),phone:l(e.phone),notes:c(e.notes)};if(!r.name)throw new n(`اكتب اسم المنتسب`);if(r.milNo&&y.people.some(e=>e.id!==t&&e.milNo===r.milNo))throw new n(`الرقم العسكري ${r.milNo} مسجّل لمنتسب آخر`);return r}function ne(e,t){let r={type:c(e.type),model:c(e.model),serial:l(e.serial),caliber:c(e.caliber),location:c(e.location),notes:c(e.notes)};if(!r.type&&!r.model)throw new n(`اكتب نوع السلاح أو طرازه`);if(!r.serial)throw new n(`اكتب الرقم التسلسلي للسلاح`);let i=e=>`${e.type}|${e.model}|${e.serial}`.toLowerCase();if(y.weapons.some(e=>e.id!==t&&i(e)===i(r)))throw new n(`السلاح ${r.model||r.type} بالرقم التسلسلي ${r.serial} مسجّل مسبقاً`);return r}function M(e,t){let r={name:c(e.name),caliber:c(e.caliber),lot:l(e.lot),unit:c(e.unit)||`طلقة`,minQty:e.minQty?m(e.minQty,`الحد الأدنى`,{allowZero:!0}):0,location:c(e.location),notes:c(e.notes)};if(!r.name)throw new n(`اكتب اسم صنف العتاد`);let i=e=>`${e.name}|${e.caliber}|${e.lot}`.toLowerCase();if(y.ammo.some(e=>e.id!==t&&i(e)===i(r)))throw new n(`هذا الصنف مسجّل مسبقاً بنفس العيار ورقم الوجبة`);return r}return{get data(){return y},get persistent(){return s},get loadProblem(){return ee},subscribe(e){return x.add(e),()=>x.delete(e)},findPerson:w,findWeapon:T,findAmmo:E,balanceOf:k,custodyOf:A,updateSettings(e){return S(()=>{y.settings={...y.settings,...e}})},addPerson(e){let n=j(e);return S(()=>{let e={id:u(),...n,createdAt:t().toISOString()};return y.people.push(e),e})},updatePerson(e,t){let n=D(w(e),`المنتسب غير موجود`),r=j(t,e);return S(()=>Object.assign(n,r))},removePerson(e){D(w(e),`المنتسب غير موجود`);let t=A(e);if(t.weapons.length||t.ammo.length)throw new n(`لا يمكن حذف منتسب بذمته أسلحة أو أعتدة. أرجعها أولاً`);return S(()=>{y.people=y.people.filter(t=>t.id!==e)})},addWeapon(e,{at:n,note:r}={}){let i=ne(e),a=h(n,t);return S(()=>{let e={id:u(),...i,status:`in_store`,holderId:null,createdAt:t().toISOString()};return y.weapons.push(e),C({at:a,kind:`w_add`,weaponId:e.id,w:f(e),note:c(r)}),e})},updateWeapon(e,t){let n=D(T(e),`السلاح غير موجود`),r=ne(t,e);return S(()=>Object.assign(n,r))},removeWeapon(e,{note:r}={}){let i=D(T(e),`السلاح غير موجود`);if(i.status===`issued`)throw new n(`السلاح بذمة منتسب. أرجعه أولاً ثم اشطبه`);return S(()=>{C({at:t().toISOString(),kind:`w_remove`,weaponId:e,w:f(i),from:i.status,note:c(r)}),y.weapons=y.weapons.filter(t=>t.id!==e)})},issueWeapon(e,r,{at:i,note:o}={}){let s=D(T(e),`اختر السلاح`),l=D(w(r),`اختر المنتسب المستلم`);if(s.status!==`in_store`)throw new n(`لا يمكن تسليم السلاح: حالته الآن «${a[s.status].label}»`);let u=h(i,t);return S(()=>{s.status=`issued`,s.holderId=l.id,C({at:u,kind:`w_issue`,weaponId:s.id,personId:l.id,w:f(s),p:d(l),note:c(o)})})},returnWeapon(e,{status:r=`in_store`,at:i,note:a}={}){let o=D(T(e),`اختر السلاح`);if(o.status!==`issued`)throw new n(`السلاح ليس بذمة أحد`);if(![`in_store`,`maintenance`,`unserviceable`,`lost`].includes(r))throw new n(`اختر حالة السلاح`);let s=w(o.holderId),l=h(i,t);return S(()=>{C({at:l,kind:r===`lost`?`w_status`:`w_return`,weaponId:o.id,personId:o.holderId,w:f(o),p:s?d(s):``,from:`issued`,to:r,note:c(a)}),o.status=r,o.holderId=null})},setWeaponStatus(e,r,{at:i,note:o}={}){let s=D(T(e),`اختر السلاح`);if(s.status===`issued`)throw new n(`السلاح بذمة منتسب. استخدم «إرجاع» لإنهاء الذمة`);if(!a[r]||r===`issued`)throw new n(`اختر الحالة الجديدة`);if(r===s.status)throw new n(`هذه هي حالة السلاح الحالية`);let l=h(i,t);return S(()=>{C({at:l,kind:`w_status`,weaponId:s.id,w:f(s),from:s.status,to:r,note:c(o)}),s.status=r})},addAmmo(e,{qty:n,at:r,note:i}={}){let a=M(e),o=n?m(n,`الكمية الأولية`,{allowZero:!0}):0,s=h(r,t);return S(()=>{let e={id:u(),...a,createdAt:t().toISOString()};return y.ammo.push(e),o&&C({at:s,kind:`a_in`,ammoId:e.id,qty:o,a:p(e),u:e.unit,note:c(i)||`رصيد افتتاحي`}),e})},updateAmmo(e,t){let n=D(E(e),`الصنف غير موجود`),r=M(t,e);return S(()=>Object.assign(n,r))},removeAmmo(e){D(E(e),`الصنف غير موجود`);let t=k(e);if(t.issued)throw new n(`بعض هذا العتاد بذمة منتسبين. أرجعه أو سجّل استهلاكه أولاً`);if(t.store)throw new n(`في المستودع رصيد من هذا الصنف. سجّل إخراجه أو صفّره بتسوية جرد أولاً`);return S(()=>{y.ammo=y.ammo.filter(t=>t.id!==e)})},ammoMove(e,{ammoId:r,personId:i,qty:a,counted:s,at:l,note:u}={}){if(o[e]?.group!==`ammo`)throw new n(`نوع حركة غير معروف`);let f=D(E(r),`اختر صنف العتاد`),g=k(f.id),_={kind:e,ammoId:f.id,a:p(f),u:f.unit,note:c(u)};if(e===`a_adjust`){let e=m(s,`الكمية الموجودة فعلاً`,{allowZero:!0});if(e===g.store)throw new n(`الكمية مطابقة لرصيد المستودع، لا حاجة للتسوية`);_.qty=e-g.store,_.counted=e}else{let t=m(a,`الكمية`);if(_.qty=t,e===`a_issue`||e===`a_return`||e===`a_consume`){let r=D(w(i),`اختر المنتسب`);if(_.personId=r.id,_.p=d(r),e!==`a_issue`){let e=g.byPerson.get(r.id)||0;if(t>e)throw new n(`بذمة ${d(r)} ${e} ${f.unit} فقط من هذا الصنف`)}}if((e===`a_issue`||e===`a_out`)&&t>g.store)throw new n(`الرصيد في المستودع ${g.store} ${f.unit} فقط`)}return _.at=h(l,t),S(()=>C(_))},exportJSON(){let e={app:`armory-app`,exportedAt:t().toISOString(),...y,settings:{...y.settings,lock:null}};return JSON.stringify(e,null,2)},markBackedUp(){return S(()=>{y.settings.lastBackupAt=t().toISOString()})},importJSON(e){let t;try{t=JSON.parse(e)}catch{throw new n(`تعذّرت قراءة الملف`)}let r=_(t);return S(()=>{r.settings.lock=y.settings.lock,y=r})},reset(){return S(()=>{let e=y.settings.lock;y=g(),y.settings.lock=e})}}}var v={home:[[`path`,{d:`M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8`}],[`path`,{d:`M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z`}]],weapon:[[`circle`,{cx:`12`,cy:`12`,r:`10`}],[`line`,{x1:`22`,x2:`18`,y1:`12`,y2:`12`}],[`line`,{x1:`6`,x2:`2`,y1:`12`,y2:`12`}],[`line`,{x1:`12`,x2:`12`,y1:`6`,y2:`2`}],[`line`,{x1:`12`,x2:`12`,y1:`22`,y2:`18`}]],ammo:[[`path`,{d:`M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z`}],[`path`,{d:`m7 16.5-4.74-2.85`}],[`path`,{d:`m7 16.5 5-3`}],[`path`,{d:`M7 16.5v5.17`}],[`path`,{d:`M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z`}],[`path`,{d:`m17 16.5-5-3`}],[`path`,{d:`m17 16.5 4.74-2.85`}],[`path`,{d:`M17 16.5v5.17`}],[`path`,{d:`M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z`}],[`path`,{d:`M12 8 7.26 5.15`}],[`path`,{d:`m12 8 4.74-2.85`}],[`path`,{d:`M12 13.5V8`}]],people:[[`path`,{d:`M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2`}],[`path`,{d:`M16 3.128a4 4 0 0 1 0 7.744`}],[`path`,{d:`M22 21v-2a4 4 0 0 0-3-3.87`}],[`circle`,{cx:`9`,cy:`7`,r:`4`}]],log:[[`path`,{d:`M15 12h-5`}],[`path`,{d:`M15 8h-5`}],[`path`,{d:`M19 17V5a2 2 0 0 0-2-2H4`}],[`path`,{d:`M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3`}]],settings:[[`path`,{d:`M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915`}],[`circle`,{cx:`12`,cy:`12`,r:`3`}]],plus:[[`path`,{d:`M5 12h14`}],[`path`,{d:`M12 5v14`}]],search:[[`path`,{d:`m21 21-4.34-4.34`}],[`circle`,{cx:`11`,cy:`11`,r:`8`}]],close:[[`path`,{d:`M18 6 6 18`}],[`path`,{d:`m6 6 12 12`}]],back:[[`path`,{d:`M5 12h14`}],[`path`,{d:`m12 5 7 7-7 7`}]],chevron:[[`path`,{d:`m15 18-6-6 6-6`}]],edit:[[`path`,{d:`M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z`}],[`path`,{d:`m15 5 4 4`}]],trash:[[`path`,{d:`M10 11v6`}],[`path`,{d:`M14 11v6`}],[`path`,{d:`M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6`}],[`path`,{d:`M3 6h18`}],[`path`,{d:`M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2`}]],issue:[[`path`,{d:`m18 9-6-6-6 6`}],[`path`,{d:`M12 3v14`}],[`path`,{d:`M5 21h14`}]],return:[[`path`,{d:`M12 17V3`}],[`path`,{d:`m6 11 6 6 6-6`}],[`path`,{d:`M19 21H5`}]],wrench:[[`path`,{d:`M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z`}]],alert:[[`path`,{d:`m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3`}],[`path`,{d:`M12 9v4`}],[`path`,{d:`M12 17h.01`}]],print:[[`path`,{d:`M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2`}],[`path`,{d:`M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6`}],[`rect`,{x:`6`,y:`14`,width:`12`,height:`8`,rx:`1`}]],sheet:[[`path`,{d:`M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z`}],[`path`,{d:`M14 2v5a1 1 0 0 0 1 1h5`}],[`path`,{d:`M8 13h2`}],[`path`,{d:`M14 13h2`}],[`path`,{d:`M8 17h2`}],[`path`,{d:`M14 17h2`}]],backup:[[`path`,{d:`M12 2v8`}],[`path`,{d:`m16 6-4 4-4-4`}],[`rect`,{width:`20`,height:`8`,x:`2`,y:`14`,rx:`2`}],[`path`,{d:`M6 18h.01`}],[`path`,{d:`M10 18h.01`}]],restore:[[`path`,{d:`m16 6-4-4-4 4`}],[`path`,{d:`M12 2v8`}],[`rect`,{width:`20`,height:`8`,x:`2`,y:`14`,rx:`2`}],[`path`,{d:`M6 18h.01`}],[`path`,{d:`M10 18h.01`}]],lock:[[`rect`,{width:`18`,height:`11`,x:`3`,y:`11`,rx:`2`,ry:`2`}],[`path`,{d:`M7 11V7a5 5 0 0 1 10 0v4`}]],unlock:[[`rect`,{width:`18`,height:`11`,x:`3`,y:`11`,rx:`2`,ry:`2`}],[`path`,{d:`M7 11V7a5 5 0 0 1 9.9-1`}]],shield:[[`path`,{d:`M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z`}],[`path`,{d:`m9 12 2 2 4-4`}]],flame:[[`path`,{d:`M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4`}]],scale:[[`path`,{d:`M12 3v18`}],[`path`,{d:`m19 8 3 8a5 5 0 0 1-6 0zV7`}],[`path`,{d:`M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1`}],[`path`,{d:`m5 8 3 8a5 5 0 0 1-6 0zV7`}],[`path`,{d:`M7 21h10`}]],receive:[[`path`,{d:`M12 22V12`}],[`path`,{d:`M16 17h6`}],[`path`,{d:`M19 14v6`}],[`path`,{d:`M21 10.535V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.729l7 4a2 2 0 0 0 2 .001l1.675-.955`}],[`path`,{d:`M3.29 7 12 12l8.71-5`}],[`path`,{d:`m7.5 4.27 8.997 5.148`}]],send:[[`path`,{d:`M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z`}],[`path`,{d:`m21.854 2.147-10.94 10.939`}]],user:[[`path`,{d:`M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2`}],[`circle`,{cx:`12`,cy:`7`,r:`4`}]],info:[[`circle`,{cx:`12`,cy:`12`,r:`10`}],[`path`,{d:`M12 16v-4`}],[`path`,{d:`M12 8h.01`}]],erase:[[`path`,{d:`M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21`}],[`path`,{d:`m5.082 11.09 8.828 8.828`}]],key:[[`path`,{d:`M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z`}],[`circle`,{cx:`16.5`,cy:`7.5`,r:`.5`,fill:`currentColor`}]],data:[[`ellipse`,{cx:`12`,cy:`5`,rx:`9`,ry:`3`}],[`path`,{d:`M3 5V19A9 3 0 0 0 21 19V5`}],[`path`,{d:`M3 12A9 3 0 0 0 21 12`}]],"no-results":[[`path`,{d:`m13.5 8.5-5 5`}],[`path`,{d:`m8.5 8.5 5 5`}],[`circle`,{cx:`11`,cy:`11`,r:`8`}],[`path`,{d:`m21 21-4.3-4.3`}]],empty:[[`polyline`,{points:`22 12 16 12 14 15 10 15 8 12 2 12`}],[`path`,{d:`M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z`}]],check:[[`circle`,{cx:`12`,cy:`12`,r:`10`}],[`path`,{d:`m16 9-5.5 5.5L8 12`}]],phone:[[`rect`,{width:`14`,height:`20`,x:`5`,y:`2`,rx:`2`,ry:`2`}],[`path`,{d:`M12 18h.01`}]],download:[[`path`,{d:`M12 15V3`}],[`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`}],[`path`,{d:`m7 10 5 5 5-5`}]]},y=e=>String(e).replace(/&/g,`&amp;`).replace(/"/g,`&quot;`);function b(e){let t=v[e];return t?`<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${t.map(([e,t])=>`<${e} ${Object.entries(t).map(([e,t])=>`${e}="${y(t)}"`).join(` `)}/>`).join(``)}</svg>`:``}var x=e=>`<i class="ic" data-icon="${e}" data-drawn>${b(e)}</i>`;function te(e=document){e.querySelectorAll(`[data-icon]:not([data-drawn])`).forEach(e=>{e.innerHTML=b(e.dataset.icon),e.dataset.drawn=``})}var S=t({isAndroidApp:()=>w,print:()=>D,saveFile:()=>E}),C=globalThis.AndroidBridge,w=!!C,T=null;globalThis.__armoryFileSaved=e=>{let t=T;T=null,t?.(e)};function E(e,t,n){return T?.(`cancelled`),new Promise(r=>{T=r,C.saveFile(e,t.split(`;`)[0],n)})}var D=e=>C.print(e),O=e=>String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]),k=e=>Number(e||0).toLocaleString(`en-US`),A=e=>String(e).padStart(2,`0`),j=e=>{let t=new Date(e);return`${t.getFullYear()}/${A(t.getMonth()+1)}/${A(t.getDate())}`},ne=e=>{let t=new Date(e);return`${A(t.getHours())}:${A(t.getMinutes())}`},M=e=>`${j(e)} ${ne(e)}`,re=(e=new Date)=>`${e.getFullYear()}-${A(e.getMonth()+1)}-${A(e.getDate())}T${A(e.getHours())}:${A(e.getMinutes())}`,ie=e=>{let t=new Date(e);return`${t.getFullYear()}-${A(t.getMonth()+1)}-${A(t.getDate())}`},ae=e=>s(e).toLowerCase().replace(/[ً-ْـ]/g,``).replace(/[أإآ]/g,`ا`).replace(/ة/g,`ه`).replace(/ى/g,`ي`),oe=(e,...t)=>{let n=ae(e).trim();return!n||n.split(/\s+/).every(e=>ae(t.filter(Boolean).join(` `)).includes(e))},se=/[0-9][0-9A-Za-z.]*(?:\s?[×xX*-]\s?[0-9][0-9A-Za-z.]*)+/g;function ce(e){let t=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);for(let e=t.nextNode();e;e=t.nextNode()){if(e.parentNode.nodeName===`TEXTAREA`||e.data.includes(`⁦`))continue;let t=e.data.replace(se,e=>`\u2066${e}\u2069`);t!==e.data&&(e.data=t)}}var le;function N(e,t=`ok`){let n=document.getElementById(`toast`);n.innerHTML=`${x(t===`error`?`alert`:`check`)}<span>${O(e)}</span>`,ce(n),n.className=`toast show ${t}`,clearTimeout(le),le=setTimeout(()=>{n.className=`toast`},2600)}var ue=()=>document.getElementById(`sheet`),de=!1,fe=!1,pe=null;function me(){let e=ue();e.addEventListener(`close`,()=>{e.innerHTML=``,de&&(de=!1,fe=!0,history.back())}),e.addEventListener(`click`,t=>{t.target===e&&e.close()}),window.addEventListener(`popstate`,()=>{if(fe){if(fe=!1,pe!==null){let e=pe;pe=null,location.hash=e}}else e.open&&(de=!1,e.close())})}function P(e){fe?pe=e:location.hash=e}function F({title:e,body:t,submitLabel:r=`حفظ`,tone:i=`primary`,onSubmit:a,onOpen:o}){let s=ue();if(s.open)return;s.innerHTML=`
    <form class="sheet" novalidate>
      <header class="sheet-head">
        <h2>${O(e)}</h2>
        <button type="button" class="icon-btn" data-close aria-label="إغلاق">${x(`close`)}</button>
      </header>
      <div class="sheet-body">${t}</div>
      <p class="form-error" role="alert" hidden></p>
      <footer class="sheet-foot">
        <button type="submit" class="btn ${i}">${O(r)}</button>
        <button type="button" class="btn ghost" data-close>إلغاء</button>
      </footer>
    </form>`;let c=s.querySelector(`form`),l=c.querySelector(`.form-error`);c.querySelectorAll(`[data-close]`).forEach(e=>e.addEventListener(`click`,()=>s.close())),ye(c),c.addEventListener(`submit`,async e=>{e.preventDefault(),l.hidden=!0;try{await a(Object.fromEntries(new FormData(c)),c),s.close()}catch(e){e instanceof n||console.error(e),l.innerHTML=`${x(`alert`)} ${O(e instanceof n?e.message:`حدث خطأ غير متوقع، حاول مرة أخرى`)}`,l.hidden=!1,l.scrollIntoView({block:`nearest`})}}),ce(c),history.pushState({sheet:!0},``),de=!0,s.showModal(),matchMedia(`(pointer: fine)`).matches?c.querySelector(`.sheet-body input:not([type=hidden]):not([type=radio]), .sheet-body textarea`)?.focus():s.querySelector(`.sheet`).focus(),o?.(c)}var he=({title:e,message:t,confirmLabel:n,tone:r=`danger`,extra:i=``,validate:a})=>new Promise(o=>{let s=!1;F({title:e,submitLabel:n,tone:r,body:`<p class="sheet-text">${t}</p>${i}`,onSubmit:e=>{a?.(e),s=e}}),ue().addEventListener(`close`,()=>o(s),{once:!0})});function I({label:e,name:t,value:n=``,type:r=`text`,placeholder:i=``,list:a=``,inputmode:o=``,required:s=!1,hint:c=``,mono:l=!1}){return`<label class="field">
    <span class="field-label">${O(e)}${s?` <b class="req" aria-hidden="true">*</b>`:``}</span>
    <input class="input${l?` mono`:``}" name="${t}" type="${r}" value="${O(n)}" placeholder="${O(i)}"
      ${a?`list="${a}"`:``} ${o?`inputmode="${o}"`:``} autocomplete="off" ${s?`aria-required="true"`:``}>
    ${c?`<small class="field-hint">${c}</small>`:``}
  </label>`}var ge=({label:e,name:t,value:n=``,placeholder:r=``})=>`<label class="field">
    <span class="field-label">${O(e)}</span>
    <textarea class="input" name="${t}" rows="2" placeholder="${O(r)}">${O(n)}</textarea>
  </label>`,L=(e=`التاريخ والوقت`)=>I({label:e,name:`at`,type:`datetime-local`,value:re()}),R=(e,t)=>`<datalist id="${e}">${[...new Set(t.filter(Boolean))].map(e=>`<option value="${O(e)}">`).join(``)}</datalist>`,z=(...e)=>`<div class="field-row">${e.join(``)}</div>`;function _e({label:e,name:t,options:n,selected:r=``,empty:i=`لا توجد عناصر متاحة`}){let a=`<span class="field-label">${O(e)} <b class="req" aria-hidden="true">*</b></span>`;if(!n.length)return`<div class="field">${a}<div class="picker-empty">${x(`empty`)} ${O(i)}</div></div>`;let o=n.length>5?`<div class="search-box small">${x(`search`)}<input type="search" class="picker-search" placeholder="ابحث…" aria-label="بحث في ${O(e)}"></div>`:``;return`<div class="field" role="group" aria-label="${O(e)}">${a}<div class="picker">${o}
    <div class="picker-list">${n.map(e=>`
      <label class="picker-opt" data-key="${O(ae(`${e.label} ${e.sub||``} ${e.meta||``}`))}">
        <input type="radio" name="${t}" value="${O(e.value)}"${e.value===r?` checked`:``}>
        <span class="picker-text"><b>${O(e.label)}</b>${e.sub?`<small>${O(e.sub)}</small>`:``}</span>
        ${e.meta?`<span class="picker-meta">${O(e.meta)}</span>`:``}
      </label>`).join(``)}
    </div><p class="picker-none" hidden>لا نتائج مطابقة</p></div></div>`}var ve=({label:e,name:t,value:n,text:r,sub:i=``})=>`<div class="field">
    <span class="field-label">${O(e)}</span>
    <div class="fixed-value"><b>${O(r)}</b>${i?`<small>${O(i)}</small>`:``}</div>
    <input type="hidden" name="${t}" value="${O(n)}">
  </div>`;function ye(e){e.querySelectorAll(`.picker`).forEach(e=>{let t=e.querySelector(`.picker-search`),n=[...e.querySelectorAll(`.picker-opt`)],r=e.querySelector(`.picker-none`);t?.addEventListener(`input`,()=>{let e=ae(t.value).trim().split(/\s+/),i=0;n.forEach(t=>{let n=e.every(e=>t.dataset.key.includes(e));t.hidden=!n,i+=n}),r.hidden=i>0}),t?.addEventListener(`keydown`,e=>{e.key===`Enter`&&e.preventDefault()}),e.querySelector(`input:checked`)?.closest(`.picker-opt`)?.scrollIntoView({block:`nearest`})})}async function be(e,t,n){if(w)return E(e,n,t);let r=URL.createObjectURL(new Blob([t],{type:n})),i=Object.assign(document.createElement(`a`),{href:r,download:e});return document.body.append(i),i.click(),i.remove(),setTimeout(()=>URL.revokeObjectURL(r),1e3),`saved`}function xe(e){return new Promise(t=>{let n=Object.assign(document.createElement(`input`),{type:`file`,accept:e});n.addEventListener(`change`,()=>t(n.files[0]||null),{once:!0}),n.click()})}var Se=[`بندقية`,`بندقية قنص`,`مسدس`,`رشاش خفيف`,`رشاش متوسط`,`رشاش ثقيل`,`قاذفة`,`هاون`],Ce=[`طلقة`,`صندوق`,`قنبلة`,`قذيفة`,`صاروخ`,`مخزن`],we=[`جندي`,`جندي أول`,`نائب عريف`,`عريف`,`رقيب`,`رئيس عرفاء`,`نائب ضابط`,`ملازم`,`ملازم أول`,`نقيب`,`رائد`,`مقدم`,`عقيد`],B,Te=e=>{B=e},V=(e,t)=>e.map(e=>e[t]),Ee=(e=`مثال: رقم الكتاب أو سبب الحركة`)=>ge({label:`ملاحظات`,name:`note`,placeholder:e}),De=e=>({value:e.id,label:d(e),sub:[e.milNo&&`ر.ع ${e.milNo}`,e.platoon].filter(Boolean).join(` · `)}),Oe=()=>B.data.people.map(De),ke=e=>({value:e.id,label:e.model||e.type,sub:[e.type!==e.model&&e.type,e.caliber].filter(Boolean).join(` · `),meta:e.serial}),Ae=(e,t)=>({value:e.id,label:[e.name,e.caliber].filter(Boolean).join(` `),sub:e.lot?`وجبة ${e.lot}`:``,meta:t}),je=(e,t=`المنتسب`)=>{let n=e&&B.findPerson(e);return n?ve({label:t,name:`personId`,value:n.id,text:d(n),sub:n.milNo?`ر.ع ${n.milNo}`:``}):_e({label:t,name:`personId`,options:Oe(),empty:`لا يوجد منتسبون. أضفهم من صفحة المنتسبين`})},Me=(e,t,n)=>{let r=e&&B.findWeapon(e);return r?ve({label:`السلاح`,name:`weaponId`,value:r.id,text:r.model||r.type,sub:`الرقم التسلسلي ${r.serial}`}):_e({label:`السلاح`,name:`weaponId`,options:t,empty:n})},Ne=(e,t,n)=>{let r=e&&B.findAmmo(e);return r?ve({label:`صنف العتاد`,name:`ammoId`,value:r.id,text:p(r),sub:`في المستودع: ${k(B.balanceOf(r.id).store)} ${r.unit}`}):_e({label:`صنف العتاد`,name:`ammoId`,options:t,empty:n})};function Pe(e){let t=e?B.findPerson(e):{},n=B.data.people;F({title:e?`تعديل بيانات المنتسب`:`إضافة منتسب`,submitLabel:e?`حفظ التعديلات`:`إضافة`,body:`
      ${I({label:`الاسم الثلاثي`,name:`name`,value:t.name,required:!0})}
      ${z(I({label:`الرتبة`,name:`rank`,value:t.rank,list:`dl-ranks`}),I({label:`الرقم العسكري`,name:`milNo`,value:t.milNo,inputmode:`numeric`,mono:!0}))}
      ${z(I({label:`الفصيل / الحضيرة`,name:`platoon`,value:t.platoon,list:`dl-platoons`}),I({label:`رقم الهاتف`,name:`phone`,value:t.phone,type:`tel`,inputmode:`tel`,mono:!0}))}
      ${ge({label:`ملاحظات`,name:`notes`,value:t.notes})}
      ${R(`dl-ranks`,[...we,...V(n,`rank`)])}
      ${R(`dl-platoons`,V(n,`platoon`))}`,onSubmit:t=>{e?B.updatePerson(e,t):B.addPerson(t),N(e?`حُفظت التعديلات`:`أُضيف ${t.name.trim()}`)}})}async function Fe(e){await he({title:`حذف المنتسب`,message:`سيُحذف <b>${O(d(B.findPerson(e)))}</b> من قائمة المنتسبين. تبقى حركاته السابقة في السجل.`,confirmLabel:`حذف`,validate:()=>B.removePerson(e)})&&(N(`حُذف المنتسب`),P(`#/people`))}function Ie(e){let t=e?B.findWeapon(e):{},n=B.data.weapons;F({title:e?`تعديل بيانات السلاح`:`إدخال سلاح للمستودع`,submitLabel:e?`حفظ التعديلات`:`إدخال`,body:`
      ${z(I({label:`النوع`,name:`type`,value:t.type,list:`dl-wtypes`,placeholder:`بندقية`}),I({label:`الطراز`,name:`model`,value:t.model,list:`dl-wmodels`,placeholder:`AK-47`,mono:!0}))}
      ${I({label:`الرقم التسلسلي`,name:`serial`,value:t.serial,required:!0,mono:!0})}
      ${z(I({label:`العيار`,name:`caliber`,value:t.caliber,list:`dl-calibers`,placeholder:`7.62×39`,mono:!0}),I({label:`مكان الخزن`,name:`location`,value:t.location,list:`dl-wloc`,placeholder:`خزانة 1`}))}
      ${ge({label:`ملاحظات`,name:`notes`,value:t.notes,placeholder:`الملحقات، الحالة الفنية…`})}
      ${e?``:L(`تاريخ الإدخال`)}
      ${R(`dl-wtypes`,[...Se,...V(n,`type`)])}
      ${R(`dl-wmodels`,V(n,`model`))}
      ${R(`dl-calibers`,[...V(n,`caliber`),...V(B.data.ammo,`caliber`)])}
      ${R(`dl-wloc`,V(n,`location`))}`,onSubmit:t=>{e?(B.updateWeapon(e,t),N(`حُفظت التعديلات`)):N(`أُدخل السلاح ${B.addWeapon(t,{at:t.at}).serial}`)}})}async function Le(e){await he({title:`شطب السلاح`,message:`سيُشطب السلاح <b>${O(f(B.findWeapon(e)))}</b> من قيود المستودع، ويُسجَّل الشطب في السجل.`,confirmLabel:`شطب`,extra:Ee(`سبب الشطب`),validate:t=>B.removeWeapon(e,{note:t.note})})&&(N(`شُطب السلاح`),P(`#/weapons`))}function Re({weaponId:e,personId:t}={}){F({title:`تسليم سلاح لمنتسب`,submitLabel:`تسليم`,body:`
      ${Me(e,B.data.weapons.filter(e=>e.status===`in_store`).map(ke),`لا توجد أسلحة في المستودع جاهزة للتسليم`)}
      ${je(t,`المستلم`)}
      ${L()}
      ${Ee()}`,onSubmit:e=>{B.issueWeapon(e.weaponId,e.personId,e),N(`سُلّم السلاح وأُضيف إلى ذمة المنتسب`)}})}var ze=[[`in_store`,`سليم`,`يعود إلى المستودع جاهزاً`],[`maintenance`,`يحتاج صيانة`,`يدخل المستودع ويُحوّل للصيانة`],[`unserviceable`,`عاطل`,`غير صالح للاستخدام`],[`lost`,`مفقود`,`أبلغ المنتسب بفقدانه`]];function Be({weaponId:e,personId:t}={}){F({title:`إرجاع سلاح`,submitLabel:`تسجيل`,body:`
      ${Me(e,B.data.weapons.filter(e=>e.status===`issued`&&(!t||e.holderId===t)).map(e=>{let t=B.findPerson(e.holderId);return{...ke(e),sub:t?`بذمة ${d(t)}`:``}}),`لا توجد أسلحة مسلّمة حالياً`)}
      <fieldset class="field segmented-field">
        <legend class="field-label">حالة السلاح عند الإرجاع</legend>
        <div class="segmented">${ze.map(([e,t,n],r)=>`
          <label class="seg seg-${a[e].tone}"><input type="radio" name="status" value="${e}"${r===0?` checked`:``}>
            <span><b>${t}</b><small>${n}</small></span></label>`).join(``)}
        </div>
      </fieldset>
      ${L()}
      ${Ee(`مثال: نواقص في الملحقات، تفاصيل الفقدان…`)}`,onSubmit:e=>{B.returnWeapon(e.weaponId,e),N(e.status===`lost`?`سُجّل السلاح مفقوداً`:`أُرجع السلاح إلى المستودع`)}})}function Ve(e){let t=B.findWeapon(e),n=Object.entries(a).filter(([e])=>e!==`issued`&&e!==t.status);F({title:`تغيير حالة السلاح`,submitLabel:`تغيير الحالة`,body:`
      ${ve({label:`السلاح`,name:`weaponId`,value:t.id,text:t.model||t.type,sub:`الحالة الآن: ${a[t.status].label}`})}
      <fieldset class="field segmented-field">
        <legend class="field-label">الحالة الجديدة</legend>
        <div class="segmented">${n.map(([e,t])=>`
          <label class="seg seg-${t.tone}"><input type="radio" name="status" value="${e}"><span><b>${t.label}</b></span></label>`).join(``)}
        </div>
      </fieldset>
      ${L()}
      ${Ee()}`,onSubmit:e=>{B.setWeaponStatus(t.id,e.status,e),N(`تغيّرت حالة السلاح`)}})}function He(e){let t=e?B.findAmmo(e):{},n=B.data.ammo;F({title:e?`تعديل صنف العتاد`:`إضافة صنف عتاد`,submitLabel:e?`حفظ التعديلات`:`إضافة`,body:`
      ${I({label:`اسم الصنف`,name:`name`,value:t.name,required:!0,list:`dl-anames`,placeholder:`عتاد بندقية`})}
      ${z(I({label:`العيار`,name:`caliber`,value:t.caliber,list:`dl-acal`,placeholder:`7.62×39`,mono:!0}),I({label:`رقم الوجبة`,name:`lot`,value:t.lot,mono:!0}))}
      ${z(I({label:`وحدة القياس`,name:`unit`,value:t.unit||`طلقة`,list:`dl-units`}),I({label:`الحد الأدنى للتنبيه`,name:`minQty`,value:t.minQty||``,inputmode:`numeric`,placeholder:`0`,hint:`يظهر تنبيه حين يقل الرصيد عنه`}))}
      ${I({label:`مكان الخزن`,name:`location`,value:t.location,list:`dl-aloc`})}
      ${e?``:`<div class="field-group">${z(I({label:`الرصيد الافتتاحي`,name:`qty`,inputmode:`numeric`,placeholder:`0`,hint:`الكمية الموجودة الآن في المستودع`}),L(`بتاريخ`))}</div>`}
      ${ge({label:`ملاحظات`,name:`notes`,value:t.notes})}
      ${R(`dl-anames`,V(n,`name`))}
      ${R(`dl-acal`,[...V(n,`caliber`),...V(B.data.weapons,`caliber`)])}
      ${R(`dl-units`,[...Ce,...V(n,`unit`)])}
      ${R(`dl-aloc`,V(n,`location`))}`,onSubmit:t=>{e?(B.updateAmmo(e,t),N(`حُفظت التعديلات`)):(B.addAmmo(t,{qty:t.qty,at:t.at}),N(`أُضيف الصنف ${t.name.trim()}`))}})}async function Ue(e){await he({title:`حذف صنف العتاد`,message:`سيُحذف الصنف <b>${O(p(B.findAmmo(e)))}</b>. تبقى حركاته السابقة في السجل.`,confirmLabel:`حذف`,validate:()=>B.removeAmmo(e)})&&(N(`حُذف الصنف`),P(`#/ammo`))}var We={a_in:{title:`استلام عتاد وارد`,submit:`استلام`,qtyLabel:`الكمية المستلمة`,notePh:`الجهة المسلِّمة، رقم الكتاب أو المستند`},a_out:{title:`إخراج عتاد من المستودع`,submit:`إخراج`,qtyLabel:`الكمية المُخرجة`,notePh:`السبب: إتلاف، تسليم لجهة أخرى… ورقم الكتاب`},a_issue:{title:`صرف عتاد لمنتسب`,submit:`صرف`,qtyLabel:`الكمية المصروفة`,notePh:`الغرض: واجب، رمي تدريبي…`},a_return:{title:`إرجاع عتاد للمستودع`,submit:`إرجاع`,qtyLabel:`الكمية المُرجعة`,notePh:``},a_consume:{title:`تسجيل استهلاك عتاد`,submit:`تسجيل الاستهلاك`,qtyLabel:`الكمية المستهلكة`,notePh:`مثال: رمي تدريبي، واجب…`},a_adjust:{title:`تسوية جرد`,submit:`تسوية`,qtyLabel:`الكمية الموجودة فعلاً`,notePh:`سبب الفرق ورقم محضر الجرد`}};function Ge(e,{ammoId:t,personId:n}={}){let r=We[e],i=e===`a_adjust`?`counted`:`qty`,a;if(e===`a_return`||e===`a_consume`){let e=[];for(let r of B.data.ammo)if(!(t&&r.id!==t))for(let[t,i]of B.balanceOf(r.id).byPerson){if(n&&t!==n)continue;let a=B.findPerson(t);e.push({value:`${r.id}|${t}`,label:a?d(a):`منتسب محذوف`,sub:p(r),meta:`${k(i)} ${r.unit}`})}a=_e({label:`العتاد بالذمة`,name:`line`,options:e,selected:e.length===1?e[0].value:``,empty:`لا يوجد عتاد بالذمة`})}else a=Ne(t,B.data.ammo.map(e=>({a:e,store:B.balanceOf(e.id).store})).filter(({store:t})=>e===`a_in`||e===`a_adjust`||t>0).map(({a:e,store:t})=>Ae(e,`${k(t)} ${e.unit}`)),B.data.ammo.length?`لا يوجد رصيد في المستودع`:`لا توجد أصناف عتاد. أضفها من صفحة الأعتدة`),e===`a_issue`&&(a+=je(n,`المستلم`));F({title:r.title,submitLabel:r.submit,tone:e===`a_out`||e===`a_consume`?`warn`:`primary`,body:`
      ${a}
      ${z(I({label:r.qtyLabel,name:i,inputmode:`numeric`,required:!0,mono:!0,hint:e===`a_adjust`?`اكتب العدد الفعلي بعد العدّ، ويُحسب الفرق تلقائياً`:``}),L())}
      ${Ee(r.notePh)}`,onSubmit:t=>{t.line&&([t.ammoId,t.personId]=t.line.split(`|`)),B.ammoMove(e,t),N(`تم: ${r.title}`)}})}var Ke=`1.0.0`,H,qe=e=>{H=e},U={weapons:{q:``,status:`all`},ammo:{q:``,filter:`all`},people:{q:``,platoon:`all`},log:{q:``,group:`all`,from:``,to:``}},Je=7,Ye=e=>`<span class="pill tone-${a[e].tone}">${a[e].label}</span>`,W=(e,t=`empty`,n=``)=>`<div class="empty">${x(t)}<p>${e}</p>${n}</div>`,Xe=()=>W(`لا توجد نتائج مطابقة`,`no-results`),G=(e,t,n,{tone:r=`ghost`,data:i={}}={})=>`<button type="button" class="btn ${r}" data-action="${e}"${Object.entries(i).map(([e,t])=>` data-${e}="${O(t)}"`).join(``)}>${x(t)}<span>${n}</span></button>`,K=(e,t,n,r,i)=>`<button type="button" class="chip${r===t?` active`:``}" data-action="chip" data-bind="${e}" data-value="${O(t)}" aria-pressed="${r===t}">${O(n)}${i===void 0?``:` <span class="chip-n">${k(i)}</span>`}</button>`,Ze=(e,t)=>`<div class="search-box">${x(`search`)}<input type="search" data-bind="${e}" placeholder="${O(t)}" aria-label="${O(t)}" autocomplete="off"></div>`,Qe=e=>`<dl class="kv">${e.filter(([,e])=>e).map(([e,t])=>`<div><dt>${O(e)}</dt><dd>${t}</dd></div>`).join(``)}</dl>`,$e=(e,t=``)=>{let n=e&&H.findPerson(e);return n?`<a href="#/people/${n.id}">${O(d(n))}</a>`:O(t)},q=(e,t=H.balanceOf(e.id))=>e.minQty>0&&t.store<e.minQty,et=e=>[...e].sort((e,t)=>t.at>e.at?1:t.at<e.at?-1:0);function tt(e){let t=e=>a[e]?.label||``;switch(e.kind){case`w_add`:case`w_remove`:return{what:e.w};case`w_issue`:return{what:e.w,who:`إلى ${e.p}`};case`w_return`:return{what:e.w,who:e.p?`من ${e.p}`:``,detail:e.to&&e.to!==`in_store`?`الحالة: ${t(e.to)}`:``};case`w_status`:return{what:e.w,who:e.p?`بذمة ${e.p}`:``,detail:`${t(e.from)} ← ${t(e.to)}`.replace(/^ ← /,``)};case`a_adjust`:return{what:e.a,amount:`${e.qty>0?`+`:`−`}${k(Math.abs(e.qty))} ${e.u||``}`.trim(),detail:e.counted===void 0?``:`الموجود فعلاً ${k(e.counted)}`};default:return{what:e.a,amount:`${k(e.qty)} ${e.u||``}`.trim(),who:e.p?e.kind===`a_issue`?`إلى ${e.p}`:e.kind===`a_return`?`من ${e.p}`:e.p:``}}}function nt(e,{withDate:t=!0}={}){let n=o[e.kind],r=tt(e),i=e.weaponId&&H.findWeapon(e.weaponId)?`#/weapons/${e.weaponId}`:e.ammoId&&H.findAmmo(e.ammoId)?`#/ammo/${e.ammoId}`:``,a=i?`<a href="${i}">${O(r.what)}</a>`:O(r.what),s=r.who&&e.personId&&H.findPerson(e.personId)?O(r.who).replace(O(e.p),$e(e.personId)):O(r.who||``);return`<li class="log-row kind-${e.kind}">
    <span class="log-icon">${x(n.icon)}</span>
    <div class="log-main">
      <div class="log-line"><b>${n.label}</b>${r.amount?`<span class="log-amount">${O(r.amount)}</span>`:``}</div>
      <div class="log-what">${a}${s?` · ${s}`:``}${r.detail?` · ${O(r.detail)}`:``}</div>
      ${e.note?`<div class="log-note">${O(e.note)}</div>`:``}
    </div>
    <time class="log-time" datetime="${O(e.at)}">${t?`${j(e.at)}<br>`:``}${ne(e.at)}</time>
  </li>`}var rt=(e,t)=>`<ul class="log-list">${e.map(e=>nt(e,t)).join(``)}</ul>`;function it(){let e=[],t=H.data.settings;if(H.loadProblem&&e.push([`danger`,`alert`,H.loadProblem]),H.persistent||e.push([`danger`,`alert`,`التخزين محجوب في هذا المتصفح: لن تُحفظ البيانات بعد إغلاق الصفحة. افتح التطبيق في نافذة عادية (غير خاصة).`]),t.demo)return e.push([`info`,`info`,`تستعرض الآن بيانات نموذجية للتجربة. امسحها حين تبدأ الاستخدام الفعلي.`,`<button type="button" class="btn small" data-action="reset">مسح البيانات النموذجية</button>`]),e.map(at).join(``);let n=H.data.weapons.length||H.data.ammo.length||H.data.people.length,r=!t.lastBackupAt||Date.now()-new Date(t.lastBackupAt).getTime()>Je*864e5;return n&&r&&e.push([`warn`,`backup`,`البيانات محفوظة على هذا الجهاز فقط. ${t.lastBackupAt?`آخر نسخة احتياطية قبل أكثر من ${Je} أيام.`:`لم تُؤخذ نسخة احتياطية بعد.`}`,`<button type="button" class="btn small" data-action="backup">أخذ نسخة الآن</button>`]),e.map(at).join(``)}var at=([e,t,n,r=``])=>`<div class="banner tone-${e}">${x(t)}<p>${n}</p>${r}</div>`;function ot(){let{weapons:e,ammo:t,people:n,log:r}=H.data,i=`مستودع ${H.data.settings.unitName||`السرية`}`;if(!e.length&&!t.length)return{title:i,html:`${it()}<section class="card welcome">
        <span class="welcome-mark">${x(`shield`)}</span>
        <h2>أهلاً بك في تطبيق مستودع السرية</h2>
        <p>سجّل أسلحة السرية وأعتدتها، وتابع ما بذمة كل منتسب، واطبع تقارير الجرد وسندات الذمة. البيانات تُحفظ على هذا الجهاز.</p>
        <ol class="steps">
          <li${(e=>e?` class="done"`:``)(n.length)}><b>أضف المنتسبين</b><span>${n.length?`أُضيف ${k(n.length)} منتسب`:`الاسم والرتبة والرقم العسكري`}</span></li>
          <li><b>أدخل الأسلحة</b><span>كل سلاح برقمه التسلسلي</span></li>
          <li><b>أضف أصناف العتاد</b><span>مع الرصيد الموجود حالياً</span></li>
        </ol>
        <div class="actions">
          ${G(`add-person`,`people`,`إضافة منتسب`,{tone:`primary`})}
          ${G(`add-weapon`,`weapon`,`إدخال سلاح`)}
          ${G(`add-ammo`,`ammo`,`إضافة صنف عتاد`)}
        </div>
        ${n.length?``:`<p class="welcome-demo">تريد أن ترى التطبيق أولاً؟ <button type="button" class="link" data-action="demo">جرّبه ببيانات نموذجية</button></p>`}
      </section>`};let o=Object.fromEntries(Object.keys(a).map(e=>[e,0]));e.forEach(e=>o[e.status]++);let s=e.length,c=s?Object.keys(a).filter(e=>o[e]).map(e=>`<span class="bar-seg tone-${a[e].tone}" style="flex:${o[e]}" title="${a[e].label}: ${o[e]}"></span>`).join(``):``,l=(e,t,n)=>`<button type="button" class="stat${e===`all`?``:` tone-${a[e].tone}`}" data-action="weapons-filter" data-status="${e}">
      <b>${k(t)}</b><span>${n}</span></button>`,u=t.filter(e=>q(e)),d=[...e.filter(e=>e.status===`lost`).map(e=>`<a class="alert-row tone-danger" href="#/weapons/${e.id}">${x(`alert`)}<span>سلاح مفقود: <b>${O(e.model||e.type)}</b> <span class="mono">${O(e.serial)}</span></span></a>`),...u.map(e=>`<a class="alert-row tone-warn" href="#/ammo/${e.id}">${x(`alert`)}<span>رصيد منخفض: <b>${O(e.name)} ${O(e.caliber)}</b> — ${k(H.balanceOf(e.id).store)} من حد ${k(e.minQty)}</span></a>`)],f=t.map(e=>{let t=H.balanceOf(e.id);return`<a class="mini-row" href="#/ammo/${e.id}">
      <span class="mini-main"><b>${O(e.name)}</b><small>${O([e.caliber,e.lot&&`وجبة ${e.lot}`].filter(Boolean).join(` · `))}</small></span>
      <span class="mini-num${q(e,t)?` low`:``}"><b>${k(t.store)}</b><small>في المستودع</small></span>
      <span class="mini-num muted"><b>${k(t.issued)}</b><small>بالذمة</small></span>
    </a>`}).join(``);return{title:i,html:`${it()}
      <div class="quick">
        ${G(`issue-weapon`,`issue`,`تسليم سلاح`,{tone:`tile`})}
        ${G(`return-weapon`,`return`,`إرجاع سلاح`,{tone:`tile`})}
        ${G(`ammo-move`,`issue`,`صرف عتاد`,{tone:`tile`,data:{kind:`a_issue`}})}
        ${G(`ammo-move`,`receive`,`استلام عتاد`,{tone:`tile`,data:{kind:`a_in`}})}
      </div>
      ${d.length?`<section class="card alerts"><h2 class="card-title">تنبيهات</h2>${d.join(``)}</section>`:``}
      <div class="home-grid">
        <section class="card">
          <div class="card-head"><h2 class="card-title">${x(`weapon`)} الأسلحة</h2><a href="#/weapons" class="more">الكل ${x(`chevron`)}</a></div>
          <div class="stat-grid">
            ${l(`all`,s,`المجموع`)}
            ${l(`in_store`,o.in_store,`في المستودع`)}
            ${l(`issued`,o.issued,`مسلّمة`)}
            ${l(`maintenance`,o.maintenance,`في الصيانة`)}
            ${o.unserviceable?l(`unserviceable`,o.unserviceable,`عاطلة`):``}
            ${o.lost?l(`lost`,o.lost,`مفقودة`):``}
          </div>
          ${c?`<div class="bar" aria-hidden="true">${c}</div>`:``}
        </section>
        <section class="card">
          <div class="card-head"><h2 class="card-title">${x(`ammo`)} الأعتدة</h2><a href="#/ammo" class="more">الكل ${x(`chevron`)}</a></div>
          ${f||W(`لا توجد أصناف عتاد بعد`,`ammo`,G(`add-ammo`,`plus`,`إضافة صنف`))}
        </section>
        <section class="card">
          <div class="card-head"><h2 class="card-title">${x(`people`)} المنتسبون</h2><a href="#/people" class="more">الكل ${x(`chevron`)}</a></div>
          <div class="stat-grid">
            <a class="stat" href="#/people"><b>${k(n.length)}</b><span>المجموع</span></a>
            <a class="stat" href="#/people"><b>${k(n.filter(e=>{let t=H.custodyOf(e.id);return t.weapons.length||t.ammo.length}).length)}</b><span>بذمتهم مواد</span></a>
          </div>
        </section>
        <section class="card wide">
          <div class="card-head"><h2 class="card-title">${x(`log`)} آخر الحركات</h2><a href="#/log" class="more">السجل ${x(`chevron`)}</a></div>
          ${r.length?rt(et(r).slice(0,6)):W(`لا توجد حركات بعد`,`log`)}
        </section>
      </div>`}}function st(){let e=H.data.weapons,t=Object.fromEntries(Object.keys(a).map(t=>[t,e.filter(e=>e.status===t).length])),n=U.weapons;return{title:`الأسلحة`,html:`
      <div class="toolbar">
        ${Ze(`weapons.q`,`ابحث بالرقم التسلسلي أو الطراز أو اسم الحائز`)}
        ${G(`add-weapon`,`plus`,`إدخال سلاح`,{tone:`primary`})}
      </div>
      <div class="chips">
        ${K(`weapons.status`,`all`,`الكل`,n.status,e.length)}
        ${Object.entries(a).filter(([e])=>t[e]||n.status===e).map(([e,r])=>K(`weapons.status`,e,r.label,n.status,t[e])).join(``)}
      </div>
      <div id="list"></div>`,list(){if(!e.length)return W(`لم يُدخل أي سلاح بعد`,`weapon`,G(`add-weapon`,`plus`,`إدخال سلاح`,{tone:`primary`}));let t=e.filter(e=>n.status===`all`||e.status===n.status).filter(e=>oe(n.q,e.serial,e.model,e.type,e.caliber,e.location,e.holderId&&H.findPerson(e.holderId)&&d(H.findPerson(e.holderId)))).sort((e,t)=>(e.model||e.type).localeCompare(t.model||t.type,`ar`)||e.serial.localeCompare(t.serial,`en`,{numeric:!0}));return t.length?`<p class="list-count">${k(t.length)} سلاح</p><div class="list">${t.map(e=>`
        <a class="item" href="#/weapons/${e.id}">
          <span class="item-icon tone-${a[e.status].tone}">${x(`weapon`)}</span>
          <span class="item-main">
            <b>${O(e.model||e.type)}</b>
            <small>${O([e.model&&e.type,e.caliber].filter(Boolean).join(` · `))}</small>
            ${e.status===`issued`?`<small class="item-holder">${x(`user`)}${O(d(H.findPerson(e.holderId)||{name:`منتسب محذوف`}))}</small>`:``}
          </span>
          <span class="item-side"><span class="mono serial">${O(e.serial)}</span>${Ye(e.status)}</span>
        </a>`).join(``)}</div>`:Xe()}}}function ct(e){let t=H.findWeapon(e);if(!t)return gt(`السلاح`,`#/weapons`);let n=et(H.data.log.filter(t=>t.weaponId===e)),r=t.status===`issued`?n.find(e=>e.kind===`w_issue`)?.at:null,i={in_store:[G(`issue-weapon`,`issue`,`تسليم لمنتسب`,{tone:`primary`,data:{id:e}}),G(`weapon-status`,`wrench`,`تغيير الحالة`,{data:{id:e}})],issued:[G(`return-weapon`,`return`,`إرجاع للمستودع`,{tone:`primary`,data:{id:e}})]}[t.status]||[G(`weapon-status`,`wrench`,`تغيير الحالة`,{tone:`primary`,data:{id:e}})];return{title:t.model||t.type,back:`#/weapons`,html:`
      <section class="card detail">
        <div class="detail-head">
          <span class="item-icon big tone-${a[t.status].tone}">${x(`weapon`)}</span>
          <div class="detail-name"><h2>${O(t.model||t.type)}</h2><p class="mono serial">${O(t.serial)}</p></div>
          ${Ye(t.status)}
        </div>
        ${t.status===`issued`?`<div class="holder">${x(`user`)}<span>بذمة ${$e(t.holderId,`منتسب محذوف`)}${r?` منذ ${j(r)}`:``}</span></div>`:``}
        ${Qe([[`النوع`,O(t.type)],[`الطراز`,O(t.model)],[`العيار`,O(t.caliber)],[`مكان الخزن`,O(t.location)],[`تاريخ الإدخال`,t.createdAt&&j(n.findLast?.(e=>e.kind===`w_add`)?.at||t.createdAt)],[`ملاحظات`,O(t.notes)]])}
        <div class="actions">
          ${i.join(``)}
          ${G(`edit-weapon`,`edit`,`تعديل`,{data:{id:e}})}
          ${t.status===`issued`?``:G(`remove-weapon`,`trash`,`شطب`,{tone:`ghost danger-text`,data:{id:e}})}
        </div>
      </section>
      <section class="card">
        <h2 class="card-title">سجل السلاح</h2>
        ${n.length?rt(n):W(`لا توجد حركات`)}
      </section>`}}function lt(){let e=H.data.ammo,t=U.ammo,n=e.filter(e=>q(e)).length,r=e.filter(e=>H.balanceOf(e.id).issued).length;return{title:`الأعتدة`,html:`
      <div class="toolbar">
        ${Ze(`ammo.q`,`ابحث بالصنف أو العيار أو رقم الوجبة`)}
        ${G(`add-ammo`,`plus`,`إضافة صنف`,{tone:`primary`})}
      </div>
      <div class="chips">
        ${K(`ammo.filter`,`all`,`الكل`,t.filter,e.length)}
        ${n||t.filter===`low`?K(`ammo.filter`,`low`,`رصيد منخفض`,t.filter,n):``}
        ${r||t.filter===`held`?K(`ammo.filter`,`held`,`بذمة المنتسبين`,t.filter,r):``}
      </div>
      <div class="quick compact">
        ${G(`ammo-move`,`receive`,`استلام وارد`,{tone:`tile`,data:{kind:`a_in`}})}
        ${G(`ammo-move`,`issue`,`صرف لمنتسب`,{tone:`tile`,data:{kind:`a_issue`}})}
        ${G(`ammo-move`,`return`,`إرجاع`,{tone:`tile`,data:{kind:`a_return`}})}
        ${G(`ammo-move`,`flame`,`استهلاك`,{tone:`tile`,data:{kind:`a_consume`}})}
      </div>
      <div id="list"></div>`,list(){if(!e.length)return W(`لا توجد أصناف عتاد بعد`,`ammo`,G(`add-ammo`,`plus`,`إضافة صنف`,{tone:`primary`}));let n=e.filter(e=>t.filter===`all`||(t.filter===`low`?q(e):H.balanceOf(e.id).issued)).filter(e=>oe(t.q,e.name,e.caliber,e.lot,e.location,e.unit));return n.length?`<div class="list">${n.map(e=>{let t=H.balanceOf(e.id),n=q(e,t);return`<a class="item" href="#/ammo/${e.id}">
          <span class="item-icon${n?` tone-warn`:``}">${x(`ammo`)}</span>
          <span class="item-main"><b>${O(e.name)}${e.caliber?` <span class="mono">${O(e.caliber)}</span>`:``}</b>
            <small>${O([e.lot&&`وجبة ${e.lot}`,e.location].filter(Boolean).join(` · `))||O(e.unit)}${n?` · <span class="text-warn">رصيد منخفض</span>`:``}</small></span>
          <span class="item-qty"><b>${k(t.store)}</b><small>${O(e.unit)} في المستودع</small>${t.issued?`<small class="muted">+ ${k(t.issued)} بالذمة</small>`:``}</span>
        </a>`}).join(``)}</div>`:Xe()}}}function ut(e){let t=H.findAmmo(e);if(!t)return gt(`صنف العتاد`,`#/ammo`);let n=H.balanceOf(e),r=et(H.data.log.filter(t=>t.ammoId===e)),i=[...n.byPerson].sort((e,t)=>t[1]-e[1]),a={id:e};return{title:[t.name,t.caliber].filter(Boolean).join(` `),back:`#/ammo`,html:`
      <section class="card detail">
        <div class="detail-head">
          <span class="item-icon big${q(t,n)?` tone-warn`:``}">${x(`ammo`)}</span>
          <div class="detail-name"><h2>${O(t.name)}</h2><p>${O([t.caliber,t.lot&&`وجبة ${t.lot}`].filter(Boolean).join(` · `))}</p></div>
        </div>
        <div class="figures">
          <div class="figure${q(t,n)?` low`:``}"><b>${k(n.store)}</b><span>في المستودع</span></div>
          <div class="figure"><b>${k(n.issued)}</b><span>بذمة المنتسبين</span></div>
          <div class="figure"><b>${k(n.store+n.issued)}</b><span>المجموع (${O(t.unit)})</span></div>
        </div>
        ${q(t,n)?`<div class="banner tone-warn">${x(`alert`)}<p>الرصيد أقل من الحد الأدنى (${k(t.minQty)} ${O(t.unit)})</p></div>`:``}
        ${Qe([[`وحدة القياس`,O(t.unit)],[`الحد الأدنى`,t.minQty?k(t.minQty):``],[`مكان الخزن`,O(t.location)],[`ملاحظات`,O(t.notes)]])}
        <div class="actions">
          ${G(`ammo-move`,`receive`,`استلام وارد`,{tone:`primary`,data:{...a,kind:`a_in`}})}
          ${n.store?G(`ammo-move`,`issue`,`صرف لمنتسب`,{data:{...a,kind:`a_issue`}}):``}
          ${n.store?G(`ammo-move`,`send`,`إخراج`,{data:{...a,kind:`a_out`}}):``}
          ${G(`ammo-move`,`scale`,`تسوية جرد`,{data:{...a,kind:`a_adjust`}})}
          ${G(`edit-ammo`,`edit`,`تعديل`,{data:a})}
          ${G(`remove-ammo`,`trash`,`حذف`,{tone:`ghost danger-text`,data:a})}
        </div>
      </section>
      <section class="card">
        <h2 class="card-title">بذمة المنتسبين</h2>
        ${i.length?`<div class="list flat">${i.map(([e,n])=>`
          <div class="item static">
            <span class="item-main"><b>${$e(e,`منتسب محذوف`)}</b></span>
            <span class="item-qty"><b>${k(n)}</b><small>${O(t.unit)}</small></span>
            <span class="item-actions">
              ${G(`ammo-move`,`return`,`إرجاع`,{tone:`small`,data:{...a,kind:`a_return`,person:e}})}
              ${G(`ammo-move`,`flame`,`استهلاك`,{tone:`small`,data:{...a,kind:`a_consume`,person:e}})}
            </span>
          </div>`).join(``)}</div>`:W(`لا يوجد شيء من هذا الصنف بذمة أحد`)}
      </section>
      <section class="card">
        <h2 class="card-title">سجل الصنف</h2>
        ${r.length?rt(r):W(`لا توجد حركات`)}
      </section>`}}function dt(){let e=H.data.people,t=U.people,n=[...new Set(e.map(e=>e.platoon).filter(Boolean))].sort((e,t)=>e.localeCompare(t,`ar`));return{title:`المنتسبون`,html:`
      <div class="toolbar">
        ${Ze(`people.q`,`ابحث بالاسم أو الرقم العسكري`)}
        ${G(`add-person`,`plus`,`إضافة منتسب`,{tone:`primary`})}
      </div>
      ${n.length?`<div class="chips">${K(`people.platoon`,`all`,`الكل`,t.platoon,e.length)}${n.map(n=>K(`people.platoon`,n,n,t.platoon,e.filter(e=>e.platoon===n).length)).join(``)}</div>`:``}
      <div id="list"></div>`,list(){if(!e.length)return W(`لا يوجد منتسبون بعد`,`people`,G(`add-person`,`plus`,`إضافة منتسب`,{tone:`primary`}));let n=e.filter(e=>t.platoon===`all`||e.platoon===t.platoon).filter(e=>oe(t.q,e.name,e.rank,e.milNo,e.platoon,e.phone)).sort((e,t)=>e.name.localeCompare(t.name,`ar`));return n.length?`<p class="list-count">${k(n.length)} منتسب</p><div class="list">${n.map(e=>{let t=H.custodyOf(e.id);return`<a class="item" href="#/people/${e.id}">
          <span class="avatar">${O(e.name.trim()[0]||`؟`)}</span>
          <span class="item-main"><b>${O(d(e))}</b><small>${O([e.milNo&&`ر.ع ${e.milNo}`,e.platoon].filter(Boolean).join(` · `))}</small></span>
          <span class="item-side">
            ${t.weapons.length?`<span class="count-badge" title="أسلحة بذمته">${x(`weapon`)}${k(t.weapons.length)}</span>`:``}
            ${t.ammo.length?`<span class="count-badge" title="أصناف عتاد بذمته">${x(`ammo`)}${k(t.ammo.length)}</span>`:``}
          </span>
        </a>`}).join(``)}</div>`:Xe()}}}function ft(e){let t=H.findPerson(e);if(!t)return gt(`المنتسب`,`#/people`);let n=H.custodyOf(e),r=et(H.data.log.filter(t=>t.personId===e)),i={person:e};return{title:t.name,back:`#/people`,html:`
      <section class="card detail">
        <div class="detail-head">
          <span class="avatar big">${O(t.name.trim()[0]||`؟`)}</span>
          <div class="detail-name"><h2>${O(d(t))}</h2><p>${O([t.milNo&&`الرقم العسكري ${t.milNo}`,t.platoon].filter(Boolean).join(` · `))}</p></div>
        </div>
        ${Qe([[`الهاتف`,t.phone&&`<a href="tel:${O(t.phone)}" class="mono" dir="ltr">${O(t.phone)}</a>`],[`ملاحظات`,O(t.notes)]])}
        <div class="actions">
          ${G(`issue-weapon`,`issue`,`تسليم سلاح`,{tone:`primary`,data:i})}
          ${G(`ammo-move`,`issue`,`صرف عتاد`,{data:{...i,kind:`a_issue`}})}
          ${G(`print-custody`,`print`,`طباعة سند الذمة`,{data:{id:e}})}
          ${G(`edit-person`,`edit`,`تعديل`,{data:{id:e}})}
          ${G(`remove-person`,`trash`,`حذف`,{tone:`ghost danger-text`,data:{id:e}})}
        </div>
      </section>
      <section class="card">
        <h2 class="card-title">${x(`weapon`)} الأسلحة بذمته</h2>
        ${n.weapons.length?`<div class="list flat">${n.weapons.map(e=>`
          <div class="item static">
            <span class="item-main"><b><a href="#/weapons/${e.id}">${O(e.model||e.type)}</a></b><small>${O([e.type,e.caliber].filter(Boolean).join(` · `))}</small></span>
            <span class="mono serial">${O(e.serial)}</span>
            <span class="item-actions">${G(`return-weapon`,`return`,`إرجاع`,{tone:`small`,data:{id:e.id}})}</span>
          </div>`).join(``)}</div>`:W(`لا توجد أسلحة بذمته`)}
      </section>
      <section class="card">
        <h2 class="card-title">${x(`ammo`)} العتاد بذمته</h2>
        ${n.ammo.length?`<div class="list flat">${n.ammo.map(({ammo:e,qty:t})=>`
          <div class="item static">
            <span class="item-main"><b><a href="#/ammo/${e.id}">${O(e.name)}</a></b><small>${O([e.caliber,e.lot&&`وجبة ${e.lot}`].filter(Boolean).join(` · `))}</small></span>
            <span class="item-qty"><b>${k(t)}</b><small>${O(e.unit)}</small></span>
            <span class="item-actions">
              ${G(`ammo-move`,`return`,`إرجاع`,{tone:`small`,data:{id:e.id,...i,kind:`a_return`}})}
              ${G(`ammo-move`,`flame`,`استهلاك`,{tone:`small`,data:{id:e.id,...i,kind:`a_consume`}})}
            </span>
          </div>`).join(``)}</div>`:W(`لا يوجد عتاد بذمته`)}
      </section>
      <section class="card">
        <h2 class="card-title">سجل المنتسب</h2>
        ${r.length?rt(r):W(`لا توجد حركات`)}
      </section>`}}function pt(){let e=U.log;return et(H.data.log).filter(t=>{if(e.group!==`all`&&o[t.kind].group!==e.group)return!1;let n=ie(t.at);return e.from&&n<e.from||e.to&&n>e.to?!1:oe(e.q,t.w,t.a,t.p,t.note,o[t.kind].label)})}function mt(){let e=U.log;return{title:`سجل الحركات`,html:`
      <div class="toolbar">
        ${Ze(`log.q`,`ابحث في الحركات`)}
        <div class="toolbar-actions">
          ${G(`print-log`,`print`,`طباعة`)}
          ${G(`export-csv`,`sheet`,`Excel`,{data:{what:`log`}})}
        </div>
      </div>
      <div class="chips">
        ${K(`log.group`,`all`,`الكل`,e.group)}
        ${K(`log.group`,`weapons`,`الأسلحة`,e.group)}
        ${K(`log.group`,`ammo`,`الأعتدة`,e.group)}
      </div>
      <div class="date-range">
        <label>من تاريخ <input type="date" class="input small" data-bind="log.from"></label>
        <label>إلى تاريخ <input type="date" class="input small" data-bind="log.to"></label>
      </div>
      <div id="list"></div>`,list(){if(!H.data.log.length)return W(`لا توجد حركات بعد. كل تسليم وإرجاع وصرف يُسجَّل هنا تلقائياً`,`log`);let e=pt();if(!e.length)return Xe();let t=new Map;for(let n of e){let e=ie(n.at);t.has(e)||t.set(e,[]),t.get(e).push(n)}return`<p class="list-count">${k(e.length)} حركة</p>${[...t].map(([,e])=>`
        <section class="day"><h3 class="day-title">${j(e[0].at)}</h3>${rt(e,{withDate:!1})}</section>`).join(``)}`}}}function ht(){let e=H.data.settings;return{title:`الإعدادات`,back:`#/home`,html:`
      <section class="card">
        <h2 class="card-title">${x(`shield`)} بيانات السرية</h2>
        <p class="card-sub">تظهر في عنوان التطبيق وفي التقارير المطبوعة وتواقيعها.</p>
        <form data-form="settings" class="settings-form">
          <label class="field"><span class="field-label">اسم السرية</span><input class="input" name="unitName" value="${O(e.unitName)}" placeholder="مثال: السرية الأولى" autocomplete="off"></label>
          <div class="field-row">
            <label class="field"><span class="field-label">أمين المستودع</span><input class="input" name="keeperName" value="${O(e.keeperName)}" autocomplete="off"></label>
            <label class="field"><span class="field-label">آمر السرية</span><input class="input" name="commanderName" value="${O(e.commanderName)}" autocomplete="off"></label>
          </div>
          <button type="submit" class="btn primary">${x(`check`)}<span>حفظ</span></button>
        </form>
      </section>

      <section class="card">
        <h2 class="card-title">${x(`lock`)} قفل التطبيق</h2>
        <p class="card-sub">${e.lock?`القفل مفعّل: يُطلب الرمز عند فتح التطبيق وبعد بقائه في الخلفية أكثر من دقيقتين.`:`اطلب رمزاً سرياً عند فتح التطبيق، لمنع من يمسك الجهاز من الاطلاع على البيانات.`}</p>
        <div class="actions">
          ${e.lock?`${G(`set-lock`,`key`,`تغيير الرمز`)}${G(`remove-lock`,`unlock`,`إلغاء القفل`,{tone:`ghost danger-text`})}`:G(`set-lock`,`lock`,`تفعيل القفل`,{tone:`primary`})}
        </div>
      </section>

      <section class="card">
        <h2 class="card-title">${x(`data`)} النسخ الاحتياطي</h2>
        <p class="card-sub">البيانات محفوظة في هذا الجهاز فقط. خذ نسخة احتياطية بانتظام واحفظها في مكان آمن، ويمكنك استعادتها على هذا الجهاز أو جهاز آخر.</p>
        <p class="backup-state">${e.lastBackupAt?`آخر نسخة احتياطية: <b>${M(e.lastBackupAt)}</b>`:`<b class="text-warn">لم تُؤخذ نسخة احتياطية بعد</b>`}</p>
        <div class="actions">
          ${G(`backup`,`backup`,`تنزيل نسخة احتياطية`,{tone:`primary`})}
          ${G(`restore`,`restore`,`استعادة من نسخة`)}
        </div>
      </section>

      <section class="card">
        <h2 class="card-title">${x(`print`)} التقارير والتصدير</h2>
        <div class="actions">
          ${G(`print-inventory`,`print`,`طباعة تقرير الجرد`,{tone:`primary`})}
        </div>
        <p class="card-sub">تصدير جداول تُفتح في Excel:</p>
        <div class="actions">
          ${G(`export-csv`,`sheet`,`الأسلحة`,{data:{what:`weapons`}})}
          ${G(`export-csv`,`sheet`,`الأعتدة`,{data:{what:`ammo`}})}
          ${G(`export-csv`,`sheet`,`المنتسبون`,{data:{what:`people`}})}
          ${G(`export-csv`,`sheet`,`سجل الحركات`,{data:{what:`log`}})}
        </div>
      </section>

      ${w?``:`<section class="card">
        <h2 class="card-title">${x(`phone`)} تطبيق أندرويد</h2>
        <p class="card-sub">نسخة تُثبَّت على هواتف أندرويد كتطبيق مستقل، وتحفظ السجلات داخل التطبيق وتعمل بدون إنترنت. حمّل الملف ثم افتحه للتثبيت.</p>
        <div class="actions"><a class="btn primary" href="armory.apk" download="armory.apk">${x(`download`)}<span>تحميل التطبيق (APK)</span></a></div>
      </section>`}

      <section class="card danger-zone">
        <h2 class="card-title">${x(`erase`)} مسح البيانات</h2>
        <p class="card-sub">يحذف كل السجلات من هذا الجهاز نهائياً. خذ نسخة احتياطية قبل ذلك.</p>
        <div class="actions">${G(`reset`,`trash`,`مسح جميع البيانات`,{tone:`danger`})}</div>
      </section>
      <p class="app-version">مستودع السرية · الإصدار ${Ke}</p>`}}function gt(e,t){return{title:`غير موجود`,back:t,html:W(`${e} غير موجود، ربما حُذف.`,`no-results`,`<a class="btn" href="${t}">رجوع</a>`)}}var{isAndroidApp:_t}=S,J,vt=e=>{J=e},yt=()=>J.data.settings.unitName||`السرية`,bt=()=>new Date().toISOString();function xt(e,t=``){return`<header class="p-head">
    <div><b>${O(yt())}</b><span>مستودع الأسلحة والأعتدة</span></div>
    <div class="p-title"><h1>${O(e)}</h1>${t?`<p>${t}</p>`:``}</div>
    <div class="p-date">التاريخ: ${j(bt())}</div>
  </header>`}function St(e){let t=J.data.settings,n={"أمين المستودع":t.keeperName,"آمر السرية":t.commanderName};return`<div class="p-signs">${e.map(([e,t])=>`
    <div class="p-sign"><span>${O(e)}</span><div class="p-line"></div><small>${O(t??n[e]??``)}</small></div>`).join(``)}
  </div>`}var Y=(e,t,n=`لا يوجد`)=>`<table class="p-table">
  <thead><tr><th>ت</th>${e.map(e=>`<th>${O(e)}</th>`).join(``)}</tr></thead>
  <tbody>${t.length?t.map((e,t)=>`<tr><td>${t+1}</td>${e.map(e=>`<td>${e}</td>`).join(``)}</tr>`).join(``):`<tr><td colspan="${e.length+1}" class="p-empty">${n}</td></tr>`}</tbody>
</table>`;function Ct(e,t){let n=document.getElementById(`print-area`);n.innerHTML=e,ce(n),_t?D(`${t} - ${yt()}`):(window.addEventListener(`afterprint`,()=>{n.innerHTML=``},{once:!0}),window.print())}function wt(){let{weapons:e,ammo:t}=J.data,n=new Map;for(let t of e){let e=t.type||`غير محدد`,r=n.get(e)||{total:0,in_store:0,issued:0,other:0};r.total++,t.status===`in_store`||t.status===`issued`?r[t.status]++:r.other++,n.set(e,r)}let r=[...e].sort((e,t)=>(e.type||``).localeCompare(t.type||``,`ar`)||e.serial.localeCompare(t.serial,`en`,{numeric:!0})),i=e=>e.holderId&&J.findPerson(e.holderId)?d(J.findPerson(e.holderId)):``;Ct(`
    ${xt(`تقرير الجرد العام`,`عدد الأسلحة ${k(e.length)} · أصناف العتاد ${k(t.length)}`)}
    <h2>خلاصة الأسلحة حسب النوع</h2>
    ${Y([`النوع`,`المجموع`,`في المستودع`,`مسلّم`,`صيانة / عاطل / مفقود`],[...n].map(([e,t])=>[O(e),k(t.total),k(t.in_store),k(t.issued),k(t.other)]))}
    <h2>الأسلحة</h2>
    ${Y([`النوع`,`الطراز`,`الرقم التسلسلي`,`العيار`,`الحالة`,`بذمة`],r.map(e=>[O(e.type),O(e.model),`<span class="mono">${O(e.serial)}</span>`,O(e.caliber),a[e.status].label,O(i(e))]))}
    <h2>الأعتدة</h2>
    ${Y([`الصنف`,`العيار`,`الوجبة`,`الوحدة`,`في المستودع`,`بذمة المنتسبين`,`المجموع`],t.map(e=>{let t=J.balanceOf(e.id);return[O(e.name),O(e.caliber),O(e.lot),O(e.unit),k(t.store),k(t.issued),`<b>${k(t.store+t.issued)}</b>`]}))}
    ${St([[`أمين المستودع`],[`آمر السرية`]])}`,`تقرير الجرد العام`)}function Tt(e){let t=J.findPerson(e),n=J.custodyOf(e);Ct(`
    ${xt(`سند ذمة`,`الأسلحة والأعتدة المسلّمة للمنتسب`)}
    <dl class="p-kv">
      <div><dt>الاسم</dt><dd>${O(t.name)}</dd></div>
      <div><dt>الرتبة</dt><dd>${O(t.rank)||`—`}</dd></div>
      <div><dt>الرقم العسكري</dt><dd class="mono">${O(t.milNo)||`—`}</dd></div>
      <div><dt>الفصيل</dt><dd>${O(t.platoon)||`—`}</dd></div>
    </dl>
    <h2>الأسلحة</h2>
    ${Y([`النوع`,`الطراز`,`الرقم التسلسلي`,`العيار`],n.weapons.map(e=>[O(e.type),O(e.model),`<span class="mono">${O(e.serial)}</span>`,O(e.caliber)]),`لا توجد أسلحة بذمته`)}
    <h2>الأعتدة</h2>
    ${Y([`الصنف`,`العيار`,`الوجبة`,`الكمية`,`الوحدة`],n.ammo.map(({ammo:e,qty:t})=>[O(e.name),O(e.caliber),O(e.lot),`<b>${k(t)}</b>`,O(e.unit)]),`لا يوجد عتاد بذمته`)}
    <p class="p-pledge">أتعهد بالمحافظة على المواد المثبتة أعلاه واستخدامها للأغراض الرسمية فقط وإعادتها عند الطلب، وأتحمل المسؤولية في حال فقدانها أو إتلافها.</p>
    ${St([[`المستلم`,d(t)],[`أمين المستودع`],[`آمر السرية`]])}`,`سند ذمة ${t.name}`)}function Et(e,t){Ct(`
    ${xt(`سجل الحركات`,t)}
    ${Y([`التاريخ`,`الحركة`,`التفاصيل`,`المنتسب`,`ملاحظات`],e.map(e=>{let t=tt(e);return[M(e.at),o[e.kind].label,O(t.what)+(t.amount?` — <b>${O(t.amount)}</b>`:``),O(e.p||``),O(e.note||``)]}))}
    ${St([[`أمين المستودع`],[`آمر السرية`]])}`,`سجل الحركات`)}var Dt=e=>{let t=String(e??``);return/[",\n\r]/.test(t)?`"${t.replace(/"/g,`""`)}"`:t},Ot=e=>`﻿`+e.map(e=>e.map(Dt).join(`,`)).join(`\r
`),kt=()=>j(bt()).replace(/\//g,`-`);function At(e,t){let n=J.data,r=e=>e&&J.findPerson(e)?d(J.findPerson(e)):``,[i,s]={weapons:[`weapons`,[[`النوع`,`الطراز`,`الرقم التسلسلي`,`العيار`,`الحالة`,`بذمة`,`مكان الخزن`,`ملاحظات`],...n.weapons.map(e=>[e.type,e.model,e.serial,e.caliber,a[e.status].label,r(e.holderId),e.location,e.notes])]],ammo:[`ammo`,[[`الصنف`,`العيار`,`الوجبة`,`الوحدة`,`في المستودع`,`بذمة المنتسبين`,`المجموع`,`الحد الأدنى`,`مكان الخزن`],...n.ammo.map(e=>{let t=J.balanceOf(e.id);return[e.name,e.caliber,e.lot,e.unit,t.store,t.issued,t.store+t.issued,e.minQty||``,e.location]})]],people:[`personnel`,[[`الاسم`,`الرتبة`,`الرقم العسكري`,`الفصيل`,`الهاتف`,`أسلحة بذمته`,`عتاد بذمته`],...n.people.map(e=>{let t=J.custodyOf(e.id);return[e.name,e.rank,e.milNo,e.platoon,e.phone,t.weapons.map(e=>`${e.model||e.type} ${e.serial}`).join(` / `),t.ammo.map(({ammo:e,qty:t})=>`${e.name} ${e.caliber}: ${t} ${e.unit}`).join(` / `)]})]],log:[`movements`,[[`التاريخ`,`الوقت`,`الحركة`,`السلاح`,`العتاد`,`الكمية`,`المنتسب`,`ملاحظات`],...(t||n.log).map(e=>[j(e.at),new Date(e.at).toTimeString().slice(0,5),o[e.kind].label,e.w||``,e.a||``,e.qty??``,e.p||``,e.note||``])]]}[e];return be(`armory-${i}-${kt()}.csv`,Ot(s),`text/csv;charset=utf-8`)}async function jt(){let e=await be(`armory-backup-${kt()}.json`,J.exportJSON(),`application/json`);return e===`saved`&&J.markBackedUp(),e}var Mt=15e4,Nt=12e4,X,Pt=0,Ft=e=>btoa(String.fromCharCode(...new Uint8Array(e))),It=e=>Uint8Array.from(atob(e),e=>e.charCodeAt(0));async function Lt(e,t,n){let r=await crypto.subtle.importKey(`raw`,new TextEncoder().encode(e),`PBKDF2`,!1,[`deriveBits`]);return Ft(await crypto.subtle.deriveBits({name:`PBKDF2`,hash:`SHA-256`,salt:t,iterations:n},r,256))}async function Rt(e){let t=X.data.settings.lock;return!t||await Lt(e,It(t.salt),t.iterations)===t.hash}var zt=()=>document.getElementById(`lock-screen`);function Bt(){if(!X.data.settings.lock)return;document.getElementById(`sheet`).close();let e=zt();e.hidden=!1,document.querySelector(`.app`).inert=!0;let t=e.querySelector(`input`);t.value=``,e.querySelector(`.lock-error`).hidden=!0,t.focus()}function Vt(e){X=e;let t=zt().querySelector(`form`),n=t.querySelector(`input`),r=t.querySelector(`.lock-error`),i=!1;t.addEventListener(`submit`,async e=>{if(e.preventDefault(),i)return;i=!0;let a=await Rt(s(n.value));i=!1,a?(zt().hidden=!0,document.querySelector(`.app`).inert=!1):(r.hidden=!1,n.value=``,t.classList.remove(`shake`),t.offsetWidth,t.classList.add(`shake`),n.focus())}),document.addEventListener(`visibilitychange`,()=>{document.hidden?Pt=Date.now():Pt&&Date.now()-Pt>Nt&&Bt()}),Bt()}function Ht(){let e=!!X.data.settings.lock;F({title:e?`تغيير رمز القفل`:`تفعيل قفل التطبيق`,submitLabel:e?`تغيير`:`تفعيل`,body:`
      ${e?I({label:`الرمز الحالي`,name:`current`,type:`password`,inputmode:`numeric`}):``}
      ${I({label:`الرمز الجديد`,name:`pin`,type:`password`,inputmode:`numeric`,hint:`4 أرقام على الأقل`})}
      ${I({label:`تأكيد الرمز`,name:`confirm`,type:`password`,inputmode:`numeric`})}
      <p class="sheet-text small">إذا نسيت الرمز فلا يمكن فتح التطبيق إلا بمسح بيانات المتصفح، لذا خذ نسخة احتياطية أولاً.</p>`,onSubmit:async t=>{if(e&&!await Rt(s(t.current)))throw new n(`الرمز الحالي غير صحيح`);let r=s(t.pin).trim();if(!/^\d{4,}$/.test(r))throw new n(`الرمز يجب أن يكون 4 أرقام على الأقل`);if(r!==s(t.confirm).trim())throw new n(`الرمزان غير متطابقين`);let i=crypto.getRandomValues(new Uint8Array(16));X.updateSettings({lock:{salt:Ft(i),hash:await Lt(r,i,Mt),iterations:Mt}}),N(e?`تغيّر الرمز`:`فُعّل القفل`)}})}function Ut(){F({title:`إلغاء قفل التطبيق`,submitLabel:`إلغاء القفل`,tone:`danger`,body:I({label:`الرمز الحالي`,name:`current`,type:`password`,inputmode:`numeric`}),onSubmit:async e=>{if(!await Rt(s(e.current)))throw new n(`الرمز غير صحيح`);X.updateSettings({lock:null}),N(`أُلغي القفل`)}})}function Wt(e){let t=(e,t=9,n=0)=>{let r=new Date;return r.setDate(r.getDate()-e),r.setHours(t,n,0,0),re(r)};e.updateSettings({unitName:`السرية الأولى`,keeperName:`رئيس عرفاء كريم ناصر`,commanderName:`نقيب حيدر عبد الأمير`,demo:!0});let n=[[`حيدر عبد الأمير`,`نقيب`,`10234`,`مقر السرية`],[`مصطفى جاسم`,`ملازم أول`,`10567`,`الفصيل الأول`],[`كريم ناصر`,`رئيس عرفاء`,`20311`,`مقر السرية`],[`علي حسن`,`عريف`,`30842`,`الفصيل الأول`],[`أحمد ستار`,`نائب عريف`,`31102`,`الفصيل الثاني`],[`سجاد كاظم`,`جندي أول`,`40125`,`الفصيل الثاني`],[`محمد رضا`,`جندي`,`40377`,`الفصيل الأول`],[`حسين عباس`,`جندي`,`40391`,`الفصيل الثاني`]].map(([t,n,r,i])=>e.addPerson({name:t,rank:n,milNo:r,platoon:i})),r=t(12,8,30),i=(t,n,i,a,o)=>a.map(a=>e.addWeapon({type:t,model:n,caliber:i,serial:a,location:o},{at:r,note:`جرد افتتاحي`})),a=i(`بندقية`,`AK-47`,`7.62×39`,[`AK-58114`,`AK-58122`,`AK-58137`,`AK-58141`,`AK-58150`,`AK-58163`,`AK-58171`,`AK-58189`],`خزانة 1`),o=i(`بندقية`,`M16A4`,`5.56×45`,[`W4402871`,`W4402879`,`W4402886`,`W4402890`],`خزانة 2`),s=i(`مسدس`,`Glock 19`,`9×19`,[`BKZ411`,`BKZ426`,`BKZ438`],`خزانة 3`),c=i(`رشاش متوسط`,`PKM`,`7.62×54R`,[`PK-90311`,`PK-90347`],`رف الرشاشات`),[l]=i(`قاذفة`,`RPG-7`,`40 ملم`,[`RP-77015`],`رف القاذفات`),[u]=i(`بندقية قنص`,`SVD`,`7.62×54R`,[`SV-60412`],`خزانة 1`),d=(t,n)=>e.addAmmo(t,{qty:n,at:r,note:`جرد افتتاحي`}),f=d({name:`عتاد بندقية`,caliber:`7.62×39`,lot:`2024-17`,unit:`طلقة`,minQty:`3000`,location:`المخزن أ`},`12000`),p=d({name:`عتاد بندقية`,caliber:`5.56×45`,lot:`2023-08`,unit:`طلقة`,minQty:`2000`,location:`المخزن أ`},`4000`),m=d({name:`عتاد مسدس`,caliber:`9×19`,unit:`طلقة`,minQty:`500`,location:`المخزن أ`},`900`),h=d({name:`عتاد رشاش`,caliber:`7.62×54R`,lot:`2022-31`,unit:`طلقة`,minQty:`1000`,location:`المخزن ب`},`2400`),g=d({name:`قنبلة يدوية`,caliber:`F1`,unit:`قنبلة`,minQty:`20`,location:`المخزن ب`},`40`),_=d({name:`قذيفة قاذفة`,caliber:`PG-7V`,unit:`قذيفة`,minQty:`10`,location:`المخزن ب`},`14`),[ee,v,y,b,x,te,S,C]=n,w=(n,r,i,a)=>e.issueWeapon(n.id,r.id,{at:t(i,a)});w(s[0],ee,11,9),w(s[1],v,11,9),w(a[0],b,10,7),w(a[1],x,10,7),w(a[2],te,10,7),w(o[0],S,10,7),w(c[0],C,10,7),w(l,y,6,14);let T=(n,r,i,a,o,s,c=``)=>e.ammoMove(n,{ammoId:r.id,personId:i?.id,qty:a,at:t(o,s),note:c});T(`a_issue`,f,b,`120`,10,7,`واجب حراسة`),T(`a_issue`,f,x,`120`,10,7,`واجب حراسة`),T(`a_issue`,f,te,`120`,10,7,`واجب حراسة`),T(`a_issue`,p,S,`90`,10,7,`واجب حراسة`),T(`a_issue`,h,C,`500`,10,7,`واجب حراسة`),T(`a_issue`,m,ee,`30`,11,9),T(`a_issue`,m,v,`30`,11,9),T(`a_issue`,f,v,`600`,4,6,`رمي تدريبي - ميدان الرمي`),T(`a_consume`,f,v,`540`,4,13,`رمي تدريبي - ميدان الرمي`),T(`a_return`,f,v,`60`,4,15,`المتبقي من الرمي التدريبي`),T(`a_issue`,_,y,`6`,6,14,`واجب`),T(`a_issue`,g,y,`4`,6,14,`واجب`),T(`a_in`,p,null,`2000`,3,10,`وارد من مستودع الفوج بالكتاب 412`),T(`a_out`,g,null,`2`,2,11,`إتلاف قنبلتين تالفتين بمحضر لجنة`),e.setWeaponStatus(a[7].id,`maintenance`,{at:t(5,10),note:`عطل في مجموعة الأقسام`}),e.setWeaponStatus(o[3].id,`unserviceable`,{at:t(8,10),note:`كسر في الأخمص`}),w(u,b,2,7),e.returnWeapon(u.id,{at:t(1,16)}),e.updateSettings({demo:!0})}var Z=ee();Te(Z),qe(Z),vt(Z);var Gt={home:()=>ot(),weapons:e=>e?ct(e):st(),ammo:e=>e?ut(e):lt(),people:e=>e?ft(e):dt(),log:()=>mt(),settings:()=>ht()};function Kt(){let[e,t=``]=location.hash.replace(/^#\/?/,``).split(`/`);return Gt[e]?{section:e,id:decodeURIComponent(t)}:{section:`home`,id:``}}var Q=e=>document.querySelector(e),qt=new Map,$=null;function Jt({sameView:e=!1}={}){let{section:t,id:n}=Kt(),r=`${t}/${n}`,i=document.scrollingElement,a=$?.key===r;$&&!a&&qt.set($.key,i.scrollTop);let o=Gt[t](n||void 0);Q(`#page-title`).textContent=o.title,document.title=`${o.title} · مستودع السرية`;let s=Q(`#back-btn`);s.hidden=!o.back,s.dataset.to=o.back||``,Q(`#brand-unit`).textContent=`مستودع ${Z.data.settings.unitName||`السرية`}`,Q(`#lock-btn`).hidden=!Z.data.settings.lock,Q(`.topbar-settings`).hidden=t===`settings`,document.querySelectorAll(`[data-nav]`).forEach(e=>{let n=e.dataset.nav===t;e.classList.toggle(`active`,n),n?e.setAttribute(`aria-current`,`page`):e.removeAttribute(`aria-current`)});let c=Q(`#view`);c.innerHTML=o.html,$={key:r,view:o},c.querySelectorAll(`[data-bind]`).forEach(e=>{let[t,n]=e.dataset.bind.split(`.`);e.value=U[t][n],e.addEventListener(`input`,()=>{U[t][n]=e.value,Yt()})}),Yt(),ce(document.querySelector(`.app`)),e&&a||(i.scrollTop=qt.get(r)||0)}function Yt(){let e=Q(`#list`);e&&$?.view.list&&(e.innerHTML=$.view.list(),ce(e))}function Xt(){let e=history.state?.depth??0;history.state?.depth===void 0&&history.replaceState({...history.state,depth:e},``),window.addEventListener(`hashchange`,()=>{history.state?.depth===void 0?history.replaceState({depth:++e},``):e=history.state.depth,Jt()}),window.addEventListener(`popstate`,()=>{history.state?.depth!==void 0&&(e=history.state.depth)}),Q(`#back-btn`).addEventListener(`click`,()=>{history.state?.depth>0?history.back():location.replace(`#${Q(`#back-btn`).dataset.to.replace(/^#/,``)}`)})}var Zt={"add-person":()=>Pe(),"edit-person":e=>Pe(e.id),"remove-person":e=>Fe(e.id),"add-weapon":()=>Ie(),"edit-weapon":e=>Ie(e.id),"remove-weapon":e=>Le(e.id),"issue-weapon":e=>Re({weaponId:e.id,personId:e.person}),"return-weapon":e=>Be({weaponId:e.id,personId:e.person}),"weapon-status":e=>Ve(e.id),"add-ammo":()=>He(),"edit-ammo":e=>He(e.id),"remove-ammo":e=>Ue(e.id),"ammo-move":e=>Ge(e.kind,{ammoId:e.id,personId:e.person}),"weapons-filter":e=>{Object.assign(U.weapons,{status:e.status,q:``}),P(`#/weapons`)},chip:(e,t)=>{let[n,r]=e.bind.split(`.`);U[n][r]=e.value,t.parentElement.querySelectorAll(`.chip[data-bind="${e.bind}"]`).forEach(e=>{e.classList.toggle(`active`,e===t),e.setAttribute(`aria-pressed`,e===t)}),Yt()},"print-inventory":()=>wt(),"print-custody":e=>Tt(e.id),"print-log":()=>{let{from:e,to:t}=U.log,n=e=>e.replaceAll(`-`,`/`),r=e||t?`من ${e?n(e):`البداية`} إلى ${t?n(t):`اليوم`}`:`كل الحركات`;Et(pt(),r)},"export-csv":async e=>{let t=await At(e.what,e.what===`log`&&Kt().section===`log`?pt():void 0);t===`failed`?N(`تعذّر حفظ الملف`,`error`):t===`saved`&&w&&N(`حُفظ الملف`)},backup:async()=>{let e=await jt();e===`failed`?N(`تعذّر حفظ النسخة الاحتياطية`,`error`):e===`saved`&&N(w?`حُفظت النسخة الاحتياطية`:`نُزّلت النسخة الاحتياطية، احفظها في مكان آمن`)},restore:Qt,reset:$t,demo:()=>{Wt(Z),N(`حُمّلت بيانات نموذجية للتجربة`)},"lock-now":()=>Bt(),"set-lock":()=>Ht(),"remove-lock":()=>Ut()};async function Qt(){let e=await xe(`application/json,.json`);if(!e)return;let t=await e.text(),n={};try{n=JSON.parse(t)}catch{}let r=e=>Array.isArray(n[e])?k(n[e].length):`؟`;await he({title:`استعادة نسخة احتياطية`,message:`ستُستبدل كل البيانات الحالية على هذا الجهاز بمحتوى النسخة${n.exportedAt?` المأخوذة في <b>${O(M(n.exportedAt))}</b>`:``}:
      ${r(`weapons`)} سلاح، ${r(`ammo`)} صنف عتاد، ${r(`people`)} منتسب، ${r(`log`)} حركة. لا يمكن التراجع عن ذلك.`,confirmLabel:`استعادة`,validate:()=>Z.importJSON(t)})&&(N(`اُستعيدت البيانات`),P(`#/home`))}async function $t(){await he({title:`مسح جميع البيانات`,message:`سيُحذف كل شيء من هذا الجهاز نهائياً: الأسلحة والأعتدة والمنتسبون والسجل. للتأكيد اكتب كلمة <b>مسح</b>.`,confirmLabel:`مسح نهائي`,extra:I({label:`كلمة التأكيد`,name:`confirm`}),validate:e=>{if(e.confirm.trim()!==`مسح`)throw new n(`اكتب كلمة «مسح» للتأكيد`);Z.reset()}})&&(N(`مُسحت البيانات`),P(`#/home`))}document.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action]`);if(!t||t.closest(`#sheet`))return;let r=Zt[t.dataset.action];r&&(e.preventDefault(),Promise.resolve(r(t.dataset,t)).catch(e=>{e instanceof n||console.error(e),N(e instanceof n?e.message:`حدث خطأ غير متوقع`,`error`)}))}),document.addEventListener(`submit`,e=>{let t=e.target.closest(`form[data-form="settings"]`);if(!t)return;e.preventDefault();let n=Object.fromEntries(new FormData(t));try{Z.updateSettings({unitName:n.unitName.trim(),keeperName:n.keeperName.trim(),commanderName:n.commanderName.trim()}),N(`حُفظت بيانات السرية`)}catch(e){N(e.message,`error`)}}),te(),me(),Xt(),Vt(Z),Z.subscribe(()=>Jt({sameView:!0})),Jt(),navigator.storage?.persist?.().catch(()=>{}),!w&&`serviceWorker`in navigator&&window.addEventListener(`load`,()=>navigator.serviceWorker.register(`sw.js`).catch(()=>{}));