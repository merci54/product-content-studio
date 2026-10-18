// Тестові облікові дані та секрет: використовуються лише в e2e на окремій базі test.db.
export const TEST_ADMIN = {
  email: 'e2e-admin@example.test',
  password: 'e2e-password-123',
};

export const TEST_ENV = {
  DATABASE_URL: 'file:./test.db',
  JWT_SECRET: 'e2e-test-secret-not-for-production-0001',
  ADMIN_EMAIL: TEST_ADMIN.email,
  ADMIN_PASSWORD: TEST_ADMIN.password,
};
