import '@testing-library/jest-dom';
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset } from 'jest-mock-extended';

// Mock PrismaClient
jest.mock('./src/lib/prisma', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

// Mock Redis
jest.mock('ioredis', () => require('ioredis-mock'));

// Reset mocks before each test
beforeEach(() => {
  mockReset(prismaMock);
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

export const prismaMock = mockDeep<PrismaClient>();