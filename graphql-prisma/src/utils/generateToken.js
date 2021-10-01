import { sign } from 'jsonwebtoken';

const generateToken = (userId) =>
  sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

export { generateToken as default };
