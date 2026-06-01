import path from 'node:path';

export const resolveProjectPath = (value: string) => {
  if (path.isAbsolute(value)) {
    return value;
  }

  return path.resolve(process.cwd(), value);
};
