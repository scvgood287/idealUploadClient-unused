import React, { memo } from 'react';
import { useAtom } from 'jotai';
import uuid from 'react-uuid';

import { imagesAtom, initialCollectionsAtom, errorMessageAtom, isDoneAtom } from 'hooks/states';
import { SendImagesStyle } from 'styles';
import { CTAButton } from 'components';
import { customAsync, uploadToS3 } from 'apis';
import {
  UPLOADTYPE_ERROR as ERROR,
  REQUESTTYPE_GET as GET,
  REQUESTTYPE_POST as POST,
  REQUESTTARGET_COLLECTIONS as COLLECTIONS,
  REQUESTTARGET_DOCUMENTS as DOCUMENTS,
  COLLECTION_GENDER as GENDER,
  COLLECTION_GROUP as GROUP,
  COLLECTION_GROUPIMAGE as GROUPIMAGE,
  COLLECTION_GROUPIMAGERATE as GROUPIMAGERATE,
  COLLECTION_MEMBER as MEMBER,
  COLLECTION_MEMBERIMAGE as MEMBERIMAGE,
  COLLECTION_MEMBERIMAGERATE as MEMBERIMAGERATE
} from 'Dictionary';

const getCollection = customAsync(GET, COLLECTIONS);
const postDocuments = customAsync(POST, DOCUMENTS);

