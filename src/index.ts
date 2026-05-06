/* eslint-disable @typescript-eslint/no-explicit-any */
import { XMLParser, XMLValidator } from 'fast-xml-parser'

import { InvalidNZBError } from './exceptions.ts'
import { NZB, FileMeta, Meta, Segment } from './models.ts'

const parser = new XMLParser({ ignoreAttributes: false })

export default function parse (string: string): NZB {
  try {
    const valid = XMLValidator.validate(string)
    if (valid !== true) throw new SyntaxError('Invalid XML')
    const nzbdict = parser.parse(string)
    const meta = parseMetadata(nzbdict)
    const files = parseFiles(nzbdict)
    return new NZB({ meta, files })
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new InvalidNZBError(error.message)
    } else {
      throw error
    }
  }
}

type MetaFieldType = Array<Record<string, string>> | Record<string, string> | undefined
type FileFieldType = Array<Record<string, any>> | Record<string, any> | undefined
type GroupFieldType = string[] | string | undefined

function parseMetadata (nzb: Record<string, any>): Meta {
  let meta: MetaFieldType = nzb?.nzb?.head?.meta
  if (!meta) return new Meta()

  if (!Array.isArray(meta)) meta = [meta]

  const passwords = new Set<string>()
  const tags = new Set<string>()
  let title: string | undefined
  let category: string | undefined

  for (const item of meta) {
    const type = item['@_type']?.toLowerCase()
    const text = item['#text']

    if (type === 'title') {
      title = text
    } else if (type === 'password') {
      if (text) passwords.add(text)
    } else if (type === 'tag') {
      if (text) tags.add(text.trim())
    } else if (type === 'category') {
      category = text
    }
  }

  return new Meta({
    title,
    passwords: [...passwords],
    tags: [...tags],
    category
  })
}

function parseSegments (segmentdict: Record<string, any> | null): Segment[] {
  const segments = segmentdict?.segment

  if (!segments) {
    throw new SyntaxError('Missing or malformed <segments>...</segments>!')
  }

  const segmentList = Array.isArray(segments) ? segments : [segments]
  const segmentset: Segment[] = []

  for (const segment of segmentList) {
    const size = segment['@_bytes']
    const number = segment['@_number']
    const messageId = segment['#text']

    if (size && number && messageId) {
      segmentset.push(new Segment(parseInt(size), parseInt(number), messageId))
    }
  }

  return segmentset.sort((a, b) => a.number - b.number)
}

function parseFiles (nzb: Record<string, any>): FileMeta[] {
  const fileTags = nzb?.nzb?.file as FileFieldType

  if (fileTags === null || fileTags === undefined) {
    throw new SyntaxError('Missing or malformed <file>...</file>!')
  }

  const files: FileMeta[] = []

  for (const file of Array.isArray(fileTags) ? fileTags : [fileTags]) {
    const groupSet = new Set<string>()
    const groups = file.groups?.group as GroupFieldType
    if (groups === null || groups === undefined) {
      throw new SyntaxError('Missing or malformed <groups>...</groups>!')
    }
    if (typeof groups === 'string') {
      groupSet.add(groups)
    } else {
      groups.forEach(group => groupSet.add(group))
    }
    files.push(
      new FileMeta({
        poster: file['@_poster'],
        datetime: new Date(file['@_date'] * 1000),
        subject: file['@_subject'],
        groups: [...groupSet].sort(),
        segments: parseSegments(file.segments)
      })
    )
  }

  return files.sort((a, b) => a.subject.localeCompare(b.subject))
}
