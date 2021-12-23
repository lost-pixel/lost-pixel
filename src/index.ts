import fs from 'fs';

const diffFolders = (path1: string, path2: string): string[] => {
  const files1 = fs.readdirSync(path1);
  const files2 = fs.readdirSync(path2);

  const diff = files1.filter((file) => !files2.includes(file));

  return diff;
};
