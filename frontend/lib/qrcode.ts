import QRCode from 'qrcode';

/**
 * Generate Data URL string for QR Code (e.g. data:image/png;base64,...)
 */
export async function generateQRCodeDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('QR Code Generation Error:', err);
    throw new Error('Failed to generate QR code');
  }
}
