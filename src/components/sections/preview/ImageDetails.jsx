import React, { memo, useState } from 'react';
import { useAtom } from 'jotai';

import { imagesAtom, viewImageAtom, initialCollectionsAtom, errorMessageAtom } from 'hooks/states';
import { CTAButton } from 'components';
import {
  ImageDetailsStyle,
  ImageCategoriesStyle,
  ImageInformationStyle
} from 'styles';
import {
  editImage,
  categorizeImage,
  isUnusableName
} from 'utils';
import {
  CANNOT_USE_THIS
} from 'Dictionary';

const ImageDetails = () => {
  const [viewImage, setViewImage] = useAtom(viewImageAtom);
  const [images, setImages] = useAtom(imagesAtom);
  const [initialCollections] = useAtom(initialCollectionsAtom);
  const [, setErrorMessage] = useAtom(errorMessageAtom);
  const [input, setInput] = useState("");
  const [isEditable, setIsEditable] = useState(false);

  const handleChange = (e) => { setInput(e.target.value); };

  const handleEditFileName = () => {
    const { fileName, extension } = viewImage;
    try {
      setIsEditable(!isEditable);
      if (!isEditable) { setInput(fileName); }
      else {
        setInput("");

        if (isUnusableName(input.toLowerCase(), images)) {
          const errorMessage =
          `아래 중 하나 이상의 이유로 파일명 수정 요청이 거부됩니다. 다른 파일명을 입력해주세요.\n
          1. 파일명에 사용할 수 없는 특수기호나 여백(space)이 포함되어 있습니다.\n
          1-1. 파일명에 사용 가능한 특수기호 : "_" (파일의 속성을 구분할때만 사용가능)\n
          1-2. 파일명에 사용할 수 없는 특수 기호 목록 :
          ${CANNOT_USE_THIS.map(e => `"${e}"`).join(' , ')}\n
          2. 파일명 편집 시에는 확장자명은 편집 할 수 없고, 파일명만 편집 가능하므로 확장자명을 제외한 파일명만 입력 가능합니다.\n
          3. 파일명은 공백이 될 수 없습니다.
          4. 기존에 임시 업로드한 파일 중 파일명이 중복된 파일이 존재합니다. 파일명 중복검사는 대소문자를 구분하지 않으니 유의해주십시오.`;
  
          setErrorMessage(errorMessage);
  
          throw new Error(errorMessage);
        } else {
          const newImage = categorizeImage(editImage(viewImage, initialCollections, [input, extension]));
          
          setImages([...images.filter(image => image !== viewImage), newImage]);
          setErrorMessage();
          setViewImage(newImage);
        };
      } 
    } catch (err) { console.error(err); };
  };

  const handleDeleteImage = () => {
    setInput("");
    setIsEditable(false);
    setImages(images.filter(image => image !== viewImage));
    setErrorMessage();
    setViewImage();
  };

  return !viewImage ? null : (
    <ImageDetailsStyle>
      <ImageCategoriesStyle>{`${viewImage.categorized.largeCategory} - ${viewImage.categorized.mediumCategory}`}</ImageCategoriesStyle>
      <ImageInformationStyle>
        {!isEditable ? <div>FileName : {viewImage.fileName}</div> : <input type="text" onChange={handleChange}/>}
        <div>Extension : {viewImage.extension}</div>
      </ImageInformationStyle>
      <CTAButton onClick={handleEditFileName}>Edit</CTAButton>
      <CTAButton onClick={handleDeleteImage} isDelete>Delete</CTAButton>
    </ImageDetailsStyle>
  );
};

export default memo(ImageDetails);