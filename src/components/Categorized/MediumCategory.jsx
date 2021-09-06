import React, { memo } from 'react';

import ImageForm from '../ImageForm';
import SmallCategory from './SmallCategory';
import { UPLOADTYPE_ERR as ERR } from '../../Dictionary';

const MediumCategory = (props) => {
  const { name, largeCategory, mediumCategory, onChange, onClick } = props;

  const data = (ERR === largeCategory) ? (
    <ImageForm
      images={mediumCategory}
      onChange={onChange}
      onClick={onClick}
    />
  ) : (
    <SmallCategory
      largeCategory={largeCategory}
      images={mediumCategory}
      onChange={onChange}
      onClick={onClick}
    />
  );

  return (
    <li>
      <div>{name}</div>
      <ul>{data}</ul>
    </li>
  );
};

export default memo(MediumCategory);