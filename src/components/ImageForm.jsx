import React, { memo } from 'react';
import uuid from 'react-uuid';

const ImageForm = (props) => {
  const { images, input, onChange, onClick } = props;

  // 여기서의 images 는 images[largeCategory][mediumCategory][group][member] || images[largeCategory][mediumCategory][group] 로 받아온 배열 형태의 이미지들이다.
  const imageForm = images.map((image) => {
    const { isEdit, fileName, extension, imgUrl } = image;

    return (
      <li key={uuid()}>
        <img src={imgUrl} alt={`${fileName}.${extension}`}/>
        <div style={{ display: "flex" }}>
          {!isEdit ? (<div>{`${fileName}.${extension}`}</div>) : (<input type="text" onChange={onChange}/>)}
          <button
            onClick={() => onClick(image)}
            style={{ margin: "4px 10px" }}
          >
          {!isEdit ? "edit" : "OK!"}
          </button>
        </div>
      </li>
    );
  });

  return (imageForm);
};

export default memo(ImageForm);