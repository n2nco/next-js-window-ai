module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testPathIgnorePatterns: ["/node_modules/", "/.next/"],
    testMatch: ["<rootDir>/tests/**/*.test.ts"], // Add this line
  };
  