import { handlerPath } from "@libs/handlerResolver";
import { AWS } from "@serverless/typescript";

// const BUCKET = process.env.BUCKET;

export default {
    handler: `${handlerPath(__dirname)}/handler.main`,
    events: [
      {
        s3: {
          bucket: 'rscatalog-bucket',
          event: 's3:ObjectCreated:*',
          rules: [{
            prefix: 'uploaded/',
          }],
          existing: true
        }
      },
    ],
  } as AWS['functions']['string']