import React, { memo } from 'react';
import uuid from 'react-uuid';

import {
	UPLOADTYPE_ERR as ERR,
	UPLOADTYPE_MEMBER as MEMBER
} from '../Dictionary';

const ImageForm = (props) => {
  const { images, showBy, onChange, onClick } = props;

  // 여기서의 images 는 ImageList.jsx 에서 images[largeCategory][mediumCategory] 로 받아온 배열 형태의 이미지들이다.
  const imageForm = images.map((image, i, arr) => {
    const { isEditable, editableName, extension, src, group, member } = image;

    const editableText = (!isEditable) ? (<div>{`${editableName}.${extension}`}</div>) : (<input type="text" onChange={onChange}/>);

    // showBy 가 member 나 group 이고, 현재 이미지보다 이전 이미지 중, 그룹과 멤버가 같은 이미지가 없으면 ?
		// group 을 보여주고, showBy 가 member 이면 member 까지 보여준다.
		// 자신 이전에 같은 이미지가 있다는 뜻이므로, 아무것도 보여주지 않는다.
    return (
      <>
        {showBy !== ERR && !arr.slice(0, i).some(prevImage => prevImage.group === group && prevImage.member === member) ?
          (<><br/><div key={uuid()}>{`${group}${showBy === MEMBER ? `_${member}` : ''}`}</div><br/></>)
          : undefined}
        <li key={uuid()}>
          <img src={src} alt={`${editableName}.${extension}`}/>
          <div style={{ display: "flex" }}>
            {editableText}
            <button
              onClick={() => onClick(image)}
              style={{ margin: "4px 10px" }}
            >
            edit
            </button>
          </div>
        </li>
      </>
    );
  });

  return imageForm;
};

export default memo(ImageForm);