import { atom } from 'jotai';

const initialImages = [];

const imagesAtom = atom(initialImages);

const viewImageAtom = atom();

export {
  imagesAtom,
  viewImageAtom
};