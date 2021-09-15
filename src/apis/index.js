import axios from 'axios';
import AWS from 'aws-sdk';

import {
  ACCESS_ID,
  ACCESS_KEY,
  REGION,
  BUCKET_NAME,
  API_URL
} from '../Dictionary';

// reqType 은 요청 종류에 따라 get, post 등이 string 으로 들어온다.
// url 은 API_URL 의 뒤에 들어올 url 이다.
// body 는 요청 시 같이 보낼 데이터이다.
const customAsync = (reqType, target) => {
  const asyncFunction = (option, body) => axios[reqType](`${API_URL}/${target}/${option}`, body);
  return asyncFunction;
};

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
      console.log(data);
    } else { console.log(err); };
  });
};

export {
  customAsync,
  uploadToS3
};