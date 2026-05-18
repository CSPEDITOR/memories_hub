/** Dashboard filter pills → API category / client tag matching */

export const DASHBOARD_FILTERS = [
  'All',
  'Farewell',
  'Freshers',
  'Hostel Life',
  'Trips',
  'Festivals',
  'Friends',
  'Sports',
  'Classroom',
  'Group Photos',
  'Person Images',
  'Place Images',
  'Funny Moments',
  'Emotional Moments',
]

const CATEGORY_MAP = {
  Farewell: 'Farewell',
  Freshers: 'Freshers',
  'Hostel Life': 'Hostel Life',
  Trips: 'Trips',
  Festivals: 'Festival Celebrations',
  Friends: 'Friendship Memories',
  Sports: 'Sports',
  Classroom: 'Classroom Moments',
  'Funny Moments': 'Funny Memories',
  'Emotional Moments': 'Emotional Memories',
}

const TAG_MAP = {
  'Group Photos': 'group',
  'Person Images': 'person',
  'Place Images': 'place',
}

export function getFilterQuery(label) {
  if (!label || label === 'All') return { category: undefined, tag: undefined }
  if (CATEGORY_MAP[label]) return { category: CATEGORY_MAP[label], tag: undefined }
  if (TAG_MAP[label]) return { category: undefined, tag: TAG_MAP[label] }
  return { category: undefined, tag: undefined }
}
