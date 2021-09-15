import React, { memo, useState } from 'react';
import uuid from 'react-uuid';
import _ from 'lodash';

import ImageList from 'components/ImageList';
import {
  editImage,
  categorizeImage,
  insertImage,
  isUnusableName
} from 'utils/index';
import {
  customAsync,
  uploadToS3
} from 'apis/index';
import {
  CANNOT_USE_THIS,
  REGION,
  BUCKET_NAME,
  REQUESTTYPE_GET as GET,
  REQUESTTYPE_POST as POST,
  REQUESTTARGET_COLLECTIONS as COLLECTIONS,
  REQUESTTARGET_DOCUMENTS as DOCUMENTS,
  NEW,
  COMPAREBY,
  COLLECTION_ALL as ALL,
  COLLECTION_GENDER as GENDER,
  COLLECTION_GROUP as GROUP,
  COLLECTION_GROUPIMAGE as GROUPIMAGE,
  COLLECTION_GROUPIMAGERATE as GROUPIMAGERATE,
  COLLECTION_MEMBER as MEMBER,
  COLLECTION_MEMBERIMAGE as MEMBERIMAGE,
  COLLECTION_MEMBERIMAGERATE as MEMBERIMAGERATE
} from 'Dictionary';

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

  // !initialCollection ? 아직 Get 요청을 보내지 않았으므로, 최초 임시 업로드 버튼만 활성화(최초 임시 업로드 시 Get 요청)
	// : 업로드를 위한 조작 화면
  const [initialCollection, setInitialCollection] = useState();
	
  // isUploadEnd ? 조작 불가능하도록 아무것도 렌더링하지 않음 : 업로드를 위한 조작 화면
  const [isUploadEnd, setIsUploadEnd] = useState(false);

  const getCollections = customAsync(GET, `${COLLECTIONS}`);
  const postDocuments = customAsync(POST, `${DOCUMENTS}`);
  
	// App.jsx/handleUpdateImages
  const handleUpdateImages = async (e) => {
    try {
      // !initialCollection ? 아직 Get 요청 한 적 없으니 요청 후 setInitialCollection : 그대로 사용
      let data = initialCollection;
      if (!data) {
        const response = await getCollections(ALL);
        data = response.data;
        setInitialCollection(data);
      };
      console.log(data);
  
      let files = [...e.target.files];
      let temp = {...images};
  
      // !needToInsertImage ?
      // files forEach 루프 도중, 다른 불필요한 작업을 중단. 임시 업로드 요청 거부
      // : files forEach 정상 순회 및 setImages
      // wrongImages 에는 업로드한 파일들 중, 사용 불가능한 파일명들이 추가된다.
      let needToInsertImage = true;
      let wrongImages = new Set();
  
      files.forEach((file) => {
        // 사용자가 임시 업로드 한 직후의 파일이라 파일명만 따로 따올 수 없음.
        // validName 으로 파일명만 slice 한 후, toLowerCase 로 비교 가능하게 만듬.
        const name = file.name;
        const validName = name.slice(0, name.lastIndexOf(".")).toLowerCase();
  
        // 사용 불가능한 파일명이거나, 같이 업로드한 파일 중 겹치는 파일명이 있다면 ?
        // wrongImages 에 name 추가, needToInsertImage 를 false 로 한다.
        // : needToInsertImage ? editAndInsertImage : do Nothing
        if (isUnusableName(validName, images) || files.filter(({ name: tempName }) => tempName.slice(0, tempName.lastIndexOf(".")).toLowerCase() === validName ).length > 1) {
          wrongImages.add(name);
          needToInsertImage = false;
        } else if (needToInsertImage) {
          const categorizedImage = categorizeImage(editImage(file, data));
          const { largeCategory, mediumCategory } = categorizedImage.categorized;

          temp[largeCategory][mediumCategory] = insertImage(temp[largeCategory][mediumCategory], categorizedImage, COMPAREBY);
        };
      });
  
      // 임시 업로드 거부 및 throw new Error
      if (!needToInsertImage) {
        throw new Error(
          `아래 중 하나 이상의 이유로 업로드 요청이 거부됩니다.\n
          파일명을 수정하여 다시 업로드해주세요.\n
          \n
          1. 파일명에 사용할 수 없는 특수기호나 여백(space)이 포함되어 있습니다.\n
          \t1-1. 파일명에 사용 가능한 특수기호 : "_" (파일의 속성을 구분할때만 사용가능. 그 이외에는 사용 시 오류. 예) uploadType_gender_group_member_index)\n
          \t1-2. 파일명에 사용할 수 없는 특수기호 목록 :
          ${CANNOT_USE_THIS.map((c, i) => `\n\t\t1-2-${i + 1} : ${c}`)}\n
          2. "."의 개수가 파일명과 확장자명 구분을 위한 1개 보다 더 많습니다.\n
          3. 파일명은 공백이 될 수 없습니다.
          4. 기존에 임시 업로드한 파일이나 동시에 업로드한 파일들 중 파일명이 중복된 파일이 존재합니다. 파일명 중복검사는 대소문자를 구분하지 않으니 유의해주십시오.\n
          \n
          해당하는 파일명 목록 : ${[...wrongImages].map((fileName, i) => `\n\t${i + 1}. ${fileName}`)}`
        );
      };
  
      console.log(temp);
      setImages(temp);
    } catch (error) { console.error(error); };
  };

  // 임시로 간단히 구현한 것뿐이라 여러 예외처리는 아직 안 되어 있음. 여러 상황에 따른 구현이 추가적으로 필요
	const handleChange = (e) => { setInput(e.target.value); };

	// App.jsx/handleEditFileName
	const handleEditFileName = (e) => {
    console.log(input);
    console.log(images);
    try {
      // !e.isEdit ? 수정 가능하게 한 뒤, input 기본 값은 해당 파일의 파일명
      // : 입력한 파일명이 사용 불가능한 파일명이라면 ? 수정 거부 및 throw new Error, handleEditFileName End
      // : images 에서 해당 파일을 지운 뒤, editAndInsert 로 올바른 위치에 재분류 후 setImages
      if (!e.isEdit) {
        e.isEdit = !e.isEdit;
        setInput(e[COMPAREBY]);
      } else if (isUnusableName(input.toLowerCase(), images)) {
        e.isEdit = !e.isEdit;
        setInput();
        throw new Error(
          `아래 중 하나 이상의 이유로 파일명 수정 요청이 거부됩니다.\n
          다른 파일명을 입력해주세요.\n
          \n
          1. 파일명에 사용할 수 없는 특수기호나 여백(space)이 포함되어 있습니다.\n
          \t1-1. 파일명에 사용 가능한 특수기호 : "_" (파일의 속성을 구분할때만 사용가능. 그 이외에는 사용 시 오류. 예) uploadType_gender_group_member_index)\n
          \t1-2. 파일명에 사용할 수 없는 특수 기호 목록 :
          ${CANNOT_USE_THIS.map((c, i) => `\n\t\t1-2-${i + 1} : ${c}`)}\n
          2. 파일명 편집 시에는 확장자명은 편집 할 수 없고, 파일명만 편집 가능하므로 확장자명을 제외한 파일명만 입력 가능합니다. ("." 사용 불가)\n
          3. 파일명은 공백이 될 수 없습니다.
          4. 기존에 임시 업로드한 파일 중 파일명이 중복된 파일이 존재합니다. 파일명 중복검사는 대소문자를 구분하지 않으니 유의해주십시오.`
        );
      } else {
        const { largeCategory, mediumCategory } = e.categorized;
  
        let temp = _.cloneDeep(images);
        temp[largeCategory][mediumCategory] = images[largeCategory][mediumCategory].filter(image => image !== e);
        
        const categorizedImage = categorizeImage(editImage(e, initialCollection, [input, e.extension]));
        const { largeCategory: newLargeCategory, mediumCategory: newMediumCategory } = categorizedImage.categorized;

        temp[newLargeCategory][newMediumCategory] = insertImage(temp[newLargeCategory][newMediumCategory], categorizedImage, COMPAREBY);
  
        setInput();
        setImages(temp);
      };
    } catch (error) { console.error(error); };
  };

	// App.jsx/handleUploadFiles
	const handleUploadFiles = async () => {
    try {
      let temp = {...images};
      const { err: uploadErr, member: uploadMember, group: uploadGroup } = temp;

      // Error

      // images[err] 에 파일이 하나라도 있으면 throw new Error, handleUploadFiles End
      if ((Object.values(uploadErr).reduce((acc, curr) => (acc + curr.length), 0) !== 0)) { throw new Error(('아직 수정하지 않은 ERROR 파일이 존재합니다.')) };

      // REQUEST Start!
      
      let collections = {...initialCollection};
      let { gender: genderCollection, group: groupCollection, groupImage: groupImageCollection, member: memberCollection, memberImage: memberImageCollection } = collections;

      // uploadData 는 Post 요청 시 같이 보낼 body, update 는 collection 의 이름
      // Post 요청 이후, Post 요청이 적용된 db 를 다시 불러와 collections 를 업데이트,
      // Post 요청으로 업데이트된 collection 을 반환한다.
      const postAndUpdate = async (targetCollection, body) => {
        await postDocuments(targetCollection, body);
        const response = await getCollections(targetCollection);

        return response.data[targetCollection];
      };

      // 임시 업로드한 모든 성별, 그룹, 멤버 목록
      let genders = new Set();
      let groups = new Set();
      let members = new Set();

      // 임시 업로드한 파일들 중 db 에 없는 새로운 성별, 그룹, 멤버 목록
      let newGenders = new Set();
      let newGroups = Object.entries(uploadGroup).reduce((acc, [key, value]) => {
        value.forEach(({ gender, group, isNewGender, isNewGroup }) => {
          genders.add(gender);
          groups.add(`${gender}/${group}`);

          if (key === NEW) {
            if (isNewGender) { newGenders.add(gender); };
            if (isNewGroup) { acc.add(`${gender}/${group}`); };
          };
        });

        return acc;
      }, new Set());
      let newMembers = Object.entries(uploadMember).reduce((acc, [key, value]) => {
        value.forEach(({ gender, group, member, isNewGender, isNewGroup, isNewMember }) => {
          genders.add(gender);
          groups.add(`${gender}/${group}`);
          members.add(`${gender}/${group}/${member}`);

          if (key === NEW) {
            if (isNewGender) { newGenders.add(gender); };
            if (isNewGroup) { newGroups.add(`${gender}/${group}`); };
            if (isNewMember) { acc.add(`${gender}/${group}/${member}`); };
          };
        });

        return acc;
      }, new Set());

		  // 이후 반복문을 사용할 수 있게 Set 형태의 목록을 Array 형태로 변환
      [genders, groups, members, newGenders, newGroups, newMembers] = [genders, groups, members, newGenders, newGroups, newMembers].map((set = []) => [...set].map(e => e.split('/')));

      // gender

		  // 새로운 성별이 있을때만 postAndUpdate
      if (newGenders.length !== 0) {
        console.log("gender upload start");
        let targetGenders = [];
        newGenders.forEach(([name]) => targetGenders.push({ name }));

        genderCollection = await postAndUpdate(GENDER, targetGenders);
        console.log("gender upload done");
      };

		  // 업데이트된 genderCollection 중 임시 업로드 한 성별에 한해 id 들을 모아둔다.
      // genderIds[성별] = 해당 성별의 id
      const genderIds = genders.reduce((acc, [gender]) => {
        acc[gender] = genderCollection[genderCollection.findIndex(({ name }) => name === gender)]._id;
        
        return acc;
      }, {});

      // group

      // 새로운 그룹이 있을때만 postAndUpdate
      if (newGroups.length !== 0) {
        console.log("group upload start");
        let targetGroups = [];
        newGroups.forEach(([gender, name]) => targetGroups.push({ genderId: genderIds[gender], name }));

        groupCollection = await postAndUpdate(GROUP, targetGroups);
        console.log("group upload done");
      };

      // 업데이트된 groupCollection 중 임시 업로드 한 그룹에 한해 id 들을 모아둔다.
		  // groupIds[그룹이름][성별id] = 해당 그룹의 id / 같은 이름의 그룹, 다른 성별 가능성
      const groupIds = groups.reduce((acc, [gender, group]) => {
        const genderId = genderIds[gender];
        const groupId = groupCollection[groupCollection.findIndex(({ name, genderId: existedGenderId }) => name === group && existedGenderId === genderId)]._id;

        acc[group] = acc[group] || {};
        acc[group][genderId] = groupId;

        return acc;
      }, {});

      // groupImage

      // 임시 업로드한 이미지들 중 업로드 타입이 group 인 이미지가 하나라도 있으면 이미지를 AWS S3 업로드 및 postAndUpdate
      if (Object.values(uploadGroup).some(e => e.length > 0)) {
        console.log("groupImage upload start");
        let targetGroupImages = [];
        Object.values(uploadGroup).forEach(c => c.forEach((file) => {
          const { gender, group, file: originalFile } = file;
          const type = originalFile.type;

          const nameId = uuid().replaceAll("-", "");
          const name = `images/groupImages/${gender}/${group}/${nameId}.${type.split("/")[1]}`;
          const imageUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${name}`;

          console.log(`Start Upload GroupImage To AWS S3!`);
          uploadToS3(originalFile, name, type);
          console.log(`Done Upload GroupImage To AWS S3!`);

          const genderId = genderIds[gender];
          const groupId = groupIds[group][genderId];

          targetGroupImages.push({ groupId, imageUrl, name });
        }));

        groupImageCollection = await postAndUpdate(GROUPIMAGE, targetGroupImages);
        console.log("groupImage upload done");

        // groupImageRate

        // 임시 업로드한 이미지들 중 업로드 타입이 group 인 이미지들에 한해
        // 업데이트된 groupCollection 중 groupImageId 를 찾아 post
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

		  // 새로운 멤버가 있다면 postAndUpdate
      if (newMembers.length !== 0) {
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

      // 업데이트된 memberCollection 중 임시 업로드 한 그룹에 한해 id 들을 모아둔다.
		  // memberIds[멤버이름][그룹id][성별id] = 해당 멤버의 id / 동명이인의 가능성
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

      // 임시 업로드한 이미지들 중 업로드 타입이 member 인 이미지가 하나라도 있으면 이미지를 AWS S3 업로드 및 postAndUpdate
      if (Object.values(uploadMember).some(e => e.length > 0)) {
        console.log("memberImage upload start");
        let targetMemberImages = [];
        Object.values(uploadMember).forEach(c => c.forEach((file) => {
          const { gender, group, member, file: originalFile } = file;
          const type = originalFile.type;

          const nameId = uuid().replaceAll("-", "");
          const name = `images/memberImages/${gender}/${group}/${member}/${nameId}.${type.split("/")[1]}`;
          const imageUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${name}`;

          console.log(`Start Upload MemberImage To AWS S3!`);
          uploadToS3(originalFile, name, type);
          console.log(`Done Upload MemberImage To AWS S3!`);

          const genderId = genderIds[gender];
          const groupId = groupIds[group][genderId];
          const memberId = memberIds[member][groupId][genderId];

          targetMemberImages.push({ memberId, imageUrl, name });
        }));

        memberImageCollection = await postAndUpdate(MEMBERIMAGE, targetMemberImages);
        console.log("memberImage upload done");

        // memberImageRate

        // 임시 업로드한 이미지들 중 업로드 타입이 member 인 이미지들에 한해 업데이트된 memberCollection 중 memberImageId 를 찾아 post
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

        // 마지막은 Post만
        await postDocuments(MEMBERIMAGERATE, targetMemberImageRates);
        console.log("memberImageRate upload done");
      };

      // 무사히 업로드를 끝마쳤다면 setIsUploadEnd 로 조작 불가능한 화면 렌더링
      console.log('done!');
      setIsUploadEnd(true);
    } catch (error) { console.error(error); };
  };

	return (!initialCollection ?
    <>
      <input
        type="file"
        onChange={handleUpdateImages}
        multiple
      />
    </>
    : isUploadEnd ? <h1>UPLOAD FINISH!!!</h1> :
    <>
      <input
        type="file"
        onChange={handleUpdateImages}
        multiple
      />
      <button onClick={handleUploadFiles}>SEND</button>
      <br></br>
      <br></br>
      <ImageList
        images={images}
        input={input}
        onChange={handleChange}
        onClick={handleEditFileName}
      />
    </>
  );
};

export default memo(App);