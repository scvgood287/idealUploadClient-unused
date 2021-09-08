import React, { memo, useState } from 'react';
import _ from 'lodash';
import uuid from 'react-uuid';

import ImageList from './components/ImageList';
import {
  editImage,
  insertImage,
  resData,
  isUnusableName,
  uploadToS3
} from './apis/index';
import {
  CANNOT_USE_THIS,
  REGION,
  BUCKET_NAME,
  REQUESTTYPE_GET as GET,
  REQUESTTYPE_POST as POST,
  REQUESTTARGET_COLLECTIONS as COLLECTIONS,
  REQUESTTARGET_DOCUMENTS as DOCUMENTS,
  NEW,
  COLLECTION_GENDER as GENDER,
  COLLECTION_GROUP as GROUP,
  COLLECTION_GROUPIMAGE as GROUPIMAGE,
  COLLECTION_GROUPIMAGERATE as GROUPIMAGERATE,
  COLLECTION_MEMBER as MEMBER,
  COLLECTION_MEMBERIMAGE as MEMBERIMAGE,
  COLLECTION_MEMBERIMAGERATE as MEMBERIMAGERATE
} from './Dictionary';

const getCollections = async () => await resData(GET, COLLECTIONS);
const postDocuments = async (body) => await resData(POST, DOCUMENTS, body);

