import { ValidationError } from "@nestjs/common";

export default function formatValidatorErrors(
  validationError: ValidationError[],
) {
  const formattedErrors: { fieldName: string; message: string }[] = [];

  const errorFormatter = (
    errors: ValidationError[],
    parentField?: string,
  ) => {
    try {
      errors.map((error) => {
        const fieldName = parentField
          ? `${parentField}.${error.property}`
          : error.property;

        if (
          !Object.entries(error.constraints || {}).length &&
          error.children?.length
        ) {
          errorFormatter(error.children, fieldName);
        } else {
          const formatedMessage = Object.values(error.constraints ?? {}).join(', ');

          formattedErrors.push({
            fieldName,
            message: formatedMessage,
          });
        }
      });
    } catch (error) {
      return validationError;
    }
  };
  errorFormatter(validationError);
  if (!formattedErrors.length)
    return validationError;

  return formattedErrors;
}