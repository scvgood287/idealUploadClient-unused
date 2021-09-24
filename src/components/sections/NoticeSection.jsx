import React, { memo } from 'react';
import { useAtom } from 'jotai';

import { Notices, SendImages } from './notice';
import { imagesAtom } from 'hooks/states';
import {
  NoticeStyle,
  NoticeWrapperStyle
} from 'styles';

const NoticeSection = () => {
  const [images] = useAtom(imagesAtom);

  return (
    <NoticeStyle>
      {images.length === 0 ? null : (
        <NoticeWrapperStyle>
          <Notices />
          <SendImages />
        </NoticeWrapperStyle>
      )}
    </NoticeStyle>
  );
};

export default memo(NoticeSection);