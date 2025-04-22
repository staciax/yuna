import { t } from 'elysia';

// export const ErrorMessage = t.Object({
//     message: t.String(),
//     code: t.Optional(t.String()),
// });

// export const ErrorResponse = t.Object({
//     errors: t.Optional(t.Array(ErrorMessage)),
// });

// elysia default error response
// export const TypeBoxValidationErrorResponse = t.Object({
//     type: t.String(),
//     on: t.String(),
//     summary: t.String(),
//     property: t.String(),
//     expected: t.Object({
//         type: t.String(),
//         message: t.String(),
//         error: t.Object({}, { additionalProperties: true }),
//     }),
//     found: t.Object({}, { additionalProperties: true }),
//     errors: t.Array(
//         t.Object({
//             type: t.String(),
//             schema: t.Object({}, { additionalProperties: true }),
//             path: t.String(),
//             value: t.Any(),
//             message: t.String(),
//             errors: t.Array(t.Any()),
//             summary: t.String(),
//         }),
//     ),
// });

const ValidationErrorDetails = t.Object({
    type: t.String(),
    path: t.Array(t.String()),
    message: t.String(),
});

export const ValidationErrorSchema = t.Object({
    type: t.String(),
    on: t.String(),
    errors: t.Array(ValidationErrorDetails),
});
