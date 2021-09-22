import 'source-map-support/register';
import { PutObjectCommandInput } from '@aws-sdk/client-s3';
import { formatJSONErrorResponse, formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import ImportService from 'src/services/importService';

const BUCKET_NAME = process.env.BUCKET;

const importProductsFile: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {
    try {
        const { name } = event.queryStringParameters;
        console.log("CATALOG FILENAME: ", name);
        const importService = new ImportService({ region: "eu-west-1" });
        const putCmdInput: PutObjectCommandInput = {
            Bucket: BUCKET_NAME,
            Key: `uploaded/${name}`
            // ContentType: "text/csv"
        }
        const signedUrl = await importService.fetchSignedUrl(putCmdInput);
        console.log("SIGNED URL: ", signedUrl);
        return formatJSONResponse({signedUrl});

    } catch(err) {
        return formatJSONErrorResponse(400, err);
    }


}

export const main = middyfy(importProductsFile);