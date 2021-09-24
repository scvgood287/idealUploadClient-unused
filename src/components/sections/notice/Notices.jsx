import React, { memo } from 'react';
import { useAtom } from 'jotai';

import { errorMessageAtom } from 'hooks/states';
import { NoticesStyle } from 'styles';

const Notices = () => {
  const [errorMessage] = useAtom(errorMessageAtom);

  return (
    <NoticesStyle>
      {errorMessage}
    </NoticesStyle>
  );
};

export default memo(Notices);