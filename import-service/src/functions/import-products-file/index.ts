import { handlerPath } from "@libs/handlerResolver";
import { AWS } from "@serverless/typescript";

export default {
    handler: `${handlerPath(__dirname)}/handler.main`,
    events: [
        {
          http: {
            method: 'get',
            path: '/import',
            cors: true,
            request: {
                parameters: {
                    querystrings: {
                        name: true
                    }
                }
            }
          }
        }
      ]
} as AWS["functions"]["tring"]