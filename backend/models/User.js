// import mongoose from 'mongoose'

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true, trim: true },
//     email: { type: String, required: true, unique: true, lowercase: true, trim: true },
//     password: { type: String, required: true, select: false },
//     avatar: { type: String, default: '' },
//     passoutYear: { type: Number },
//     department: { type: String, default: '' },
//     bio: { type: String, default: '', maxlength: 500 },
//     /** IGIT-only: simple college email domain check can be added in controller */
//     collegeId: { type: String, default: 'IGIT' },
//     followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
//     following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
//     savedMemories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Memory' }],
//   },
//   { timestamps: true }
// )

// userSchema.index({ email: 1 })
// userSchema.index({ name: 'text', department: 'text' })

// export default mongoose.model('User', userSchema)


import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    avatar: { type: String, default: '' },
    passoutYear: { type: Number },
    department: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 500 },
    collegeId: { type: String, default: 'IGIT' },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    savedMemories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Memory' }],
  },
  { timestamps: true }
)

userSchema.index({ name: 'text', department: 'text' })

export default mongoose.model('User', userSchema)