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
  // eslint-disable-next-line
  const [postDocumentsState, postDocuments] = useAsync('Post', 'documents', true);
  // const [postImagesState, postImages] = useAsync('Post', 'images', true);

  // eslint-disable-next-line
  const { loading, data, error } = getCollectionsState;

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

  const handleUploadImages = async () => {
    console.log(images);
    let temp = Object.entries(_.cloneDeep(images));
    const errors = temp.splice(temp.findIndex(e => e[0] === 'err'), 1);

    const hasError = Object.values(errors[0][1]).reduce((acc, curr) => { return acc + curr.length}, 0) !== 0;;
    if (hasError) { console.log('Error Exist'); return; }

    const findTarget = (data, collection) => data[data.findIndex(e => Object.keys(e)[0] === collection)][collection];

    const validGenders = temp.map((type) => {
      const [uploadType, genders] = type;
      const upload = Object.entries(genders)
      .map(([gender, files]) => files.length !== 0 ? gender : undefined)
      .filter(e => e !== undefined);

      return upload.length !== 0 ? { uploadType, uploadGenders: upload } : undefined;
    }).filter(e => e !== undefined);

    let newGenderList = new Set();
    validGenders.forEach((validGender) => (
      validGender.uploadGenders.forEach((uploadGender) => {
        const existGenders = findTarget(data, 'gender').map(({ name }) => name);

        if (!existGenders.includes(uploadGender)) newGenderList.add(uploadGender);
      })
    ));
    const newGenders = ['gender', [...newGenderList].map(name => ({ name }))];

    if (newGenderList.size !== 0) await postDocuments(newGenders);

    // gender update complete, Get updatedData
    await getCollections();

    const genderCollections = findTarget(data, 'gender');

    let newGroupList = genderCollections.map(gender => ({
      ...gender,
      uploadList: new Set([]),
    }));
    validGenders.forEach((upload) => {
      const { uploadType, uploadGenders } = upload;

      const targetGenders = temp
        .filter(type => type[0] === uploadType)
        .map(type => type[1])[0];
      const resGroups = findTarget(data, 'group').map(({ name }) => name);

      uploadGenders.forEach((gender) => {
        targetGenders[gender].forEach(({ group }) => {
          if (!resGroups.includes(group)) {
            newGroupList
            .filter(({ name }) => name === gender)[0]
            .uploadList
            .add(group);
          };
        });
      });
    });

    let newGroups = ['group', []];
    newGroupList.forEach((gender) => {
      const { _id, uploadList } = gender;
      
      if (uploadList.size !== 0) {
        [...uploadList].forEach(group => newGroups[1].push({
          genderId: _id,
          name: group
        }));
      };
    });
    if (newGroups[1].length !== 0) await postDocuments(newGroups);

    // gender, group update complete, Get updatedData
    await getCollections();

    // 여기부터
    const memberCollections = findTarget(data, 'member');
    const newMemberList = temp.filter(e => e[0] === 'member')[0][1];
    console.log(memberCollections);
    console.log(newMemberList);
  }

  return (
    <>
      {/* <button onClick={getCollections}>다시 불러오기</button> */}
      <Upload
        onChange={handleFileInput}
        onClick={handleUploadImages}
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
