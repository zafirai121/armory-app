import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore, UserError } from '../src/store.js';

function memoryStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  };
}

function setup() {
  const storage = memoryStorage();
  const store = createStore({ storage });
  const ali = store.addPerson({ name: 'علي حسن', rank: 'عريف', milNo: '١٢٣٤' });
  const omar = store.addPerson({ name: 'عمر كاظم', rank: 'جندي' });
  const ak = store.addWeapon({ type: 'بندقية', model: 'AK-47', serial: '٥٥٠١' });
  const rounds = store.addAmmo({ name: 'عتاد بندقية', caliber: '7.62×39', unit: 'طلقة', minQty: '100' }, { qty: '500' });
  return { storage, store, ali, omar, ak, rounds };
}

test('Arabic-Indic digits are stored as Latin digits', () => {
  const { ali, ak } = setup();
  assert.equal(ali.milNo, '1234');
  assert.equal(ak.serial, '5501');
});

test('issuing and returning a weapon moves its custody', () => {
  const { store, ali, ak } = setup();
  store.issueWeapon(ak.id, ali.id);
  assert.equal(store.findWeapon(ak.id).status, 'issued');
  assert.deepEqual(store.custodyOf(ali.id).weapons.map((w) => w.id), [ak.id]);
  assert.throws(() => store.issueWeapon(ak.id, ali.id), UserError);
  assert.throws(() => store.removePerson(ali.id), UserError);

  store.returnWeapon(ak.id, { status: 'maintenance' });
  const w = store.findWeapon(ak.id);
  assert.equal(w.status, 'maintenance');
  assert.equal(w.holderId, null);
  assert.equal(store.custodyOf(ali.id).weapons.length, 0);
  assert.throws(() => store.issueWeapon(ak.id, ali.id), /في الصيانة/);
});

test('a weapon reported lost leaves custody and is logged against the holder', () => {
  const { store, omar, ak } = setup();
  store.issueWeapon(ak.id, omar.id);
  store.returnWeapon(ak.id, { status: 'lost', note: 'فُقد أثناء الواجب' });
  const last = store.data.log.at(-1);
  assert.equal(last.kind, 'w_status');
  assert.equal(last.to, 'lost');
  assert.equal(last.personId, omar.id);
  assert.equal(store.findWeapon(ak.id).status, 'lost');
});

test('duplicate serial for the same model is refused', () => {
  const { store } = setup();
  assert.throws(() => store.addWeapon({ type: 'بندقية', model: 'ak-47', serial: '5501' }), UserError);
  store.addWeapon({ type: 'مسدس', model: 'Glock 17', serial: '5501' });
});

test('ammunition balances follow every movement', () => {
  const { store, ali, omar, rounds } = setup();
  const id = rounds.id;
  assert.equal(store.balanceOf(id).store, 500);

  store.ammoMove('a_issue', { ammoId: id, personId: ali.id, qty: '120' });
  store.ammoMove('a_issue', { ammoId: id, personId: omar.id, qty: '60' });
  store.ammoMove('a_return', { ammoId: id, personId: ali.id, qty: '20' });
  store.ammoMove('a_consume', { ammoId: id, personId: omar.id, qty: '60' });
  store.ammoMove('a_in', { ammoId: id, qty: '1,000' });
  store.ammoMove('a_out', { ammoId: id, qty: '40' });

  const b = store.balanceOf(id);
  assert.equal(b.store, 500 - 120 - 60 + 20 + 1000 - 40);
  assert.equal(b.issued, 100);
  assert.equal(b.byPerson.get(ali.id), 100);
  assert.equal(b.byPerson.has(omar.id), false);

  store.ammoMove('a_adjust', { ammoId: id, counted: '1250' });
  assert.equal(store.balanceOf(id).store, 1250);
  assert.equal(store.data.log.at(-1).qty, 1250 - 1300);
});

test('ammunition movements cannot overdraw the store or a custody', () => {
  const { store, ali, rounds } = setup();
  assert.throws(() => store.ammoMove('a_issue', { ammoId: rounds.id, personId: ali.id, qty: '501' }), /500/);
  assert.throws(() => store.ammoMove('a_return', { ammoId: rounds.id, personId: ali.id, qty: '1' }), UserError);
  assert.throws(() => store.ammoMove('a_out', { ammoId: rounds.id, qty: '0' }), UserError);
  assert.throws(() => store.ammoMove('a_in', { ammoId: rounds.id, qty: '2.5' }), UserError);
  assert.throws(() => store.ammoMove('a_adjust', { ammoId: rounds.id, counted: '500' }), /مطابقة/);
  assert.throws(() => store.ammoMove('w_issue', { ammoId: rounds.id, qty: '1' }), UserError);
  assert.throws(() => store.removeAmmo(rounds.id), UserError);
});

test('data survives a reload and a backup round-trip', () => {
  const { storage, store, ali, rounds } = setup();
  store.ammoMove('a_issue', { ammoId: rounds.id, personId: ali.id, qty: '30' });
  store.updateSettings({ lock: { salt: 's', hash: 'h' }, unitName: 'السرية الأولى' });

  const reopened = createStore({ storage });
  assert.equal(reopened.balanceOf(rounds.id).byPerson.get(ali.id), 30);
  assert.equal(reopened.data.settings.unitName, 'السرية الأولى');

  const backup = reopened.exportJSON();
  assert.equal(JSON.parse(backup).settings.lock, null);

  const other = createStore({ storage: memoryStorage() });
  other.importJSON(backup);
  assert.equal(other.data.people.length, 2);
  assert.equal(other.balanceOf(rounds.id).store, 470);
  assert.throws(() => other.importJSON('{"hello":1}'), UserError);
});

test('a failed save rolls the change back', () => {
  const { storage, store } = setup();
  const before = store.data.people.length;
  storage.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.throws(() => store.addPerson({ name: 'جديد' }), /تعذّر الحفظ/);
  assert.equal(store.data.people.length, before);
});

test('unreadable saved data is kept aside, not lost', () => {
  const storage = memoryStorage();
  storage.setItem('armory-app:data:v1', '{broken');
  const store = createStore({ storage });
  assert.ok(store.loadProblem);
  assert.equal(storage.getItem('armory-app:unreadable-copy'), '{broken');
});