const App = () => {
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
  const [isUploadEnd, setIsUploadEnd] = useState(false);
  
  const handleFileInput = async (e) => {
    try {
      const data = initialCollection || await getCollections();
      if (!initialCollection) { setInitialCollection(data); };
      console.log(data);

      const files = [...e.target.files];
      const temp = _.cloneDeep(images);

      let needToInsertImage = true;
      let wrongImages = new Set();

      files.forEach((file) => {
        const name = file.name;
        const validName = name.slice(0, name.lastIndexOf(".")).toLowerCase();

        if (isUnusableName(validName, images) || files.filter(({ name: tempName }) => tempName.slice(0, tempName.lastIndexOf(".")).toLowerCase() === validName ).length > 1) {
          wrongImages.add(name);
          needToInsertImage = false;
        };

        if (needToInsertImage) { insertImage(temp, editImage(file, data)); };
      });

      if (!needToInsertImage) {
        throw new Error(
          `아래 중 하나 이상의 이유로 업로드가 거부됩니다.\n
          파일명을 수정하여 다시 업로드해주세요.\n
          \n
          1. 사용할 수 없는 특수기호가 포함되어 있습니다.\n
          \t1-1. 사용가능한 특수 기호 목록 :\n
          \t\t1-1-1. "." (최초 임시 업로드 시, 파일명과 확장자명를 구분지을때 단 한 번만 사용 가능, 파일명 편집 시에는 파일명만 편집 가능하므로 "."과 확장자명 생략)\n
          \t\t1-1-2. "_" (파일의 속성을 구분할때 사용. 예) uploadType_gender_group_member_index)\n
          \t1-2. 사용할 수 없는 특수 기호 목록 :
          ${CANNOT_USE_THIS.map((c, i) => `\n\t\t1-2-${i + 1} : ${c}`)}\n
          2. "."의 개수가 파일명과 확장자명 구분을 위한 1개 보다 더 많습니다.\n
          3. 기존에 임시 업로드한 파일이나 동시에 업로드한 파일들 중 파일명이 중복된 파일이 존재합니다. 파일명 중복검사는 대소문자를 구분하지 않으니 유의해주십시오.\n
          \n
          해당하는 파일명 목록 : ${[...wrongImages].map((fileName, i) => `\n\t${i + 1}. ${fileName}`)}`
        );
      };

      setImages(temp);
    } catch (error) { console.error(error); };
  };

  const handleChange = (e) => { setInput(e.target.value); };

  const handleEditText = (e) => {
    try {
      if (!e.isEditable) {
        e.isEditable = !e.isEditable;
        setInput(e.editableName);
      } else if (isUnusableName(input.toLowerCase(), images)) {
        e.isEditable = !e.isEditable;
        setInput('');
        throw new Error(
          `아래 중 하나 이상의 이유로 업로드가 거부됩니다.\n
          다른 파일명을 입력해주세요.\n
          \n
          1. 사용할 수 없는 특수기호가 포함되어 있습니다.\n
          \t1-1. 사용가능한 특수 기호 목록 :\n
          \t\t1-1-1. "." (최초 임시 업로드 시, 파일명과 확장자명를 구분지을때 단 한 번만 사용 가능, 파일명 편집 시에는 파일명만 편집 가능하므로 "."과 확장자명 생략)\n
          \t\t1-1-2. "_" (파일의 속성을 구분할때 사용. 예) uploadType_gender_group_member_index)\n
          \t1-2. 사용할 수 없는 특수 기호 목록 :
          ${CANNOT_USE_THIS.map((c, i) => `\n\t\t1-2-${i + 1} : ${c}`)}\n
          2. 파일명 편집 시에는 확장자명은 편집 할 수 없고, 파일명만 편집 가능하므로 확장자명을 제외한 파일명만 입력 가능합니다.\n
          3. 기존에 임시 업로드한 파일 중 파일명이 중복된 파일이 존재합니다. 파일명 중복검사는 대소문자를 구분하지 않으니 유의해주십시오.`
        );
      } else {
        const { largeCategory, mediumCategory } = e.categorized;
  
        let temp = _.cloneDeep(images);
        temp[largeCategory][mediumCategory] = images[largeCategory][mediumCategory].filter(image => image !== e);
        
        insertImage(temp, editImage(e, initialCollection, [input, e.extension], true));
  
        setInput('');
        setImages(temp);
      };
    } catch (error) { console.error(error); };
  };

  const handleUploadImages = async () => {
    try {
      const temp = _.cloneDeep(images);
      const { err: uploadErr, member: uploadMember, group: uploadGroup } = temp;

      // Error

      if ((Object.values(uploadErr).reduce((acc, curr) => (acc + curr.length), 0) !== 0)) { throw new Error(('아직 수정하지 않은 ERROR 파일이 존재합니다.')) };

      // REQUEST Start!

      let collections = _.cloneDeep(initialCollection);
      let { gender: genderCollection, group: groupCollection, groupImage: groupImageCollection, member: memberCollection, memberImage: memberImageCollection } = collections;

      const postAndUpdate = async (uploadData, update) => {
        await postDocuments(uploadData);
        collections = await getCollections();

        return collections[update];
      }

      let genders = new Set();
      let groups = new Set();
      let members = new Set();

      let newGenders = new Set();
      let newGroups = Object.entries(uploadGroup).forEach(([key, value]) => value.reduce((acc, { gender, group, isNewGender, isNewGroup }) => {
        genders.add(gender);
        groups.add(`${gender}/${group}`);
        
        if (key === NEW) {
          if (isNewGender) { newGenders.add(gender); };
          if (isNewGroup) { acc.add(`${gender}/${group}`); };
        };
        
        return acc;
      }, new Set()));
      let newMembers = Object.entries(uploadMember).forEach(([key, value]) => value.reduce((acc, { gender, group, member, isNewGender, isNewGroup, isNewMember }) => {
        genders.add(gender);
        groups.add(`${gender}/${group}`);
        members.add(`${gender}/${group}/${member}`);
        
        if (key === NEW) {
          if (isNewGender) { newGenders.add(gender); };
          if (isNewGroup) { newGroups.add(`${gender}/${group}`); };
          if (isNewMember) { acc.add(`${gender}/${group}/${member}`); };
        };
        
        return acc;
      }, new Set()));

      [genders, groups, members, newGenders, newGroups, newMembers] = [genders, groups, members, newGenders, newGroups, newMembers].map((set = []) => [...set].map(e => e.split('/')));

      // gender

      if (newGenders.length !== 0) {
        console.log("gender upload start");
        let targetGenders = [GENDER, []];
        newGenders.forEach(name => targetGenders[1].push({ name }));

        genderCollection = await postAndUpdate(targetGenders, GENDER);
        console.log("gender upload done");
      };

      const genderIds = genders.reduce((acc, [gender]) => {
        acc[gender] = genderCollection[genderCollection.findIndex(({ name }) => name === gender)]._id;
        
        return acc;
      }, {});

      // group

      if (newGroups.length !== 0) {
        console.log("group upload start");
        let targetGroups = [GROUP, []];
        newGroups.forEach(([gender, name]) => targetGroups[1].push({ genderId: genderIds[gender], name }));

        groupCollection = await postAndUpdate(targetGroups, GROUP);
        console.log("group upload done");
      };

      const groupIds = groups.reduce((acc, [gender, group]) => {
        const genderId = genderIds[gender];
        const groupId = groupCollection[groupCollection.findIndex(({ name, genderId: existedGenderId }) => name === group && existedGenderId === genderId)]._id;

        acc[group] = acc[group] || {};
        acc[group][genderId] = groupId;

        return acc;
      }, {});

      // groupImage

      if (Object.values(uploadGroup).some(e => e.length > 0)) {
        console.log("groupImage upload start");
        let targetGroupImages = [GROUPIMAGE, []];
        Object.values(uploadGroup).forEach(c => c.forEach((file) => {
          const { gender, group, type } = file;

          const nameId = uuid().replaceAll("-", "");
          const name = `images/groupImages/${gender}/${group}/${nameId}.${type.split("/")[1]}`;
          const imageUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${name}`;

          uploadToS3(file, name, type);

          const genderId = genderIds[gender];
          const groupId = groupIds[group][genderId];

          targetGroupImages[1].push({ groupId, imageUrl, name });
        }));

        groupImageCollection = await postAndUpdate(targetGroupImages, GROUPIMAGE);
        console.log("groupImage upload done");

        // groupImageRate

        console.log("groupImageRate upload start");
        let targetGroupImageRates = [GROUPIMAGERATE, []];
        targetGroupImages[1].forEach(({ groupId, imageUrl, name }) => {
          const groupImageId = groupImageCollection[groupImageCollection.findIndex(({ name: existedName, imageUrl: existedImageUrl, groupId: existedGroupId }) => (
            existedName === name &&
            existedImageUrl === imageUrl &&
            existedGroupId === groupId
          ))]._id;

          targetGroupImageRates[1].push({
            groupImageId,
            first: 0,
            entry: 0,
            win: 0,
            lose: 0,
          });
        });

        await postDocuments(targetGroupImageRates);
        console.log("groupImageRate upload done");
      };

      // member

      if (newMembers.length !== 0) {
        console.log("member upload start");
        let targetMembers = [MEMBER, []];
        newMembers.forEach(([gender, group, name]) => {
          const genderId = genderIds[gender];
          const groupId = groupIds[group][genderId];

          targetMembers[1].push({ genderId, groupId, name });
        });

        memberCollection = await postAndUpdate(targetMembers, MEMBER);
        console.log("member upload done");
      };

      const memberIds = members.reduce((acc, [gender, group, member]) => {
        const genderId = genderIds[gender];
        const groupId = groupIds[group][genderId];
        const memberId = memberCollection[memberCollection.findIndex(({ name, genderId: existedGenderId, groupId: existedGroupId }) => name === member && existedGenderId === genderId && existedGroupId === groupId)]._id;

        acc[member] = acc[member] || {};
        acc[member][groupId] = acc[member][groupId] || {};
        acc[member][groupId][genderId] = memberId;

        return acc;
      }, {});

      // memberImage

      if (Object.values(uploadMember).some(e => e.length > 0)) {
        console.log("memberImage upload start");
        let targetMemberImages = [MEMBERIMAGE, []];
        Object.values(uploadMember).forEach(c => c.forEach((file) => {
          const { gender, group, member, type } = file;

          const nameId = uuid().replaceAll("-", "");
          const name = `images/memberImages/${gender}/${group}/${member}/${nameId}.${type.split("/")[1]}`;
          const imageUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${name}`;

          uploadToS3(file, name, type);

          const genderId = genderIds[gender];
          const groupId = groupIds[group][genderId];
          const memberId = memberIds[member][groupId][genderId];

          targetMemberImages[1].push({ memberId, imageUrl, name });
        }));

        memberImageCollection = await postAndUpdate(targetMemberImages, MEMBERIMAGE);
        console.log("memberImage upload done");

        // memberImageRate

        console.log("memberImageRate upload start");
        let targetMemberImageRates = [MEMBERIMAGERATE, []];
        targetMemberImages[1].forEach(({ memberId, imageUrl, name }) => {
          const memberImageId = memberImageCollection[memberImageCollection.findIndex(({ name: existedName, imageUrl: existedImageUrl, memberId: existedMemberId }) => (
            existedName === name &&
            existedImageUrl === imageUrl &&
            existedMemberId === memberId
          ))]._id;

          targetMemberImageRates[1].push({
            memberImageId,
            first: 0,
            entry: 0,
            win: 0,
            lose: 0,
          });
        });

        await postDocuments(targetMemberImageRates);
        console.log("memberImageRate upload done");
      };

      console.log('done!');
      setIsUploadEnd(true);
    } catch (error) { console.error(error); };
  };

  return !initialCollection ? (
    <>
      <input
        type="file"
        onChange={handleFileInput}
        multiple
      />
    </>
  ) : isUploadEnd ? (<h1>UPLOAD FINISH!!!</h1>) : (
    <>
      <input
        type="file"
        onChange={handleFileInput}
        multiple
      />
      <button onClick={handleUploadImages}>SEND</button>
      <br></br>
      <br></br>
      <ImageList
        images={images}
        onChange={handleChange}
        onClick={handleEditText}
      />
    </>
  );
}

export default memo(App);
