import React, { memo } from 'react';

const ImageForm = (props) => {
  const { images, onChange, onClick } = props;

  const imageForm = images.map((image) => {

    const { isEdit, fileName, extension } = image;

    const editableText = (!isEdit) ? (<div>{`${fileName}.${extension}`}</div>) : (<input type="text" onChange={onChange}/>);

    return (
      <li key={fileName}>
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
    )
  });

  return imageForm;
};

export default memo(ImageForm);