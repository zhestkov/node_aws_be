import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3ClientConfig, S3Client, PutObjectCommand, PutObjectCommandInput, GetObjectCommand, CopyObjectCommand  } from '@aws-sdk/client-s3';
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { ReadStream } from 'fs';
import * as csvParser from 'csv-parser';

const BUCKET = process.env.BUCKET;

export default class ImportService {
    s3client: S3Client;
    sqsClient: SQSClient;
    constructor(config: S3ClientConfig) {
        this.s3client = new S3Client(config);
        this.sqsClient = new SQSClient(config);
    }

    async fetchSignedUrl(input: PutObjectCommandInput) {
        const putObjectCmd = new PutObjectCommand(input);
        return await getSignedUrl(this.s3client, putObjectCmd, { expiresIn: 3600 });
    }

    async parseFile(records: any[]) {
        try {
            records.forEach(async (rec) => {
                 const resp = await this.s3client.send(new GetObjectCommand({
                    Bucket: BUCKET,
                    Key: rec.s3.object.key
                 }));
                 (resp.Body as ReadStream).pipe(csvParser())
                    .on('data', async (data) => {
                        console.log('on data:', data);
                        const [title, description, price, count] = (Object.values(data)[0] as string).split(";");
                        const product = {
                            title,
                            description,
                            price: Number(price),
                            count: Number(count)
                        };
                        await this.sendProductToSQS(product);
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
            throw new Error("Error while parsing csv file");
        }
    }

    async sendProductToSQS(data) {
        console.log("Sending to SQS: ", data);
        await this.sqsClient.send(new SendMessageCommand({
            QueueUrl: process.env.SQS_URL,
            MessageBody: JSON.stringify(data)
        }));
    }
}