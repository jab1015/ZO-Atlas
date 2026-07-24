export const useDocuments = () => ({ docs: [], loading: false, uploadFiles: async () => undefined, rename: async () => undefined, move: async () => undefined, duplicate: async () => undefined, setArchived: async () => undefined, remove: async () => undefined, addVersion: async () => undefined, restoreVersion: async () => undefined, setAiMeta: async () => undefined });
export const DOC_FOLDERS: string[] = [];
export const ACCEPT_EXTS = "*/*";
export const formatSize = (bytes: number) => `${bytes} bytes`;
export const readFileText = async () => "";
export const docPublicUrl = () => "";
export const isImageExt = () => false;
export const isTextExt = () => false;
