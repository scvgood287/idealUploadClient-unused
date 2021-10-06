import React, { memo } from 'react';
import { useAtom } from 'jotai';

import { Categories, Images, ImageUploader } from './select';
import { SelectStyle } from 'styles';
import { isUsingNowAtom } from 'hooks/states';

const SelectSection = () => {
  const [isUsingNow] = useAtom(isUsingNowAtom);

  return (
    <SelectStyle>
      <ImageUploader />
      {!isUsingNow ? null : (
        <>
          <Categories />
          <Images />
        </>
      )}
    </SelectStyle>
  );
};

export default memo(SelectSection);