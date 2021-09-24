import React, { memo } from 'react';
import { LargeCategories, MediumCategories } from './categories/index';

const Categories = () => {
  return (
    <>
      <LargeCategories />
      <MediumCategories />
    </>
  );
};

export default memo(Categories);