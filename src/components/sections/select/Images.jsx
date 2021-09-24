import React, { memo } from 'react';
import { SelectableImages } from './images/index';

const Images = () => {
  return (
    <>
      <SelectableImages />
    </>
  );
};

export default memo(Images);