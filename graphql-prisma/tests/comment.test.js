import 'cross-fetch/polyfill';
import getClient from './utils/getClient';
import seedDatabase, {
  userOne,
  commentOne,
  commentTwo,
} from './utils/seedDatabase';
import { deleteComment } from './utils/operations';
import prisma from '../src/prisma';

const client = getClient();

beforeEach(seedDatabase);

test('Should be able to delete own comment', async () => {
  const client = getClient(userOne.jwt);

  const variables = {
    id: commentOne.comment.id,
  };

  await client.mutate({ mutation: deleteComment, variables });

  const commentExists = await prisma.comment.count({
    where: {
      id: commentOne.comment.id,
    },
  });

  expect(commentExists).toBe(0);
});

test('Should not be able to delete other users comment', async () => {
  const client = getClient(userOne.jwt);

  const variables = {
    id: commentTwo.comment.id,
  };

  await expect(
    client.mutate({ mutation: deleteComment, variables })
  ).rejects.toThrow('Unable to delete comment');
});
