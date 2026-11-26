import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

export async function verifyAndUpdate() {
  try {
    const update = await check();

    if (!update) return;

    await update.downloadAndInstall((event) => {
      switch (event.event) {
        case 'Started':
          console.log(`Starting: ${event.data.contentLength ?? 0} bytes`);
          break;
        case 'Progress':
          console.log(`Receive: ${event.data.chunkLength} bytes`);
          break;
        case 'Finished':
          console.log('The update has been finished.');
          break;
      }
    });
  
    await relaunch();
  } catch (error) {
    console.warn('Update check skipped or failed:', error);
  }
}