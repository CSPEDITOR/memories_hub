import mongoose from 'mongoose'

const storySchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mediaUrl: { type: String, required: true },
    mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
    caption: { type: String, default: '' },
    /** Optional background music URL (user-provided link or uploaded) */
    musicUrl: { type: String, default: '' },
    expiresAt: { type: Date, required: true },
    views: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
)

storySchema.index({ expiresAt: 1 })
storySchema.index({ author: 1, createdAt: -1 })

export default mongoose.model('Story', storySchema)
