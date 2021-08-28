import 'source-map-support/register';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import { ProductNotFoundError } from './exceptions';
import data from 'src/data';

const getProductById: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {
  try {
    const id = event.pathParameters.id;
    const product = data.find(p => p.id === id);
    if (product == null) {
      throw new ProductNotFoundError("Product not found");
    }
    return formatJSONResponse(product);
  } catch(err) {
    const msg = err.message || "Uknown error type";
    const statusCode = err instanceof ProductNotFoundError ? 400 : 500;
    return formatJSONResponse({
      statusCode,
      description: msg
    });
    
  }
}

export const main = middyfy(getProductById);
