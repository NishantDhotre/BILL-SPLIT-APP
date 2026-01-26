import { toPng } from 'html-to-image';

/**
 * Captures a DOM element by ID and returns a Blob.
 */
export const captureReceipt = async (elementId: string): Promise<Blob | null> => {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id ${elementId} not found`);
        return null;
    }

    console.log(`Attempting to capture element with ID: ${elementId}`);
    try {
        console.log('Starting html-to-image capture...');
        const dataUrl = await toPng(element, {
            backgroundColor: '#ffffff',
            pixelRatio: 2,
            cacheBust: true,
        });
        console.log('Data URL created successfully.');

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
export const shareImage = async (blob: Blob, fileName: string, title: string) => {
    // Check if Web Share API is supported and can share files
    if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [new File([blob], fileName, { type: blob.type })] })
    ) {
        try {
            const file = new File([blob], fileName, { type: blob.type });
            await navigator.share({
                title: title,
                text: 'Here is the bill split receipt! 🧾',
                files: [file],
            });
            return true; // Shared successfully
        } catch (error) {
            if ((error as DOMException).name !== 'AbortError') {
                console.error('Share failed:', error);
            }
            // If user likely cancelled, we don't necessarily need to fallback, but let's assume
            // if it failed for technical reasons, we fallback.
        }
    }



    // Fallback: Download
    console.log('Web Share API not available or failed. Falling back to download.');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log('Download triggered.');
    return false; // Downloaded
};
