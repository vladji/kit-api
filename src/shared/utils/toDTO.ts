import { Types } from "mongoose";

export interface CommonDTOProps {
  _id: Types.ObjectId;
  __v?: unknown;
}

export function toDTO<T extends CommonDTOProps>(
  doc: T
): Omit<T, "_id" | "__v"> & { id: string } {
  const { _id, __v, ...rest } = doc;
  return {
    ...rest,
    id: _id.toString(),
  };
}

export function toDTOs<T extends CommonDTOProps>(
  docs: T[]
): (Omit<T, "_id" | "__v"> & { id: string })[] {
  return docs.map(toDTO);
}
