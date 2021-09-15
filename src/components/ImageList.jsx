import React, { memo, useState } from 'react';
import uuid from 'react-uuid';

import GroupBundles from './GroupBundles';
import { UPLOADTYPE_ERR as ERR } from '../Dictionary';

const ImageList = (props) => {
  const { images, input, onChange, onClick } = props;

  // App.jsx 에서 받아온 images state 의 키 값들 중 0번째 값을 대분류 default 로 설정한다.
  const largeCategories = Object.keys(images);
  const [largeCategory, setLargeCategory] = useState(largeCategories[0]);

	// 위에서 정해진 largeCategory state 에 따라 images[largeCategory] 의 키 값들 중 0번째 값을 중분류 default 로 설정한다.
  const mediumCategories = Object.keys(images[largeCategory]);
  const [mediumCategory, setMediumCategory] = useState(mediumCategories[0]);

  // largeCategory state 에 따라 그 하위의 images[largeCategory] 의 생김새 또한
	// 다르므로 업데이트 될 largeCategory state 에 맞게 images[largeCategory] 의
	// 0번째 키 값을 setMediumCategory 로 설정해준다.
  const SelectLarge = largeCategories.map(c => (
    <button
      key={uuid()}
      onClick={() => {
        setLargeCategory(c);
        setMediumCategory(Object.keys(images[c])[0]);
      }}
    >
      {c}
    </button>
  ));

	// mediumCategories 는 largeCategory state 가 setLargeCategory 로 업데이트 될 때마다
	// 같이 업데이트 되고, 그에 따라 SelectMedium 또한 업데이트 된다.
  const SelectMedium = mediumCategories.map(c => (
    <button
      key={uuid()}
      onClick={() => setMediumCategory(c)}
    >
      {c}
    </button>
  ));

  // largeCategory state 와 mediumCategory state 에 의해 렌더링 대상이 될 이미지 배열이 정해지고,
  // ImageForm 에 그 이미지 배열을 ImageForm.jsx 에 넘겨준다.
  // showBy 는 labeling, member, group 이 넘어가는데, member 나 group 이면 그에 따라 세부 정렬을 해준다
  return (
    <>
      {SelectLarge}
      <br></br>
      <br></br>
      {SelectMedium}
      <br></br>
      <br></br>
      <ul>
        <GroupBundles
          images={images[largeCategory][mediumCategory]}
          input={input}
          showBy={largeCategory === ERR ? mediumCategory : largeCategory}
          onChange={onChange}
          onClick={onClick}
        />
      </ul>
    </>
  );
};

export default memo(ImageList);