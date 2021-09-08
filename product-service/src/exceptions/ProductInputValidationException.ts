export default class ProductInputValidationError extends Error {
    constructor(msg: string) {
        super(msg);
        this.name = "ProductInputValidationError";
    }
}