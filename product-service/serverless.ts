import type { AWS } from '@serverless/typescript';

import getProducts from '@functions/get-products';
import getProductById from '@functions/get-product-by-id';
import postProduct from '@functions/post-product';
import catalogBatchProcess from '@functions/catalog-batch-process';

const serverlessConfiguration: AWS = {
  service: 'product-service',
  useDotenv: true,
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
  },
  plugins: ['serverless-webpack', 'serverless-dotenv-plugin'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    region: "eu-west-1",
    stage: 'dev',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['sqs:*'],
        Resource: {
          'Fn::GetAtt': ['catalogItemsQueue', 'Arn']
        }
      },
      {
        Effect: 'Allow',
        Action: 'sns:*',
        Resource: {
          Ref: 'createProductTopic'
        }
      }
    ],
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      PG_HOST: '${env:PG_HOST}',
      PG_PORT: '${env:PG_PORT}',
      PG_DATABASE: '${env:PG_DATABASE}',
      PG_USERNAME: '${env:PG_USERNAME}',
      PG_PASSWORD: '${env:PG_PASSWORD}',
      SQS_NAME: '${env:SQS_NAME}',
      SNS_NAME: '${env:SNS_NAME}',
      SNS_ARN: {
        Ref: 'createProductTopic'
      }
    },
    lambdaHashingVersion: '20201221',
  },
  resources: {
    Resources: {
      catalogItemsQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: '${self:provider.environment.SQS_NAME}'
        }
      },
      createProductTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: '${self:provider.environment.SNS_NAME}'
        }
      },
      SNSSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: '${env:EMAIL_ADDRESS}',
          Protocol: 'email',
          TopicArn: {
            Ref: 'createProductTopic'
          }
        }
      }
    },
    Outputs: {
      catalogItemsQueueUrl: {
        Value: {
          Ref: 'catalogItemsQueue',
        },
      },
      createProductTopicArn: {
        Value: {
          'Fn::GetAtt': ['catalogItemsQueue', 'Arn'],
        },
      }
    }
  },
  // import the function via paths
  functions: { getProducts, getProductById, postProduct, catalogBatchProcess },
};

module.exports = serverlessConfiguration;
