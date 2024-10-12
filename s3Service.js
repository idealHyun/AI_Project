const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');

// S3 클라이언트 초기화
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// 파일 업로드 함수
exports.uploadFile = async (params) => {
  try {
    const upload = new Upload({
      client: s3, // S3 클라이언트
      params, // 업로드할 파일의 매개변수
    });

    // 업로드 진행 상황 모니터링 (선택 사항)
    upload.on('httpUploadProgress', (progress) => {
      console.log(`Uploaded: ${progress.loaded} / ${progress.total}`);
    });

    const result = await upload.done(); // 업로드 완료될 때까지 기다림
    return result;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};
