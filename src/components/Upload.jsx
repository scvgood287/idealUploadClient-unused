import React, { memo } from 'react';

const Upload = (props) => {
  const { onChange, onClick } = props;

  return (
    <>
      <input
        type="file"
        onChange={onChange}
        multiple
      />
      <button onClick={onClick}>SEND</button>
    </>
  );
}
export default memo(Upload);