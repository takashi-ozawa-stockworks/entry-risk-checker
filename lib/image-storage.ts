import { set, get, del } from "idb-keyval";

export const saveImage = async (file: File): Promise<string> => {
  const id = `trade_image_${Date.now()}_${crypto.randomUUID()}`;
  await set(id, file);
  return id;
};

export const getImage = async (id: string): Promise<Blob | undefined> => {
  return await get(id);
};

export const deleteImage = async (id: string): Promise<void> => {
  await del(id);
};
