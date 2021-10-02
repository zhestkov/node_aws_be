import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3ClientConfig, S3Client, PutObjectCommand, PutObjectCommandInput, GetObjectCommand, CopyObjectCommand  } from '@aws-sdk/client-s3';
import { createReadStream, ReadStream } from 'fs';
import * as csvParser from 'csv-parser';

const BUCKET = process.env.BUCKET;

export default class ImportService {
    s3client: S3Client;
    constructor(config: S3ClientConfig) {
        this.s3client = new S3Client(config);
    }

    async fetchSignedUrl(input: PutObjectCommandInput) {
        const putObjectCmd = new PutObjectCommand(input);
        return await getSignedUrl(this.s3client, putObjectCmd, { expiresIn: 3600 });
    }

    async parseFile(records: any[]) {
        try {
            records.forEach(async (rec) => {
                const getObjectCmd = new GetObjectCommand({ 
                    Bucket: BUCKET,
                    Key: rec.s3.object.key
                 });
                 const resp = await this.s3client.send(getObjectCmd);
                 (resp.Body as ReadStream).pipe(csvParser())
                    .on('data', data => {
                        console.log(data);
                    })
                    .on('end', async () => {
                        console.log(`Copy from ${BUCKET}/${rec.s3.object.key}`);
                        const copyObjectCmd = new CopyObjectCommand({
                            Bucket: BUCKET,
                            CopySource: `${BUCKET}/${rec.s3.object.key}`,
                            Key: rec.s3.object.key.replace('uploaded', 'parsed')
                        });
                        await this.s3client.send(copyObjectCmd);
                        console.log(`Copied from /uploaded to /parsed`);
                    });
            });
        } catch(err) {
            console.log('error:', err);
        }
    }


}