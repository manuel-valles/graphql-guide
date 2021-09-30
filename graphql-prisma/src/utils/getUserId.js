import { verify } from 'jsonwebtoken';

const getUserId = (request) => {
  const header = request.request.headers.authorization;

  if (!header) throw new Error('Not authenticated.');

  const token = header.replace('Bearer ', '');
  const decoded = verify(token, process.env.JWT_SECRET);

  return decoded.userId;
};

export { getUserId as default };
