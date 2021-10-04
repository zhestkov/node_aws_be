import { formatJSONErrorResponse, formatJSONResponse } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";
import ImportService from "src/services/importService";

const importFileParser: any = async (event) => {
    try {
        const importService = new ImportService({ region: "eu-west-1" });
        console.log("RECORDS LENGTH: ", event.Records.length);
        await importService.parseFile(event.Records);
        return formatJSONResponse({ message: 'Message is saved to the queue'});

    } catch(err) {
        return formatJSONErrorResponse(400, err);
    }
}

export const main = middyfy(importFileParser);
