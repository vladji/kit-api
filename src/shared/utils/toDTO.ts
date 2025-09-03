export function toDTO<T extends { _id: any; __v?: any }>(
  doc: T
): Omit<T, "_id" | "__v"> & { id: string } {
  const { _id, __v, ...rest } = doc;
  return {
    ...rest,
    id: _id.toString(),
  };
}

export function toDTOs<T extends { _id: any; __v?: any }>(
  docs: T[]
): (Omit<T, "_id" | "__v"> & { id: string })[] {
  return docs.map(toDTO);
}
