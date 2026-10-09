(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=class extends Error{},t=`armory-app:data:v1`,n=`armory-app:unreadable-copy`,r={in_store:{label:`في المستودع`,tone:`ok`},issued:{label:`مسلّم`,tone:`warn`},maintenance:{label:`في الصيانة`,tone:`info`},unserviceable:{label:`عاطل`,tone:`muted`},lost:{label:`مفقود`,tone:`danger`}},i={w_add:{label:`إدخال سلاح`,icon:`plus`,group:`weapons`},w_issue:{label:`تسليم سلاح`,icon:`issue`,group:`weapons`},w_return:{label:`إرجاع سلاح`,icon:`return`,group:`weapons`},w_status:{label:`تغيير حالة سلاح`,icon:`wrench`,group:`weapons`},w_remove:{label:`شطب سلاح`,icon:`trash`,group:`weapons`},a_in:{label:`استلام عتاد وارد`,icon:`receive`,group:`ammo`},a_issue:{label:`صرف عتاد`,icon:`issue`,group:`ammo`},a_return:{label:`إرجاع عتاد`,icon:`return`,group:`ammo`},a_consume:{label:`استهلاك عتاد`,icon:`flame`,group:`ammo`},a_out:{label:`إخراج عتاد`,icon:`send`,group:`ammo`},a_adjust:{label:`تسوية جرد`,icon:`scale`,group:`ammo`}},a=e=>String(e??``).replace(/[٠-٩]/g,e=>String(e.charCodeAt(0)-1632)).replace(/[۰-۹]/g,e=>String(e.charCodeAt(0)-1776)),o=e=>String(e??``).replace(/[\u2066-\u2069]/g,``).trim().replace(/\s+/g,` `),s=e=>a(o(e)),c=()=>globalThis.crypto?.randomUUID?.()??`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`,l=e=>[e.rank,e.name].filter(Boolean).join(` `),u=e=>`${e.model||e.type} — ${e.serial}`,d=e=>[e.name,e.caliber].filter(Boolean).join(` `)+(e.lot?` (وجبة ${e.lot})`:``);function f(t,n,{allowZero:r=!1}={}){let i=a(t).trim().replace(/[,،]/g,``),o=i===``?NaN:Number(i);if(!Number.isInteger(o)||o<0||!r&&o===0)throw new e(`${n} يجب أن تكون عدداً صحيحاً ${r?`لا يقل عن صفر`:`أكبر من صفر`}`);return o}function p(t,n){if(!t)return n().toISOString();let r=new Date(t);if(Number.isNaN(r.getTime()))throw new e(`التاريخ غير صحيح`);return r.toISOString()}function m(){return{version:1,settings:{unitName:``,keeperName:``,commanderName:``,lastBackupAt:null,lock:null},people:[],weapons:[],ammo:[],log:[]}}function h(t){if(!t||typeof t!=`object`||[`people`,`weapons`,`ammo`,`log`].some(e=>!Array.isArray(t[e])))throw new e(`الملف ليس نسخة احتياطية من هذا التطبيق`);let n=m(),a=e=>e&&typeof e==`object`&&typeof e.id==`string`;return{version:1,settings:{...n.settings,...t.settings&&typeof t.settings==`object`?t.settings:{}},people:t.people.filter(e=>a(e)&&e.name),weapons:t.weapons.filter(e=>a(e)&&e.serial).map(e=>r[e.status]?e:{...e,status:`in_store`,holderId:null}),ammo:t.ammo.filter(e=>a(e)&&e.name),log:t.log.filter(e=>a(e)&&i[e.kind]&&!Number.isNaN(new Date(e.at).getTime()))}}function g({storage:a=globalThis.localStorage,now:g=()=>new Date}={}){let _=!0,ee=null,v=null,y=S(),b=null,x=new Set;function S(){let e=null;try{e=a?a.getItem(t):null,a||(_=!1)}catch{_=!1}if(!e)return m();try{let t=h(JSON.parse(e));return v=e,t}catch{try{a.setItem(n,e)}catch{}return ee=`تعذّرت قراءة البيانات المحفوظة، فبدأ التطبيق بسجل فارغ. احتُفظ بالنسخة التالفة على الجهاز.`,m()}}function C(n){let r=n();if(b=null,_){let n=JSON.stringify(y);try{a.setItem(t,n),v=n}catch{throw y=v?h(JSON.parse(v)):m(),x.forEach(e=>e()),new e(`تعذّر الحفظ: مساحة التخزين على هذا الجهاز ممتلئة أو محجوبة`)}}return x.forEach(e=>e()),r}let w=e=>y.log.push({id:c(),...e}),T=e=>y.people.find(t=>t.id===e),E=e=>y.weapons.find(t=>t.id===e),D=e=>y.ammo.find(t=>t.id===e),O=(t,n)=>{if(!t)throw new e(n);return t};function te(){if(b)return b;let e=new Map;for(let t of y.log){if(!t.ammoId)continue;let n=e.get(t.ammoId);n||e.set(t.ammoId,n={store:0,issued:0,byPerson:new Map});let r=t.qty||0,i=e=>{let r=(n.byPerson.get(t.personId)||0)+e;r?n.byPerson.set(t.personId,r):n.byPerson.delete(t.personId),n.issued+=e};switch(t.kind){case`a_in`:case`a_adjust`:n.store+=r;break;case`a_out`:n.store-=r;break;case`a_issue`:n.store-=r,i(r);break;case`a_return`:n.store+=r,i(-r);break;case`a_consume`:i(-r)}}return b=e}let k=e=>te().get(e)||{store:0,issued:0,byPerson:new Map};function ne(e){let t=y.weapons.filter(t=>t.status===`issued`&&t.holderId===e),n=[];for(let t of y.ammo){let r=k(t.id).byPerson.get(e)||0;r&&n.push({ammo:t,qty:r})}return{weapons:t,ammo:n}}function A(t,n){let r={name:o(t.name),rank:o(t.rank),milNo:s(t.milNo),platoon:o(t.platoon),phone:s(t.phone),notes:o(t.notes)};if(!r.name)throw new e(`اكتب اسم المنتسب`);if(r.milNo&&y.people.some(e=>e.id!==n&&e.milNo===r.milNo))throw new e(`الرقم العسكري ${r.milNo} مسجّل لمنتسب آخر`);return r}function re(t,n){let r={type:o(t.type),model:o(t.model),serial:s(t.serial),caliber:o(t.caliber),location:o(t.location),notes:o(t.notes)};if(!r.type&&!r.model)throw new e(`اكتب نوع السلاح أو طرازه`);if(!r.serial)throw new e(`اكتب الرقم التسلسلي للسلاح`);let i=e=>`${e.type}|${e.model}|${e.serial}`.toLowerCase();if(y.weapons.some(e=>e.id!==n&&i(e)===i(r)))throw new e(`السلاح ${r.model||r.type} بالرقم التسلسلي ${r.serial} مسجّل مسبقاً`);return r}function j(t,n){let r={name:o(t.name),caliber:o(t.caliber),lot:s(t.lot),unit:o(t.unit)||`طلقة`,minQty:t.minQty?f(t.minQty,`الحد الأدنى`,{allowZero:!0}):0,location:o(t.location),notes:o(t.notes)};if(!r.name)throw new e(`اكتب اسم صنف العتاد`);let i=e=>`${e.name}|${e.caliber}|${e.lot}`.toLowerCase();if(y.ammo.some(e=>e.id!==n&&i(e)===i(r)))throw new e(`هذا الصنف مسجّل مسبقاً بنفس العيار ورقم الوجبة`);return r}return{get data(){return y},get persistent(){return _},get loadProblem(){return ee},subscribe(e){return x.add(e),()=>x.delete(e)},findPerson:T,findWeapon:E,findAmmo:D,balanceOf:k,custodyOf:ne,updateSettings(e){return C(()=>{y.settings={...y.settings,...e}})},addPerson(e){let t=A(e);return C(()=>{let e={id:c(),...t,createdAt:g().toISOString()};return y.people.push(e),e})},updatePerson(e,t){let n=O(T(e),`المنتسب غير موجود`),r=A(t,e);return C(()=>Object.assign(n,r))},removePerson(t){O(T(t),`المنتسب غير موجود`);let n=ne(t);if(n.weapons.length||n.ammo.length)throw new e(`لا يمكن حذف منتسب بذمته أسلحة أو أعتدة. أرجعها أولاً`);return C(()=>{y.people=y.people.filter(e=>e.id!==t)})},addWeapon(e,{at:t,note:n}={}){let r=re(e),i=p(t,g);return C(()=>{let e={id:c(),...r,status:`in_store`,holderId:null,createdAt:g().toISOString()};return y.weapons.push(e),w({at:i,kind:`w_add`,weaponId:e.id,w:u(e),note:o(n)}),e})},updateWeapon(e,t){let n=O(E(e),`السلاح غير موجود`),r=re(t,e);return C(()=>Object.assign(n,r))},removeWeapon(t,{note:n}={}){let r=O(E(t),`السلاح غير موجود`);if(r.status===`issued`)throw new e(`السلاح بذمة منتسب. أرجعه أولاً ثم اشطبه`);return C(()=>{w({at:g().toISOString(),kind:`w_remove`,weaponId:t,w:u(r),from:r.status,note:o(n)}),y.weapons=y.weapons.filter(e=>e.id!==t)})},issueWeapon(t,n,{at:i,note:a}={}){let s=O(E(t),`اختر السلاح`),c=O(T(n),`اختر المنتسب المستلم`);if(s.status!==`in_store`)throw new e(`لا يمكن تسليم السلاح: حالته الآن «${r[s.status].label}»`);let d=p(i,g);return C(()=>{s.status=`issued`,s.holderId=c.id,w({at:d,kind:`w_issue`,weaponId:s.id,personId:c.id,w:u(s),p:l(c),note:o(a)})})},returnWeapon(t,{status:n=`in_store`,at:r,note:i}={}){let a=O(E(t),`اختر السلاح`);if(a.status!==`issued`)throw new e(`السلاح ليس بذمة أحد`);if(![`in_store`,`maintenance`,`unserviceable`,`lost`].includes(n))throw new e(`اختر حالة السلاح`);let s=T(a.holderId),c=p(r,g);return C(()=>{w({at:c,kind:n===`lost`?`w_status`:`w_return`,weaponId:a.id,personId:a.holderId,w:u(a),p:s?l(s):``,from:`issued`,to:n,note:o(i)}),a.status=n,a.holderId=null})},setWeaponStatus(t,n,{at:i,note:a}={}){let s=O(E(t),`اختر السلاح`);if(s.status===`issued`)throw new e(`السلاح بذمة منتسب. استخدم «إرجاع» لإنهاء الذمة`);if(!r[n]||n===`issued`)throw new e(`اختر الحالة الجديدة`);if(n===s.status)throw new e(`هذه هي حالة السلاح الحالية`);let c=p(i,g);return C(()=>{w({at:c,kind:`w_status`,weaponId:s.id,w:u(s),from:s.status,to:n,note:o(a)}),s.status=n})},addAmmo(e,{qty:t,at:n,note:r}={}){let i=j(e),a=t?f(t,`الكمية الأولية`,{allowZero:!0}):0,s=p(n,g);return C(()=>{let e={id:c(),...i,createdAt:g().toISOString()};return y.ammo.push(e),a&&w({at:s,kind:`a_in`,ammoId:e.id,qty:a,a:d(e),u:e.unit,note:o(r)||`رصيد افتتاحي`}),e})},updateAmmo(e,t){let n=O(D(e),`الصنف غير موجود`),r=j(t,e);return C(()=>Object.assign(n,r))},removeAmmo(t){O(D(t),`الصنف غير موجود`);let n=k(t);if(n.issued)throw new e(`بعض هذا العتاد بذمة منتسبين. أرجعه أو سجّل استهلاكه أولاً`);if(n.store)throw new e(`في المستودع رصيد من هذا الصنف. سجّل إخراجه أو صفّره بتسوية جرد أولاً`);return C(()=>{y.ammo=y.ammo.filter(e=>e.id!==t)})},ammoMove(t,{ammoId:n,personId:r,qty:a,counted:s,at:c,note:u}={}){if(i[t]?.group!==`ammo`)throw new e(`نوع حركة غير معروف`);let m=O(D(n),`اختر صنف العتاد`),h=k(m.id),_={kind:t,ammoId:m.id,a:d(m),u:m.unit,note:o(u)};if(t===`a_adjust`){let t=f(s,`الكمية الموجودة فعلاً`,{allowZero:!0});if(t===h.store)throw new e(`الكمية مطابقة لرصيد المستودع، لا حاجة للتسوية`);_.qty=t-h.store,_.counted=t}else{let n=f(a,`الكمية`);if(_.qty=n,t===`a_issue`||t===`a_return`||t===`a_consume`){let i=O(T(r),`اختر المنتسب`);if(_.personId=i.id,_.p=l(i),t!==`a_issue`){let t=h.byPerson.get(i.id)||0;if(n>t)throw new e(`بذمة ${l(i)} ${t} ${m.unit} فقط من هذا الصنف`)}}if((t===`a_issue`||t===`a_out`)&&n>h.store)throw new e(`الرصيد في المستودع ${h.store} ${m.unit} فقط`)}return _.at=p(c,g),C(()=>w(_))},exportJSON(){let e={app:`armory-app`,exportedAt:g().toISOString(),...y,settings:{...y.settings,lock:null}};return JSON.stringify(e,null,2)},markBackedUp(){return C(()=>{y.settings.lastBackupAt=g().toISOString()})},importJSON(t){let n;try{n=JSON.parse(t)}catch{throw new e(`تعذّرت قراءة الملف`)}let r=h(n);return C(()=>{r.settings.lock=y.settings.lock,y=r})},reset(){return C(()=>{let e=y.settings.lock;y=m(),y.settings.lock=e})}}}var _={home:[[`path`,{d:`M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8`}],[`path`,{d:`M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z`}]],weapon:[[`circle`,{cx:`12`,cy:`12`,r:`10`}],[`line`,{x1:`22`,x2:`18`,y1:`12`,y2:`12`}],[`line`,{x1:`6`,x2:`2`,y1:`12`,y2:`12`}],[`line`,{x1:`12`,x2:`12`,y1:`6`,y2:`2`}],[`line`,{x1:`12`,x2:`12`,y1:`22`,y2:`18`}]],ammo:[[`path`,{d:`M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z`}],[`path`,{d:`m7 16.5-4.74-2.85`}],[`path`,{d:`m7 16.5 5-3`}],[`path`,{d:`M7 16.5v5.17`}],[`path`,{d:`M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z`}],[`path`,{d:`m17 16.5-5-3`}],[`path`,{d:`m17 16.5 4.74-2.85`}],[`path`,{d:`M17 16.5v5.17`}],[`path`,{d:`M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z`}],[`path`,{d:`M12 8 7.26 5.15`}],[`path`,{d:`m12 8 4.74-2.85`}],[`path`,{d:`M12 13.5V8`}]],people:[[`path`,{d:`M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2`}],[`path`,{d:`M16 3.128a4 4 0 0 1 0 7.744`}],[`path`,{d:`M22 21v-2a4 4 0 0 0-3-3.87`}],[`circle`,{cx:`9`,cy:`7`,r:`4`}]],log:[[`path`,{d:`M15 12h-5`}],[`path`,{d:`M15 8h-5`}],[`path`,{d:`M19 17V5a2 2 0 0 0-2-2H4`}],[`path`,{d:`M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3`}]],settings:[[`path`,{d:`M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915`}],[`circle`,{cx:`12`,cy:`12`,r:`3`}]],plus:[[`path`,{d:`M5 12h14`}],[`path`,{d:`M12 5v14`}]],search:[[`path`,{d:`m21 21-4.34-4.34`}],[`circle`,{cx:`11`,cy:`11`,r:`8`}]],close:[[`path`,{d:`M18 6 6 18`}],[`path`,{d:`m6 6 12 12`}]],back:[[`path`,{d:`M5 12h14`}],[`path`,{d:`m12 5 7 7-7 7`}]],chevron:[[`path`,{d:`m15 18-6-6 6-6`}]],edit:[[`path`,{d:`M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z`}],[`path`,{d:`m15 5 4 4`}]],trash:[[`path`,{d:`M10 11v6`}],[`path`,{d:`M14 11v6`}],[`path`,{d:`M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6`}],[`path`,{d:`M3 6h18`}],[`path`,{d:`M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2`}]],issue:[[`path`,{d:`m18 9-6-6-6 6`}],[`path`,{d:`M12 3v14`}],[`path`,{d:`M5 21h14`}]],return:[[`path`,{d:`M12 17V3`}],[`path`,{d:`m6 11 6 6 6-6`}],[`path`,{d:`M19 21H5`}]],wrench:[[`path`,{d:`M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z`}]],alert:[[`path`,{d:`m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3`}],[`path`,{d:`M12 9v4`}],[`path`,{d:`M12 17h.01`}]],print:[[`path`,{d:`M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2`}],[`path`,{d:`M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6`}],[`rect`,{x:`6`,y:`14`,width:`12`,height:`8`,rx:`1`}]],sheet:[[`path`,{d:`M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z`}],[`path`,{d:`M14 2v5a1 1 0 0 0 1 1h5`}],[`path`,{d:`M8 13h2`}],[`path`,{d:`M14 13h2`}],[`path`,{d:`M8 17h2`}],[`path`,{d:`M14 17h2`}]],backup:[[`path`,{d:`M12 2v8`}],[`path`,{d:`m16 6-4 4-4-4`}],[`rect`,{width:`20`,height:`8`,x:`2`,y:`14`,rx:`2`}],[`path`,{d:`M6 18h.01`}],[`path`,{d:`M10 18h.01`}]],restore:[[`path`,{d:`m16 6-4-4-4 4`}],[`path`,{d:`M12 2v8`}],[`rect`,{width:`20`,height:`8`,x:`2`,y:`14`,rx:`2`}],[`path`,{d:`M6 18h.01`}],[`path`,{d:`M10 18h.01`}]],lock:[[`rect`,{width:`18`,height:`11`,x:`3`,y:`11`,rx:`2`,ry:`2`}],[`path`,{d:`M7 11V7a5 5 0 0 1 10 0v4`}]],unlock:[[`rect`,{width:`18`,height:`11`,x:`3`,y:`11`,rx:`2`,ry:`2`}],[`path`,{d:`M7 11V7a5 5 0 0 1 9.9-1`}]],shield:[[`path`,{d:`M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z`}],[`path`,{d:`m9 12 2 2 4-4`}]],flame:[[`path`,{d:`M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4`}]],scale:[[`path`,{d:`M12 3v18`}],[`path`,{d:`m19 8 3 8a5 5 0 0 1-6 0zV7`}],[`path`,{d:`M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1`}],[`path`,{d:`m5 8 3 8a5 5 0 0 1-6 0zV7`}],[`path`,{d:`M7 21h10`}]],receive:[[`path`,{d:`M12 22V12`}],[`path`,{d:`M16 17h6`}],[`path`,{d:`M19 14v6`}],[`path`,{d:`M21 10.535V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.729l7 4a2 2 0 0 0 2 .001l1.675-.955`}],[`path`,{d:`M3.29 7 12 12l8.71-5`}],[`path`,{d:`m7.5 4.27 8.997 5.148`}]],send:[[`path`,{d:`M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z`}],[`path`,{d:`m21.854 2.147-10.94 10.939`}]],user:[[`path`,{d:`M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2`}],[`circle`,{cx:`12`,cy:`7`,r:`4`}]],info:[[`circle`,{cx:`12`,cy:`12`,r:`10`}],[`path`,{d:`M12 16v-4`}],[`path`,{d:`M12 8h.01`}]],erase:[[`path`,{d:`M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21`}],[`path`,{d:`m5.082 11.09 8.828 8.828`}]],key:[[`path`,{d:`M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z`}],[`circle`,{cx:`16.5`,cy:`7.5`,r:`.5`,fill:`currentColor`}]],data:[[`ellipse`,{cx:`12`,cy:`5`,rx:`9`,ry:`3`}],[`path`,{d:`M3 5V19A9 3 0 0 0 21 19V5`}],[`path`,{d:`M3 12A9 3 0 0 0 21 12`}]],"no-results":[[`path`,{d:`m13.5 8.5-5 5`}],[`path`,{d:`m8.5 8.5 5 5`}],[`circle`,{cx:`11`,cy:`11`,r:`8`}],[`path`,{d:`m21 21-4.3-4.3`}]],empty:[[`polyline`,{points:`22 12 16 12 14 15 10 15 8 12 2 12`}],[`path`,{d:`M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z`}]],check:[[`circle`,{cx:`12`,cy:`12`,r:`10`}],[`path`,{d:`m16 9-5.5 5.5L8 12`}]]},ee=e=>String(e).replace(/&/g,`&amp;`).replace(/"/g,`&quot;`);function v(e){let t=_[e];return t?`<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${t.map(([e,t])=>`<${e} ${Object.entries(t).map(([e,t])=>`${e}="${ee(t)}"`).join(` `)}/>`).join(``)}</svg>`:``}var y=e=>`<i class="ic" data-icon="${e}" data-drawn>${v(e)}</i>`;function b(e=document){e.querySelectorAll(`[data-icon]:not([data-drawn])`).forEach(e=>{e.innerHTML=v(e.dataset.icon),e.dataset.drawn=``})}var x=e=>String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]),S=e=>Number(e||0).toLocaleString(`en-US`),C=e=>String(e).padStart(2,`0`),w=e=>{let t=new Date(e);return`${t.getFullYear()}/${C(t.getMonth()+1)}/${C(t.getDate())}`},T=e=>{let t=new Date(e);return`${C(t.getHours())}:${C(t.getMinutes())}`},E=e=>`${w(e)} ${T(e)}`,D=(e=new Date)=>`${e.getFullYear()}-${C(e.getMonth()+1)}-${C(e.getDate())}T${C(e.getHours())}:${C(e.getMinutes())}`,O=e=>{let t=new Date(e);return`${t.getFullYear()}-${C(t.getMonth()+1)}-${C(t.getDate())}`},te=e=>a(e).toLowerCase().replace(/[ً-ْـ]/g,``).replace(/[أإآ]/g,`ا`).replace(/ة/g,`ه`).replace(/ى/g,`ي`),k=(e,...t)=>{let n=te(e).trim();return!n||n.split(/\s+/).every(e=>te(t.filter(Boolean).join(` `)).includes(e))},ne=/[0-9][0-9A-Za-z.]*(?:\s?[×xX*-]\s?[0-9][0-9A-Za-z.]*)+/g;function A(e){let t=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);for(let e=t.nextNode();e;e=t.nextNode()){if(e.parentNode.nodeName===`TEXTAREA`||e.data.includes(`⁦`))continue;let t=e.data.replace(ne,e=>`\u2066${e}\u2069`);t!==e.data&&(e.data=t)}}var re;function j(e,t=`ok`){let n=document.getElementById(`toast`);n.innerHTML=`${y(t===`error`?`alert`:`check`)}<span>${x(e)}</span>`,A(n),n.className=`toast show ${t}`,clearTimeout(re),re=setTimeout(()=>{n.className=`toast`},2600)}var ie=()=>document.getElementById(`sheet`),ae=!1,oe=!1,se=null;function ce(){let e=ie();e.addEventListener(`close`,()=>{e.innerHTML=``,ae&&(ae=!1,oe=!0,history.back())}),e.addEventListener(`click`,t=>{t.target===e&&e.close()}),window.addEventListener(`popstate`,()=>{if(oe){if(oe=!1,se!==null){let e=se;se=null,location.hash=e}}else e.open&&(ae=!1,e.close())})}function M(e){oe?se=e:location.hash=e}function N({title:t,body:n,submitLabel:r=`حفظ`,tone:i=`primary`,onSubmit:a,onOpen:o}){let s=ie();if(s.open)return;s.innerHTML=`
    <form class="sheet" novalidate>
      <header class="sheet-head">
        <h2>${x(t)}</h2>
        <button type="button" class="icon-btn" data-close aria-label="إغلاق">${y(`close`)}</button>
      </header>
      <div class="sheet-body">${n}</div>
      <p class="form-error" role="alert" hidden></p>
      <footer class="sheet-foot">
        <button type="submit" class="btn ${i}">${x(r)}</button>
        <button type="button" class="btn ghost" data-close>إلغاء</button>
      </footer>
    </form>`;let c=s.querySelector(`form`),l=c.querySelector(`.form-error`);c.querySelectorAll(`[data-close]`).forEach(e=>e.addEventListener(`click`,()=>s.close())),pe(c),c.addEventListener(`submit`,async t=>{t.preventDefault(),l.hidden=!0;try{await a(Object.fromEntries(new FormData(c)),c),s.close()}catch(t){t instanceof e||console.error(t),l.innerHTML=`${y(`alert`)} ${x(t instanceof e?t.message:`حدث خطأ غير متوقع، حاول مرة أخرى`)}`,l.hidden=!1,l.scrollIntoView({block:`nearest`})}}),A(c),history.pushState({sheet:!0},``),ae=!0,s.showModal(),matchMedia(`(pointer: fine)`).matches?c.querySelector(`.sheet-body input:not([type=hidden]):not([type=radio]), .sheet-body textarea`)?.focus():s.querySelector(`.sheet`).focus(),o?.(c)}var le=({title:e,message:t,confirmLabel:n,tone:r=`danger`,extra:i=``,validate:a})=>new Promise(o=>{let s=!1;N({title:e,submitLabel:n,tone:r,body:`<p class="sheet-text">${t}</p>${i}`,onSubmit:e=>{a?.(e),s=e}}),ie().addEventListener(`close`,()=>o(s),{once:!0})});function P({label:e,name:t,value:n=``,type:r=`text`,placeholder:i=``,list:a=``,inputmode:o=``,required:s=!1,hint:c=``,mono:l=!1}){return`<label class="field">
    <span class="field-label">${x(e)}${s?` <b class="req" aria-hidden="true">*</b>`:``}</span>
    <input class="input${l?` mono`:``}" name="${t}" type="${r}" value="${x(n)}" placeholder="${x(i)}"
      ${a?`list="${a}"`:``} ${o?`inputmode="${o}"`:``} autocomplete="off" ${s?`aria-required="true"`:``}>
    ${c?`<small class="field-hint">${c}</small>`:``}
  </label>`}var ue=({label:e,name:t,value:n=``,placeholder:r=``})=>`<label class="field">
    <span class="field-label">${x(e)}</span>
    <textarea class="input" name="${t}" rows="2" placeholder="${x(r)}">${x(n)}</textarea>
  </label>`,F=(e=`التاريخ والوقت`)=>P({label:e,name:`at`,type:`datetime-local`,value:D()}),I=(e,t)=>`<datalist id="${e}">${[...new Set(t.filter(Boolean))].map(e=>`<option value="${x(e)}">`).join(``)}</datalist>`,L=(...e)=>`<div class="field-row">${e.join(``)}</div>`;function de({label:e,name:t,options:n,selected:r=``,empty:i=`لا توجد عناصر متاحة`}){let a=`<span class="field-label">${x(e)} <b class="req" aria-hidden="true">*</b></span>`;if(!n.length)return`<div class="field">${a}<div class="picker-empty">${y(`empty`)} ${x(i)}</div></div>`;let o=n.length>5?`<div class="search-box small">${y(`search`)}<input type="search" class="picker-search" placeholder="ابحث…" aria-label="بحث في ${x(e)}"></div>`:``;return`<div class="field" role="group" aria-label="${x(e)}">${a}<div class="picker">${o}
    <div class="picker-list">${n.map(e=>`
      <label class="picker-opt" data-key="${x(te(`${e.label} ${e.sub||``} ${e.meta||``}`))}">
        <input type="radio" name="${t}" value="${x(e.value)}"${e.value===r?` checked`:``}>
        <span class="picker-text"><b>${x(e.label)}</b>${e.sub?`<small>${x(e.sub)}</small>`:``}</span>
        ${e.meta?`<span class="picker-meta">${x(e.meta)}</span>`:``}
      </label>`).join(``)}
    </div><p class="picker-none" hidden>لا نتائج مطابقة</p></div></div>`}var fe=({label:e,name:t,value:n,text:r,sub:i=``})=>`<div class="field">
    <span class="field-label">${x(e)}</span>
    <div class="fixed-value"><b>${x(r)}</b>${i?`<small>${x(i)}</small>`:``}</div>
    <input type="hidden" name="${t}" value="${x(n)}">
  </div>`;function pe(e){e.querySelectorAll(`.picker`).forEach(e=>{let t=e.querySelector(`.picker-search`),n=[...e.querySelectorAll(`.picker-opt`)],r=e.querySelector(`.picker-none`);t?.addEventListener(`input`,()=>{let e=te(t.value).trim().split(/\s+/),i=0;n.forEach(t=>{let n=e.every(e=>t.dataset.key.includes(e));t.hidden=!n,i+=n}),r.hidden=i>0}),t?.addEventListener(`keydown`,e=>{e.key===`Enter`&&e.preventDefault()}),e.querySelector(`input:checked`)?.closest(`.picker-opt`)?.scrollIntoView({block:`nearest`})})}function me(e,t,n){let r=URL.createObjectURL(t instanceof Blob?t:new Blob([t],{type:n})),i=Object.assign(document.createElement(`a`),{href:r,download:e});document.body.append(i),i.click(),i.remove(),setTimeout(()=>URL.revokeObjectURL(r),1e3)}function he(e){return new Promise(t=>{let n=Object.assign(document.createElement(`input`),{type:`file`,accept:e});n.addEventListener(`change`,()=>t(n.files[0]||null),{once:!0}),n.click()})}var ge=[`بندقية`,`بندقية قنص`,`مسدس`,`رشاش خفيف`,`رشاش متوسط`,`رشاش ثقيل`,`قاذفة`,`هاون`],_e=[`طلقة`,`صندوق`,`قنبلة`,`قذيفة`,`صاروخ`,`مخزن`],ve=[`جندي`,`جندي أول`,`نائب عريف`,`عريف`,`رقيب`,`رئيس عرفاء`,`نائب ضابط`,`ملازم`,`ملازم أول`,`نقيب`,`رائد`,`مقدم`,`عقيد`],R,ye=e=>{R=e},z=(e,t)=>e.map(e=>e[t]),B=(e=`مثال: رقم الكتاب أو سبب الحركة`)=>ue({label:`ملاحظات`,name:`note`,placeholder:e}),be=e=>({value:e.id,label:l(e),sub:[e.milNo&&`ر.ع ${e.milNo}`,e.platoon].filter(Boolean).join(` · `)}),xe=()=>R.data.people.map(be),Se=e=>({value:e.id,label:e.model||e.type,sub:[e.type!==e.model&&e.type,e.caliber].filter(Boolean).join(` · `),meta:e.serial}),Ce=(e,t)=>({value:e.id,label:[e.name,e.caliber].filter(Boolean).join(` `),sub:e.lot?`وجبة ${e.lot}`:``,meta:t}),we=(e,t=`المنتسب`)=>{let n=e&&R.findPerson(e);return n?fe({label:t,name:`personId`,value:n.id,text:l(n),sub:n.milNo?`ر.ع ${n.milNo}`:``}):de({label:t,name:`personId`,options:xe(),empty:`لا يوجد منتسبون. أضفهم من صفحة المنتسبين`})},Te=(e,t,n)=>{let r=e&&R.findWeapon(e);return r?fe({label:`السلاح`,name:`weaponId`,value:r.id,text:r.model||r.type,sub:`الرقم التسلسلي ${r.serial}`}):de({label:`السلاح`,name:`weaponId`,options:t,empty:n})},Ee=(e,t,n)=>{let r=e&&R.findAmmo(e);return r?fe({label:`صنف العتاد`,name:`ammoId`,value:r.id,text:d(r),sub:`في المستودع: ${S(R.balanceOf(r.id).store)} ${r.unit}`}):de({label:`صنف العتاد`,name:`ammoId`,options:t,empty:n})};function De(e){let t=e?R.findPerson(e):{},n=R.data.people;N({title:e?`تعديل بيانات المنتسب`:`إضافة منتسب`,submitLabel:e?`حفظ التعديلات`:`إضافة`,body:`
      ${P({label:`الاسم الثلاثي`,name:`name`,value:t.name,required:!0})}
      ${L(P({label:`الرتبة`,name:`rank`,value:t.rank,list:`dl-ranks`}),P({label:`الرقم العسكري`,name:`milNo`,value:t.milNo,inputmode:`numeric`,mono:!0}))}
      ${L(P({label:`الفصيل / الحضيرة`,name:`platoon`,value:t.platoon,list:`dl-platoons`}),P({label:`رقم الهاتف`,name:`phone`,value:t.phone,type:`tel`,inputmode:`tel`,mono:!0}))}
      ${ue({label:`ملاحظات`,name:`notes`,value:t.notes})}
      ${I(`dl-ranks`,[...ve,...z(n,`rank`)])}
      ${I(`dl-platoons`,z(n,`platoon`))}`,onSubmit:t=>{e?R.updatePerson(e,t):R.addPerson(t),j(e?`حُفظت التعديلات`:`أُضيف ${t.name.trim()}`)}})}async function Oe(e){await le({title:`حذف المنتسب`,message:`سيُحذف <b>${x(l(R.findPerson(e)))}</b> من قائمة المنتسبين. تبقى حركاته السابقة في السجل.`,confirmLabel:`حذف`,validate:()=>R.removePerson(e)})&&(j(`حُذف المنتسب`),M(`#/people`))}function ke(e){let t=e?R.findWeapon(e):{},n=R.data.weapons;N({title:e?`تعديل بيانات السلاح`:`إدخال سلاح للمستودع`,submitLabel:e?`حفظ التعديلات`:`إدخال`,body:`
      ${L(P({label:`النوع`,name:`type`,value:t.type,list:`dl-wtypes`,placeholder:`بندقية`}),P({label:`الطراز`,name:`model`,value:t.model,list:`dl-wmodels`,placeholder:`AK-47`,mono:!0}))}
      ${P({label:`الرقم التسلسلي`,name:`serial`,value:t.serial,required:!0,mono:!0})}
      ${L(P({label:`العيار`,name:`caliber`,value:t.caliber,list:`dl-calibers`,placeholder:`7.62×39`,mono:!0}),P({label:`مكان الخزن`,name:`location`,value:t.location,list:`dl-wloc`,placeholder:`خزانة 1`}))}
      ${ue({label:`ملاحظات`,name:`notes`,value:t.notes,placeholder:`الملحقات، الحالة الفنية…`})}
      ${e?``:F(`تاريخ الإدخال`)}
      ${I(`dl-wtypes`,[...ge,...z(n,`type`)])}
      ${I(`dl-wmodels`,z(n,`model`))}
      ${I(`dl-calibers`,[...z(n,`caliber`),...z(R.data.ammo,`caliber`)])}
      ${I(`dl-wloc`,z(n,`location`))}`,onSubmit:t=>{e?(R.updateWeapon(e,t),j(`حُفظت التعديلات`)):j(`أُدخل السلاح ${R.addWeapon(t,{at:t.at}).serial}`)}})}async function Ae(e){await le({title:`شطب السلاح`,message:`سيُشطب السلاح <b>${x(u(R.findWeapon(e)))}</b> من قيود المستودع، ويُسجَّل الشطب في السجل.`,confirmLabel:`شطب`,extra:B(`سبب الشطب`),validate:t=>R.removeWeapon(e,{note:t.note})})&&(j(`شُطب السلاح`),M(`#/weapons`))}function je({weaponId:e,personId:t}={}){N({title:`تسليم سلاح لمنتسب`,submitLabel:`تسليم`,body:`
      ${Te(e,R.data.weapons.filter(e=>e.status===`in_store`).map(Se),`لا توجد أسلحة في المستودع جاهزة للتسليم`)}
      ${we(t,`المستلم`)}
      ${F()}
      ${B()}`,onSubmit:e=>{R.issueWeapon(e.weaponId,e.personId,e),j(`سُلّم السلاح وأُضيف إلى ذمة المنتسب`)}})}var Me=[[`in_store`,`سليم`,`يعود إلى المستودع جاهزاً`],[`maintenance`,`يحتاج صيانة`,`يدخل المستودع ويُحوّل للصيانة`],[`unserviceable`,`عاطل`,`غير صالح للاستخدام`],[`lost`,`مفقود`,`أبلغ المنتسب بفقدانه`]];function Ne({weaponId:e,personId:t}={}){N({title:`إرجاع سلاح`,submitLabel:`تسجيل`,body:`
      ${Te(e,R.data.weapons.filter(e=>e.status===`issued`&&(!t||e.holderId===t)).map(e=>{let t=R.findPerson(e.holderId);return{...Se(e),sub:t?`بذمة ${l(t)}`:``}}),`لا توجد أسلحة مسلّمة حالياً`)}
      <fieldset class="field segmented-field">
        <legend class="field-label">حالة السلاح عند الإرجاع</legend>
        <div class="segmented">${Me.map(([e,t,n],i)=>`
          <label class="seg seg-${r[e].tone}"><input type="radio" name="status" value="${e}"${i===0?` checked`:``}>
            <span><b>${t}</b><small>${n}</small></span></label>`).join(``)}
        </div>
      </fieldset>
      ${F()}
      ${B(`مثال: نواقص في الملحقات، تفاصيل الفقدان…`)}`,onSubmit:e=>{R.returnWeapon(e.weaponId,e),j(e.status===`lost`?`سُجّل السلاح مفقوداً`:`أُرجع السلاح إلى المستودع`)}})}function Pe(e){let t=R.findWeapon(e),n=Object.entries(r).filter(([e])=>e!==`issued`&&e!==t.status);N({title:`تغيير حالة السلاح`,submitLabel:`تغيير الحالة`,body:`
      ${fe({label:`السلاح`,name:`weaponId`,value:t.id,text:t.model||t.type,sub:`الحالة الآن: ${r[t.status].label}`})}
      <fieldset class="field segmented-field">
        <legend class="field-label">الحالة الجديدة</legend>
        <div class="segmented">${n.map(([e,t])=>`
          <label class="seg seg-${t.tone}"><input type="radio" name="status" value="${e}"><span><b>${t.label}</b></span></label>`).join(``)}
        </div>
      </fieldset>
      ${F()}
      ${B()}`,onSubmit:e=>{R.setWeaponStatus(t.id,e.status,e),j(`تغيّرت حالة السلاح`)}})}function Fe(e){let t=e?R.findAmmo(e):{},n=R.data.ammo;N({title:e?`تعديل صنف العتاد`:`إضافة صنف عتاد`,submitLabel:e?`حفظ التعديلات`:`إضافة`,body:`
      ${P({label:`اسم الصنف`,name:`name`,value:t.name,required:!0,list:`dl-anames`,placeholder:`عتاد بندقية`})}
      ${L(P({label:`العيار`,name:`caliber`,value:t.caliber,list:`dl-acal`,placeholder:`7.62×39`,mono:!0}),P({label:`رقم الوجبة`,name:`lot`,value:t.lot,mono:!0}))}
      ${L(P({label:`وحدة القياس`,name:`unit`,value:t.unit||`طلقة`,list:`dl-units`}),P({label:`الحد الأدنى للتنبيه`,name:`minQty`,value:t.minQty||``,inputmode:`numeric`,placeholder:`0`,hint:`يظهر تنبيه حين يقل الرصيد عنه`}))}
      ${P({label:`مكان الخزن`,name:`location`,value:t.location,list:`dl-aloc`})}
      ${e?``:`<div class="field-group">${L(P({label:`الرصيد الافتتاحي`,name:`qty`,inputmode:`numeric`,placeholder:`0`,hint:`الكمية الموجودة الآن في المستودع`}),F(`بتاريخ`))}</div>`}
      ${ue({label:`ملاحظات`,name:`notes`,value:t.notes})}
      ${I(`dl-anames`,z(n,`name`))}
      ${I(`dl-acal`,[...z(n,`caliber`),...z(R.data.weapons,`caliber`)])}
      ${I(`dl-units`,[..._e,...z(n,`unit`)])}
      ${I(`dl-aloc`,z(n,`location`))}`,onSubmit:t=>{e?(R.updateAmmo(e,t),j(`حُفظت التعديلات`)):(R.addAmmo(t,{qty:t.qty,at:t.at}),j(`أُضيف الصنف ${t.name.trim()}`))}})}async function Ie(e){await le({title:`حذف صنف العتاد`,message:`سيُحذف الصنف <b>${x(d(R.findAmmo(e)))}</b>. تبقى حركاته السابقة في السجل.`,confirmLabel:`حذف`,validate:()=>R.removeAmmo(e)})&&(j(`حُذف الصنف`),M(`#/ammo`))}var Le={a_in:{title:`استلام عتاد وارد`,submit:`استلام`,qtyLabel:`الكمية المستلمة`,notePh:`الجهة المسلِّمة، رقم الكتاب أو المستند`},a_out:{title:`إخراج عتاد من المستودع`,submit:`إخراج`,qtyLabel:`الكمية المُخرجة`,notePh:`السبب: إتلاف، تسليم لجهة أخرى… ورقم الكتاب`},a_issue:{title:`صرف عتاد لمنتسب`,submit:`صرف`,qtyLabel:`الكمية المصروفة`,notePh:`الغرض: واجب، رمي تدريبي…`},a_return:{title:`إرجاع عتاد للمستودع`,submit:`إرجاع`,qtyLabel:`الكمية المُرجعة`,notePh:``},a_consume:{title:`تسجيل استهلاك عتاد`,submit:`تسجيل الاستهلاك`,qtyLabel:`الكمية المستهلكة`,notePh:`مثال: رمي تدريبي، واجب…`},a_adjust:{title:`تسوية جرد`,submit:`تسوية`,qtyLabel:`الكمية الموجودة فعلاً`,notePh:`سبب الفرق ورقم محضر الجرد`}};function Re(e,{ammoId:t,personId:n}={}){let r=Le[e],i=e===`a_adjust`?`counted`:`qty`,a;if(e===`a_return`||e===`a_consume`){let e=[];for(let r of R.data.ammo)if(!(t&&r.id!==t))for(let[t,i]of R.balanceOf(r.id).byPerson){if(n&&t!==n)continue;let a=R.findPerson(t);e.push({value:`${r.id}|${t}`,label:a?l(a):`منتسب محذوف`,sub:d(r),meta:`${S(i)} ${r.unit}`})}a=de({label:`العتاد بالذمة`,name:`line`,options:e,selected:e.length===1?e[0].value:``,empty:`لا يوجد عتاد بالذمة`})}else a=Ee(t,R.data.ammo.map(e=>({a:e,store:R.balanceOf(e.id).store})).filter(({store:t})=>e===`a_in`||e===`a_adjust`||t>0).map(({a:e,store:t})=>Ce(e,`${S(t)} ${e.unit}`)),R.data.ammo.length?`لا يوجد رصيد في المستودع`:`لا توجد أصناف عتاد. أضفها من صفحة الأعتدة`),e===`a_issue`&&(a+=we(n,`المستلم`));N({title:r.title,submitLabel:r.submit,tone:e===`a_out`||e===`a_consume`?`warn`:`primary`,body:`
      ${a}
      ${L(P({label:r.qtyLabel,name:i,inputmode:`numeric`,required:!0,mono:!0,hint:e===`a_adjust`?`اكتب العدد الفعلي بعد العدّ، ويُحسب الفرق تلقائياً`:``}),F())}
      ${B(r.notePh)}`,onSubmit:t=>{t.line&&([t.ammoId,t.personId]=t.line.split(`|`)),R.ammoMove(e,t),j(`تم: ${r.title}`)}})}var V,ze=e=>{V=e},H={weapons:{q:``,status:`all`},ammo:{q:``,filter:`all`},people:{q:``,platoon:`all`},log:{q:``,group:`all`,from:``,to:``}},Be=7,Ve=e=>`<span class="pill tone-${r[e].tone}">${r[e].label}</span>`,U=(e,t=`empty`,n=``)=>`<div class="empty">${y(t)}<p>${e}</p>${n}</div>`,He=()=>U(`لا توجد نتائج مطابقة`,`no-results`),W=(e,t,n,{tone:r=`ghost`,data:i={}}={})=>`<button type="button" class="btn ${r}" data-action="${e}"${Object.entries(i).map(([e,t])=>` data-${e}="${x(t)}"`).join(``)}>${y(t)}<span>${n}</span></button>`,G=(e,t,n,r,i)=>`<button type="button" class="chip${r===t?` active`:``}" data-action="chip" data-bind="${e}" data-value="${x(t)}" aria-pressed="${r===t}">${x(n)}${i===void 0?``:` <span class="chip-n">${S(i)}</span>`}</button>`,Ue=(e,t)=>`<div class="search-box">${y(`search`)}<input type="search" data-bind="${e}" placeholder="${x(t)}" aria-label="${x(t)}" autocomplete="off"></div>`,We=e=>`<dl class="kv">${e.filter(([,e])=>e).map(([e,t])=>`<div><dt>${x(e)}</dt><dd>${t}</dd></div>`).join(``)}</dl>`,Ge=(e,t=``)=>{let n=e&&V.findPerson(e);return n?`<a href="#/people/${n.id}">${x(l(n))}</a>`:x(t)},K=(e,t=V.balanceOf(e.id))=>e.minQty>0&&t.store<e.minQty,q=e=>[...e].sort((e,t)=>t.at>e.at?1:t.at<e.at?-1:0);function Ke(e){let t=e=>r[e]?.label||``;switch(e.kind){case`w_add`:case`w_remove`:return{what:e.w};case`w_issue`:return{what:e.w,who:`إلى ${e.p}`};case`w_return`:return{what:e.w,who:e.p?`من ${e.p}`:``,detail:e.to&&e.to!==`in_store`?`الحالة: ${t(e.to)}`:``};case`w_status`:return{what:e.w,who:e.p?`بذمة ${e.p}`:``,detail:`${t(e.from)} ← ${t(e.to)}`.replace(/^ ← /,``)};case`a_adjust`:return{what:e.a,amount:`${e.qty>0?`+`:`−`}${S(Math.abs(e.qty))} ${e.u||``}`.trim(),detail:e.counted===void 0?``:`الموجود فعلاً ${S(e.counted)}`};default:return{what:e.a,amount:`${S(e.qty)} ${e.u||``}`.trim(),who:e.p?e.kind===`a_issue`?`إلى ${e.p}`:e.kind===`a_return`?`من ${e.p}`:e.p:``}}}function qe(e,{withDate:t=!0}={}){let n=i[e.kind],r=Ke(e),a=e.weaponId&&V.findWeapon(e.weaponId)?`#/weapons/${e.weaponId}`:e.ammoId&&V.findAmmo(e.ammoId)?`#/ammo/${e.ammoId}`:``,o=a?`<a href="${a}">${x(r.what)}</a>`:x(r.what),s=r.who&&e.personId&&V.findPerson(e.personId)?x(r.who).replace(x(e.p),Ge(e.personId)):x(r.who||``);return`<li class="log-row kind-${e.kind}">
    <span class="log-icon">${y(n.icon)}</span>
    <div class="log-main">
      <div class="log-line"><b>${n.label}</b>${r.amount?`<span class="log-amount">${x(r.amount)}</span>`:``}</div>
      <div class="log-what">${o}${s?` · ${s}`:``}${r.detail?` · ${x(r.detail)}`:``}</div>
      ${e.note?`<div class="log-note">${x(e.note)}</div>`:``}
    </div>
    <time class="log-time" datetime="${x(e.at)}">${t?`${w(e.at)}<br>`:``}${T(e.at)}</time>
  </li>`}var Je=(e,t)=>`<ul class="log-list">${e.map(e=>qe(e,t)).join(``)}</ul>`;function Ye(){let e=[],t=V.data.settings;if(V.loadProblem&&e.push([`danger`,`alert`,V.loadProblem]),V.persistent||e.push([`danger`,`alert`,`التخزين محجوب في هذا المتصفح: لن تُحفظ البيانات بعد إغلاق الصفحة. افتح التطبيق في نافذة عادية (غير خاصة).`]),t.demo)return e.push([`info`,`info`,`تستعرض الآن بيانات نموذجية للتجربة. امسحها حين تبدأ الاستخدام الفعلي.`,`<button type="button" class="btn small" data-action="reset">مسح البيانات النموذجية</button>`]),e.map(Xe).join(``);let n=V.data.weapons.length||V.data.ammo.length||V.data.people.length,r=!t.lastBackupAt||Date.now()-new Date(t.lastBackupAt).getTime()>Be*864e5;return n&&r&&e.push([`warn`,`backup`,`البيانات محفوظة على هذا الجهاز فقط. ${t.lastBackupAt?`آخر نسخة احتياطية قبل أكثر من ${Be} أيام.`:`لم تُؤخذ نسخة احتياطية بعد.`}`,`<button type="button" class="btn small" data-action="backup">أخذ نسخة الآن</button>`]),e.map(Xe).join(``)}var Xe=([e,t,n,r=``])=>`<div class="banner tone-${e}">${y(t)}<p>${n}</p>${r}</div>`;function Ze(){let{weapons:e,ammo:t,people:n,log:i}=V.data,a=`مستودع ${V.data.settings.unitName||`السرية`}`;if(!e.length&&!t.length)return{title:a,html:`${Ye()}<section class="card welcome">
        <span class="welcome-mark">${y(`shield`)}</span>
        <h2>أهلاً بك في تطبيق مستودع السرية</h2>
        <p>سجّل أسلحة السرية وأعتدتها، وتابع ما بذمة كل منتسب، واطبع تقارير الجرد وسندات الذمة. البيانات تُحفظ على هذا الجهاز.</p>
        <ol class="steps">
          <li${(e=>e?` class="done"`:``)(n.length)}><b>أضف المنتسبين</b><span>${n.length?`أُضيف ${S(n.length)} منتسب`:`الاسم والرتبة والرقم العسكري`}</span></li>
          <li><b>أدخل الأسلحة</b><span>كل سلاح برقمه التسلسلي</span></li>
          <li><b>أضف أصناف العتاد</b><span>مع الرصيد الموجود حالياً</span></li>
        </ol>
        <div class="actions">
          ${W(`add-person`,`people`,`إضافة منتسب`,{tone:`primary`})}
          ${W(`add-weapon`,`weapon`,`إدخال سلاح`)}
          ${W(`add-ammo`,`ammo`,`إضافة صنف عتاد`)}
        </div>
        ${n.length?``:`<p class="welcome-demo">تريد أن ترى التطبيق أولاً؟ <button type="button" class="link" data-action="demo">جرّبه ببيانات نموذجية</button></p>`}
      </section>`};let o=Object.fromEntries(Object.keys(r).map(e=>[e,0]));e.forEach(e=>o[e.status]++);let s=e.length,c=s?Object.keys(r).filter(e=>o[e]).map(e=>`<span class="bar-seg tone-${r[e].tone}" style="flex:${o[e]}" title="${r[e].label}: ${o[e]}"></span>`).join(``):``,l=(e,t,n)=>`<button type="button" class="stat${e===`all`?``:` tone-${r[e].tone}`}" data-action="weapons-filter" data-status="${e}">
      <b>${S(t)}</b><span>${n}</span></button>`,u=t.filter(e=>K(e)),d=[...e.filter(e=>e.status===`lost`).map(e=>`<a class="alert-row tone-danger" href="#/weapons/${e.id}">${y(`alert`)}<span>سلاح مفقود: <b>${x(e.model||e.type)}</b> <span class="mono">${x(e.serial)}</span></span></a>`),...u.map(e=>`<a class="alert-row tone-warn" href="#/ammo/${e.id}">${y(`alert`)}<span>رصيد منخفض: <b>${x(e.name)} ${x(e.caliber)}</b> — ${S(V.balanceOf(e.id).store)} من حد ${S(e.minQty)}</span></a>`)],f=t.map(e=>{let t=V.balanceOf(e.id);return`<a class="mini-row" href="#/ammo/${e.id}">
      <span class="mini-main"><b>${x(e.name)}</b><small>${x([e.caliber,e.lot&&`وجبة ${e.lot}`].filter(Boolean).join(` · `))}</small></span>
      <span class="mini-num${K(e,t)?` low`:``}"><b>${S(t.store)}</b><small>في المستودع</small></span>
      <span class="mini-num muted"><b>${S(t.issued)}</b><small>بالذمة</small></span>
    </a>`}).join(``);return{title:a,html:`${Ye()}
      <div class="quick">
        ${W(`issue-weapon`,`issue`,`تسليم سلاح`,{tone:`tile`})}
        ${W(`return-weapon`,`return`,`إرجاع سلاح`,{tone:`tile`})}
        ${W(`ammo-move`,`issue`,`صرف عتاد`,{tone:`tile`,data:{kind:`a_issue`}})}
        ${W(`ammo-move`,`receive`,`استلام عتاد`,{tone:`tile`,data:{kind:`a_in`}})}
      </div>
      ${d.length?`<section class="card alerts"><h2 class="card-title">تنبيهات</h2>${d.join(``)}</section>`:``}
      <div class="home-grid">
        <section class="card">
          <div class="card-head"><h2 class="card-title">${y(`weapon`)} الأسلحة</h2><a href="#/weapons" class="more">الكل ${y(`chevron`)}</a></div>
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
          <div class="card-head"><h2 class="card-title">${y(`ammo`)} الأعتدة</h2><a href="#/ammo" class="more">الكل ${y(`chevron`)}</a></div>
          ${f||U(`لا توجد أصناف عتاد بعد`,`ammo`,W(`add-ammo`,`plus`,`إضافة صنف`))}
        </section>
        <section class="card">
          <div class="card-head"><h2 class="card-title">${y(`people`)} المنتسبون</h2><a href="#/people" class="more">الكل ${y(`chevron`)}</a></div>
          <div class="stat-grid">
            <a class="stat" href="#/people"><b>${S(n.length)}</b><span>المجموع</span></a>
            <a class="stat" href="#/people"><b>${S(n.filter(e=>{let t=V.custodyOf(e.id);return t.weapons.length||t.ammo.length}).length)}</b><span>بذمتهم مواد</span></a>
          </div>
        </section>
        <section class="card wide">
          <div class="card-head"><h2 class="card-title">${y(`log`)} آخر الحركات</h2><a href="#/log" class="more">السجل ${y(`chevron`)}</a></div>
          ${i.length?Je(q(i).slice(0,6)):U(`لا توجد حركات بعد`,`log`)}
        </section>
      </div>`}}function Qe(){let e=V.data.weapons,t=Object.fromEntries(Object.keys(r).map(t=>[t,e.filter(e=>e.status===t).length])),n=H.weapons;return{title:`الأسلحة`,html:`
      <div class="toolbar">
        ${Ue(`weapons.q`,`ابحث بالرقم التسلسلي أو الطراز أو اسم الحائز`)}
        ${W(`add-weapon`,`plus`,`إدخال سلاح`,{tone:`primary`})}
      </div>
      <div class="chips">
        ${G(`weapons.status`,`all`,`الكل`,n.status,e.length)}
        ${Object.entries(r).filter(([e])=>t[e]||n.status===e).map(([e,r])=>G(`weapons.status`,e,r.label,n.status,t[e])).join(``)}
      </div>
      <div id="list"></div>`,list(){if(!e.length)return U(`لم يُدخل أي سلاح بعد`,`weapon`,W(`add-weapon`,`plus`,`إدخال سلاح`,{tone:`primary`}));let t=e.filter(e=>n.status===`all`||e.status===n.status).filter(e=>k(n.q,e.serial,e.model,e.type,e.caliber,e.location,e.holderId&&V.findPerson(e.holderId)&&l(V.findPerson(e.holderId)))).sort((e,t)=>(e.model||e.type).localeCompare(t.model||t.type,`ar`)||e.serial.localeCompare(t.serial,`en`,{numeric:!0}));return t.length?`<p class="list-count">${S(t.length)} سلاح</p><div class="list">${t.map(e=>`
        <a class="item" href="#/weapons/${e.id}">
          <span class="item-icon tone-${r[e.status].tone}">${y(`weapon`)}</span>
          <span class="item-main">
            <b>${x(e.model||e.type)}</b>
            <small>${x([e.model&&e.type,e.caliber].filter(Boolean).join(` · `))}</small>
            ${e.status===`issued`?`<small class="item-holder">${y(`user`)}${x(l(V.findPerson(e.holderId)||{name:`منتسب محذوف`}))}</small>`:``}
          </span>
          <span class="item-side"><span class="mono serial">${x(e.serial)}</span>${Ve(e.status)}</span>
        </a>`).join(``)}</div>`:He()}}}function $e(e){let t=V.findWeapon(e);if(!t)return st(`السلاح`,`#/weapons`);let n=q(V.data.log.filter(t=>t.weaponId===e)),i=t.status===`issued`?n.find(e=>e.kind===`w_issue`)?.at:null,a={in_store:[W(`issue-weapon`,`issue`,`تسليم لمنتسب`,{tone:`primary`,data:{id:e}}),W(`weapon-status`,`wrench`,`تغيير الحالة`,{data:{id:e}})],issued:[W(`return-weapon`,`return`,`إرجاع للمستودع`,{tone:`primary`,data:{id:e}})]}[t.status]||[W(`weapon-status`,`wrench`,`تغيير الحالة`,{tone:`primary`,data:{id:e}})];return{title:t.model||t.type,back:`#/weapons`,html:`
      <section class="card detail">
        <div class="detail-head">
          <span class="item-icon big tone-${r[t.status].tone}">${y(`weapon`)}</span>
          <div class="detail-name"><h2>${x(t.model||t.type)}</h2><p class="mono serial">${x(t.serial)}</p></div>
          ${Ve(t.status)}
        </div>
        ${t.status===`issued`?`<div class="holder">${y(`user`)}<span>بذمة ${Ge(t.holderId,`منتسب محذوف`)}${i?` منذ ${w(i)}`:``}</span></div>`:``}
        ${We([[`النوع`,x(t.type)],[`الطراز`,x(t.model)],[`العيار`,x(t.caliber)],[`مكان الخزن`,x(t.location)],[`تاريخ الإدخال`,t.createdAt&&w(n.findLast?.(e=>e.kind===`w_add`)?.at||t.createdAt)],[`ملاحظات`,x(t.notes)]])}
        <div class="actions">
          ${a.join(``)}
          ${W(`edit-weapon`,`edit`,`تعديل`,{data:{id:e}})}
          ${t.status===`issued`?``:W(`remove-weapon`,`trash`,`شطب`,{tone:`ghost danger-text`,data:{id:e}})}
        </div>
      </section>
      <section class="card">
        <h2 class="card-title">سجل السلاح</h2>
        ${n.length?Je(n):U(`لا توجد حركات`)}
      </section>`}}function et(){let e=V.data.ammo,t=H.ammo,n=e.filter(e=>K(e)).length,r=e.filter(e=>V.balanceOf(e.id).issued).length;return{title:`الأعتدة`,html:`
      <div class="toolbar">
        ${Ue(`ammo.q`,`ابحث بالصنف أو العيار أو رقم الوجبة`)}
        ${W(`add-ammo`,`plus`,`إضافة صنف`,{tone:`primary`})}
      </div>
      <div class="chips">
        ${G(`ammo.filter`,`all`,`الكل`,t.filter,e.length)}
        ${n||t.filter===`low`?G(`ammo.filter`,`low`,`رصيد منخفض`,t.filter,n):``}
        ${r||t.filter===`held`?G(`ammo.filter`,`held`,`بذمة المنتسبين`,t.filter,r):``}
      </div>
      <div class="quick compact">
        ${W(`ammo-move`,`receive`,`استلام وارد`,{tone:`tile`,data:{kind:`a_in`}})}
        ${W(`ammo-move`,`issue`,`صرف لمنتسب`,{tone:`tile`,data:{kind:`a_issue`}})}
        ${W(`ammo-move`,`return`,`إرجاع`,{tone:`tile`,data:{kind:`a_return`}})}
        ${W(`ammo-move`,`flame`,`استهلاك`,{tone:`tile`,data:{kind:`a_consume`}})}
      </div>
      <div id="list"></div>`,list(){if(!e.length)return U(`لا توجد أصناف عتاد بعد`,`ammo`,W(`add-ammo`,`plus`,`إضافة صنف`,{tone:`primary`}));let n=e.filter(e=>t.filter===`all`||(t.filter===`low`?K(e):V.balanceOf(e.id).issued)).filter(e=>k(t.q,e.name,e.caliber,e.lot,e.location,e.unit));return n.length?`<div class="list">${n.map(e=>{let t=V.balanceOf(e.id),n=K(e,t);return`<a class="item" href="#/ammo/${e.id}">
          <span class="item-icon${n?` tone-warn`:``}">${y(`ammo`)}</span>
          <span class="item-main"><b>${x(e.name)}${e.caliber?` <span class="mono">${x(e.caliber)}</span>`:``}</b>
            <small>${x([e.lot&&`وجبة ${e.lot}`,e.location].filter(Boolean).join(` · `))||x(e.unit)}${n?` · <span class="text-warn">رصيد منخفض</span>`:``}</small></span>
          <span class="item-qty"><b>${S(t.store)}</b><small>${x(e.unit)} في المستودع</small>${t.issued?`<small class="muted">+ ${S(t.issued)} بالذمة</small>`:``}</span>
        </a>`}).join(``)}</div>`:He()}}}function tt(e){let t=V.findAmmo(e);if(!t)return st(`صنف العتاد`,`#/ammo`);let n=V.balanceOf(e),r=q(V.data.log.filter(t=>t.ammoId===e)),i=[...n.byPerson].sort((e,t)=>t[1]-e[1]),a={id:e};return{title:[t.name,t.caliber].filter(Boolean).join(` `),back:`#/ammo`,html:`
      <section class="card detail">
        <div class="detail-head">
          <span class="item-icon big${K(t,n)?` tone-warn`:``}">${y(`ammo`)}</span>
          <div class="detail-name"><h2>${x(t.name)}</h2><p>${x([t.caliber,t.lot&&`وجبة ${t.lot}`].filter(Boolean).join(` · `))}</p></div>
        </div>
        <div class="figures">
          <div class="figure${K(t,n)?` low`:``}"><b>${S(n.store)}</b><span>في المستودع</span></div>
          <div class="figure"><b>${S(n.issued)}</b><span>بذمة المنتسبين</span></div>
          <div class="figure"><b>${S(n.store+n.issued)}</b><span>المجموع (${x(t.unit)})</span></div>
        </div>
        ${K(t,n)?`<div class="banner tone-warn">${y(`alert`)}<p>الرصيد أقل من الحد الأدنى (${S(t.minQty)} ${x(t.unit)})</p></div>`:``}
        ${We([[`وحدة القياس`,x(t.unit)],[`الحد الأدنى`,t.minQty?S(t.minQty):``],[`مكان الخزن`,x(t.location)],[`ملاحظات`,x(t.notes)]])}
        <div class="actions">
          ${W(`ammo-move`,`receive`,`استلام وارد`,{tone:`primary`,data:{...a,kind:`a_in`}})}
          ${n.store?W(`ammo-move`,`issue`,`صرف لمنتسب`,{data:{...a,kind:`a_issue`}}):``}
          ${n.store?W(`ammo-move`,`send`,`إخراج`,{data:{...a,kind:`a_out`}}):``}
          ${W(`ammo-move`,`scale`,`تسوية جرد`,{data:{...a,kind:`a_adjust`}})}
          ${W(`edit-ammo`,`edit`,`تعديل`,{data:a})}
          ${W(`remove-ammo`,`trash`,`حذف`,{tone:`ghost danger-text`,data:a})}
        </div>
      </section>
      <section class="card">
        <h2 class="card-title">بذمة المنتسبين</h2>
        ${i.length?`<div class="list flat">${i.map(([e,n])=>`
          <div class="item static">
            <span class="item-main"><b>${Ge(e,`منتسب محذوف`)}</b></span>
            <span class="item-qty"><b>${S(n)}</b><small>${x(t.unit)}</small></span>
            <span class="item-actions">
              ${W(`ammo-move`,`return`,`إرجاع`,{tone:`small`,data:{...a,kind:`a_return`,person:e}})}
              ${W(`ammo-move`,`flame`,`استهلاك`,{tone:`small`,data:{...a,kind:`a_consume`,person:e}})}
            </span>
          </div>`).join(``)}</div>`:U(`لا يوجد شيء من هذا الصنف بذمة أحد`)}
      </section>
      <section class="card">
        <h2 class="card-title">سجل الصنف</h2>
        ${r.length?Je(r):U(`لا توجد حركات`)}
      </section>`}}function nt(){let e=V.data.people,t=H.people,n=[...new Set(e.map(e=>e.platoon).filter(Boolean))].sort((e,t)=>e.localeCompare(t,`ar`));return{title:`المنتسبون`,html:`
      <div class="toolbar">
        ${Ue(`people.q`,`ابحث بالاسم أو الرقم العسكري`)}
        ${W(`add-person`,`plus`,`إضافة منتسب`,{tone:`primary`})}
      </div>
      ${n.length?`<div class="chips">${G(`people.platoon`,`all`,`الكل`,t.platoon,e.length)}${n.map(n=>G(`people.platoon`,n,n,t.platoon,e.filter(e=>e.platoon===n).length)).join(``)}</div>`:``}
      <div id="list"></div>`,list(){if(!e.length)return U(`لا يوجد منتسبون بعد`,`people`,W(`add-person`,`plus`,`إضافة منتسب`,{tone:`primary`}));let n=e.filter(e=>t.platoon===`all`||e.platoon===t.platoon).filter(e=>k(t.q,e.name,e.rank,e.milNo,e.platoon,e.phone)).sort((e,t)=>e.name.localeCompare(t.name,`ar`));return n.length?`<p class="list-count">${S(n.length)} منتسب</p><div class="list">${n.map(e=>{let t=V.custodyOf(e.id);return`<a class="item" href="#/people/${e.id}">
          <span class="avatar">${x(e.name.trim()[0]||`؟`)}</span>
          <span class="item-main"><b>${x(l(e))}</b><small>${x([e.milNo&&`ر.ع ${e.milNo}`,e.platoon].filter(Boolean).join(` · `))}</small></span>
          <span class="item-side">
            ${t.weapons.length?`<span class="count-badge" title="أسلحة بذمته">${y(`weapon`)}${S(t.weapons.length)}</span>`:``}
            ${t.ammo.length?`<span class="count-badge" title="أصناف عتاد بذمته">${y(`ammo`)}${S(t.ammo.length)}</span>`:``}
          </span>
        </a>`}).join(``)}</div>`:He()}}}function rt(e){let t=V.findPerson(e);if(!t)return st(`المنتسب`,`#/people`);let n=V.custodyOf(e),r=q(V.data.log.filter(t=>t.personId===e)),i={person:e};return{title:t.name,back:`#/people`,html:`
      <section class="card detail">
        <div class="detail-head">
          <span class="avatar big">${x(t.name.trim()[0]||`؟`)}</span>
          <div class="detail-name"><h2>${x(l(t))}</h2><p>${x([t.milNo&&`الرقم العسكري ${t.milNo}`,t.platoon].filter(Boolean).join(` · `))}</p></div>
        </div>
        ${We([[`الهاتف`,t.phone&&`<a href="tel:${x(t.phone)}" class="mono" dir="ltr">${x(t.phone)}</a>`],[`ملاحظات`,x(t.notes)]])}
        <div class="actions">
          ${W(`issue-weapon`,`issue`,`تسليم سلاح`,{tone:`primary`,data:i})}
          ${W(`ammo-move`,`issue`,`صرف عتاد`,{data:{...i,kind:`a_issue`}})}
          ${W(`print-custody`,`print`,`طباعة سند الذمة`,{data:{id:e}})}
          ${W(`edit-person`,`edit`,`تعديل`,{data:{id:e}})}
          ${W(`remove-person`,`trash`,`حذف`,{tone:`ghost danger-text`,data:{id:e}})}
        </div>
      </section>
      <section class="card">
        <h2 class="card-title">${y(`weapon`)} الأسلحة بذمته</h2>
        ${n.weapons.length?`<div class="list flat">${n.weapons.map(e=>`
          <div class="item static">
            <span class="item-main"><b><a href="#/weapons/${e.id}">${x(e.model||e.type)}</a></b><small>${x([e.type,e.caliber].filter(Boolean).join(` · `))}</small></span>
            <span class="mono serial">${x(e.serial)}</span>
            <span class="item-actions">${W(`return-weapon`,`return`,`إرجاع`,{tone:`small`,data:{id:e.id}})}</span>
          </div>`).join(``)}</div>`:U(`لا توجد أسلحة بذمته`)}
      </section>
      <section class="card">
        <h2 class="card-title">${y(`ammo`)} العتاد بذمته</h2>
        ${n.ammo.length?`<div class="list flat">${n.ammo.map(({ammo:e,qty:t})=>`
          <div class="item static">
            <span class="item-main"><b><a href="#/ammo/${e.id}">${x(e.name)}</a></b><small>${x([e.caliber,e.lot&&`وجبة ${e.lot}`].filter(Boolean).join(` · `))}</small></span>
            <span class="item-qty"><b>${S(t)}</b><small>${x(e.unit)}</small></span>
            <span class="item-actions">
              ${W(`ammo-move`,`return`,`إرجاع`,{tone:`small`,data:{id:e.id,...i,kind:`a_return`}})}
              ${W(`ammo-move`,`flame`,`استهلاك`,{tone:`small`,data:{id:e.id,...i,kind:`a_consume`}})}
            </span>
          </div>`).join(``)}</div>`:U(`لا يوجد عتاد بذمته`)}
      </section>
      <section class="card">
        <h2 class="card-title">سجل المنتسب</h2>
        ${r.length?Je(r):U(`لا توجد حركات`)}
      </section>`}}function it(){let e=H.log;return q(V.data.log).filter(t=>{if(e.group!==`all`&&i[t.kind].group!==e.group)return!1;let n=O(t.at);return e.from&&n<e.from||e.to&&n>e.to?!1:k(e.q,t.w,t.a,t.p,t.note,i[t.kind].label)})}function at(){let e=H.log;return{title:`سجل الحركات`,html:`
      <div class="toolbar">
        ${Ue(`log.q`,`ابحث في الحركات`)}
        <div class="toolbar-actions">
          ${W(`print-log`,`print`,`طباعة`)}
          ${W(`export-csv`,`sheet`,`Excel`,{data:{what:`log`}})}
        </div>
      </div>
      <div class="chips">
        ${G(`log.group`,`all`,`الكل`,e.group)}
        ${G(`log.group`,`weapons`,`الأسلحة`,e.group)}
        ${G(`log.group`,`ammo`,`الأعتدة`,e.group)}
      </div>
      <div class="date-range">
        <label>من تاريخ <input type="date" class="input small" data-bind="log.from"></label>
        <label>إلى تاريخ <input type="date" class="input small" data-bind="log.to"></label>
      </div>
      <div id="list"></div>`,list(){if(!V.data.log.length)return U(`لا توجد حركات بعد. كل تسليم وإرجاع وصرف يُسجَّل هنا تلقائياً`,`log`);let e=it();if(!e.length)return He();let t=new Map;for(let n of e){let e=O(n.at);t.has(e)||t.set(e,[]),t.get(e).push(n)}return`<p class="list-count">${S(e.length)} حركة</p>${[...t].map(([,e])=>`
        <section class="day"><h3 class="day-title">${w(e[0].at)}</h3>${Je(e,{withDate:!1})}</section>`).join(``)}`}}}function ot(){let e=V.data.settings;return{title:`الإعدادات`,back:`#/home`,html:`
      <section class="card">
        <h2 class="card-title">${y(`shield`)} بيانات السرية</h2>
        <p class="card-sub">تظهر في عنوان التطبيق وفي التقارير المطبوعة وتواقيعها.</p>
        <form data-form="settings" class="settings-form">
          <label class="field"><span class="field-label">اسم السرية</span><input class="input" name="unitName" value="${x(e.unitName)}" placeholder="مثال: السرية الأولى" autocomplete="off"></label>
          <div class="field-row">
            <label class="field"><span class="field-label">أمين المستودع</span><input class="input" name="keeperName" value="${x(e.keeperName)}" autocomplete="off"></label>
            <label class="field"><span class="field-label">آمر السرية</span><input class="input" name="commanderName" value="${x(e.commanderName)}" autocomplete="off"></label>
          </div>
          <button type="submit" class="btn primary">${y(`check`)}<span>حفظ</span></button>
        </form>
      </section>

      <section class="card">
        <h2 class="card-title">${y(`lock`)} قفل التطبيق</h2>
        <p class="card-sub">${e.lock?`القفل مفعّل: يُطلب الرمز عند فتح التطبيق وبعد بقائه في الخلفية أكثر من دقيقتين.`:`اطلب رمزاً سرياً عند فتح التطبيق، لمنع من يمسك الجهاز من الاطلاع على البيانات.`}</p>
        <div class="actions">
          ${e.lock?`${W(`set-lock`,`key`,`تغيير الرمز`)}${W(`remove-lock`,`unlock`,`إلغاء القفل`,{tone:`ghost danger-text`})}`:W(`set-lock`,`lock`,`تفعيل القفل`,{tone:`primary`})}
        </div>
      </section>

      <section class="card">
        <h2 class="card-title">${y(`data`)} النسخ الاحتياطي</h2>
        <p class="card-sub">البيانات محفوظة في هذا الجهاز فقط. خذ نسخة احتياطية بانتظام واحفظها في مكان آمن، ويمكنك استعادتها على هذا الجهاز أو جهاز آخر.</p>
        <p class="backup-state">${e.lastBackupAt?`آخر نسخة احتياطية: <b>${E(e.lastBackupAt)}</b>`:`<b class="text-warn">لم تُؤخذ نسخة احتياطية بعد</b>`}</p>
        <div class="actions">
          ${W(`backup`,`backup`,`تنزيل نسخة احتياطية`,{tone:`primary`})}
          ${W(`restore`,`restore`,`استعادة من نسخة`)}
        </div>
      </section>

      <section class="card">
        <h2 class="card-title">${y(`print`)} التقارير والتصدير</h2>
        <div class="actions">
          ${W(`print-inventory`,`print`,`طباعة تقرير الجرد`,{tone:`primary`})}
        </div>
        <p class="card-sub">تصدير جداول تُفتح في Excel:</p>
        <div class="actions">
          ${W(`export-csv`,`sheet`,`الأسلحة`,{data:{what:`weapons`}})}
          ${W(`export-csv`,`sheet`,`الأعتدة`,{data:{what:`ammo`}})}
          ${W(`export-csv`,`sheet`,`المنتسبون`,{data:{what:`people`}})}
          ${W(`export-csv`,`sheet`,`سجل الحركات`,{data:{what:`log`}})}
        </div>
      </section>

      <section class="card danger-zone">
        <h2 class="card-title">${y(`erase`)} مسح البيانات</h2>
        <p class="card-sub">يحذف كل السجلات من هذا الجهاز نهائياً. خذ نسخة احتياطية قبل ذلك.</p>
        <div class="actions">${W(`reset`,`trash`,`مسح جميع البيانات`,{tone:`danger`})}</div>
      </section>`}}function st(e,t){return{title:`غير موجود`,back:t,html:U(`${e} غير موجود، ربما حُذف.`,`no-results`,`<a class="btn" href="${t}">رجوع</a>`)}}var J,ct=e=>{J=e},lt=()=>J.data.settings.unitName||`السرية`,ut=()=>new Date().toISOString();function dt(e,t=``){return`<header class="p-head">
    <div><b>${x(lt())}</b><span>مستودع الأسلحة والأعتدة</span></div>
    <div class="p-title"><h1>${x(e)}</h1>${t?`<p>${t}</p>`:``}</div>
    <div class="p-date">التاريخ: ${w(ut())}</div>
  </header>`}function ft(e){let t=J.data.settings,n={"أمين المستودع":t.keeperName,"آمر السرية":t.commanderName};return`<div class="p-signs">${e.map(([e,t])=>`
    <div class="p-sign"><span>${x(e)}</span><div class="p-line"></div><small>${x(t??n[e]??``)}</small></div>`).join(``)}
  </div>`}var Y=(e,t,n=`لا يوجد`)=>`<table class="p-table">
  <thead><tr><th>ت</th>${e.map(e=>`<th>${x(e)}</th>`).join(``)}</tr></thead>
  <tbody>${t.length?t.map((e,t)=>`<tr><td>${t+1}</td>${e.map(e=>`<td>${e}</td>`).join(``)}</tr>`).join(``):`<tr><td colspan="${e.length+1}" class="p-empty">${n}</td></tr>`}</tbody>
</table>`;function pt(e){let t=document.getElementById(`print-area`);t.innerHTML=e,A(t),window.addEventListener(`afterprint`,()=>{t.innerHTML=``},{once:!0}),window.print()}function mt(){let{weapons:e,ammo:t}=J.data,n=new Map;for(let t of e){let e=t.type||`غير محدد`,r=n.get(e)||{total:0,in_store:0,issued:0,other:0};r.total++,t.status===`in_store`||t.status===`issued`?r[t.status]++:r.other++,n.set(e,r)}let i=[...e].sort((e,t)=>(e.type||``).localeCompare(t.type||``,`ar`)||e.serial.localeCompare(t.serial,`en`,{numeric:!0})),a=e=>e.holderId&&J.findPerson(e.holderId)?l(J.findPerson(e.holderId)):``;pt(`
    ${dt(`تقرير الجرد العام`,`عدد الأسلحة ${S(e.length)} · أصناف العتاد ${S(t.length)}`)}
    <h2>خلاصة الأسلحة حسب النوع</h2>
    ${Y([`النوع`,`المجموع`,`في المستودع`,`مسلّم`,`صيانة / عاطل / مفقود`],[...n].map(([e,t])=>[x(e),S(t.total),S(t.in_store),S(t.issued),S(t.other)]))}
    <h2>الأسلحة</h2>
    ${Y([`النوع`,`الطراز`,`الرقم التسلسلي`,`العيار`,`الحالة`,`بذمة`],i.map(e=>[x(e.type),x(e.model),`<span class="mono">${x(e.serial)}</span>`,x(e.caliber),r[e.status].label,x(a(e))]))}
    <h2>الأعتدة</h2>
    ${Y([`الصنف`,`العيار`,`الوجبة`,`الوحدة`,`في المستودع`,`بذمة المنتسبين`,`المجموع`],t.map(e=>{let t=J.balanceOf(e.id);return[x(e.name),x(e.caliber),x(e.lot),x(e.unit),S(t.store),S(t.issued),`<b>${S(t.store+t.issued)}</b>`]}))}
    ${ft([[`أمين المستودع`],[`آمر السرية`]])}`)}function ht(e){let t=J.findPerson(e),n=J.custodyOf(e);pt(`
    ${dt(`سند ذمة`,`الأسلحة والأعتدة المسلّمة للمنتسب`)}
    <dl class="p-kv">
      <div><dt>الاسم</dt><dd>${x(t.name)}</dd></div>
      <div><dt>الرتبة</dt><dd>${x(t.rank)||`—`}</dd></div>
      <div><dt>الرقم العسكري</dt><dd class="mono">${x(t.milNo)||`—`}</dd></div>
      <div><dt>الفصيل</dt><dd>${x(t.platoon)||`—`}</dd></div>
    </dl>
    <h2>الأسلحة</h2>
    ${Y([`النوع`,`الطراز`,`الرقم التسلسلي`,`العيار`],n.weapons.map(e=>[x(e.type),x(e.model),`<span class="mono">${x(e.serial)}</span>`,x(e.caliber)]),`لا توجد أسلحة بذمته`)}
    <h2>الأعتدة</h2>
    ${Y([`الصنف`,`العيار`,`الوجبة`,`الكمية`,`الوحدة`],n.ammo.map(({ammo:e,qty:t})=>[x(e.name),x(e.caliber),x(e.lot),`<b>${S(t)}</b>`,x(e.unit)]),`لا يوجد عتاد بذمته`)}
    <p class="p-pledge">أتعهد بالمحافظة على المواد المثبتة أعلاه واستخدامها للأغراض الرسمية فقط وإعادتها عند الطلب، وأتحمل المسؤولية في حال فقدانها أو إتلافها.</p>
    ${ft([[`المستلم`,l(t)],[`أمين المستودع`],[`آمر السرية`]])}`)}function gt(e,t){pt(`
    ${dt(`سجل الحركات`,t)}
    ${Y([`التاريخ`,`الحركة`,`التفاصيل`,`المنتسب`,`ملاحظات`],e.map(e=>{let t=Ke(e);return[E(e.at),i[e.kind].label,x(t.what)+(t.amount?` — <b>${x(t.amount)}</b>`:``),x(e.p||``),x(e.note||``)]}))}
    ${ft([[`أمين المستودع`],[`آمر السرية`]])}`)}var _t=e=>{let t=String(e??``);return/[",\n\r]/.test(t)?`"${t.replace(/"/g,`""`)}"`:t},vt=e=>`﻿`+e.map(e=>e.map(_t).join(`,`)).join(`\r
