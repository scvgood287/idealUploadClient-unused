import {
  GENDER_BOY as BOY,
  GENDER_GIRL as GIRL,
  GENDER_MIXED as MIXED,
  NEW,
  UPLOADTYPE_MEMBER as MEMBER,
  UPLOADTYPE_ERR as ERR,
  ERRTYPE_LABELING as LABELING,
  API_URL,
} from '../Dictionary';
import axios from 'axios';

const rules = {
  uploadTypes: {
    member: 5,
    group: 4,
  },
  genders: [BOY, GIRL, MIXED],
};

const inputData = (arr, objData, prop) => {
  const index = arr.findIndex((e) => e[prop] >= objData[prop]);
  (index <= -1) ? arr[arr.length] = objData : arr.splice(index, 0, objData);
}

const editImage = (file, collections, newName, skip = false) => {
  let temp = {};

  temp.name = newName || file.name;
  [temp.fileName, temp.extension] = temp.name.split(".");
  temp.splitName = temp.fileName.split("_");
  temp.isEdit = false;

  [temp.uploadType, temp.gender, temp.group, temp.member, temp.index] = temp.splitName;
  const { index, uploadType, gender, group, member } = temp;

  temp.index = index ?? member;

  const isNewGender = rules.genders.includes(gender) && !hasDoc(collections.gender, gender);
  const genderId = !isNewGender ? getDocId(collections.gender, gender) : undefined;
  const isNewGroup = !isNewGender ? !hasDoc(collections.group, group, genderId) : true;
  const isNewMember = uploadType === MEMBER ? (!isNewGender && !isNewGroup) ? !hasDoc(collections.member, member, genderId, getDocId(collections.group, group, genderId)) : true : false;

  temp.isNewGender = isNewGender;
  temp.isNewGroup = isNewGroup;
  temp.isNewMember = isNewMember;

  if (!skip) {
    temp.src = URL.createObjectURL(file);
  }

  return temp;
}

const insertImage = (images, image) => {
  const { uploadType, gender, splitName, isNewGender, isNewGroup, isNewMember } = image;
  const { uploadTypes, genders } = rules;

  const isCorrectGender = genders.includes(gender);
  const isCorrectLabeling =
    uploadTypes.hasOwnProperty(uploadType) &&
    uploadTypes[uploadType] === splitName.length &&
    uploadTypes[uploadType] === splitName.filter(Boolean).length;

  const largeCategory = (!isCorrectGender || !isCorrectLabeling) ? ERR : uploadType;

  const mediumCategory = (largeCategory === uploadType) ? ((isNewGender || isNewGroup || isNewMember) ? NEW : gender)
    : (!isCorrectLabeling) ? LABELING
    : uploadType;

  const categorized = {
    largeCategory,
    mediumCategory,
  };
  image.categorized = categorized;

  const lengthRules = Object.entries(uploadTypes).map(([key, value]) => (`${key}의 길이는 반드시 ${value}이여야 합니다.`));

  const labelingRules = {
    uploadTypeRules: `uploadType은 반드시 ${Object.keys(uploadTypes)} 중 하나여야 합니다.`,
    lengthRules,
    genderRules: `gender은 반드시 ${genders} 중 하나여야 합니다.`
  }

  const errObj = (mediumCategory === LABELING) ? {
    errMsg: `규칙에 어긋난 라벨링입니다. 수정해주세요.`,
    labelingRules,
    ...image,
  } : {
    errMsg: `gender 라벨링이 잘못되었습니다. 수정해주세요.`,
    labelingRules,
    ...image,
  };

  const targetArr = images[largeCategory][mediumCategory];
  const data = (largeCategory === ERR) ? errObj : image;
  const compareBy = 'fileName';

  inputData(targetArr, data, compareBy);
};

const hasDoc = (collection, name, ...props) => {
  try {
    if (props.filter(Boolean).length === 0) { return collection.some(doc => doc.name === name); }
    else if (!Array.isArray(props)) { throw new TypeError('wrong type props'); }

    return collection.some(doc => doc.name === name && props.every(prop => Object.values(doc).includes(prop)));
  } catch (e) { console.error(e); };
};

const getDocId = (collection, name, ...props) => {
  try {
    if (props.filter(Boolean).length === 0) { return collection[collection.findIndex(doc => doc.name === name)]._id; }
    else if (!Array.isArray(props)) { throw new TypeError('wrong type props'); }

    return collection[collection.findIndex(doc => doc.name === name && props.every(prop => Object.values(doc).includes(prop)))]._id;
  } catch (e) { console.error(e); };
};

const resData = async (reqType, url, body) => {
  const res = await axios[reqType](`${API_URL}/${url}`, body);
  return res.data;
};

export {
  editImage,
  insertImage,
  hasDoc,
  getDocId,
  resData
};