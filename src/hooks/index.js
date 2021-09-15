import { atom } from 'jotai';

// images

const errLabelingAtom = atom([]);
const errMemberAtom = atom([]);
const errGroupAtom = atom([]);

const getErrLabelingAtom = atom((get) => get(errLabelingAtom));

const errAtom = atom({
  labeling: errLabelingAtom,
  member: errMemberAtom,
  group: errGroupAtom,
});

const memberNewAtom = atom([]);
const memberBoyAtom = atom([]);
const memberGirlAtom = atom([]);
const membermixedAtom = atom([]);

const memberAtom = atom({
  new: memberNewAtom,
  boy: memberBoyAtom,
  girl: memberGirlAtom,
  mixed: membermixedAtom,
});

const groupNewAtom = atom([]);
const groupBoyAtom = atom([]);
const groupGirlAtom = atom([]);
const groupmixedAtom = atom([]);

const groupAtom = atom({
  new: groupNewAtom,
  boy: groupBoyAtom,
  girl: groupGirlAtom,
  mixed: groupmixedAtom,
});

const imagesAtom = atom({
  err: errAtom,
  member: memberAtom,
  group: groupAtom,
});

export {

};