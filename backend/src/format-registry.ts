import { FormatRegistry } from '@sinclair/typebox';

// https://github.com/colinhacks/zod/blob/e376cda8e14d3caa09bc2148ffc668748118db6b/src/types.ts#L638
const ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;

export const registerUlidFormat = () => {
    if (!FormatRegistry.Has('ulid'))
        FormatRegistry.Set('ulid', (value) => ulidRegex.test(value));
};
