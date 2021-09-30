import { verify } from 'jsonwebtoken';

const getUserId = (request, requireAuth = true) => {
  const header = request.request.headers.authorization;

  if (header) {
    const token = header.replace('Bearer ', '');
    const { userId } = verify(token, process.env.JWT_SECRET);
    return userId;
  }

  if (requireAuth) throw new Error('Authentication required');
};

export { getUserId as default };
