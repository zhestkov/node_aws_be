export class ProductNotFoundError extends Error {
    constructor(msg: string) {
        super(msg);
        this.name = "ProductNotFoundError";
    }
}