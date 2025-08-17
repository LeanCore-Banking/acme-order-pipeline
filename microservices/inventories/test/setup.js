// Configuración global para las pruebas
jest.mock("dotenv", () => ({
  config: jest.fn(),
}));

// Mock global de console para evitar ruido en las pruebas
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// Mock de process.env para pruebas
process.env.NODE_ENV = "test";
process.env.PORT = "3002";
process.env.PG_DATABASE = "test_db";
process.env.PG_USER = "test_user";
process.env.PG_PASSWORD = "test_password";
process.env.PG_HOST = "test_host";

// Configuración de timeout para pruebas asíncronas
jest.setTimeout(10000);

// Limpiar todos los mocks después de cada prueba
afterEach(() => {
  jest.clearAllMocks();
});
