// import fs from 'fs';
import aws from 'aws-sdk';
import nodemailer from 'nodemailer';
import multer from 'multer';
import multerS3 from 'multer-s3';

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: 'us-east-2',
});

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

// create Nodemailer SES transporter
export const transporter = nodemailer.createTransport({
  SES: new aws.SES({
    apiVersion: '2010-12-01',
    accessKeyId: process.env.AWS_ACCESS_ID,
    accessSecretKey: process.env.AWS_SECRET_KEY,
    region: 'us-east-2',
    correctClockSkew: true,
  }),
});

export const uploadToS3 = multer({
  storage: multerS3({
    s3,
    bucket: process.env.BUCKET_NAME,
    acl: 'public-read',
    metadata(req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key(req, file, cb) {
      cb(null, `${Date.now().toString()}_${file.originalname}`);
    },
  }),
});

export function deleteFromS3(keys) {
  return keys.forEach((Key) => new Promise((res, rej) => {
    s3.deleteObject(
      {
        Bucket: process.env.BUCKET_NAME,
        Key,
      },
      (err, data) => {
        if (err) return rej(err);
        return res(data);
      },
    );
  }));
}

export function listFilesS3() {
  s3.listObjects({ Delimiter: '/' }, (err, data) => {
    if (err) {
      console.log('listFilesS3 > ', err);
      return { code: 500, message: `There was an error listing your albums: ${err.message}` };
    }
    const albums = data.CommonPrefixes.map((commonPrefix) => {
      const prefix = commonPrefix.Prefix;
      const albumName = decodeURIComponent(prefix.replace('/', ''));
      return albumName;
    });
    console.log('albums > ', albums);
    return albums;
  });
}
