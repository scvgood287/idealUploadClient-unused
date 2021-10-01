import axios from 'axios';
import AWS from 'aws-sdk';

axios.defaults.baseURL = process.env.REACT_APP_API_URL;

const customAsync = (reqType, target) => {
  const asyncFunction = (option, body) => axios[reqType](`${target}${option ? `/${option}` : ""}`, body);
  return asyncFunction;
};

const uploadToS3 = (Body, Key, ContentType) => {
  const s3 = new AWS.S3({
    accessKeyId: process.env.REACT_APP_ACCESS_ID,
    secretAccessKey: process.env.REACT_APP_ACCESS_KEY,
    region: process.env.REACT_APP_REGION,
  });

  s3.putObject({
    Bucket: process.env.REACT_APP_BUCKET_NAME,
    Body,
    Key,
    ContentType,
    ACL: "public-read",
  }, (err, data) => {
    if (!err) {
    } else { console.log(err); };
  });
};

export {
  customAsync,
  uploadToS3
};