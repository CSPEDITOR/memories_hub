import mongoose from 'mongoose'

const memorySchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    /** Multiple Cloudinary URLs */
    images: [{ type: String, required: true }],
    cloudinaryIds: [{ type: String }],
    tags: [{ type: String, trim: true }],
    /** When the moment actually happened */
    memoryDate: { type: Date, required: true },
    eventCategory: { type: String, required: true, trim: true },
    location: { type: String, default: '' },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likesCount: { type: Number, default: 0 },
    saves: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

memorySchema.index({ createdAt: -1 })
memorySchema.index({ likesCount: -1, createdAt: -1 })
memorySchema.index({ eventCategory: 1 })
memorySchema.index({ title: 'text', description: 'text', tags: 'text' })

export default mongoose.model('Memory', memorySchema)
