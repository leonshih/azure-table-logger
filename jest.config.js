module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleDirectories: ['node_modules', 'lib'],
    setupFilesAfterEnv: ["<rootDir>/tests/setupTests.ts"],
};