import { cloudinary } from '../config/cloudinary.js'

/**
 * Uploads a buffer to Cloudinary under folder `igit-memories`.
 * @returns {{ url: string, public_id: string }}
 */
export function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'igit-memories',
        resource_type: 'image',
        ...options,
      },
      (err, result) => {
        if (err) return reject(err)
        resolve({ url: result.secure_url, public_id: result.public_id })
      }
    )
    uploadStream.end(buffer)
  })
}
