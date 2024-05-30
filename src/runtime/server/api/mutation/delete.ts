import { defineEventHandler } from 'h3'
import { getKey, normalizeKey } from '../../utils'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useStorage } from '#imports'

export default defineEventHandler(async (event) => {
  const key = getKey(event)

  const normalizedKey = normalizeKey(key)

  await useStorage('s3').removeItem(normalizedKey, { removeMeta: true })

  return { status: 'ok' }
})
