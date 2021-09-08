// ".", "_" 만 사용가능
const CANNOT_USE_THIS = [".", " ", "~", "₩", "`", "!", "@", "#", "%", "^", "&", "*", "(", ")", "+", "=", "{", "[", "}", "]", "|", ":", ";", "'", '"', "<", ">", ",", "?", "/"];

// GENDER
// men -> boy, women -> girl 로 바꿔야함
const GENDER_BOY = "men";
const GENDER_GIRL = "women";
const GENDER_MIXED = "mixed";

const NEW = "new";

// UPLOADTYPE
const UPLOADTYPE_ERR = "err";
const UPLOADTYPE_MEMBER = "member";
const UPLOADTYPE_GROUP = "group";

// ERRTYPE
const ERRTYPE_LABELING = "labeling";

// API_URL
const API_URL = "http://localhost:8000/api/ideals";
const ACCESS_ID = "AKIARWY3ZOJ6GHLHZMJI";
const ACCESS_KEY = "JtoJhmGh5CXN9VYGh/QXgpOpG1p4qL1LRrYFwTHl";
const BUCKET_NAME = "ideals-bucket";
const DIR_NAME = "idealimages";
const REGION = "ap-northeast-2";
const IDENTITYPOOLID = "IdentityPoolId:ap-northeast-2:ca1cfcae-8b4e-439c-9f1b-a421944d0712";

//ACTIONTYPE
const ACTIONTYPE_LOADING = "LOADING";
const ACTIONTYPE_SUCCESS = "SUCCESS";
const ACTIONTYPE_ERROR = "ERROR";

// REQUESTTYPE
const REQUESTTYPE_GET = "get";
const REQUESTTYPE_POST = "post";

// REQUESTTARGET
const REQUESTTARGET_COLLECTIONS = "collections";
const REQUESTTARGET_DOCUMENTS = "documents";

// COLLECTION
const COLLECTION_GENDER = "gender";
const COLLECTION_GROUP = "group";
const COLLECTION_GROUPIMAGE = "groupImage";
const COLLECTION_GROUPIMAGERATE = "groupImageRate";
const COLLECTION_GROUPIMAGEGAMELOG = "groupImageGameLog";
const COLLECTION_MEMBER = "member";
const COLLECTION_MEMBERIMAGE = "memberImage";
const COLLECTION_MEMBERIMAGERATE = "memberImageRate";
const COLLECTION_MEMBERIMAGEGAMELOG = "memberImageGameLog";

export {
  CANNOT_USE_THIS,

  GENDER_BOY,
  GENDER_GIRL,
  GENDER_MIXED,

  NEW,

  UPLOADTYPE_ERR,
  UPLOADTYPE_MEMBER,
  UPLOADTYPE_GROUP,

  ERRTYPE_LABELING,

  API_URL,
  ACCESS_ID,
  ACCESS_KEY,
  BUCKET_NAME,
  DIR_NAME,
  REGION,
  IDENTITYPOOLID,

  ACTIONTYPE_LOADING,
  ACTIONTYPE_SUCCESS,
  ACTIONTYPE_ERROR,

  REQUESTTYPE_GET,
  REQUESTTYPE_POST,

  REQUESTTARGET_COLLECTIONS,
  REQUESTTARGET_DOCUMENTS,

  COLLECTION_GENDER,
  COLLECTION_GROUP,
  COLLECTION_GROUPIMAGE,
  COLLECTION_GROUPIMAGERATE,
  COLLECTION_GROUPIMAGEGAMELOG,
  COLLECTION_MEMBER,
  COLLECTION_MEMBERIMAGE,
  COLLECTION_MEMBERIMAGERATE,
  COLLECTION_MEMBERIMAGEGAMELOG
};