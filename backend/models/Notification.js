import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: ['like', 'comment', 'follow', 'story_view', 'mention', 'system'],
      required: true,
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    memory: { type: mongoose.Schema.Types.ObjectId, ref: 'Memory' },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
)

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 })

export default mongoose.model('Notification', notificationSchema)
