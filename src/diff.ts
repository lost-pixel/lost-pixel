export type Files = {
  reference: string[];
  current: string[];
  difference: string[];
};

export type Changes = {
  difference: string[];
  deletion: string[];
  addition: string[];
};

export const getChanges = (files: Files): Changes => {
  return {
    difference: files.difference.sort(),
    deletion: files.reference
      .filter((file) => !files.current.includes(file))
      .sort(),
    addition: files.current
      .filter((file) => !files.reference.includes(file))
      .sort(),
  };
};