const SendImages = () => {
  const [images] = useAtom(imagesAtom);
  const [initialCollections] = useAtom(initialCollectionsAtom);
  const [, setErrorMessage] = useAtom(errorMessageAtom);
  const [, setIsDone] = useAtom(isDoneAtom);

  const handleUploadImages = async () => {
    try {
      if (images.length === 0 || images.some(({ categorized }) => categorized.largeCategory === ERROR)) {
        const temp = '업로드 할 이미지가 없거나, 아직 수정하지 않은 ERROR 파일이 존재합니다.';
        setErrorMessage(temp);
        throw new Error(temp);
      };

      let collections = {...initialCollections};
      let { gender: genderCollection, group: groupCollection, groupImage: groupImageCollection, member: memberCollection, memberImage: memberImageCollection } = collections;

      const postAndUpdate = async (targetCollection, body) => {
        await postDocuments(targetCollection, body);
        const response = await getCollection(targetCollection);

        return response.data[targetCollection];
      };

      let genders = new Set();
      let groups = new Set();
      let members = new Set();

      let newGenders = new Set();
      let newGroups = new Set();
      let newMembers = images.reduce((acc, { gender, group, member, isNewGender, isNewGroup, isNewMember }) => {
        const tempGroup = `${gender}/${group}`
        const tempMember = !member ? false : `${gender}/${group}/${member}`;

        genders.add(gender);
        groups.add(tempGroup);

        if (isNewGender) { newGenders.add(gender); };
        if (isNewGroup) { newGroups.add(tempGroup); };

        if (tempMember) {
          members.add(tempMember);
          if (isNewMember) { acc.add(tempMember); };
        };

        return acc;
      }, new Set());

      [genders, groups, members, newGenders, newGroups, newMembers] = [genders, groups, members, newGenders, newGroups, newMembers].map((set = []) => [...set].map(e => e.split('/')));

      // gender

      if (newGenders.length > 0) {
        console.log("gender upload start");
        let targetGenders = [];
        newGenders.forEach(([name]) => targetGenders.push({ name }));

        genderCollection = await postAndUpdate(GENDER, targetGenders);
        console.log("gender upload done");
      };

      const genderIds = genders.reduce((acc, [gender]) => {
        acc[gender] = genderCollection[genderCollection.findIndex(({ name }) => name === gender)]._id;
        
        return acc;
      }, {});

      // group

      if (newGroups.length > 0) {
        console.log("group upload start");
        let targetGroups = [];
        newGroups.forEach(([gender, name]) => targetGroups.push({ genderId: genderIds[gender], name }));

        groupCollection = await postAndUpdate(GROUP, targetGroups);
        console.log("group upload done");
      };

      const groupIds = groups.reduce((acc, [gender, group]) => {
        const genderId = genderIds[gender];
        const groupId = groupCollection[groupCollection.findIndex(({ name, genderId: existedGenderId }) => name === group && existedGenderId === genderId)]._id;

        acc[group] = acc[group] || {};
        acc[group][genderId] = groupId;

        return acc;
      }, {});

      const uploadGroup = images.filter(({ uploadType }) => uploadType === GROUP);
      const uploadMember = images.filter(({ uploadType }) => uploadType === MEMBER);

      // groupImage

      if (uploadGroup.length > 0) {
        console.log("groupImage upload start");
        let targetGroupImages = [];
        uploadGroup.forEach(file => {
          const { gender, group, file: originalFile } = file;
          const type = originalFile.type;

          const nameId = uuid().replaceAll("-", "");
          const name = `images/groupImages/${gender}/${group}/${nameId}.${type.split("/")[1]}`;
          const imageUrl = `${process.env.REACT_APP_S3_URL}/${name}`;

          console.log(`Start Upload GroupImage To AWS S3!`);
          uploadToS3(originalFile, name, type);
          console.log(`Done Upload GroupImage To AWS S3!`);

          const genderId = genderIds[gender];
          const groupId = groupIds[group][genderId];

          targetGroupImages.push({ groupId, imageUrl, name });
        });

        groupImageCollection = await postAndUpdate(GROUPIMAGE, targetGroupImages);
        console.log("groupImage upload done");

        // groupImageRate

        console.log("groupImageRate upload start");
        let targetGroupImageRates = [];
        targetGroupImages.forEach(({ groupId, imageUrl, name }) => {
          const groupImageId = groupImageCollection[groupImageCollection.findIndex(({ name: existedName, imageUrl: existedImageUrl, groupId: existedGroupId }) => (
            existedName === name &&
            existedImageUrl === imageUrl &&
            existedGroupId === groupId
          ))]._id;

          targetGroupImageRates.push({
            groupImageId,
            first: 0,
            entry: 0,
            win: 0,
            lose: 0,
          });
        });

        await postDocuments(GROUPIMAGERATE, targetGroupImageRates);
        console.log("groupImageRate upload done");
      };

      // member

      if (newMembers.length > 0) {
        console.log("member upload start");
        let targetMembers = [];
        newMembers.forEach(([gender, group, name]) => {
          const genderId = genderIds[gender];
          const groupId = groupIds[group][genderId];

          targetMembers.push({ genderId, groupId, name });
        });

        memberCollection = await postAndUpdate(MEMBER, targetMembers);
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

      if (uploadMember.length > 0) {
        console.log("memberImage upload start");
        let targetMemberImages = [];
        uploadMember.forEach(file => {
          const { gender, group, member, file: originalFile } = file;
          const type = originalFile.type;

          const nameId = uuid().replaceAll("-", "");
          const name = `images/memberImages/${gender}/${group}/${member}/${nameId}.${type.split("/")[1]}`;
          const imageUrl = `${process.env.REACT_APP_S3_URL}/${name}`;

          console.log(`Start Upload MemberImage To AWS S3!`);
          uploadToS3(originalFile, name, type);
          console.log(`Done Upload MemberImage To AWS S3!`);

          const genderId = genderIds[gender];
          const groupId = groupIds[group][genderId];
          const memberId = memberIds[member][groupId][genderId];

          targetMemberImages.push({ memberId, imageUrl, name });
        });

        memberImageCollection = await postAndUpdate(MEMBERIMAGE, targetMemberImages);
        console.log("memberImage upload done");

        // memberImageRate

        console.log("memberImageRate upload start");
        let targetMemberImageRates = [];
        targetMemberImages.forEach(({ memberId, imageUrl, name }) => {
          const memberImageId = memberImageCollection[memberImageCollection.findIndex(({ name: existedName, imageUrl: existedImageUrl, memberId: existedMemberId }) => (
            existedName === name &&
            existedImageUrl === imageUrl &&
            existedMemberId === memberId
          ))]._id;

          targetMemberImageRates.push({
            memberImageId,
            first: 0,
            entry: 0,
            win: 0,
            lose: 0,
          });
        });

        await postDocuments(MEMBERIMAGERATE, targetMemberImageRates);
        console.log("memberImageRate upload done");
      };

      setErrorMessage('Upload Done!');
      setIsDone(true);
    } catch (err) {
      setErrorMessage(err);
      console.error(err);
    };
  };

  return (
    <SendImagesStyle>
      <CTAButton onClick={handleUploadImages}>Send</CTAButton>
    </SendImagesStyle>
  );
};

export default memo(SendImages);