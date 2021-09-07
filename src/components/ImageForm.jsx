import React, { memo } from 'react';
import uuid from 'react-uuid';

const ImageForm = (props) => {
  const { images, onChange, onClick } = props;

  const imageForm = images.map((image) => {
    const { isEditable, editableName, extension, src } = image;

    const editableText = (!isEditable) ? (<div>{`${editableName}.${extension}`}</div>) : (<input type="text" onChange={onChange}/>);

    return (
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
    );
  });

  return imageForm;
};

export default memo(ImageForm);