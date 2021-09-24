import { atom } from 'jotai';

import {
  UPLOADTYPE_ERROR as ERROR,
  UPLOADTYPE_MEMBER as MEMBER,
  UPLOADTYPE_GROUP as GROUP,
  ERRTYPE_LABELING as LABELING,
  ERRTYPE_GENDER as GENDER,
  MEDIUMCATEGORY_NEW as NEW,
  GENDER_BOY as BOY,
  GENDER_GIRL as GIRL,
  GENDER_MIXED as MIXED
} from 'Dictionary';

const largeCategories = [ERROR, MEMBER, GROUP];
const mediumCategories = {
  error: [LABELING, GENDER],
  member: [NEW, BOY, GIRL, MIXED],
  group: [NEW, BOY, GIRL, MIXED],
};

const largeCategoriesAtom = atom(largeCategories);
const mediumCategoriesAtom = atom((get) => mediumCategories[get(currentLargeCategoryAtom)]);

const currentLargeCategoryAtom = atom(MEMBER,
  (_get, set, update) => {
    set(currentLargeCategoryAtom, update);
    set(currentMediumCategoryAtom, mediumCategories[update][0]);
  }
);
const currentMediumCategoryAtom = atom(NEW);

export {
  largeCategoriesAtom,
  mediumCategoriesAtom,
  currentLargeCategoryAtom,
  currentMediumCategoryAtom,
};