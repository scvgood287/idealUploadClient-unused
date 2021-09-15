import React, { memo } from 'react';
import uuid from 'react-uuid';

import ImageForm from './ImageForm';
import MemberBundles from './MemberBundles';
import {
	ERRTYPE_LABELING as LABELING,
	UPLOADTYPE_MEMBER as MEMBER
} from '../Dictionary';

const GroupBundles = (props) => {
  const { images, input, showBy, onChange, onClick } = props;

  const bundles = [...images.reduce((acc, { group }) => acc.add(group), new Set([]))].map((group) => {
    const targetImages = images.reduce((acc, image) => {
      if (image.group === group) acc.push(image);

      return acc;
    }, []);

    return (
      <li key={uuid()}>
        <div>{group}</div>
        <ul>
          {showBy === MEMBER ? (
            <MemberBundles
              images={targetImages}
              input={input}
              onChange={onChange}
              onClick={onClick}
            />
          ) : (
            <ImageForm
              images={targetImages}
              input={input}
              onChange={onChange}
              onClick={onClick}
            />
          )}
        </ul>
      </li>
    );
  });

  return (showBy === LABELING ?
    <ImageForm
      images={images}
      input={input}
      onChange={onChange}
      onClick={onClick}
    /> : bundles);
};

export default memo(GroupBundles);