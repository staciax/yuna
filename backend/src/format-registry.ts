import { FormatRegistry } from '@sinclair/typebox';

// https://github.com/ulid/javascript/blob/361eb27b5595c766b85af147df38e3e61eebb529/source/constants.ts#L11C27-L11C72
const ulidRegex = /^[0-7][0-9a-hjkmnp-tv-zA-HJKMNP-TV-Z]{25}$/;

export const registerUlidFormat = () => {
    if (!FormatRegistry.Has('ulid'))
        FormatRegistry.Set('ulid', (value) => ulidRegex.test(value));
};
