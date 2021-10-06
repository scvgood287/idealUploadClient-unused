import React, { memo } from 'react';
import { useAtom } from 'jotai';
import uuid from 'react-uuid';

import { errorMessageAtom } from 'hooks/states';
import { NoticesStyle } from 'styles';

const Notices = () => {
  const [errorMessage] = useAtom(errorMessageAtom);
  
  const error = !errorMessage ? "Error 가 없습니다" : (errorMessage + "").split('\n').filter(Boolean).map(e => <div key={uuid()}>{e}</div>);

  return (
    <NoticesStyle>
      {error}
    </NoticesStyle>
  );
};

export default memo(Notices);