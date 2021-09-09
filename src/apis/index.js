import axios from 'axios';
import AWS from 'aws-sdk';

import {
  CANNOT_USE_THIS,
  GENDER_BOY as BOY,
  GENDER_GIRL as GIRL,
  GENDER_MIXED as MIXED,
  NEW,
  UPLOADTYPE_MEMBER as MEMBER,
  UPLOADTYPE_ERR as ERR,
  ERRTYPE_LABELING as LABELING,
  ACCESS_ID,
  ACCESS_KEY,
  REGION,
  BUCKET_NAME,
  API_URL,
} from '../Dictionary';

// 라벨링에 관련된 기본적인 규칙들
const rules = {
  uploadTypes: {
    member: 5,
    group: 4,
  },
  genders: [BOY, GIRL, MIXED]
};

// index.js/editImage
// file 은 File 형태의 이미지, collections 는 Get 요청으로 받아온 db collections 이다
// newName 은 handleEditFileName 에서 파일명 편집 시에만 지정되어 들어온다.
const editImage = (file, collections, newName) => {
	// 파일명은 항상 toLowerCase() 를 거친다.
	[file.editableName, file.extension] = newName || file.name.split(".");
  file.src = file.src || URL.createObjectURL(file);
  file.editableName = file.editableName.toLowerCase();
  file.isEditable = false;
  [file.uploadType, file.gender, file.group, file.member, file.index] = file.editableName.split("_");

  const { uploadTypes, genders } = rules;
  const { uploadType, gender, group, member } = file;

	// 우선 최소한의 규칙인 업로드 타입과 성별을 체크한다.
  const isCorrectUploadType = uploadTypes.hasOwnProperty(uploadType);
  const isCorrectGender = genders.includes(gender);

	// 둘 다 제대로 라벨링 했을 경우 ?
	//   isNewGender 가 true 라면 ? 이후의 모든 isNew 들 또한 true 로 간주
	//   : isNewGroup 및 isNewMember 확인을 위한 genderId 검색 후 isNewGroup 확인, true 라면 ? isNewMember 도 true 로 간주
	//     isNewGroup 확인을 위한 groupId 검색. uploadType 이 Member 면 ? isNewMember 확인. : member 관련 속성 삭제.
	// : isNew 속성들은 불필요해지므로 삭제한다.
  if (isCorrectUploadType && isCorrectGender) {
    const  { gender: genderCollection, group: groupCollection, member: memberCollection } = collections;

    const isNewGender = !genderCollection.some(({ name }) => name === gender);
    const genderId = isNewGender ? undefined : genderCollection[genderCollection.findIndex(({ name }) => name === gender)]._id;
    const isNewGroup = isNewGender || !groupCollection.some(({ name, genderId: existedGenderId }) => name === group && existedGenderId === genderId);
    const groupId = isNewGroup ? undefined :
      groupCollection[groupCollection.findIndex(({ name, genderId: existedGenderId }) => (
        name === group &&
        existedGenderId === genderId
      ))]._id;
    
    if (uploadType === MEMBER) {
      const isNewMember = isNewGroup || !memberCollection.some(({ name, genderId: existedGenderId, groupId: existedGroupId }) => (
        name === member &&
        existedGenderId === genderId &&
        existedGroupId === groupId
      ));

      file.isNewMember = isNewMember;
    } else {
			file.index = member;
      delete file.isNewMember;
      delete file.member;
		};

    file.isNewGender = isNewGender;
    file.isNewGroup = isNewGroup;
  } else {
    delete file.isNewGender;
    delete file.isNewGroup;
    delete file.isNewMember;
  };

  file.isCorrectUploadType = isCorrectUploadType;
  file.isCorrectGender = isCorrectGender;

  return file;
};

