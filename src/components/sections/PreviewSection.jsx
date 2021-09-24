import React, { memo } from 'react';

import { ImageViewer, ImageDetails } from './preview';
import { PreviewStyle } from 'styles';

const PreviewSection = () => {
  return (
    <PreviewStyle>
      <ImageViewer />
      <ImageDetails />
    </PreviewStyle>
  );
};

export default memo(PreviewSection);