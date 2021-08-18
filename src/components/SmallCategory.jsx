import React, { memo } from 'react';

import MemberCategory from './MemberCategory';
import ImageForm from './ImageForm';

const SmallCategory = (props) => {
  const { largeCategory, images, onChange, onClick} = props;

  const groups = new Set([]);
  images.forEach(({ group }) => { groups.add(group); });

  const groupList = Array.from(groups).map((group) => {

    const targetImages = images.filter((image) => image.group === group);

    const data = (largeCategory === 'member') ? (
      <MemberCategory
        images={targetImages}
        onChange={onChange}
        onClick={onClick}
      />
    ) : (
      <ImageForm
        images={targetImages}
        onChange={onChange}
        onClick={onClick}
      />
    );

    return (
      <li key={group}>
        <div>{group}</div>
        <ul>{data}</ul>
      </li>      
    );
  });

  return groupList;
};

export default memo(SmallCategory);