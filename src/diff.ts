export const diffFolders = (files1: string[], files2: string[]): string[] => {
  const diff = files1.filter((file) => !files2.includes(file));

  return diff;
};
