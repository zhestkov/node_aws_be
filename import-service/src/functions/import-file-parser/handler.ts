import { formatJSONErrorResponse } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";
import ImportService from "src/services/importService";

const importFileParser: any = async (event) => {
    try {
        const importService = new ImportService({ region: "eu-west-1" });
        console.log("RECORDS LENGTH: ", event.Records.length);
        await importService.parseFile(event.Records);

    } catch(err) {
        return formatJSONErrorResponse(400, err);
    }
}

export const main = middyfy(importFileParser);
