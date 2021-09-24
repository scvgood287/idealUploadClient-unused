import {
  CANNOT_USE_THIS,
  GENDER_BOY as BOY,
  GENDER_GIRL as GIRL,
  GENDER_MIXED as MIXED,
  MEDIUMCATEGORY_NEW as NEW,
  UPLOADTYPE_MEMBER as MEMBER,
  UPLOADTYPE_ERROR as ERROR,
  ERRTYPE_LABELING as LABELING,
  ERRTYPE_GENDER as GENDER,
} from '../Dictionary';

const rules = {
  uploadTypes: {
    member: 5,
    group: 4,
  },
  genders: [BOY, GIRL, MIXED]
};

const editImage = (file, collections, newName) => {
	// 파일명은 항상 toLowerCase() 를 거친다.
	let [fileName, extension] = newName || file.name.split(".");
  const src = file.src || URL.createObjectURL(file);
  fileName = fileName.toLowerCase();
  const splitName = fileName.split("_");
  let [uploadType, gender, group, member, index] = splitName;

  const { uploadTypes, genders } = rules;

	// 우선 최소한의 규칙인 업로드 타입과 성별을 체크한다.
  const isCorrectUploadType = uploadTypes.hasOwnProperty(uploadType);
  const isCorrectGender = genders.includes(gender);

  let image = {
    fileName,
    extension,
    splitName,
    src,
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

const categorizeImage = (image) => {
  let newImage = {...image};

  const { uploadType, gender, splitName, isCorrectUploadType, isCorrectGender, isNewGender, isNewGroup, isNewMember } = newImage;
  const { uploadTypes, genders } = rules;

	// 업로드 타입이 정확 && 속성을 구분 짓는 "_" 의 갯수가 일치 && 공백이 들어가있지 않음
  const isCorrectLabeling = isCorrectUploadType &&
    uploadTypes[uploadType] === splitName.length &&
    uploadTypes[uploadType] === splitName.filter(Boolean).length;

	// 대분류 = 모든 라벨링 규칙을 지켜졌고, 성별도 정확하다면 ? 업로드 타입이 그대로 : err
	// 중분류 = 라벨링이 지켜졌다면 ? 성별이 정확하다면 ? 성별, 그룹, 멤버가 하나라도 새로우면 new : 성별(boy || girl || mixed)
	//   : 라벨링은 맞지만, 성별이 맞지 않으므로 err.업로드 타입(member || group)
	// : 라벨링이 틀렸으니 err.labeling
  const largeCategory = isCorrectGender && isCorrectLabeling ? uploadType : ERROR;
  const mediumCategory = isCorrectLabeling ?
    isCorrectGender ?
      isNewGender || isNewGroup || isNewMember ? NEW : gender
      : GENDER
    : LABELING;

	// handleEditFileName 에서 해당 파일이 images state 의 어디에 위치하는지 빠르게 파악하기 위한 속성 추가
  newImage.categorized = {
    largeCategory,
    mediumCategory,
  };

	// 대분류가 err 라면 ? 에러 메시지 및 지켜야 할 규칙이 포함되어 있는 err 속성 추가 : err 속성 삭제
  if (largeCategory === ERROR) {
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

const isUnusableName = (name, images) => (
  !name || CANNOT_USE_THIS.some(specialSymbol => name.includes(specialSymbol)) ||
  images.some(({ fileName }) => fileName === name)
);

export {
  editImage,
  categorizeImage,
  isUnusableName
};