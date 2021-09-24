import React, { memo } from 'react';
import uuid from 'react-uuid';

import { ImageCard } from 'components/sections/select/images/index';
import { ListStyle } from 'styles';

const CategorizedImages = ({ categorizedImages }) => {
  return categorizedImages.map(image =>
    <ListStyle key={uuid()}>
      <ImageCard image={image}/>
    </ListStyle>
  );
};

export default memo(CategorizedImages);