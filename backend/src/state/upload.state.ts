let lastUploadedFilePath: string | null = null;

export function setUploadedFilePath(path: string) {
    lastUploadedFilePath = path;
}

export function getUploadedFilePath() {
    return lastUploadedFilePath;
}