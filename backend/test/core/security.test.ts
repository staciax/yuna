import { describe, expect, it } from 'bun:test';
import { getPasswordHash, verifyPassword } from '@/core/security';

describe('Security', () => {
    const testPassword = 'test-password';

    it('should hash a password', async () => {
        const hashedPassword = await getPasswordHash(testPassword);
        expect(hashedPassword).toBeDefined();
        expect(typeof hashedPassword).toBe('string');
        expect(hashedPassword.startsWith('$argon2id$')).toBe(true);
    });

    it('should verify a password correctly', async () => {
        const hashedPassword = await getPasswordHash(testPassword);

        const isValid = await verifyPassword(testPassword, hashedPassword);
        expect(isValid).toBe(true);
    });

    it('should reject incorrect passwords', async () => {
        const hashedPassword = await getPasswordHash(testPassword);

        const isValid = await verifyPassword(
            'test-wrong-password',
            hashedPassword,
        );
        expect(isValid).toBe(false);
    });
});
