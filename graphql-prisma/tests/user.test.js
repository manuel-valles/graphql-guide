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
