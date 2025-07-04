import { StoreDocument, UserModel } from "../user.model";

type CreateUser = ({
  uniqueId,
}: {
  uniqueId: string;
}) => Promise<StoreDocument>;

export const createUser: CreateUser = async ({ uniqueId }) => {
  return await UserModel.create({ uniqueId });
};
