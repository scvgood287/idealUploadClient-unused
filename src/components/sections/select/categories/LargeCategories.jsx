import React, { memo } from 'react';
import { useAtom } from 'jotai';
import uuid from 'react-uuid';

import {
  LargeCategoriesStyle,
  LargeCategoryStyle,
} from 'styles';
import {
  largeCategoriesAtom,
  currentLargeCategoryAtom
} from 'hooks/states';

const LargeCategories = () => {
  const [largeCategories] = useAtom(largeCategoriesAtom);
  const [currentLargeCategory, setCurrentLargeCategory] = useAtom(currentLargeCategoryAtom);

  const selectLargeCategory = largeCategories.map(largeCategory =>
    <LargeCategoryStyle
      key={uuid()}
      onClick={() => setCurrentLargeCategory(largeCategory)}
      selected={largeCategory === currentLargeCategory}
    >{largeCategory}</LargeCategoryStyle>
  );

  return (
    <LargeCategoriesStyle>
      {selectLargeCategory}
    </LargeCategoriesStyle>
  );
};

export default memo(LargeCategories);