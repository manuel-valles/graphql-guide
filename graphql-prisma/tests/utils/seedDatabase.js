import { hashSync } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import prisma from '../../src/prisma';

const userOne = {
  input: {
    name: 'Manu Kem',
    email: 'manu@gmail.com',
    password: hashSync('superSecret', 10),
  },
  user: undefined,
  jwt: undefined,
};

const postOne = {
  input: {
    title: 'First Post',
    body: 'This is the first post',
    published: true,
  },
  post: undefined,
};

const postTwo = {
  input: {
    title: 'Second Post',
    body: 'This is the second post',
    published: false,
  },
  post: undefined,
};

const seedDatabase = async () => {
  // Delete test data
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Create user one
  userOne.user = await prisma.user.create({
    data: userOne.input,
  });

  userOne.jwt = sign(
    {
      userId: userOne.user.id,
    },
    process.env.JWT_SECRET
  );

  // Create post one
  postOne.post = await prisma.post.create({
    data: {
      ...postOne.input,
      authorId: userOne.user.id,
    },
  });

  // Create post two
  postTwo.post = await prisma.post.create({
    data: {
      ...postTwo.input,
      authorId: userOne.user.id,
    },
  });
};

export { seedDatabase as default, userOne, postOne, postTwo };
