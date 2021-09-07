import React, { memo, useState } from 'react';
import uuid from 'react-uuid';

import ImageForm from './ImageForm';

const ImageList = (props) => {
  const { images, onChange, onClick } = props;

  const largeCategories = Object.keys(images);
  const [largeCategory, setLargeCategory] = useState(largeCategories[0]);

  const mediumCategories = Object.keys(images[largeCategory]);
  const [mediumCategory, setMediumCategory] = useState(mediumCategories[0]);

  const SelectLarge = largeCategories.map(c => <button key={uuid()} onClick={() => { setLargeCategory(c); setMediumCategory(Object.keys(images[c])[0]); }}>{c}</button>);
  const SelectMedium = mediumCategories.map(c => <button key={uuid()} onClick={() => setMediumCategory(c)}>{c}</button>);

  return (
    <>
      {SelectLarge}
      <br></br>
      <br></br>
      {SelectMedium}
      <br></br>
      <br></br>
      <ul>
        <ImageForm
          images={images[largeCategory][mediumCategory]}
          onChange={onChange}
          onClick={onClick}
        />
      </ul>
    </>
  );
}

export default memo(ImageList);