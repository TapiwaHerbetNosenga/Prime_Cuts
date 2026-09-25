export const services = [
  {
    id: 'classic-cut',
    name: 'Classic Haircut',
    category: 'Haircuts',
    price: 180,
    duration: 30,
    description: 'Scissor and clipper cut, finished with a neck shave and styling.',
  },
  {
    id: 'skin-fade',
    name: 'Skin Fade',
    category: 'Haircuts',
    price: 220,
    duration: 45,
    description: 'A clean fade blended down to the skin, with a sharp edge-up.',
  },
  {
    id: 'line-up',
    name: 'Line-up',
    category: 'Haircuts',
    price: 80,
    duration: 15,
    description: 'Crisp edges around the hairline, temples and neckline.',
  },
  {
    id: 'beard-trim',
    name: 'Beard Trim and Shape',
    category: 'Beard and Shave',
    price: 120,
    duration: 20,
    description: 'Trim, shape and define the beard line, with a hot towel finish.',
  },
  {
    id: 'hot-towel-shave',
    name: 'Hot Towel Shave',
    category: 'Beard and Shave',
    price: 200,
    duration: 40,
    description: 'A traditional razor shave with hot towels and aftershave balm.',
  },
  {
    id: 'cut-and-beard',
    name: 'Cut and Beard Combo',
    category: 'Packages',
    price: 280,
    duration: 60,
    description: 'A classic haircut and a beard trim in one appointment.',
  },
  {
    id: 'full-treatment',
    name: 'The Full Treatment',
    category: 'Packages',
    price: 380,
    duration: 90,
    description: 'Haircut, beard trim and a hot towel shave, start to finish.',
  },
  {
    id: 'kids-cut',
    name: 'Kids Cut (under 12)',
    category: 'Kids',
    price: 130,
    duration: 30,
    description: 'A patient, neat haircut for younger clients.',
  },
]

export const serviceCategories = [...new Set(services.map((s) => s.category))]

export const formatPrice = (amount) => `R${amount}`

export const formatDuration = (minutes) => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (!h) return `${m} min`
  return m ? `${h} h ${m} min` : `${h} h`
}