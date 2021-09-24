import React, { memo } from 'react';

import { CTAButtonStyle } from 'styles';

const CTAButton = ({ onClick, isDelete, children }) => {
  return <CTAButtonStyle onClick={() => onClick()} isDelete={isDelete}>{children}</CTAButtonStyle>
};

export default memo(CTAButton);