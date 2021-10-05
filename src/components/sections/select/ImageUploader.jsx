import React, { memo, useRef } from 'react';
import { useAtom } from 'jotai';

import { imagesAtom, initialCollectionsAtom, errorMessageAtom } from 'hooks/states';
import { ImageUploaderStyle } from 'styles';
import imageUploadIcon from 'resources/add.png';
import {
  editImage,
  categorizeImage,
  isUnusableName
} from 'utils';
import {
  CANNOT_USE_THIS,
} from 'Dictionary';

const ImageUploader = () => {
  const [images, setImages] = useAtom(imagesAtom);
  const [initialCollections] = useAtom(initialCollectionsAtom);
  const [, setErrorMessage] = useAtom(errorMessageAtom);

  const fileInput = useRef(null);
  const changeCTASize = useRef(null);

  const handleUpdate = () => { fileInput.current.click(); };

  const handleUpdateImages = (e) => {
    try {
      let newImages = [...images];
      let files = [...e.target.files];

      let needToInsertImage = true;
      let wrongImages = new Set();

      files.forEach((file) => {
        const name = file.name;
        const validName = name.slice(0, name.lastIndexOf(".")).toLowerCase();
  
        if (isUnusableName(validName, newImages) || files.filter(({ name: currentName }) => currentName.slice(0, currentName.lastIndexOf(".")).toLowerCase() === validName).length > 1) {
          wrongImages.add(name);
          needToInsertImage = false;
        } else if (needToInsertImage) { newImages = [...newImages, categorizeImage(editImage(file, initialCollections))]; };
      });

      if (!needToInsertImage) {
        const errorMessage = 
        `아래 중 하나 이상의 이유로 업로드 요청이 거부됩니다. 파일명을 수정하여 다시 업로드해주세요.\n
        1. 파일명에 사용할 수 없는 특수기호나 여백(space)이 포함되어 있습니다.\n
        1-1. 파일명에 사용 가능한 특수기호 : "_" (파일의 속성을 구분할때만 사용가능)\n
        1-2. 파일명에 사용할 수 없는 특수기호 목록 :
        ${CANNOT_USE_THIS.map(e => `"${e}"`).join(' , ')}\n
        2. "."의 개수가 파일명과 확장자명 구분을 위한 1개 보다 더 많습니다.\n
        3. 파일명은 공백이 될 수 없습니다.
        4. 기존에 임시 업로드한 파일이나 동시에 업로드한 파일들 중 파일명이 중복된 파일이 존재합니다. 파일명 중복검사는 대소문자를 구분하지 않으니 유의해주십시오.\n
        해당하는 파일명 목록 : ${[...wrongImages].map((fileName, index) => `\n${index + 1}. ${fileName}`)}`;

        setErrorMessage(errorMessage);

        throw new Error(errorMessage);
      };

      changeCTASize.current.style.height = "60px";
      setErrorMessage();
      setImages(newImages);
    } catch (err) { console.error(err); };
  };

  return (
    <>
      <ImageUploaderStyle ref={changeCTASize} onClick={() => handleUpdate()}>
        <img src={imageUploadIcon} alt={imageUploadIcon} style={{ width: images.length === 0 ? '60px' : '40px' }}/>
      </ImageUploaderStyle>
      <input
        type="file"
        ref={fileInput}
        onChange={handleUpdateImages}
        style={{ display: 'none' }}
        multiple
      />
    </>
  );
};

export default memo(ImageUploader);