// index.js/insertImage
const insertImage = (images, image) => {
  const { uploadType, gender, isCorrectUploadType, isCorrectGender, isNewGender, isNewGroup, isNewMember } = image;
  const { uploadTypes, genders } = rules;

  const validName = image.editableName.split("_");

	// 업로드 타입이 정확 && 속성을 구분 짓는 "_" 의 갯수가 일치 && 공백이 들어가있지 않음
  const isCorrectLabeling = isCorrectUploadType &&
    uploadTypes[uploadType] === validName.length &&
    uploadTypes[uploadType] === validName.filter(Boolean).length;

	// 대분류 = 모든 라벨링 규칙을 지켜졌고, 성별도 정확하다면 ? 업로드 타입이 그대로 : err
	// 중분류 = 라벨링이 지켜졌다면 ? 성별이 정확하다면 ? 성별, 그룹, 멤버가 하나라도 새로우면 new : 성별(boy || girl || mixed)
	//   : 라벨링은 맞지만, 성별이 맞지 않으므로 err.업로드 타입(member || group)
	// : 라벨링이 틀렸으니 err.labeling
  const largeCategory = isCorrectGender && isCorrectLabeling ? uploadType : ERR;
  const mediumCategory = isCorrectLabeling ?
    isCorrectGender ?
      isNewGender || isNewGroup || isNewMember ? NEW : gender
      : uploadType
    : LABELING;

	// handleEditFileName 에서 해당 파일이 images state 의 어디에 위치하는지 빠르게 파악하기 위한 속성 추가
  image.categorized = {
    largeCategory,
    mediumCategory,
  };

	// 대분류가 err 라면 ? 에러 메시지 및 지켜야 할 규칙이 포함되어 있는 err 속성 추가 : err 속성 삭제
  if (largeCategory === ERR) {
    image.err = {
      errMsg: mediumCategory === LABELING ? `규칙에 어긋난 라벨링입니다. 수정해주세요.` : `gender 라벨링이 잘못되었습니다. 수정해주세요.`,
      rules: {
        uploadTypeRule: `uploadType은 반드시 ${Object.keys(uploadTypes)} 중 하나여야 합니다.`,
        genderRules: `gender은 반드시 ${genders} 중 하나여야 합니다.`,
        labelingRules: `파일명에 공백이 들어가면 안됩니다.${Object.entries(uploadTypes).map(([key, value]) => `\nuploadType ${key}의 "_" 개수는 반드시 ${value - 1}개이여야 합니다`)}`,
      },
    };
  } else { delete image.err; };

  const targetArr = images[largeCategory][mediumCategory];
  const compareBy = 'editableName';

	// targetIndex = targetArr(images[largeCategory][mediumCategory]) 에서 오름차순 정렬을 했을때의 올바른 위치
	// targetIndex <= -1 ? targetArr 가 [] 이거나 맨 마지막일 경우 이므로 마지막 위치에 삽입
	// : targetArr 의 targetIndex 에 끼워 넣음
	const targetIndex = targetArr.findIndex((e) => e[compareBy] >= image[compareBy]);
  targetIndex <= -1 ? targetArr[targetArr.length] = image : targetArr.splice(targetIndex, 0, image);
};

// index.js/resData
// reqType 은 요청 종류에 따라 get, post 등이 string 으로 들어온다.
// url 은 API_URL 의 뒤에 들어올 url 이다.
// body 는 요청 시 같이 보낼 데이터이다.
const resData = async (reqType, url, body) => {
  const res = await axios[reqType](`${API_URL}/${url}`, body);
  return res.data;
};

// index.js/isUnusableName
// name 은 toLowerCase() 를 거친 파일명만 들어온다.
// images state 에 이미 업로드 된 파일들의 파일명은 toLowerCase() 를 거치기 때문에 name 과 비교 가능하다.
// CANNOT_USE_THIS 는 Dictionary.js 에 등록되어 있는 사용 불가한 특수기호 목록이다.
const isUnusableName = (name, images) => (
  CANNOT_USE_THIS.some(c => name.includes(c)) ||
  Object.values(images).some(c => Object.values(c).some(imageList => imageList.some(image => image.editableName === name)))
);

// index.js/uploadToS3
// Body 는 업로드 할 File 형태의 데이터 이다.
// Key 는 업로드 할 파일의 경로 및 이름이다.
// 예) images/test.jpg -> images 폴더에 test.jpg 라는 이름으로 파일 업로드
// ContentType 은 업로드 할 파일의 타입이다. file.type 을 그대로 사용한다.
// 아무것도 지정하지 않은 상태에서 올리면 Application/octet-stream 로 지정되어 파일이 올라가게 된다.
const uploadToS3 = (Body, Key, ContentType) => {
	// 발급 받은 accesKeyId, secretAccessKey, region 로 s3 인스턴스 생성.
  const s3 = new AWS.S3({
    accessKeyId: ACCESS_ID,
    secretAccessKey: ACCESS_KEY,
    region: REGION,
  });

	// ACL 은 권한이다. public-read 로 설정해놓으면
	// 버킷에 권한이 없고 수정할 수 없는 권한이 없는 일반 사용자들도 해당하는 파일을 확인할 수 있다.
	// 업로드를 원하는 Bucket 에 업로드를 하고, 실행 결과를 로그로 남긴다.
  s3.putObject({
    Bucket: BUCKET_NAME,
    Body,
    Key,
    ContentType,
    ACL: "public-read",
  }, (err, data) => {
    if (!err) {
      console.log(
        `AWS S3 Upload File Done!\ndata : \n\t${data}`
      );
    } else { console.log(err); };
  });
};

export {
  editImage,
  insertImage,
  resData,
  isUnusableName,
  uploadToS3
};