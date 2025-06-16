---
trigger: always_on
description: 
globs: 
---
# Code Commenting Guidelines

As an expert Software Engineer, your primary goal is to produce high-quality, maintainable code. Clear and effective comments are crucial for achieving this. These guidelines will help ensure that comments enhance code readability and understanding.

## General Principles

-   **AI Role Reminder**: Remember, you are an expert SWE tasked to write efficient, well-commented code while following specific development guidelines.
-   **Clarity and Conciseness**: Comments should be written in clear, concise language. Avoid jargon where simpler terms suffice.
-   **Focus on "Why" and "How"**: Good comments explain *why* a particular approach was taken or *how* a complex piece of logic works. Avoid merely restating *what* the code does if it's already obvious from the code itself.
-   **Maintainability**: Keep comments up-to-date with code changes. Outdated comments can be more misleading than no comments at all.

## Comment Types

### Single-Line Comments (`//`)
-   Use for brief explanations of individual lines or small blocks of code.
-   Place them on the line above the code they refer to, or at the end of the line if the comment is very short and directly relates to that line.

    ```typescript
    // Calculate the total price including tax
    const totalPrice = calculateSubtotal(items) + calculateTax(subtotal);

    const discount = 0.1; // 10% discount
    ```

### Multi-Line Comments (`/* ... */`) and JSDoc3
-   Use for longer explanations, function/class descriptions, and formal documentation.
-   **All functions, classes, methods, and complex type definitions MUST be documented using JSDoc3 style.**

## JSDoc3 Style Guide

JSDoc3 is the standard for documenting JavaScript and TypeScript code in this project. Adhere to the following:

1.  **Basic Structure**:
    ```typescript
    /**
     * Brief summary of the function/class.
     *
     * More detailed explanation if necessary. Can span multiple lines.
     * Links to relevant documentation or issues can be included.
     *
     * @param {paramType} paramName - Description of the parameter.
     * @param {paramType} [optionalParamName] - Description of an optional parameter.
     * @param {paramType} [paramWithDefault='defaultValue'] - Description of param with default.
     * @returns {returnType} Description of what the function returns.
     * @throws {ErrorType} Description of errors thrown.
     * @async
     * @example
     *   // Example usage:
     *   const result = myFunction(10, 'test');
     */
    ```

2.  **Key Tags to Use**:
    *   `@description` (or simply the initial block of text): Provides a summary of the element.
    *   `@param {type} name - Description`: Documents a function parameter. Include the type in curly braces.
    *   `@returns {type} Description`: Documents the value returned by a function.
    *   `@type {type}`: Documents the type of a variable or property.
        ```typescript
        /**
         * User's age.
         * @type {number}
         */
        const userAge = 30;
        ```
    *   `@property {type} name - Description`: Documents properties of an object defined using `@typedef`.
    *   `@typedef {object} TypeName - Description`: Defines a custom type, especially for complex objects.
        ```typescript
        /**
         * Represents a user object.
         * @typedef {object} UserProfile
         * @property {string} id - The unique identifier for the user.
         * @property {string} username - The user's chosen username.
         * @property {string} [email] - The user's optional email address.
         */
        ```
    *   `@throws {ErrorType} Description`: Documents errors that a function might throw.
    *   `@example Caption (optional)`: Provides example usage of the function or class.
    *   `@deprecated Optional message`: Marks a function or property as deprecated.
    *   `@see OtherThing`: Refers to another symbol or resource.
    *   `@async`: Indicates an asynchronous function (often used with `@returns {Promise<type>}`).

3.  **TypeScript Specifics**:
    *   While TypeScript provides strong typing, JSDoc comments should still describe the *purpose* and *usage context* of types, parameters, and return values.
    *   For complex interfaces or types, a JSDoc comment above the type definition can explain its overall role.

    ```typescript
    interface User {
      id: string;
      name: string;
    }

    /**
     * Fetches a user by their ID.
     * This function makes an asynchronous call to the user service.
     *
     * @param {string} userId - The unique identifier of the user to fetch.
     * @returns {Promise<User | null>} A promise that resolves to the User object or null if not found.
     * @throws {Error} If the network request fails.
     */
    async function fetchUserById(userId: string): Promise<User | null> {
      // ... implementation ...
      return null; // Placeholder
    }
    ```

## What NOT to Comment

-   **Obvious Code**: Avoid comments that merely repeat what the code clearly says.
    ```typescript
    // ❌ DON'T:
    // Set i to 0
    let i = 0;
    ```
-   **Version Control Information**: Do not use comments for changelogs or author names (this is what Git is for).
-   **Commented-Out Code**: Remove dead or commented-out code. Use version control to track history.

By following these guidelines, we can create a codebase that is easier to understand, maintain, and extend for everyone involved, including AI assistants like yourself.

