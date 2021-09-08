import ProductInputValidationError from "src/exceptions/ProductInputValidationException";
import ProductService from "src/services/product-service";
import { ProductInput } from "./inputSchema";

export const validateOnCreate = async (productService: ProductService, product: ProductInput) => {
    // check title/price/count
    if (product.title == null) {
        throw new ProductInputValidationError(`Title cannot be empty`);
    } else if (product.price == null || product.price <= 0) {
        throw new ProductInputValidationError(`Price must be equal or greater than 1`);
    } else if (product.count != null && product.count <= 0) {
        throw new ProductInputValidationError(`Count must be equal or greater than 1`);
    }

    // check if product with such title already exists
    const existedProduct = await productService.getProductByTitle(product.title);
    if (existedProduct != null) {
        throw new ProductInputValidationError(`Product with title = '${product.title}' already exists'`);
    }
}