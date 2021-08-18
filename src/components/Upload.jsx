import React, { memo } from 'react';

const Upload = (props) => {
  const { onChange } = props;

  return (
    <input
      type="file"
      onChange={onChange}
      multiple
    />
  );
}
export default memo(Upload);