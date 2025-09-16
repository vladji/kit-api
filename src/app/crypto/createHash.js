import bcrypt from "bcrypt";

const saltRounds = 10;

export const createHash = async (password) => {
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  console.log("hash", hash);
  return hash;
};

const pass = "88";
createHash(pass);
