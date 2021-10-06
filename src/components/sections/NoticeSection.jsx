import React, { memo } from 'react';
import { useAtom } from 'jotai';

import { Notices, SendImages } from './notice';
import { isUsingNowAtom } from 'hooks/states';
import {
  NoticeStyle,
  NoticeWrapperStyle
} from 'styles';

const NoticeSection = () => {
  const [isUsingNow] = useAtom(isUsingNowAtom);

  return (
    <NoticeStyle>
      {!isUsingNow ? null : (
        <NoticeWrapperStyle>
          <Notices />
          <SendImages />
        </NoticeWrapperStyle>
      )}
    </NoticeStyle>
  );
};

export default memo(NoticeSection);