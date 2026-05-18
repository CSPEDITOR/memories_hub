import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema(
  {
    memory: { type: mongoose.Schema.Types.ObjectId, ref: 'Memory', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
)

commentSchema.index({ memory: 1, createdAt: -1 })

export default mongoose.model('Comment', commentSchema)
