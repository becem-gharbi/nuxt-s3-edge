import { readMultipartFormData, createError } from 'h3'
import { defineEventHandler, useRuntimeConfig } from '#imports'
import { normalizeKey, getKey } from '#s3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const key = getKey(event)

  const multipartFormData = await readMultipartFormData(event)

  const file = multipartFormData?.find(el => el.name === 'file')
  const meta = multipartFormData?.find(el => el.name === 'meta')

  if (file) {
    const normalizedKey = normalizeKey(key)

    verifyType(file.type, config.public.s3.accept)
    verifySize(file.data.length, config.public.s3.maxSizeMb)

    const s3Meta = meta && JSON.parse(meta.data.toString())

    await event.context.s3.setItemRaw(normalizedKey, file.data, { s3Meta })

    if (config.s3.driver === 'fs') {
      await event.context.s3.setMeta(normalizedKey, { s3Meta })
    }

    return { status: 'ok' }
  }

  throw createError('invalid-file')
})

function verifyType (type: string | undefined, accept: string) {
  const regex = new RegExp(accept)

  if (!type || !regex.test(type)) {
    throw createError({
      message: 'invalid-type',
      status: 400
    })
  }
}

function verifySize (size: number, maxSizeMb: number) {
  if (maxSizeMb && size > maxSizeMb * 1000000) {
    throw createError({
      message: 'invalid-size',
      status: 400
    })
  }
}
