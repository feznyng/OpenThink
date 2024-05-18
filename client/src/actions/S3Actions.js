import * as AWS from 'aws-sdk';
const ID = process.env.REACT_APP_S3_ID;
const SECRET = process.env.REACT_APP_S3_SECRET;
const BUCKET_NAME = process.env.REACT_APP_S3_BUCKET_NAME;

const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET,
    signatureVersion: process.env.REACT_APP_S3_VERSION,
    region: process.env.REACT_APP_S3_REGION
});

export function getImage(url, name) {
    if (url === undefined || url === '' || url === null) {
        return '';
    }
    return s3.getSignedUrl('getObject', {
      Bucket: BUCKET_NAME,
      Key: url,
      ResponseContentDisposition: `attachment; ${name ? `filename="${name}"` : ''}`
    });
}

export function changeImage(url, file) {
    return s3.upload({
        Bucket: BUCKET_NAME,
        Key: url,
        Body: file
    }, (err, data) => {
        if (err) {
            throw err;
        }
    });
}

export function deleteImage(url) {
    return s3.deleteObject({
        Bucket: BUCKET_NAME,
        Key: url,
    }, (err, data) => {
        if (err) {
            throw err;
        }
    });
}

export async function getFolderImages(url) {
    let params = {
        Bucket: BUCKET_NAME,
        Prefix: url,
    }
    return s3.listObjects(params).promise();
}

export async function getFile(url) {
    let params = {
        Bucket: BUCKET_NAME,
        Key: url,
    }
    return s3.getObject(params, (err, data) => {
        console.log(data)

        let blob = new Blob([data.Body], {type: data.ContentType});
        return blob;
    }).promise();
}