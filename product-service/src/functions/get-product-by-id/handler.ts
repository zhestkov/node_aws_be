import 'source-map-support/register';
import { formatJSONErrorResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import ProductNotFoundError from 'src/exceptions/ProductNotFoundException';
import ProductService from 'src/services/product-service';

const getProductById: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {
  console.log(event);
  const productService = new ProductService();
  try {
    const id = event.pathParameters.id;
    const product = await productService.getProductById(id);
    return formatJSONResponse(product);
  } catch(err) {
    if (err instanceof ProductNotFoundError) {
      return formatJSONErrorResponse(404, err.message);
    } else {
      return formatJSONErrorResponse(500, err.message);
    }
  }
}

export const main = middyfy(getProductById);
