export default class DatabaseError extends Error {
    constructor(msg: string) {
        super(msg);
        this.name = "DatabaseError";
    }
}