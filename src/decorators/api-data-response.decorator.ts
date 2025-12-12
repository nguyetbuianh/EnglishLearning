import { applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { ResponseDto } from '../dtos/response.dto';

export type Constructor<T = object> = abstract new (...args: any[]) => T;

export const ApiResponseData = <TModel extends Constructor>(
  model: TModel,
  isArray = false,
) => {
  return applyDecorators(
    ApiExtraModels(ResponseDto, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseDto) },
          {
            properties: {
              data: isArray
                ? {
                  type: 'array',
                  items: { $ref: getSchemaPath(model) },
                }
                : {
                  $ref: getSchemaPath(model),
                },
            },
          },
        ],
      },
    }),
  );
};
