import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PaginationResponseDto } from '../dtos/pagination.dto'; 

export type Constructor<T = object> = abstract new (...args: any[]) => T;

export const ApiPaginatedResponse = <TModel extends Constructor>(
  model: TModel,
) => {
  return applyDecorators(
    ApiExtraModels(PaginationResponseDto, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginationResponseDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
};
