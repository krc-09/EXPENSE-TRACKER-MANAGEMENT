const AWS = require('aws-sdk');
const  uploadToS3 = (data, filename) =>{
    const BUCKET_NAME = 'expensetracking009';
    const IAM_USER_KEY = process.env.IAM_USER_KEY;
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET;
    const s3bucket = new AWS.S3({
      accessKeyId: IAM_USER_KEY,
      secretAccessKey: IAM_USER_SECRET,
    });
  
    
      var params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL:'public-read'
      };
      
    return new Promise((resolve, reject) => {
      s3bucket.upload(params, (err, s3response) => {
        if (err) {
          console.error('Error uploading to S3:', err);
          reject(err);
        } else {
          console.log('Upload successful:', s3response);
          resolve(s3response.Location); // Return the file URL on success
        }
      });
    });
  }

  module.exports = {uploadToS3};