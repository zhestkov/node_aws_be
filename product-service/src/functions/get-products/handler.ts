import 'source-map-support/register';
import { formatJSONErrorResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import ProductService from 'src/services/product-service';


const getProductList: ValidatedEventAPIGatewayProxyEvent<void> = async (event) => {
  console.log(event);
  const productService = new ProductService();
  try {
    const products = await productService.getProductList();
    return formatJSONResponse({
      products
    });
  } catch(err) {
    return formatJSONErrorResponse(500, err.message);
  }
}

export const main = middyfy(getProductList);
