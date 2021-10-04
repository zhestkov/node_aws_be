import { handlerPath } from "@libs/handlerResolver";
import { AWS } from "@serverless/typescript";

export default {
    handler: `${handlerPath(__dirname)}/handler.main`,
    events: [
      {
        sqs: {
          batchSize: 5,
          arn: {
            'Fn::GetAtt': ['catalogItemsQueue', 'Arn']
          }
        } 
      }
    ],
  } as AWS['functions']['string']