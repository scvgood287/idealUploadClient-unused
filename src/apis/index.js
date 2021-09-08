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

const rules = {
  uploadTypes: {
    member: 5,
    group: 4,
  },
  genders: [BOY, GIRL, MIXED]
};

const inputData = (arr, objData, prop) => {
  const index = arr.findIndex((e) => e[prop] >= objData[prop]);
  (index <= -1) ? arr[arr.length] = objData : arr.splice(index, 0, objData);
};

const editImage = (file, { gender: genderCollection, group: groupCollection, member: memberCollection }, newName, skip = false) => {
  [file.editableName, file.extension] = newName || file.name.split(".");
  file.editableName = file.editableName.toLowerCase();
  file.isEditable = false;
  file.src = skip ? file.src : URL.createObjectURL(file);
  [file.uploadType, file.gender, file.group, file.member, file.index] = file.editableName.split("_");

  const { uploadTypes, genders } = rules;
  const { uploadType, gender, group, member } = file;
  file.index = file.index || member;

  const isCorrectUploadType = uploadTypes.hasOwnProperty(uploadType);
  const isCorrectGender = genders.includes(gender);

  if (isCorrectUploadType && isCorrectGender) {
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
    } else { delete file.isNewMember; };

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

const insertImage = (images, image) => {
  const { uploadType, gender, isCorrectUploadType, isCorrectGender, isNewGender, isNewGroup, isNewMember } = image;
  const { uploadTypes, genders } = rules;

  const validName = image.editableName.split("_");

  const isCorrectLabeling = isCorrectUploadType &&
    uploadTypes[uploadType] === validName.length &&
    uploadTypes[uploadType] === validName.filter(Boolean).length;

  const largeCategory = isCorrectGender && isCorrectLabeling ? uploadType : ERR;
  const mediumCategory = isCorrectLabeling ?
    isCorrectGender ?
      isNewGender || isNewGroup || isNewMember ? NEW : gender
      : uploadType
    : LABELING;

  image.categorized = {
    largeCategory,
    mediumCategory,
  };

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
  const data = image;
  const compareBy = 'editableName';

  inputData(targetArr, data, compareBy);
};

const resData = async (reqType, url, body) => {
  const res = await axios[reqType](`${API_URL}/${url}`, body);
  return res.data;
};

const isUnusableName = (name, images) => (
  CANNOT_USE_THIS.some(c => name.includes(c)) ||
  Object.values(images).some(c => Object.values(c).some(imageList => imageList.some(image => image.editableName === name)))
);

const uploadToS3 = (Body, Key, ContentType) => {
  const s3 = new AWS.S3({
    accessKeyId: ACCESS_ID,
    secretAccessKey: ACCESS_KEY,
    region: REGION,
  });

  s3.putObject({
    Bucket: BUCKET_NAME,
    Body,
    Key,
    ContentType,
    ACL: "public-read",
  }, () => console.log("s3 upload done"));
};

export {
  editImage,
  insertImage,
  resData,
  isUnusableName,
  uploadToS3
};