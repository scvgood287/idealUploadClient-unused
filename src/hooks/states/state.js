import { atom } from 'jotai';

const isUsingNowAtom = atom(false);
const isDoneAtom = atom(false);

export {
  isUsingNowAtom,
  isDoneAtom
};