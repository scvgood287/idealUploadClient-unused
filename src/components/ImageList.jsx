import React, { memo } from 'react';

import LargeCategory from './Categorized/LargeCategory';

const ImageList = (props) => {
  const { images, onChange, onClick } = props;

  const categorizedByLarge = Object.entries(images).map(([largeCategory, value]) => {
    return (
      <LargeCategory
        key={largeCategory}
        name={largeCategory}
        largeCategory={value}
        onChange={onChange}
        onClick={onClick}
      />
    );
  });

  return (
    <ul>{categorizedByLarge}</ul>
  );
}

export default memo(ImageList);