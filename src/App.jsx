import React, { memo, useState } from 'react';
import _ from 'lodash';

import Upload from './components/Upload';
import ImageList from './components/ImageList';
import useAsync from './apis/useAsync';
import { rules, createImageByFile, insertImage, findCollection, hasDoc, getDocId } from './apis/index';
import axios from 'axios';

const App = () => {

  // useAsync = Custom Hook
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
  const [getCollectionsState, getCollections] = useAsync('Get', 'collections');
  let { data: collections } = getCollectionsState;
  // eslint-disable-next-line
  const [postDocumentsState, postDocuments] = useAsync('Post', 'documents', true);
  // const [postImagesState, postImages] = useAsync('Post', 'images', true);

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

  // const getCol = async (url) => {
  //   const res = await axios.get(url);
  //   console.log('get');
  //   return res.data;
  // };
  // const postDoc = async (url, body) => {
  //   const res = await axios.post(url, body);
  //   console.log('post');
  //   return res.data;
  // };

  const handleUploadImages = async () => {
    const temp = _.cloneDeep(images);
    const { err: uploadErr, member: uploadMember, group: uploadGroup } = temp;

    const postAndUpdate = async (upload, update) => {
      await postDocuments(upload);
      await getCollections();
  
      return findCollection(collections, update);
    };

    // Error

    const hasError = Object.values(uploadErr).reduce((acc, curr) => (acc + curr.length), 0) !== 0;
    if (hasError) { console.log('Error Exist'); return; };

    // gender

    let genderCollection = findCollection(collections, 'gender');
    if (genderCollection.length !== 3) {
      let newGenders = ["gender", []];

      const { men: memberMen, women: memberWomen , mixed: memberMixed } = uploadMember;
      const { men: groupMen, women: groupWomen, mixed: groupMixed } = uploadGroup;

      if ((memberMen.length + groupMen.length) !== 0 && !hasDoc(genderCollection, ['men'])) newGenders[1].push({ name: 'men' });
      if ((memberWomen.length + groupWomen.length) !== 0 && !hasDoc(genderCollection, ['women'])) newGenders[1].push({ name: 'women' });
      if ((memberMixed.length + groupMixed.length) !== 0 && !hasDoc(genderCollection, ['mixed'])) newGenders[1].push({ name: 'mixed' });

      if (newGenders[1].length !== 0) genderCollection = await postAndUpdate(newGenders, 'gender');
    };

    // group

    const menId = getDocId(genderCollection, ['men']);
    const womenId = getDocId(genderCollection, ['women']);
    const mixedId = getDocId(genderCollection, ['mixed']);
    
    let groupCollection = findCollection(collections, 'group');

    let menGroupSet = new Set([]);
    let womenGroupSet = new Set([]);
    let mixedGroupSet = new Set([]);

    const gatherGroups = (upload) => {
      Object.entries(upload).forEach(([key, value]) => {
        if (value.length !== 0) {
          value.forEach((file) => {
            const group = file.group;

            switch (key) {
              case 'men' : menGroupSet.add(group); break;
              case 'women' : womenGroupSet.add(group); break;
              default : mixedGroupSet.add(group);
            };
          });
        };
      });
    };
    gatherGroups(uploadMember);
    gatherGroups(uploadGroup);

    if ((menGroupSet.size + womenGroupSet.size + mixedGroupSet.size) !== 0) {
      let newGroups = ["group", []];

      const collectGroups = (targetGroupSet, genderId) => {
        if (targetGroupSet.size !== 0) {
          [...targetGroupSet].forEach((group) => {
            if (!hasDoc(groupCollection, [group, genderId])) {
              newGroups[1].push({
                genderId,
                name: group,
              });
            };
          });
        };
      };
      collectGroups(menGroupSet, menId);
      collectGroups(womenGroupSet, womenId);
      collectGroups(mixedGroupSet, mixedId);

      if (newGroups[1].length !== 0) groupCollection = await postAndUpdate(newGroups, 'group');
    };

    // member

    let memberCollection = findCollection(collections, 'member');

    let menGroupIds = {};
    let womenGroupIds = {};
    let mixedGroupIds = {};

    const collectGenderAndGroupIds = (targetGroupSet, targetGroupIds, genderId) => {
      [...targetGroupSet].forEach((group) => {
        const groupId = getDocId(groupCollection, [group, genderId]);

        targetGroupIds[group] = {
          genderId,
          groupId,
        };
      });
    };
    collectGenderAndGroupIds(menGroupSet, menGroupIds, menId);
    collectGenderAndGroupIds(womenGroupSet, womenGroupIds, womenId);
    collectGenderAndGroupIds(mixedGroupSet, mixedGroupIds, mixedId);

    const isUploadMember = Object.values(uploadMember).reduce((acc, curr) => (acc + curr.length), 0) !== 0;
    if (isUploadMember) {
      let newMembers = ["member", []];

      Object.entries(uploadMember).forEach(([key, value]) => {
        const collectMembers = (groupIds) => {
          let tempIds = {...groupIds};
          Object.values(tempIds).forEach((group) => group.newMemberSet = new Set([]));

          value.forEach((file) => {
            const { group, member } = file;
            const { genderId, groupId } = tempIds[group];

            if (!hasDoc(memberCollection, [member, genderId, groupId])) {
              tempIds[group].newMemberSet.add(member);
            };
          });

          Object.values(tempIds).forEach((group) => {
            const { newMemberSet, ...ids  } = group;

            if (newMemberSet.size !== 0) {
              [...newMemberSet].forEach((newMember) => {
                newMembers[1].push({ ...ids, name: newMember });
              });
            };
          });
        };

        switch (key) {
          case 'men' : collectMembers(menGroupIds); break;
          case 'women' : collectMembers(womenGroupIds); break;
          default : collectMembers(mixedGroupIds);
        };
      });

      if (newMembers[1].length !== 0) memberCollection = await postAndUpdate(newMembers, 'member');
    }

    // memberImage
    // AWS S3에 이미지 업로드 후 URL 회수

    const uploadTest = true;
    if (uploadTest) {
      let newMemberImages = ['memberImage', []];

      Object.entries(uploadMember).forEach(([key, value]) => {
        const collectImages = (groupIds) => {
          value.forEach((file) => {
            const { group, member, fileName: name } = file;
            const { genderId, groupId } = groupIds[group];
  
            const memberId = getDocId(memberCollection, [member, genderId, groupId]);

            newMemberImages[1].push({
              memberId,
              imageUrl: `${name}/${file.extension}`,
              name,
            });
          });
        };

        switch (key) {
          case 'men' : collectImages(menGroupIds); break;
          case 'women' : collectImages(womenGroupIds); break;
          default: collectImages(mixedGroupIds);
        };
      });

      let memberImageCollection = await postAndUpdate(newMemberImages, 'memberImage');
      // const newMemberImageRates = newMemberImages[1].map((image) => {
      //   const { name, memberId, imageUrl } = image;

      //   const memberImageId = getDocId(memberImageCollection, [name, memberId, imageUrl]);

      //   return {
      //     memberImageId,
      //     first: 0,
      //     entry: 0,
      //     win: 0,
      //     lose: 0,
      //   };
      // });

    };
  };

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
