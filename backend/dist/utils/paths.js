import path from 'node:path';
export const resolveProjectPath = (value) => {
    if (path.isAbsolute(value)) {
        return value;
    }
    return path.resolve(process.cwd(), value);
};
//# sourceMappingURL=paths.js.map