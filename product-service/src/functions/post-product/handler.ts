import 'source-map-support/register';
import { formatJSONErrorResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import ProductService from 'src/services/product-service';
import inputSchema, { ProductInput } from './inputSchema';
import ProductInputValidationError from 'src/exceptions/ProductInputValidationException';


const postProduct: ValidatedEventAPIGatewayProxyEvent<typeof inputSchema> = async (event) => {
  console.log(event);
  const product = {
    title: event.body.title,
    price: event.body.price,
    description: event.body.description,
    count: event.body.count
  } as ProductInput;
  const productService = new ProductService();
  try {
    await productService.createProduct(product);
    return formatJSONResponse({message: "product created"});
  } catch(err) {
    if (err instanceof ProductInputValidationError) {
      return formatJSONErrorResponse(404, err.message);
    } else {
      return formatJSONErrorResponse(500, err.message);
    }
  }
}

export const main = middyfy(postProduct);
