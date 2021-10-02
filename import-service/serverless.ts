import type { AWS } from '@serverless/typescript';
import importProductsFile from '@functions/import-products-file';
import importFileParser from '@functions/import-file-parser';

const serverlessConfiguration: AWS = {
  service: 'import-service',
  frameworkVersion: '2',
  useDotenv: true,
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
    region: 'eu-west-1',
    stage: 'dev',
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: [ 's3:ListBucket' ],
        Resource: [ 'arn:aws:s3:::${env:BUCKET}' ],
      },
      {
        Effect: 'Allow',
        Action: [ 's3:*' ],
        Resource: [ 'arn:aws:s3:::${env:BUCKET}/*' ]
      }
    ],
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      BUCKET: '${env:BUCKET}'
    },
    lambdaHashingVersion: '20201221',
  },
  // import the function via paths
  functions: {importProductsFile, importFileParser }
};

module.exports = serverlessConfiguration;
