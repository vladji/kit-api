import bcrypt from "bcrypt";

const saltRounds = 10;

export const createHash = async (password: string) => {
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(password, salt);
};

export const checkPassword = (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

// const pass = "simple-test";
// createHash(pass);
