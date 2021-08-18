// 라벨링에 관한 규칙들
const rules = {
  uploadTypes: {
    member: 5,
    group: 4,
  },
  genders: ['men', 'women', 'mixed'],
}

// 오름차순으로 정렬된 arr 속에서 objData 올바른 위치를 찾아 넣어주는 함수. prop은 비교할때 사용할 속성.
const inputData = (arr, objData, prop) => {
  const index = arr.findIndex((e) => e[prop] >= objData[prop]);
  (index <= -1) ? arr[arr.length] = objData : arr.splice(index, 0, objData);
}

// 파일에 우리가 원하는 속성을 덧붙히는 작업을 함. 임의로 이름을 newName으로 정해주면 그걸 토대로 파일을 업데이트함.
const createImageByFile = (file, newName) => {
  const separated = (!newName) ? (file.name).replaceAll(" ", "").split('.') : newName;
  const fileName = separated[0];
  const fileExtension = separated[1];
  const splitName = fileName.split("_");

  file.fileName = fileName;
  file.extension = fileExtension;
  file.splitName = splitName;
  file.isEdit = false;

  [file.uploadType, file.gender, file.group, file.member] = splitName;

  return file;
}

// images의 구조는 밑에 setState로 정의해뒀으니 참고.
// 받은 image를 라벨링에 관한 규칙(rules)에 따라 분류하여 inputData로 후에 정렬 필요없이 바로 오름차순 삽입.
const insertImage = (images, image, rules) => {
  const { uploadType, gender, splitName } = image;
  const { uploadTypes, genders } = rules;

  // isCorrectUploadType = image의 uploadType이 존재하는 라벨링 규칙인지 확인.
  // isCorrectGender = image의 gender가 존재하는 gender인지 확인.
  // isCorrectLabeling = 올바른 uploadType이고, 그 업로드 타입에 맞는 라벨링을 한건지 확인.
  const isCorrectGender = genders.includes(gender);
  const isCorrectLabeling = uploadTypes.hasOwnProperty(uploadType) && uploadTypes[uploadType] === splitName.length && uploadTypes[uploadType] === splitName.filter(Boolean).length;

  // 대분류가 err인 경우는 없는 gender이거나, 라벨링 규칙에 어긋난 경우.
  const largeCategory = (!isCorrectGender || !isCorrectLabeling) ? 'err' : uploadType;
  // 대분류가 err가 아닌 경우 -> err.gender / 대분류가 err이고, 라벨링 규칙에 어긋난 경우 -> err.labeling / 그 이외는 err.member | err.group
  const mediumCategory = (largeCategory === uploadType) ? gender : (!isCorrectLabeling) ? 'labeling': uploadType;

  // 후에 쉽게 위치를 확인하기 위함. handleEditText 참고.
  const categorized = {
    largeCategory,
    mediumCategory,
  };
  image.categorized = categorized;

  // 라벨링 시 각 uploadType에 맞는 카테고리 길이에 대한 설명들.
  const lengthRules = Object.entries(uploadTypes).map(([key, value]) => (`${key}의 길이는 반드시 ${value}이여야 합니다.`));

  // 라벨링 규칙들
  const labelingRules = {
    uploadTypeRules: `uploadType은 반드시 ${Object.keys(uploadTypes)} 중 하나여야 합니다.`,
    lengthRules,
    genderRules: `gender은 반드시 ${genders} 중 하나여야 합니다.`
  }

  // largeCategory가 err라고 상정했을때만 사용하기 때문에 비교는 mediumCategory만 함.
  const errObj = (mediumCategory === 'labeling') ? {
    errMsg: `규칙에 어긋난 라벨링입니다. 수정해주세요.`,
    labelingRules,
    ...image,
  } : {
    errMsg: `gender 라벨링이 잘못되었습니다. 수정해주세요.`,
    labelingRules,
    ...image,
  };

  // 이미지를 삽입할 위치
  const targetArr = images[largeCategory][mediumCategory];
  const data = (largeCategory === 'err') ? errObj : image;
  // 각 파일들을 compareBy를 기준으로 비교할 예정.
  const compareBy = 'fileName';

  inputData(targetArr, data, compareBy);
};

export { rules, createImageByFile, insertImage };