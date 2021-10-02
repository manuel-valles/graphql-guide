import 'cross-fetch/polyfill';
import ApolloClient, { gql } from 'apollo-boost';
import prisma from '../src/prisma';
import hashPassword from '../src/utils/hashPassword';

const port = process.env.PORT || 4000;

const client = new ApolloClient({
  uri: `http://localhost:${port}`,
});

beforeEach(async () => {
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
  const user = await prisma.user.create({
    data: {
      name: 'Manu Kem',
      email: 'manu@gmail.com',
      password: await hashPassword('manuSuperSecret'),
    },
  });
  await prisma.post.createMany({
    data: [
      {
        title: 'First Post',
        body: 'This is the first post',
        published: true,
        authorId: user.id,
      },
      {
        title: 'Second Post',
        body: 'This is the second post',
        published: false,
        authorId: user.id,
      },
    ],
  });
});

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

test('Should expose published posts', async () => {
  const getPosts = gql`
    query {
      posts {
        id
        title
        body
        published
      }
    }
  `;

  const { data } = await client.query({ query: getPosts });

  expect(data.posts.length).toBe(1);
  expect(data.posts[0].title).toBe('First Post');
  expect(data.posts[0].body).toBe('This is the first post');
  expect(data.posts[0].published).toBe(true);
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
