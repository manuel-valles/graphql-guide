# GraphQL | The Complete Guide

A complete guide about GraphQL, using Node.js, Prisma, authentication, Apollo Client, and more!

## Basics

- Babel CLI and presets: `$ npm install --save-dev @babel/core @babel/cli @babel/preset-env @babel/node`
- Your own GraphQL API with [GraphQL Yoga](https://github.com/dotansimha/graphql-yoga): `$ npm i graphql-yoga`
- Example basic query with scalar types (single values: ID, String, Int, Float, Boolean), custom types and arrays:

  ![graphql-yoga-example](./graphql-basics/resources/graphql-yoga-example.png)

- When we set a field whose value is one of our custom fields, we need to define a function/method that tells GraphQL how to get it. To do so, we need to define a new route on resolvers that matches with the parent property (e.g. `Post`), and set the methods for each of our fields that actually goes to another custom type (e.g. `author`).
- Mutations:

  - uuid [package](https://www.npmjs.com/package/uuid): `$ npm i uuid`
  - Example basic mutation:

    ![mutation-example](./graphql-basics/resources/mutation-example.png)

  - Input types can only have scalar values. So it cannot have a custom (object) type. Example `data` input with type `CreatePostInput`:

    ![input-type-example](./graphql-basics/resources/input-type-example.png)

  - When you delete some data you need to delete also the existing related data. For example, if you delete a user, you also have to delete the posts and comments created by that user.

- You can break the type definitions (`typeDefs`) out into their own file which is the preferred approach for a real world production graphQL applications (e.g. `schema.grapqhql`).
- You can set up `context` for the application that will be shared across your app like the mock data (db).

- **NOTE**: By default, `nodemon` looks for files with the .js, .mjs, .coffee, .litcoffee, and .json extensions. However, you can specify your own list with the `-e` (or `--ext`) switch like so: `nodemon src/index.js --ext js,graphql --exec babel-node`
