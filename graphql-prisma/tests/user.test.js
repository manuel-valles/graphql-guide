import 'cross-fetch/polyfill';
import { gql } from 'apollo-boost';
import getClient from './utils/getClient';
import seedDatabase, { userOne } from './utils/seedDatabase';
import prisma from '../src/prisma';

const client = getClient();

beforeEach(seedDatabase);

test('Should create a new user', async () => {
  const createUser = gql`
    mutation {
      createUser(
        data: {
          name: "John Doe"
          email: "John@gmail.com"
          password: "johnnySuperSecret"
        }
      ) {
        token
        user {
          id
        }
      }
    }
  `;

  const response = await client.mutate({ mutation: createUser });

  const existsUser = await prisma.user.count({
    where: { id: response.data.createUser.user.id },
  });

  expect(existsUser).toBe(1);
});

test('Should not sign up with short password', async () => {
  const createUser = gql`
    mutation {
      createUser(
        data: { name: "John Doe", email: "John@gmail.com", password: "short" }
      ) {
        token
      }
    }
  `;

  await expect(client.mutate({ mutation: createUser })).rejects.toThrow(
    'Password must be at least 8 characters long'
  );
});

test('Should expose public author profiles', async () => {
  const getUsers = gql`
    query {
      users {
        id
        name
        email
      }
    }
  `;

  const { data } = await client.query({ query: getUsers });

  expect(data.users.length).toBe(1);
  expect(data.users[0].email).toBe(null);
  expect(data.users[0].name).toBe('Manu Kem');
});

test('Should not log in with bad credentials', async () => {
  const login = gql`
    mutation {
      login(data: { email: "manu@gmail.com", password: "wrongPassword" }) {
        token
        user {
          id
        }
      }
    }
  `;

  await expect(client.mutate({ mutation: login })).rejects.toThrow(
    'Invalid credentials'
  );
});

test('Should fetch user profile', async () => {
  const client = getClient(userOne.jwt);

  const { data } = await client.query({
    query: gql`
      query {
        me {
          id
          name
          email
        }
      }
    `,
  });

  expect(data.me.id).toBe(userOne.user.id);
  expect(data.me.name).toBe(userOne.user.name);
  expect(data.me.email).toBe(userOne.user.email);
});
