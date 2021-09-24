import React, { memo } from 'react';
import { useAtom } from 'jotai';
import uuid from 'react-uuid';

import {
  MediumCategoriesStyle,
  MediumCategoriesRadioStyle,
  RadioBoxStyle
} from 'styles';
import {
  mediumCategoriesAtom,
  currentMediumCategoryAtom,
} from 'hooks/states';

const MediumCategories = () => {
  const [mediumCategories] = useAtom(mediumCategoriesAtom);
  const [currentMediumCategory, setCurrentMediumCategory] = useAtom(currentMediumCategoryAtom);

  const selectMediumCategory = mediumCategories.map(mediumCategory =>
    <RadioBoxStyle key={uuid()}>
      <MediumCategoriesRadioStyle
        type="radio"
        onClick={() => setCurrentMediumCategory(mediumCategory)}
        checked={mediumCategory === currentMediumCategory}
      />
      <div>{mediumCategory}</div>
    </RadioBoxStyle>
  );

  return (
    <MediumCategoriesStyle>
      {selectMediumCategory}
    </MediumCategoriesStyle>
  );
};

export default memo(MediumCategories);