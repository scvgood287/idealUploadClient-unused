import React, { memo } from 'react';

import ImageForm from './ImageForm';

const MemberCategory = (props) => {
  const { images, onChange, onClick } = props;

  const members = new Set([]);
  images.forEach(({ member }) => { members.add(member); });

  const memberList = Array.from(members).map((member, index) => {

    const targetImages = images.filter((image) => image.member === member);

    return (
      <li key={index}>
        <div>{member}</div>
        <ul>
          <ImageForm
            images={targetImages}
            onChange={onChange}
            onClick={onClick}
          />
        </ul>
      </li>
    )
  });

  return memberList;
};

export default memo(MemberCategory);