/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/mock-server/'
  ],
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.module.ts',
    '!src/app/**/*.routes.ts',
    '!src/main.ts'
  ],
  moduleNameMapper: {
    '^@shared$': '<rootDir>/src/app/shared',
    '^@shared/(.*)$': '<rootDir>/src/app/shared/$1',
    '^@models$': '<rootDir>/src/app/shared/models',
    '^@models/(.*)$': '<rootDir>/src/app/shared/models/$1',
    '^@env$': '<rootDir>/src/environments/environment',
    '^@env/(.*)$': '<rootDir>/src/environments/$1',
    '^src/app/shared$': '<rootDir>/src/app/shared',
    '^src/app/shared/(.*)$': '<rootDir>/src/app/shared/$1'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@angular|@coreui|@ngx-translate|rxjs|angularx-qrcode|ngx-webstorage|ngx-scrollbar|ngx-cookie-service|chart\\.js|lodash-es|@tanstack)/)'
  ],
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'html', 'js', 'json', 'mjs'],
  coverageReporters: ['html', 'text-summary'],
  coverageDirectory: 'coverage',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
        useESM: true
      }
    ]
  },
  extensionsToTreatAsEsm: ['.ts']
};
