import jwt, { SignOptions } from 'jsonwebtoken';
import Vars from '../config/var.js';

function decode(token: string): any {
  let payload;
  try {
    payload = jwt.verify(token, Vars.jwtSecret);
  } catch {
    payload = null;
  }
  return payload;
}

function encode(payload: any, options: SignOptions): string {
  return jwt.sign(payload, Vars.jwtSecret, options as SignOptions);
}

export default {
  encode,
  decode,
};
