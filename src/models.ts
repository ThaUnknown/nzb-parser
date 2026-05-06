export class Meta {
  title?: string
  passwords: string[]
  tags: string[]
  category?: string
  password?: string
  tag?: string

  constructor (data?: Partial<Meta>) {
    this.title = data?.title
    this.passwords = data?.passwords ?? []
    this.tags = data?.tags ?? []
    this.category = data?.category

    this.password = this.passwords[0]
    this.tag = this.tags[0]
  }
}

export class Segment {
  size: number
  number: number
  messageId: string

  constructor (size: number, number: number, messageId: string) {
    if (typeof size !== 'number') throw new SyntaxError('Invalid size')
    if (typeof number !== 'number') throw new SyntaxError('Invalid number')
    if (typeof messageId !== 'string') throw new SyntaxError('Invalid messageId')

    this.size = size
    this.number = number
    this.messageId = messageId
  }
}

export class FileMeta {
  poster: string
  datetime: Date
  subject: string
  groups: string[]
  segments: Segment[]
  size: number
  name: string

  constructor (data: { poster: string, datetime: Date, subject: string, groups: string[], segments: Segment[] }) {
    if (typeof data.poster !== 'string') throw new SyntaxError('Invalid poster')
    if (!(data.datetime instanceof Date)) throw new SyntaxError('Invalid datetime')
    if (typeof data.subject !== 'string') throw new SyntaxError('Invalid subject')
    if (!Array.isArray(data.groups)) throw new SyntaxError('Invalid groups')
    if (!Array.isArray(data.segments)) throw new SyntaxError('Invalid segments')

    this.poster = data.poster
    this.datetime = data.datetime
    this.subject = data.subject
    this.groups = data.groups
    this.segments = data.segments

    this.size = this.segments.reduce((sum, seg) => sum + seg.size, 0)

    this.name = (this.subject.match(/"([^"]*)"/) ?? this.subject.match(/\b([\w\-+()' .,]+(?:\[[\w\-/+()' .,]*][\w\-+()' .,]*)*\.[A-Za-z0-9]{2,4})\b/))?.[1]?.trim() ?? ''
  }
}

export class NZB {
  meta: Meta
  files: FileMeta[]
  file: FileMeta
  size: number
  names: string[]
  posters: string[]
  groups: string[]
  par2Size: number

  constructor (data: { meta?: Meta, files: FileMeta[] }) {
    this.meta = data.meta ?? new Meta()
    this.files = data.files

    // Determine main file (largest one)
    this.file = this.files.reduce((maxFile, file) => (file.size > maxFile.size ? file : maxFile))

    this.size = this.files.reduce((sum, file) => sum + file.size, 0)
    this.names = [...new Set(this.files.map(file => file.name))].sort()
    this.posters = [...new Set(this.files.map(file => file.poster))].sort()

    const groupsSet = new Set<string>()
    this.files.forEach(file => file.groups.forEach(group => groupsSet.add(group)))
    this.groups = [...groupsSet].sort()

    this.par2Size = this.files.filter(file => file.name.endsWith('.par2')).reduce((sum, file) => sum + file.size, 0)
  }
}
