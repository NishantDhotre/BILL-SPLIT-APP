/**
 * Captures a DOM element by ID and returns a Blob.
 */
export const captureReceipt = async (elementId: string): Promise<Blob | null> => {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id ${elementId} not found`);
        return null;
    }

    try {
        const { toPng } = await import('html-to-image');

        const dataUrl = await toPng(element, {
            backgroundColor: '#ffffff',
            pixelRatio: 2,
            cacheBust: true,
        });

        // Convert Data URL to Blob
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        return blob;

    } catch (error) {
        console.error('Capture failed:', error);
        return null;
    }
};

/**
 * Shares a Blob via Web Share API or downloads it as fallback.
 */
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

/**
 * Helper: Convert Blob to Base64 string
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            // Remove the data URL prefix (e.g., "data:image/png;base64,")
            resolve(base64String.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

/**
 * Shares a Blob via Web Share API (Web) or Capacitor Share (Native).
 */
export const shareImage = async (blob: Blob, fileName: string, title: string) => {
    try {
        // 1. Native Mobile Sharing (Capacitor)
        if (Capacitor.isNativePlatform()) {
            const base64Data = await blobToBase64(blob);

            // Write file to Cache directory
            const savedFile = await Filesystem.writeFile({
                path: fileName,
                data: base64Data,
                directory: Directory.Cache,
            });

            // Share the file URI
            await Share.share({
                title: title,
                text: 'Here is the bill split receipt!',
                files: [savedFile.uri],
            });
            return true;
        }

        // 2. Web Share API (Desktop/Mobile Web)
        if (
            navigator.share &&
            navigator.canShare &&
            navigator.canShare({ files: [new File([blob], fileName, { type: blob.type })] })
        ) {
            const file = new File([blob], fileName, { type: blob.type });
            await navigator.share({
                title: title,
                text: 'Here is the bill split receipt!',
                files: [file],
            });
            return true;
        }
    } catch (error) {
        if (error instanceof Error && error.message !== 'Share canceled') {
            console.error('Share failed:', error);
        }
    }

    // 3. Fallback: Download (Classic Web)
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return false;
};
