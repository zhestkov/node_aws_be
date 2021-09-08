import { ClientConfig } from 'pg';

const { PG_HOST, PG_PORT, PG_DATABASE, PG_USERNAME, PG_PASSWORD } = process.env;

const UUID_V4_REGEX = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

export default class Utils {
    static isUUIDValid(uuid: string) {
        return UUID_V4_REGEX.test(uuid);
    }

    static getDbOptions(): ClientConfig {
        return {
            host: PG_HOST,
            port: Number(PG_PORT),
            database: PG_DATABASE,
            user: PG_USERNAME,
            password: PG_PASSWORD,
            ssl: {
                rejectUnauthorized: false
            },
            connectionTimeoutMillis: 10_000
        } as ClientConfig
    }
}