import React, { memo } from 'react';
import { useAtom } from 'jotai';

import { Categories, Images, ImageUploader } from './select';
import { SelectStyle } from 'styles';
import { imagesAtom } from 'hooks/states';

const SelectSection = () => {
  const [images] = useAtom(imagesAtom);

  return (
    <SelectStyle>
      <ImageUploader />
      {images.length === 0 ? null : (
        <>
          <Categories />
          <Images />
        </>
      )}
    </SelectStyle>
  );
};

export default memo(SelectSection);