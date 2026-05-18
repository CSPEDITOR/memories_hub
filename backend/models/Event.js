import mongoose from 'mongoose'

/**
 * Optional featured college events (beyond category filters on memories).
 */
const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    category: { type: String, required: true },
    description: { type: String, default: '' },
    date: { type: Date },
    coverImage: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

export default mongoose.model('Event', eventSchema)