`),yt=()=>w(ut()).replace(/\//g,`-`);function bt(e,t){let n=J.data,a=e=>e&&J.findPerson(e)?l(J.findPerson(e)):``,[o,s]={weapons:[`weapons`,[[`النوع`,`الطراز`,`الرقم التسلسلي`,`العيار`,`الحالة`,`بذمة`,`مكان الخزن`,`ملاحظات`],...n.weapons.map(e=>[e.type,e.model,e.serial,e.caliber,r[e.status].label,a(e.holderId),e.location,e.notes])]],ammo:[`ammo`,[[`الصنف`,`العيار`,`الوجبة`,`الوحدة`,`في المستودع`,`بذمة المنتسبين`,`المجموع`,`الحد الأدنى`,`مكان الخزن`],...n.ammo.map(e=>{let t=J.balanceOf(e.id);return[e.name,e.caliber,e.lot,e.unit,t.store,t.issued,t.store+t.issued,e.minQty||``,e.location]})]],people:[`personnel`,[[`الاسم`,`الرتبة`,`الرقم العسكري`,`الفصيل`,`الهاتف`,`أسلحة بذمته`,`عتاد بذمته`],...n.people.map(e=>{let t=J.custodyOf(e.id);return[e.name,e.rank,e.milNo,e.platoon,e.phone,t.weapons.map(e=>`${e.model||e.type} ${e.serial}`).join(` / `),t.ammo.map(({ammo:e,qty:t})=>`${e.name} ${e.caliber}: ${t} ${e.unit}`).join(` / `)]})]],log:[`movements`,[[`التاريخ`,`الوقت`,`الحركة`,`السلاح`,`العتاد`,`الكمية`,`المنتسب`,`ملاحظات`],...(t||n.log).map(e=>[w(e.at),new Date(e.at).toTimeString().slice(0,5),i[e.kind].label,e.w||``,e.a||``,e.qty??``,e.p||``,e.note||``])]]}[e];me(`armory-${o}-${yt()}.csv`,vt(s),`text/csv;charset=utf-8`)}function xt(){me(`armory-backup-${yt()}.json`,J.exportJSON(),`application/json`),J.markBackedUp()}var St=15e4,Ct=12e4,X,wt=0,Tt=e=>btoa(String.fromCharCode(...new Uint8Array(e))),Et=e=>Uint8Array.from(atob(e),e=>e.charCodeAt(0));async function Dt(e,t,n){let r=await crypto.subtle.importKey(`raw`,new TextEncoder().encode(e),`PBKDF2`,!1,[`deriveBits`]);return Tt(await crypto.subtle.deriveBits({name:`PBKDF2`,hash:`SHA-256`,salt:t,iterations:n},r,256))}async function Ot(e){let t=X.data.settings.lock;return!t||await Dt(e,Et(t.salt),t.iterations)===t.hash}var kt=()=>document.getElementById(`lock-screen`);function At(){if(!X.data.settings.lock)return;document.getElementById(`sheet`).close();let e=kt();e.hidden=!1,document.querySelector(`.app`).inert=!0;let t=e.querySelector(`input`);t.value=``,e.querySelector(`.lock-error`).hidden=!0,t.focus()}function jt(e){X=e;let t=kt().querySelector(`form`),n=t.querySelector(`input`),r=t.querySelector(`.lock-error`),i=!1;t.addEventListener(`submit`,async e=>{if(e.preventDefault(),i)return;i=!0;let o=await Ot(a(n.value));i=!1,o?(kt().hidden=!0,document.querySelector(`.app`).inert=!1):(r.hidden=!1,n.value=``,t.classList.remove(`shake`),t.offsetWidth,t.classList.add(`shake`),n.focus())}),document.addEventListener(`visibilitychange`,()=>{document.hidden?wt=Date.now():wt&&Date.now()-wt>Ct&&At()}),At()}function Mt(){let t=!!X.data.settings.lock;N({title:t?`تغيير رمز القفل`:`تفعيل قفل التطبيق`,submitLabel:t?`تغيير`:`تفعيل`,body:`
      ${t?P({label:`الرمز الحالي`,name:`current`,type:`password`,inputmode:`numeric`}):``}
      ${P({label:`الرمز الجديد`,name:`pin`,type:`password`,inputmode:`numeric`,hint:`4 أرقام على الأقل`})}
      ${P({label:`تأكيد الرمز`,name:`confirm`,type:`password`,inputmode:`numeric`})}
      <p class="sheet-text small">إذا نسيت الرمز فلا يمكن فتح التطبيق إلا بمسح بيانات المتصفح، لذا خذ نسخة احتياطية أولاً.</p>`,onSubmit:async n=>{if(t&&!await Ot(a(n.current)))throw new e(`الرمز الحالي غير صحيح`);let r=a(n.pin).trim();if(!/^\d{4,}$/.test(r))throw new e(`الرمز يجب أن يكون 4 أرقام على الأقل`);if(r!==a(n.confirm).trim())throw new e(`الرمزان غير متطابقين`);let i=crypto.getRandomValues(new Uint8Array(16));X.updateSettings({lock:{salt:Tt(i),hash:await Dt(r,i,St),iterations:St}}),j(t?`تغيّر الرمز`:`فُعّل القفل`)}})}function Nt(){N({title:`إلغاء قفل التطبيق`,submitLabel:`إلغاء القفل`,tone:`danger`,body:P({label:`الرمز الحالي`,name:`current`,type:`password`,inputmode:`numeric`}),onSubmit:async t=>{if(!await Ot(a(t.current)))throw new e(`الرمز غير صحيح`);X.updateSettings({lock:null}),j(`أُلغي القفل`)}})}function Pt(e){let t=(e,t=9,n=0)=>{let r=new Date;return r.setDate(r.getDate()-e),r.setHours(t,n,0,0),D(r)};e.updateSettings({unitName:`السرية الأولى`,keeperName:`رئيس عرفاء كريم ناصر`,commanderName:`نقيب حيدر عبد الأمير`,demo:!0});let n=[[`حيدر عبد الأمير`,`نقيب`,`10234`,`مقر السرية`],[`مصطفى جاسم`,`ملازم أول`,`10567`,`الفصيل الأول`],[`كريم ناصر`,`رئيس عرفاء`,`20311`,`مقر السرية`],[`علي حسن`,`عريف`,`30842`,`الفصيل الأول`],[`أحمد ستار`,`نائب عريف`,`31102`,`الفصيل الثاني`],[`سجاد كاظم`,`جندي أول`,`40125`,`الفصيل الثاني`],[`محمد رضا`,`جندي`,`40377`,`الفصيل الأول`],[`حسين عباس`,`جندي`,`40391`,`الفصيل الثاني`]].map(([t,n,r,i])=>e.addPerson({name:t,rank:n,milNo:r,platoon:i})),r=t(12,8,30),i=(t,n,i,a,o)=>a.map(a=>e.addWeapon({type:t,model:n,caliber:i,serial:a,location:o},{at:r,note:`جرد افتتاحي`})),a=i(`بندقية`,`AK-47`,`7.62×39`,[`AK-58114`,`AK-58122`,`AK-58137`,`AK-58141`,`AK-58150`,`AK-58163`,`AK-58171`,`AK-58189`],`خزانة 1`),o=i(`بندقية`,`M16A4`,`5.56×45`,[`W4402871`,`W4402879`,`W4402886`,`W4402890`],`خزانة 2`),s=i(`مسدس`,`Glock 19`,`9×19`,[`BKZ411`,`BKZ426`,`BKZ438`],`خزانة 3`),c=i(`رشاش متوسط`,`PKM`,`7.62×54R`,[`PK-90311`,`PK-90347`],`رف الرشاشات`),[l]=i(`قاذفة`,`RPG-7`,`40 ملم`,[`RP-77015`],`رف القاذفات`),[u]=i(`بندقية قنص`,`SVD`,`7.62×54R`,[`SV-60412`],`خزانة 1`),d=(t,n)=>e.addAmmo(t,{qty:n,at:r,note:`جرد افتتاحي`}),f=d({name:`عتاد بندقية`,caliber:`7.62×39`,lot:`2024-17`,unit:`طلقة`,minQty:`3000`,location:`المخزن أ`},`12000`),p=d({name:`عتاد بندقية`,caliber:`5.56×45`,lot:`2023-08`,unit:`طلقة`,minQty:`2000`,location:`المخزن أ`},`4000`),m=d({name:`عتاد مسدس`,caliber:`9×19`,unit:`طلقة`,minQty:`500`,location:`المخزن أ`},`900`),h=d({name:`عتاد رشاش`,caliber:`7.62×54R`,lot:`2022-31`,unit:`طلقة`,minQty:`1000`,location:`المخزن ب`},`2400`),g=d({name:`قنبلة يدوية`,caliber:`F1`,unit:`قنبلة`,minQty:`20`,location:`المخزن ب`},`40`),_=d({name:`قذيفة قاذفة`,caliber:`PG-7V`,unit:`قذيفة`,minQty:`10`,location:`المخزن ب`},`14`),[ee,v,y,b,x,S,C,w]=n,T=(n,r,i,a)=>e.issueWeapon(n.id,r.id,{at:t(i,a)});T(s[0],ee,11,9),T(s[1],v,11,9),T(a[0],b,10,7),T(a[1],x,10,7),T(a[2],S,10,7),T(o[0],C,10,7),T(c[0],w,10,7),T(l,y,6,14);let E=(n,r,i,a,o,s,c=``)=>e.ammoMove(n,{ammoId:r.id,personId:i?.id,qty:a,at:t(o,s),note:c});E(`a_issue`,f,b,`120`,10,7,`واجب حراسة`),E(`a_issue`,f,x,`120`,10,7,`واجب حراسة`),E(`a_issue`,f,S,`120`,10,7,`واجب حراسة`),E(`a_issue`,p,C,`90`,10,7,`واجب حراسة`),E(`a_issue`,h,w,`500`,10,7,`واجب حراسة`),E(`a_issue`,m,ee,`30`,11,9),E(`a_issue`,m,v,`30`,11,9),E(`a_issue`,f,v,`600`,4,6,`رمي تدريبي - ميدان الرمي`),E(`a_consume`,f,v,`540`,4,13,`رمي تدريبي - ميدان الرمي`),E(`a_return`,f,v,`60`,4,15,`المتبقي من الرمي التدريبي`),E(`a_issue`,_,y,`6`,6,14,`واجب`),E(`a_issue`,g,y,`4`,6,14,`واجب`),E(`a_in`,p,null,`2000`,3,10,`وارد من مستودع الفوج بالكتاب 412`),E(`a_out`,g,null,`2`,2,11,`إتلاف قنبلتين تالفتين بمحضر لجنة`),e.setWeaponStatus(a[7].id,`maintenance`,{at:t(5,10),note:`عطل في مجموعة الأقسام`}),e.setWeaponStatus(o[3].id,`unserviceable`,{at:t(8,10),note:`كسر في الأخمص`}),T(u,b,2,7),e.returnWeapon(u.id,{at:t(1,16)}),e.updateSettings({demo:!0})}var Z=g();ye(Z),ze(Z),ct(Z);var Ft={home:()=>Ze(),weapons:e=>e?$e(e):Qe(),ammo:e=>e?tt(e):et(),people:e=>e?rt(e):nt(),log:()=>at(),settings:()=>ot()};function It(){let[e,t=``]=location.hash.replace(/^#\/?/,``).split(`/`);return Ft[e]?{section:e,id:decodeURIComponent(t)}:{section:`home`,id:``}}var Q=e=>document.querySelector(e),Lt=new Map,$=null;function Rt({sameView:e=!1}={}){let{section:t,id:n}=It(),r=`${t}/${n}`,i=document.scrollingElement,a=$?.key===r;$&&!a&&Lt.set($.key,i.scrollTop);let o=Ft[t](n||void 0);Q(`#page-title`).textContent=o.title,document.title=`${o.title} · مستودع السرية`;let s=Q(`#back-btn`);s.hidden=!o.back,s.dataset.to=o.back||``,Q(`#brand-unit`).textContent=`مستودع ${Z.data.settings.unitName||`السرية`}`,Q(`#lock-btn`).hidden=!Z.data.settings.lock,Q(`.topbar-settings`).hidden=t===`settings`,document.querySelectorAll(`[data-nav]`).forEach(e=>{let n=e.dataset.nav===t;e.classList.toggle(`active`,n),n?e.setAttribute(`aria-current`,`page`):e.removeAttribute(`aria-current`)});let c=Q(`#view`);c.innerHTML=o.html,$={key:r,view:o},c.querySelectorAll(`[data-bind]`).forEach(e=>{let[t,n]=e.dataset.bind.split(`.`);e.value=H[t][n],e.addEventListener(`input`,()=>{H[t][n]=e.value,zt()})}),zt(),A(document.querySelector(`.app`)),e&&a||(i.scrollTop=Lt.get(r)||0)}function zt(){let e=Q(`#list`);e&&$?.view.list&&(e.innerHTML=$.view.list(),A(e))}function Bt(){let e=history.state?.depth??0;history.state?.depth===void 0&&history.replaceState({...history.state,depth:e},``),window.addEventListener(`hashchange`,()=>{history.state?.depth===void 0?history.replaceState({depth:++e},``):e=history.state.depth,Rt()}),window.addEventListener(`popstate`,()=>{history.state?.depth!==void 0&&(e=history.state.depth)}),Q(`#back-btn`).addEventListener(`click`,()=>{history.state?.depth>0?history.back():location.replace(`#${Q(`#back-btn`).dataset.to.replace(/^#/,``)}`)})}var Vt={"add-person":()=>De(),"edit-person":e=>De(e.id),"remove-person":e=>Oe(e.id),"add-weapon":()=>ke(),"edit-weapon":e=>ke(e.id),"remove-weapon":e=>Ae(e.id),"issue-weapon":e=>je({weaponId:e.id,personId:e.person}),"return-weapon":e=>Ne({weaponId:e.id,personId:e.person}),"weapon-status":e=>Pe(e.id),"add-ammo":()=>Fe(),"edit-ammo":e=>Fe(e.id),"remove-ammo":e=>Ie(e.id),"ammo-move":e=>Re(e.kind,{ammoId:e.id,personId:e.person}),"weapons-filter":e=>{Object.assign(H.weapons,{status:e.status,q:``}),M(`#/weapons`)},chip:(e,t)=>{let[n,r]=e.bind.split(`.`);H[n][r]=e.value,t.parentElement.querySelectorAll(`.chip[data-bind="${e.bind}"]`).forEach(e=>{e.classList.toggle(`active`,e===t),e.setAttribute(`aria-pressed`,e===t)}),zt()},"print-inventory":()=>mt(),"print-custody":e=>ht(e.id),"print-log":()=>{let{from:e,to:t}=H.log,n=e=>e.replaceAll(`-`,`/`),r=e||t?`من ${e?n(e):`البداية`} إلى ${t?n(t):`اليوم`}`:`كل الحركات`;gt(it(),r)},"export-csv":e=>bt(e.what,e.what===`log`&&It().section===`log`?it():void 0),backup:()=>{xt(),j(`نُزّلت النسخة الاحتياطية، احفظها في مكان آمن`)},restore:Ht,reset:Ut,demo:()=>{Pt(Z),j(`حُمّلت بيانات نموذجية للتجربة`)},"lock-now":()=>At(),"set-lock":()=>Mt(),"remove-lock":()=>Nt()};async function Ht(){let e=await he(`application/json,.json`);if(!e)return;let t=await e.text(),n={};try{n=JSON.parse(t)}catch{}let r=e=>Array.isArray(n[e])?S(n[e].length):`؟`;await le({title:`استعادة نسخة احتياطية`,message:`ستُستبدل كل البيانات الحالية على هذا الجهاز بمحتوى النسخة${n.exportedAt?` المأخوذة في <b>${x(E(n.exportedAt))}</b>`:``}:
      ${r(`weapons`)} سلاح، ${r(`ammo`)} صنف عتاد، ${r(`people`)} منتسب، ${r(`log`)} حركة. لا يمكن التراجع عن ذلك.`,confirmLabel:`استعادة`,validate:()=>Z.importJSON(t)})&&(j(`اُستعيدت البيانات`),M(`#/home`))}async function Ut(){await le({title:`مسح جميع البيانات`,message:`سيُحذف كل شيء من هذا الجهاز نهائياً: الأسلحة والأعتدة والمنتسبون والسجل. للتأكيد اكتب كلمة <b>مسح</b>.`,confirmLabel:`مسح نهائي`,extra:P({label:`كلمة التأكيد`,name:`confirm`}),validate:t=>{if(t.confirm.trim()!==`مسح`)throw new e(`اكتب كلمة «مسح» للتأكيد`);Z.reset()}})&&(j(`مُسحت البيانات`),M(`#/home`))}document.addEventListener(`click`,t=>{let n=t.target.closest(`[data-action]`);if(!n||n.closest(`#sheet`))return;let r=Vt[n.dataset.action];r&&(t.preventDefault(),Promise.resolve(r(n.dataset,n)).catch(t=>{t instanceof e||console.error(t),j(t instanceof e?t.message:`حدث خطأ غير متوقع`,`error`)}))}),document.addEventListener(`submit`,e=>{let t=e.target.closest(`form[data-form="settings"]`);if(!t)return;e.preventDefault();let n=Object.fromEntries(new FormData(t));try{Z.updateSettings({unitName:n.unitName.trim(),keeperName:n.keeperName.trim(),commanderName:n.commanderName.trim()}),j(`حُفظت بيانات السرية`)}catch(e){j(e.message,`error`)}}),b(),ce(),Bt(),jt(Z),Z.subscribe(()=>Rt({sameView:!0})),Rt(),navigator.storage?.persist?.().catch(()=>{}),`serviceWorker`in navigator&&window.addEventListener(`load`,()=>navigator.serviceWorker.register(`sw.js`).catch(()=>{}));