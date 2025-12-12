import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiCreatedResponse, getSchemaPath } from '@nestjs/swagger';
import { ResponseDto } from '../dtos/response.dto';

export const ApiResponseEmpty = () => {
  return applyDecorators(
    ApiExtraModels(ResponseDto),
    ApiCreatedResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseDto) },
          {
            properties: {
              data: { type: 'null', nullable: true }
            }
          }
        ]
      }
    })
  );
};
