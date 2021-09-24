import React, { memo } from 'react';
import { useAtom } from 'jotai';

import {
  ImageViewerStyle,
  ImageStyle
} from 'styles';
import { viewImageAtom } from 'hooks/states';

const ImageViewer = () => {
  const [viewImage] = useAtom(viewImageAtom);

  return !viewImage ? null : (
    <ImageViewerStyle>
      <ImageStyle src={viewImage.src} alt={viewImage.fileName}/>
    </ImageViewerStyle>
  );
};

export default memo(ImageViewer);