import 'cross-fetch/polyfill';
import { gql } from 'apollo-boost';
import getClient from './utils/getClient';
import seedDatabase, { userOne, postOne, postTwo } from './utils/seedDatabase';
import prisma from '../src/prisma';

const client = getClient();

beforeEach(seedDatabase);

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

test('Should fetch users posts', async () => {
  const client = getClient(userOne.jwt);

  const myPosts = gql`
    query {
      myPosts {
        id
        title
        body
        published
      }
    }
  `;

  const { data } = await client.query({ query: myPosts });

  expect(data.myPosts.length).toBe(2);
});

test('Should create a new post', async () => {
  const client = getClient(userOne.jwt);

  const createPost = gql`
    mutation {
      createPost(
        data: {
          title: "Third Post"
          body: "This is the third post"
          published: true
        }
      ) {
        id
        title
        body
        published
      }
    }
  `;

  const { data } = await client.mutate({ mutation: createPost });

  expect(data.createPost.title).toBe('Third Post');
  expect(data.createPost.body).toBe('This is the third post');
  expect(data.createPost.published).toBe(true);
});

test('Should be able to update own post', async () => {
  const client = getClient(userOne.jwt);

  const updatePost = gql`
    mutation {
      updatePost(
        id: ${postOne.post.id},
        data: { title: "Updated Title", body: "Updated Body", published: false }
      ) {
        id
        title
        body
        published
      }
    }
  `;

  const { data } = await client.mutate({ mutation: updatePost });

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

  const deletePost = gql`
    mutation {
      deletePost(id: ${postTwo.post.id}) {
        id
      }
    }
  `;

  await client.mutate({ mutation: deletePost });

  const postExists = await prisma.post.count({
    where: {
      id: postTwo.post.id,
    },
  });

  expect(postExists).toBe(0);
});
