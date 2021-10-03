import 'cross-fetch/polyfill';
import getClient from './utils/getClient';
import seedDatabase, { userOne } from './utils/seedDatabase';
import prisma from '../src/prisma';
import { createUser, getUsers, login, getProfile } from './utils/operations';

const client = getClient();

beforeEach(seedDatabase);

test('Should create a new user', async () => {
  const variables = {
    data: {
      name: 'John Doe',
      email: 'John@gmail.com',
      password: 'johnnySuperSecret',
    },
  };

  const response = await client.mutate({ mutation: createUser, variables });

  const existsUser = await prisma.user.count({
    where: { id: response.data.createUser.user.id },
  });

  expect(existsUser).toBe(1);
});

test('Should not sign up with short password', async () => {
  const variables = {
    data: {
      name: 'John Doe',
      email: 'John@gmail.com',
      password: 'short',
    },
  };

  await expect(
    client.mutate({ mutation: createUser, variables })
  ).rejects.toThrow('Password must be at least 8 characters long');
});

test('Should expose public author profiles', async () => {
  const { data } = await client.query({ query: getUsers });

  expect(data.users.length).toBe(2);
  expect(data.users[0].email).toBe(null);
  expect(data.users[0].name).toBe('Manu Kem');
});

test('Should not log in with bad credentials', async () => {
  const variables = {
    data: {
      email: 'manu@gmail.com',
      password: 'wrongPassword',
    },
  };
  await expect(client.mutate({ mutation: login, variables })).rejects.toThrow(
    'Invalid credentials'
  );
});

test('Should fetch user profile', async () => {
  const client = getClient(userOne.jwt);

  const { data } = await client.query({ query: getProfile });

  expect(data.me.id).toBe(userOne.user.id);
  expect(data.me.name).toBe(userOne.user.name);
  expect(data.me.email).toBe(userOne.user.email);
});
