// Sample records for trying the app out, entered through the same store calls
// a user's actions go through, so the log and balances are consistent.
import { localInputValue } from './ui.js';

export function loadDemo(store) {
  const daysAgo = (d, h = 9, m = 0) => {
    const t = new Date();
    t.setDate(t.getDate() - d);
    t.setHours(h, m, 0, 0);
    return localInputValue(t);
  };

  store.updateSettings({
    unitName: 'السرية الأولى', keeperName: 'رئيس عرفاء كريم ناصر', commanderName: 'نقيب حيدر عبد الأمير', demo: true,
  });

  const people = [
    ['حيدر عبد الأمير', 'نقيب', '10234', 'مقر السرية'],
    ['مصطفى جاسم', 'ملازم أول', '10567', 'الفصيل الأول'],
    ['كريم ناصر', 'رئيس عرفاء', '20311', 'مقر السرية'],
    ['علي حسن', 'عريف', '30842', 'الفصيل الأول'],
    ['أحمد ستار', 'نائب عريف', '31102', 'الفصيل الثاني'],
    ['سجاد كاظم', 'جندي أول', '40125', 'الفصيل الثاني'],
    ['محمد رضا', 'جندي', '40377', 'الفصيل الأول'],
    ['حسين عباس', 'جندي', '40391', 'الفصيل الثاني'],
  ].map(([name, rank, milNo, platoon]) => store.addPerson({ name, rank, milNo, platoon }));

  const at = daysAgo(12, 8, 30);
  const add = (type, model, caliber, serials, location) =>
    serials.map((serial) => store.addWeapon({ type, model, caliber, serial, location }, { at, note: 'جرد افتتاحي' }));
  const ak = add('بندقية', 'AK-47', '7.62×39', ['AK-58114', 'AK-58122', 'AK-58137', 'AK-58141', 'AK-58150', 'AK-58163', 'AK-58171', 'AK-58189'], 'خزانة 1');
  const m16 = add('بندقية', 'M16A4', '5.56×45', ['W4402871', 'W4402879', 'W4402886', 'W4402890'], 'خزانة 2');
  const glock = add('مسدس', 'Glock 19', '9×19', ['BKZ411', 'BKZ426', 'BKZ438'], 'خزانة 3');
  const pkm = add('رشاش متوسط', 'PKM', '7.62×54R', ['PK-90311', 'PK-90347'], 'رف الرشاشات');
  const [rpg] = add('قاذفة', 'RPG-7', '40 ملم', ['RP-77015'], 'رف القاذفات');
  const [svd] = add('بندقية قنص', 'SVD', '7.62×54R', ['SV-60412'], 'خزانة 1');

  const ammo = (f, qty) => store.addAmmo(f, { qty, at, note: 'جرد افتتاحي' });
  const r762 = ammo({ name: 'عتاد بندقية', caliber: '7.62×39', lot: '2024-17', unit: 'طلقة', minQty: '3000', location: 'المخزن أ' }, '12000');
  const r556 = ammo({ name: 'عتاد بندقية', caliber: '5.56×45', lot: '2023-08', unit: 'طلقة', minQty: '2000', location: 'المخزن أ' }, '4000');
  const r9 = ammo({ name: 'عتاد مسدس', caliber: '9×19', unit: 'طلقة', minQty: '500', location: 'المخزن أ' }, '900');
  const rPk = ammo({ name: 'عتاد رشاش', caliber: '7.62×54R', lot: '2022-31', unit: 'طلقة', minQty: '1000', location: 'المخزن ب' }, '2400');
  const gren = ammo({ name: 'قنبلة يدوية', caliber: 'F1', unit: 'قنبلة', minQty: '20', location: 'المخزن ب' }, '40');
  const pg7 = ammo({ name: 'قذيفة قاذفة', caliber: 'PG-7V', unit: 'قذيفة', minQty: '10', location: 'المخزن ب' }, '14');

  const [captain, lt, sgt, cpl, lcpl, pfc, pvt1, pvt2] = people;
  const issue = (w, p, d, h) => store.issueWeapon(w.id, p.id, { at: daysAgo(d, h) });
  issue(glock[0], captain, 11, 9);
  issue(glock[1], lt, 11, 9);
  issue(ak[0], cpl, 10, 7);
  issue(ak[1], lcpl, 10, 7);
  issue(ak[2], pfc, 10, 7);
  issue(m16[0], pvt1, 10, 7);
  issue(pkm[0], pvt2, 10, 7);
  issue(rpg, sgt, 6, 14);

  const move = (kind, a, p, qty, d, h, note = '') => store.ammoMove(kind, { ammoId: a.id, personId: p?.id, qty, at: daysAgo(d, h), note });
  move('a_issue', r762, cpl, '120', 10, 7, 'واجب حراسة');
  move('a_issue', r762, lcpl, '120', 10, 7, 'واجب حراسة');
  move('a_issue', r762, pfc, '120', 10, 7, 'واجب حراسة');
  move('a_issue', r556, pvt1, '90', 10, 7, 'واجب حراسة');
  move('a_issue', rPk, pvt2, '500', 10, 7, 'واجب حراسة');
  move('a_issue', r9, captain, '30', 11, 9);
  move('a_issue', r9, lt, '30', 11, 9);
  move('a_issue', r762, lt, '600', 4, 6, 'رمي تدريبي - ميدان الرمي');
  move('a_consume', r762, lt, '540', 4, 13, 'رمي تدريبي - ميدان الرمي');
  move('a_return', r762, lt, '60', 4, 15, 'المتبقي من الرمي التدريبي');
  move('a_issue', pg7, sgt, '6', 6, 14, 'واجب');
  move('a_issue', gren, sgt, '4', 6, 14, 'واجب');
  move('a_in', r556, null, '2000', 3, 10, 'وارد من مستودع الفوج بالكتاب 412');
  move('a_out', gren, null, '2', 2, 11, 'إتلاف قنبلتين تالفتين بمحضر لجنة');

  store.setWeaponStatus(ak[7].id, 'maintenance', { at: daysAgo(5, 10), note: 'عطل في مجموعة الأقسام' });
  store.setWeaponStatus(m16[3].id, 'unserviceable', { at: daysAgo(8, 10), note: 'كسر في الأخمص' });
  issue(svd, cpl, 2, 7);
  store.returnWeapon(svd.id, { at: daysAgo(1, 16) });
  store.updateSettings({ demo: true });
}
