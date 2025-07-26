import bcrypt from "bcrypt";

export const checkPassword = (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};
