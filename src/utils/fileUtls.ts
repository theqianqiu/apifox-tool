import { exists, removeFile, writeTextFile, BaseDirectory } from '@tauri-apps/api/fs';

const saveTextFile = async (filePath: string, content: string) => {
    console.log('saveTextFile: ', filePath);
    const isExist = await exists(filePath, { dir: BaseDirectory.AppData });

    if (isExist) await removeFile(filePath, { dir: BaseDirectory.AppConfig });

    await writeTextFile(filePath, content, { dir: BaseDirectory.AppConfig });
};

export const FilerUtils = {
    saveTextFile,
};
