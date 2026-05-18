import { OLD_MEMORY_MS } from './constants.js'

/** True if the captured moment was long ago — triggers nostalgic B&W treatment */
export function isOldMemory(memoryDate) {
  if (!memoryDate) return false
  return Date.now() - new Date(memoryDate).getTime() > OLD_MEMORY_MS
}
