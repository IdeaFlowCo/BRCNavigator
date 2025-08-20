// __mocks__/openaiClient.ts
import { jest } from "@jest/globals";

// Mock implementation with proper types
interface MockMessage {
    role: string;
    content: string;
}

interface MockParams {
    messages: MockMessage[];
}

const mockCreate = jest.fn().mockImplementation(async (params: unknown) => {
    const typedParams = params as MockParams;
    const userMessage = typedParams.messages.find((m) => m.role === "user");
    const content = userMessage?.content || "";

    if (content.includes("Query: find me events related to 'yoga'")) {
        // Test case: 'yoga' -> rows 1, 2, 4, 5, 10
        console.log("Mock: Detected 'yoga' query, returning [1, 2, 4, 5, 10]");
        return Promise.resolve({
            choices: [{ message: { content: "[1, 2, 4, 5, 10]" } }],
        });
    } else if (content.includes("Query: find me events related to 'music'")) {
        // Test case: 'music' -> rows 3, 8
        console.log("Mock: Detected 'music' query, returning [3, 8]");
        return Promise.resolve({
            choices: [{ message: { content: "[3, 8]" } }],
        });
    } else if (
        content.includes("Query: find me events related to 'meditation'")
    ) {
        // Test case: 'meditation' -> rows 2, 6, 9
        console.log("Mock: Detected 'meditation' query, returning [2, 6, 9]");
        return Promise.resolve({
            choices: [{ message: { content: "[2, 6, 9]" } }],
        });
    } else if (
        content.includes("Query: find me events related to 'Beat Town Hall'")
    ) {
        // Test case: 'Beat Town Hall' -> rows 3, 8
        console.log("Mock: Detected 'Beat Town Hall' query, returning [3, 8]");
        return Promise.resolve({
            choices: [{ message: { content: "[3, 8]" } }],
        });
    } else if (
        content.includes("Query: find me events related to 'Central Park'")
    ) {
        // Test case: 'Central Park' -> rows 7, 10
        console.log("Mock: Detected 'Central Park' query, returning [7, 10]");
        return Promise.resolve({
            choices: [{ message: { content: "[7, 10]" } }],
        });
    } else if (content.includes("Query: find me events related to 'foo'")) {
        // Test case: 'foo' -> no rows
        console.log("Mock: Detected 'foo' query, returning []");
        return Promise.resolve({ choices: [{ message: { content: "[]" } }] });
    } else {
        // Default empty result for any other unrecognized queries in tests
        console.log(
            `Mock: Query not specifically handled, returning []: ${content.substring(
                content.indexOf("Query:"),
                content.indexOf("Output:")
            )}`
        );
        return Promise.resolve({ choices: [{ message: { content: "[]" } }] });
    }
});

const mockOpenAIClient = {
    chat: {
        completions: {
            create: mockCreate,
        },
    },
    // Utility to reset mock call history between tests
    reset: () => {
        mockCreate.mockClear();
    },
};

export default mockOpenAIClient;
