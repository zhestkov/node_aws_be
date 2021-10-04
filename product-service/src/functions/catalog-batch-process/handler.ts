import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { formatJSONErrorResponse } from "@libs/apiGateway"
import { middyfy } from "@libs/lambda";
import ProductService from "src/services/product-service";
import { ProductInput } from "@functions/post-product/inputSchema";


const sendProductToSNS = async (product: ProductInput & {id: string}) => {
    const snsClient = new SNSClient({ region: "eu-west-1" });
    await snsClient.send(new PublishCommand({
        Subject: `${product.title} has been created`,
        Message: JSON.stringify(product),
        TopicArn: process.env.SNS_ARN,
        MessageAttributes: {
            price: {
                DataType: 'Number',
                StringValue: `${product.price}`
            }
        }
    }));
};


const catalogBatchProcess = async (event) => {
    console.log(event);
    const productService = new ProductService();
    try {
        console.log("Catalog batch processing...");
        
        for (const record of event.Records) {
            const product: ProductInput = JSON.parse(record.body);
            console.log('Creating product: ', product);
            const createdProduct = await productService.createProduct(product);
            await sendProductToSNS(createdProduct);
        }
    } catch(err) {
        return formatJSONErrorResponse(500, err);
    } finally {
        await productService.closePool();
    }
}

export const main = middyfy(catalogBatchProcess);
