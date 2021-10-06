import React, { memo } from 'react';
import { useAtom } from 'jotai';

import { ImageViewer, ImageDetails } from './preview';
import { PreviewStyle } from 'styles';
import { isUsingNowAtom } from 'hooks/states';

const PreviewSection = () => {
  const [isUsingNow] = useAtom(isUsingNowAtom);

  return (
    <PreviewStyle>
      {!isUsingNow ? null : (
        <>
          <ImageViewer />
          <ImageDetails />
        </>
      )}
    </PreviewStyle>
  );
};

export default memo(PreviewSection);