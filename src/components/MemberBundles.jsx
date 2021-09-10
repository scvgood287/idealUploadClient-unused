import React, { memo } from 'react';
import uuid from 'react-uuid';

import ImageForm from './ImageForm';

const MemberBundles = (props) => {
  const { images, onChange, onClick } = props;

  const bundles = [...images.reduce((acc, { member }) => acc.add(member), new Set([]))].map((member) => {
    const targetImages = images.reduce((acc, image) => {
      if (image.member === member) acc.push(image);

      return acc;
    }, []);

    return (
      <li key={uuid()}>
        <div>{member}</div>
        <ul>
          <ImageForm
            images={targetImages}
            onChange={onChange}
            onClick={onClick}
          />
        </ul>
      </li>
    );
  });

  return (bundles);
};

export default memo(MemberBundles);