import React, { memo } from 'react';

import { SelectSection, PreviewSection, NoticeSection } from 'components/sections';
import { UploaderStyle } from 'styles';

const Uploader = () => {

  return (
    <UploaderStyle>
      <SelectSection/>
      <PreviewSection/>
      <NoticeSection/>
    </UploaderStyle>
  );
};

export default memo(Uploader);