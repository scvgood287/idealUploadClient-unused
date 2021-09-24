import React, { memo } from 'react';
import { useAtom } from 'jotai';

import {
  ImageCardStyle,
  ImageCardCardFileNameWrapper,
  ImageCardFileNameStyle,
  ImageCardPreviewStyle,
} from 'styles';
import { viewImageAtom } from 'hooks/states';

const ImageCard = ({ image }) => {
  const [, setViewImage] = useAtom(viewImageAtom);

  const { fileName, src } = image;

  return (
    <ImageCardStyle onClick={() => setViewImage(image)}>
      <ImageCardCardFileNameWrapper>
        <ImageCardFileNameStyle>
          {fileName}
        </ImageCardFileNameStyle>
      </ImageCardCardFileNameWrapper>
      <ImageCardPreviewStyle>
        <img src={src} alt={fileName}/>
      </ImageCardPreviewStyle>
    </ImageCardStyle>
  );
};

export default memo(ImageCard);