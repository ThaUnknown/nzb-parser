import { equal, rejects, throws } from 'node:assert'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import test, { describe } from 'node:test'

import { InvalidNZBError } from '../src/exceptions.ts'
import parse from '../src/index.ts'

const nzbs = './test/files/'

const invalidXml = `
<?xml version="1.0" encoding="iso-8859-1" ?>
<!DOCTYPE nzb PUBLIC "-//newzBin//DTD NZB 1.1//EN" "http://www.newzbin.com/DTD/nzb/nzb-1.1.dtd">
<nzb xmlns="http://www.newzbin.com/DTD/2003/nzb">
    <head>
        <meta type="title">Your File!</meta>
        <meta type="password">secret</meta>
        <meta type="tag">HD</meta>
        <meta type="category">TV</meta>
    </head>
    <file poster="Joe Bloggs &lt;bloggs@nowhere.example&gt;" date="1071674882" subject="Here's your file!  abc-mr2a.r01 (1/2)">
        <groups>
            <group>alt.binaries.newzbin</group>
            <group>alt.binaries.mojo</group>
        </groups>
        <segments>
            <segment bytes="102394" number="1">123456789abcdef@news.newzbin.com</segment>
            <segment bytes="4501" number="2">987654321fedbca@news.newzbin.com</segment>
        </segments>
    </file>
`

const validXmlButInvalidNzb = `
<?xml version="1.0" encoding="iso-8859-1" ?>
<!DOCTYPE nzb PUBLIC "-//newzBin//DTD NZB 1.1//EN" "http://www.newzbin.com/DTD/nzb/nzb-1.1.dtd">
<nzb xmlns="http://www.newzbin.com/DTD/2003/nzb">
    <head>
        <meta type="title">Your File!</meta>
    </head>
    <file poster="Joe Bloggs &lt;bloggs@nowhere.example&gt;" date="1071674882" subject="Here's your file!  abc-mr2a.r01 (1/2)">
        <groups>
            <group>alt.binaries.newzbin</group>
            <group>alt.binaries.mojo</group>
        </groups>
    </file>
</nzb>`

describe('NZB Tests', () => {
  test('invalid nzb error', () => {
    const message = 'Missing something in the NZB'
    const error = new InvalidNZBError(message)
    equal(error.message, message)
    equal('' + error.toString(), 'InvalidNZBError: Missing something in the NZB')
  })

  test('parsing invalid nzb', () => {
    throws(() => {
      parse(invalidXml)
    }, { name: 'InvalidNZBError' })

    throws(() => {
      parse(validXmlButInvalidNzb)
    }, { name: 'InvalidNZBError' })
  })

  test('parser exceptions', async () => {
    await rejects(async () => {
      const file = await readFile(join(nzbs, 'malformed_files.nzb'))
      parse(file.toString())
    }, { name: 'InvalidNZBError' })

    await rejects(async () => {
      const file = await readFile(join(nzbs, 'malformed_files2.nzb'))
      parse(file.toString())
    }, { name: 'InvalidNZBError' })

    await rejects(async () => {
      const file = await readFile(join(nzbs, 'malformed_groups.nzb'))
      parse(file.toString())
    }, { name: 'InvalidNZBError' })

    await rejects(async () => {
      const file = await readFile(join(nzbs, 'malformed_segments.nzb'))
      parse(file.toString())
    }, { name: 'InvalidNZBError' })
  })
})
