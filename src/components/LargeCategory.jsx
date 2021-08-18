import React, { memo } from 'react';

import MediumCategory from './MediumCategory';

const LargeCategory = (props) => {
  const { name, largeCategory, onChange, onClick } = props;

  const categorizedByMedium = Object.entries(largeCategory).map(([mediumCategory, value]) => {
    return (
      <MediumCategory
        key={mediumCategory}
        name={mediumCategory}
        largeCategory={name}
        mediumCategory={value}
        onChange={onChange}
        onClick={onClick}
      />
    );
  });

  return (
    <li>
      <div>{name}</div>
      <ul>{categorizedByMedium}</ul>
    </li>
  );
};

export default memo(LargeCategory);