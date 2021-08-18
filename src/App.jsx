import React, { memo, useState } from 'react';
import _ from 'lodash';

import Upload from './components/Upload';
import ImageList from './components/ImageList';
import useAsync from './apis/useAsync';
import { rules, createImageByFile, insertImage } from './apis/index';

const App = () => {

  const [images, setImages] = useState({
    err: {
      labeling: [],
      member: [],
      group: [],
    },
    member: {
      men: [],
      women: [],
      mixed: [],
    },
    group: {
      men: [],
      women: [],
      mixed: [],
    },
  });
  const [input, setInput] = useState();

  // Custom Hook
  // const [asyncFunctionState, asyncFunction] = useAsync(reqType, url, skip = false, body = {})
  // asyncFunctionState = { loading, data, error } 반환. 현재 상태나 데이터를 받아볼 수 있음
  //   .loading = Boolean , 현재 함수 실행 도중이면 true, 끝나면 false
  //   .data = 요청 결과의 데이터
  //   .error = 요청 결과의 에러
  // asyncFunction = 이 함수로 요청을 재실행 가능
  // reqType = axios 요청 타입, Get || Post
  // url = 요청의 타겟이 될 collection, 추후 설명
  // skip = default false, 해당 요청을 useEffect로 실행할지 말지 결정. true시 건너 뜀
  // body = 요청 시에 같이 보낼 데이터, Get은 body를 담을 수 없음. Post 시 사용.
  const [getCollectionsState, getCollections] = useAsync('Get' ,'collections');
  const [postDocumentsState, postDocuments] = useAsync('Post', 'documents', true);
  const [postImagesState, postImages] = useAsync('Post', 'images', true);

  const { loading, data, error } = getCollectionsState;
  
  let jotai;
  if (loading) jotai = (<div>로딩중..</div>);
  if (error) jotai = (<div>에러가 발생했습니다</div>);
  if (!data) jotai = null;
  console.log(data);

  // 파일 임시 업로드
  const handleFileInput = (e) => {
    const files = [...e.target.files];

    const temp = _.cloneDeep(images);

    files.forEach((file) => {
      insertImage(temp, createImageByFile(file), rules);
    });

    setImages(temp);
  }

  // 임시방편으로 해뒀으나, 각각의 input 별로 자신이 속한 이미지만 바꿔줘야함
  const handleChange = (e) => { setInput(e.target.value); }

  // handleChange의 주석에도 말했듯, 클릭시 다른 버튼을 비활성화 한다거나, 각각 input 별로 자신이 속한 이미지만 바꿔줘야 함.
  // 추후 분류에 속한 이미지들의 이름을 한번에 바꾼다거나, 선택한 이미지들의 이름을 한번에 바꾸는 기능도 생각중.
  const handleEditText = (e) => {
    if (!e.isEdit) {
      setInput(e.fileName);
      e.isEdit = !e.isEdit;
    } else {
      const { largeCategory, mediumCategory } = e.categorized;

      let temp = {...images};
      temp[largeCategory][mediumCategory] = temp[largeCategory][mediumCategory].filter((image) => image !== e);

      insertImage(temp, createImageByFile(e, [input, e.extension]), rules);
      setInput('');
      setImages(temp);
    }
  }

  return (
    <>
      <div>
        <button onClick={getCollections}>다시 불러오기</button>
        {jotai}
      </div>
      <Upload
        onChange={handleFileInput}
      />
      <ImageList
        images={images}
        onChange={handleChange}
        onClick={handleEditText}
      />
    </>
  );
}

export default memo(App);
