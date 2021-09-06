import React, { memo, useState } from 'react';
import _ from 'lodash';

import Upload from './components/Upload';
import ImageList from './components/ImageList';
// eslint-disable-next-line
import useAsync from './apis/useAsync';
import {
  editImage,
  insertImage,
  resData
} from './apis/index';
import {
  REQUESTTYPE_GET as GET,
  REQUESTTYPE_POST as POST,
  REQUESTTARGET_COLLECTIONS as COLLECTIONS,
  REQUESTTARGET_DOCUMENTS as DOCUMENTS,
  COLLECTION_GENDER as GENDER,
  COLLECTION_GROUP as GROUP,
  COLLECTION_MEMBER as MEMBER,
  COLLECTION_MEMBERIMAGE as MEMBERIMAGE,
  COLLECTION_MEMBERIMAGERATE as MEMBERIMAGERATE
} from './Dictionary';

const App = () => {
  // const [getCollectionsState, getCollections] = useAsync(GET, COLLECTIONS);
  // let { data: collections } = getCollectionsState;
  // // eslint-disable-next-line
  // const [postDocumentsState, postDocuments] = useAsync(POST, DOCUMENTS, true);

  const getCollections = async () => await resData(GET, COLLECTIONS);
  const postDocuments = async (body) => await resData(POST, DOCUMENTS, body);

  const [images, setImages] = useState({
    err: {
      labeling: [],
      member: [],
      group: [],
    },
    member: {
      new: [],
      men: [],
      women: [],
      mixed: [],
    },
    group: {
      new: [],
      men: [],
      women: [],
      mixed: [],
    },
  });
  const [input, setInput] = useState();
  const [initialCollection, setInitialCollection] = useState();

  const handleFileInput = async (e) => {
    const data = !initialCollection ? await getCollections() : _.cloneDeep(initialCollection);
    if (!initialCollection) { setInitialCollection(data); };

    const files = [...e.target.files];
    const temp = _.cloneDeep(images);

    files.forEach((file) => insertImage(temp, editImage(file, data)));

    setImages(temp);
  }

  const handleChange = (e) => { setInput(e.target.value); }

  const handleEditText = async (e) => {
    // 확장자 제대로 썼는지, . 하나인지 체크
    const data = !initialCollection ? await getCollections() : _.cloneDeep(initialCollection);
    if (!initialCollection) { setInitialCollection(data); };

    if (!e.isEdit) {
      setInput(e.fileName);
      e.isEdit = !e.isEdit;
    } else {
      const { largeCategory, mediumCategory } = e.categorized;

      let temp = {...images};
      temp[largeCategory][mediumCategory] = temp[largeCategory][mediumCategory].filter((image) => image !== e);
      
      insertImage(temp, editImage(e, data, input, true));

      setInput('');
      setImages(temp);
    }
  }

  const handleUploadImages = async () => {
    const temp = _.cloneDeep(images);
    const { err: uploadErr, member: uploadMember, group: uploadGroup } = temp;

    // Error

    const hasError = (Object.values(uploadErr).reduce((acc, curr) => (acc + curr.length), 0) !== 0) || !initialCollection;
    if (hasError) { console.log('Error Exist'); return; };

    // REQUEST Start!

    let collections = _.cloneDeep(initialCollection);
    console.log(collections)
    let { gender: genderCollection, group: groupCollection, member: memberCollection, memberImage: memberImageCollection } = collections;

    const postAndUpdate = async (uploadData, update) => {
      await postDocuments(uploadData);
      collections = await getCollections();

      return collections[update];
    }

    const newGenders = new Set();
    const newGroups = uploadGroup.new.reduce((acc, image) => {
      const { isNewGender, gender, isNewGroup, group } = image;

      if (isNewGender) { newGenders.add(gender); };
      if (isNewGroup) { acc.add(`${gender}/${group}`); };

      return acc;
    }, new Set());
    const newMembers = uploadMember.new.reduce((acc, image) => {
      const { isNewGender, gender, isNewGroup, group, isNewMember, member } = image;

      if (isNewGender) { newGenders.add(gender); };
      if (isNewGroup) { newGroups.add(`${gender}/${group}`); };
      if (isNewMember) { acc.add(`${gender}/${group}/${member}`); };

      return acc;
    }, new Set());

    // gender

    if (genderCollection.legnth !== 3 && newGenders.size !== 0) {
      let targetGenders = [GENDER, []];
      [...newGenders].forEach(name => targetGenders[1].push({ name }));

      genderCollection = await postAndUpdate(targetGenders, GENDER);
    }

    let genderIds = {};
    genderCollection.forEach(({ name, _id }) => genderIds[name] = _id);

    // group

    if (newGroups.size !== 0) {
      let targetGroups = [GROUP, []];
      [...newGroups].forEach((doc) => {
        const [gender, name] = doc.split('/');

        targetGroups[1].push({ genderId: genderIds[gender], name });
      });

      groupCollection = await postAndUpdate(targetGroups, GROUP);
    };

    let groupIds = {};
    groupCollection.forEach(({ name, genderId, _id }) => {
      groupIds[name] = groupIds[name] || {};
      groupIds[name][genderId] = _id;
    });

    // member

    if (newMembers.size !== 0) {
      let targetMembers = [MEMBER, []];
      [...newMembers].forEach((doc) => {
        const [gender, group, name] = doc.split('/');

        const genderId = genderIds[gender];
        const groupId = groupIds[group][genderId];

        targetMembers[1].push({ genderId, groupId, name });
      });

      memberCollection = await postAndUpdate(targetMembers, MEMBER);
    };

    let memberIds = {};
    memberCollection.forEach(({ name, genderId, groupId, _id }) => {
      memberIds[name] = memberIds[name] || {};
      memberIds[name][genderId] = memberIds[name][genderId] || {};
      memberIds[name][genderId][groupId] = _id;
    });

    // memberImage

    if (Object.values(uploadMember).some(e => e.length > 0)) {
      let targetMemberImages = [MEMBERIMAGE, []];
      Object.values(uploadMember).forEach(c => c.forEach(({ member, gender, group, name }) => {
        const genderId = genderIds[gender];
        const groupId = groupIds[group][genderId];
        const memberId = memberIds[member][genderId][groupId];

        const isExist = memberImageCollection.some(image => image.name === name);

        if (!isExist) { targetMemberImages[1].push({ memberId, imageUrl: name, name }); }
      }));

      if (targetMemberImages[1].length > 0) {
        memberImageCollection = await postAndUpdate(targetMemberImages, MEMBERIMAGE);

        // memberImageRate

        let targetMemberImageRates = [MEMBERIMAGERATE, []];
        targetMemberImages[1].forEach(({ memberId, imageUrl, name }) => targetMemberImageRates[1].push({
          memberImageId: memberImageCollection[memberImageCollection.findIndex(doc => doc.name === name && doc.imageUrl === imageUrl && doc.memberId === memberId)]._id,
          first: 0, entry: 0, win: 0, lose: 0
        }));

        await postDocuments(targetMemberImageRates);
      };
    };

    console.log(await getCollections());
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
