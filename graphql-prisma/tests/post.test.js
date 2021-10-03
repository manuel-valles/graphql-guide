import 'cross-fetch/polyfill';
import getClient from './utils/getClient';
import seedDatabase, { userOne, postOne, postTwo } from './utils/seedDatabase';
import prisma from '../src/prisma';
import {
  getPosts,
  myPosts,
  createPost,
  updatePost,
  deletePost,
} from './utils/operations';

const client = getClient();

beforeEach(seedDatabase);

test('Should expose published posts', async () => {
  const { data } = await client.query({ query: getPosts });

  expect(data.posts.length).toBe(1);
  expect(data.posts[0].title).toBe('First Post');
  expect(data.posts[0].body).toBe('This is the first post');
  expect(data.posts[0].published).toBe(true);
});

test('Should fetch users posts', async () => {
  const client = getClient(userOne.jwt);

  const { data } = await client.query({ query: myPosts });

  expect(data.myPosts.length).toBe(2);
});

test('Should create a new post', async () => {
  const client = getClient(userOne.jwt);

  const variables = {
    data: {
      title: 'Third Post',
      body: 'This is the third post',
      published: true,
    },
  };

  const { data } = await client.mutate({ mutation: createPost, variables });

  expect(data.createPost.title).toBe('Third Post');
  expect(data.createPost.body).toBe('This is the third post');
  expect(data.createPost.published).toBe(true);
});

test('Should be able to update own post', async () => {
  const client = getClient(userOne.jwt);

  const variables = {
    id: postOne.post.id,
    data: {
      title: 'Updated Title',
      body: 'Updated Body',
      published: false,
    },
  };

  const { data } = await client.mutate({ mutation: updatePost, variables });

  const postExists = await prisma.post.count({
    where: {
      id: postOne.post.id,
      published: false,
    },
  });

  expect(data.updatePost.title).toBe('Updated Title');
  expect(data.updatePost.body).toBe('Updated Body');
  expect(data.updatePost.published).toBe(false);
  expect(postExists).toBe(1);
});

test('Should be able to delete own post', async () => {
  const client = getClient(userOne.jwt);

  const variables = {
    id: postTwo.post.id,
  };

  await client.mutate({ mutation: deletePost, variables });

  const postExists = await prisma.post.count({
    where: {
      id: postTwo.post.id,
    },
  });

  expect(postExists).toBe(0);
});
