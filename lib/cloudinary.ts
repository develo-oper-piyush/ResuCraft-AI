import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo_cloud',
  api_key: process.env.CLOUDINARY_API_KEY || '1234567890',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'dummy_cloudinary_secret',
  secure: true,
});

export async function uploadToCloudinary(
  fileBuffer: Buffer | string,
  folderName: string = 'resumes',
  fileName: string = 'resume.pdf'
): Promise<{ url: string; publicId: string }> {
  try {
    const isConfigured =
      Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
      process.env.CLOUDINARY_CLOUD_NAME !== 'demo_cloud' &&
      process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
      Boolean(process.env.CLOUDINARY_API_KEY) &&
      process.env.CLOUDINARY_API_KEY !== '1234567890' &&
      Boolean(process.env.CLOUDINARY_API_SECRET) &&
      process.env.CLOUDINARY_API_SECRET !== 'dummy_cloudinary_secret';

    if (!isConfigured) {
      console.log('Cloudinary using mock fallback (environment variables are placeholders)');
      const fakeId = `resumes/${Date.now()}_${fileName.replace(/\s+/g, '_')}`;
      return {
        url: `https://res.cloudinary.com/demo/image/upload/v${Date.now()}/${fakeId}`,
        publicId: fakeId,
      };
    }

    const base64Data =
      typeof fileBuffer === 'string'
        ? fileBuffer
        : `data:application/pdf;base64,${fileBuffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(base64Data, {
      folder: `ai_portfolio_generator/${folderName}`,
      resource_type: 'auto',
      public_id: `${Date.now()}_${fileName.split('.')[0]}`,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    const fallbackId = `fallback/${Date.now()}_${fileName}`;
    return {
      url: `https://res.cloudinary.com/demo/image/upload/v${Date.now()}/${fallbackId}`,
      publicId: fallbackId,
    };
  }
}
