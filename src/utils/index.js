import {
  CANNOT_USE_THIS,
  GENDER_BOY as BOY,
  GENDER_GIRL as GIRL,
  GENDER_MIXED as MIXED,
  NEW,
  UPLOADTYPE_MEMBER as MEMBER,
  UPLOADTYPE_ERR as ERR,
  ERRTYPE_LABELING as LABELING,
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
	let [fileName, extension] = newName || file.name.split(".");
  const imgUrl = file.imgUrl || URL.createObjectURL(file);
  fileName = fileName.toLowerCase();
  const isEdit = false;
  let [uploadType, gender, group, member, index] = fileName.split("_");

  const { uploadTypes, genders } = rules;

	// 우선 최소한의 규칙인 업로드 타입과 성별을 체크한다.
  const isCorrectUploadType = uploadTypes.hasOwnProperty(uploadType);
  const isCorrectGender = genders.includes(gender);

  let image = {
    fileName,
    extension,
    imgUrl,
    isEdit,
    uploadType,
    gender,
    group,
    member,
    index,
    isCorrectUploadType,
    isCorrectGender,
    file: !newName ? file : file.file,
  };

	// 둘 다 제대로 라벨링 했을 경우 ?
	//   isNewGender 가 true 라면 ? 이후의 모든 isNew 들 또한 true 로 간주
	//   : isNewGroup 및 isNewMember 확인을 위한 genderId 검색 후 isNewGroup 확인, true 라면 ? isNewMember 도 true 로 간주
	//     isNewGroup 확인을 위한 groupId 검색. uploadType 이 Member 면 ? isNewMember 확인. : member 관련 속성 삭제.
	// : isNew 속성들은 불필요해지므로 삭제한다.
  if (isCorrectUploadType && isCorrectGender) {
    const { gender: genderCollection, group: groupCollection, member: memberCollection } = collections;

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

      image.isNewMember = isNewMember;
    } else {
			image.index = member;
      delete image.member;
		};

    image.isNewGender = isNewGender;
    image.isNewGroup = isNewGroup;
  };
  
  return image;
};

// index.js/categorizeImage
const categorizeImage = (image) => {
  let newImage = {...image};

  const { uploadType, gender, isCorrectUploadType, isCorrectGender, isNewGender, isNewGroup, isNewMember } = newImage;
  const { uploadTypes, genders } = rules;

  const validName = newImage.fileName.split("_");

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
  newImage.categorized = {
    largeCategory,
    mediumCategory,
  };

	// 대분류가 err 라면 ? 에러 메시지 및 지켜야 할 규칙이 포함되어 있는 err 속성 추가 : err 속성 삭제
  if (largeCategory === ERR) {
    newImage.err = {
      errMsg: mediumCategory === LABELING ? `규칙에 어긋난 라벨링입니다. 수정해주세요.` : `gender 라벨링이 잘못되었습니다. 수정해주세요.`,
      rules: {
        uploadTypeRule: `uploadType은 반드시 ${Object.keys(uploadTypes)} 중 하나여야 합니다.`,
        genderRules: `gender은 반드시 ${genders} 중 하나여야 합니다.`,
        labelingRules: `파일명에 공백이 들어가면 안됩니다.${Object.entries(uploadTypes).map(([key, value]) => `\nuploadType ${key}의 "_" 개수는 반드시 ${value - 1}개이여야 합니다`)}`,
      },
    };
  } else { delete newImage.err; };

  return newImage;
};

// targetIndex = targetArr(images[largeCategory][mediumCategory]) 에서 오름차순 정렬을 했을때의 올바른 위치
// targetIndex <= -1 ? targetArr 가 [] 이거나 올바른 위치가 맨 마지막일 경우 이므로 마지막 위치에 삽입
// : targetArr 의 targetIndex 에 끼워 넣음
const insertImage = (targetArr, targetImage, compareBy) => {
  const newArr = [...targetArr];

  const targetIndex = newArr.findIndex(e => e[compareBy] >= targetImage[compareBy]);
  targetIndex <= -1 ? newArr[newArr.length] = targetImage : newArr.splice(targetIndex, 0, targetImage);

  return newArr;
};

// index.js/isUnusableName
// name 은 toLowerCase() 를 거친 파일명만 들어온다.
// images state 에 이미 업로드 된 파일들의 파일명은 toLowerCase() 를 거치기 때문에 name 과 비교 가능하다.
// CANNOT_USE_THIS 는 Dictionary.js 에 등록되어 있는 사용 불가한 특수기호 목록이다.
const isUnusableName = (name, images) => (
  !name || CANNOT_USE_THIS.some(c => name.includes(c)) ||
  Object.values(images).some(c => Object.values(c).some(imageList => imageList.filter(image => image.fileName === name).length > 1))
);

export {
  editImage,
  categorizeImage,
  insertImage,
  isUnusableName
};