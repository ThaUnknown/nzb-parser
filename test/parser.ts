import { deepEqual, equal } from 'node:assert'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import test, { describe } from 'node:test'

import parse from '../src/index.ts'
import { FileMeta, Segment } from '../src/models.ts'

const nzbs = './test/files/'

describe('NZB Tests', () => {
  test('test_spec_example_nzb', async () => {
    const file = await readFile(join(nzbs, 'spec_example.nzb'))
    const nzb = parse(file.toString())
    equal(nzb.meta.title, 'Your File!')
    deepEqual(nzb.meta.passwords, ['secret'])
    deepEqual(nzb.meta.tags, ['HD'])
    equal(nzb.meta.password, 'secret')
    equal(nzb.meta.tag, 'HD')
    equal(nzb.meta.category, 'TV')
    equal(nzb.files.length, 1)
    equal(nzb.file.name, 'abc-mr2a.r01')
    equal(nzb.size, 106895)
    equal(nzb.files[0]!.segments.length, 2)
    deepEqual(new Set(nzb.files[0]!.segments), new Set([
      new Segment(102394, 1, '123456789abcdef@news.newzbin.com'),
      new Segment(4501, 2, '987654321fedbca@news.newzbin.com')
    ]))
    deepEqual(new Set(nzb.files[0]!.groups), new Set(['alt.binaries.mojo', 'alt.binaries.newzbin']))
  })

  test('test_big_buck_bunny', async () => {
    const file = await readFile(join(nzbs, 'big_buck_bunny.nzb'))
    const nzb = parse(file.toString())

    equal(nzb.meta.title, null)
    deepEqual(nzb.meta.passwords, [])
    deepEqual(nzb.meta.tags, [])
    equal(nzb.meta.password, null)
    equal(nzb.meta.tag, null)
    equal(nzb.meta.category, null)
    equal(nzb.files.length, 5)
    equal(nzb.file.name, 'Big Buck Bunny - S01E01.mkv')
    equal(nzb.size, 22704889)
    deepEqual(new Set(nzb.names), new Set([
      'Big Buck Bunny - S01E01.mkv.vol03+04.par2',
      'Big Buck Bunny - S01E01.mkv.vol01+02.par2',
      'Big Buck Bunny - S01E01.mkv.par2',
      'Big Buck Bunny - S01E01.mkv',
      'Big Buck Bunny - S01E01.mkv.vol00+01.par2'
    ]))
    deepEqual(new Set(nzb.posters), new Set(['John <nzb@nowhere.example>']))
    deepEqual(new Set(nzb.groups), new Set(['alt.binaries.boneless']))
    equal(nzb.par2Size, 5183128)
    deepEqual(nzb.file, new FileMeta({
      poster: 'John <nzb@nowhere.example>',
      datetime: new Date(Date.UTC(2024, 0, 28, 11, 18, 28)),
      subject: '[1/5] - "Big Buck Bunny - S01E01.mkv" yEnc (1/24) 16981056',
      groups: ['alt.binaries.boneless'],
      segments: [
        new Segment(739067, 1, '9cacde4c986547369becbf97003fb2c5-9483514693959@example'),
        new Segment(739549, 2, '70a3a038ce324e618e2751e063d6a036-7285710986748@example'),
        new Segment(739728, 3, 'a209875cefd44440aa91590508b48f5b-4625756912881@example'),
        new Segment(739664, 4, '44057720ed4e45e4bce21d53249d03f8-8250738040266@example'),
        new Segment(739645, 5, 'cfc13d14583c484483aa49ac420bad27-9491395432062@example'),
        new Segment(739538, 6, '5e90857531be401e9d0b632221fe2fb7-9854527985639@example'),
        new Segment(739708, 7, 'c33a2bba79494840a09d750b19d3b287-2550637855678@example'),
        new Segment(739490, 8, '38006019d94f4ecc8f19c389c00f1ebe-7841585708380@example'),
        new Segment(739667, 9, 'b75a2425bef24fd5affb00dc3db789f6-7051027232703@example'),
        new Segment(739540, 10, '79a027e3bfde458ea2bd0db1632fc84e-7270120407913@example'),
        new Segment(739657, 11, 'fb2bd74e1257487a9240ef0cf81765cc-7147741101314@example'),
        new Segment(739647, 12, 'd39ca8be78c34e3fa6f3211f1b397b3a-4725950858191@example'),
        new Segment(739668, 13, 'a4c15599055848dda1eff3b6b406fa78-8111735210252@example'),
        new Segment(739721, 14, '2f1cec363ed24584b4127af86ac312ad-7204153818612@example'),
        new Segment(739740, 15, '30ff3514896543a8ac91ec80346a5d40-9134304686352@example'),
        new Segment(739538, 16, '1f75cfa20d884b5b972cfd2e9ebef249-8919850122587@example'),
        new Segment(739646, 17, '8e22b0f973de4393a0a30ab094565316-6722799721412@example'),
        new Segment(739610, 18, 'faddf83650cc4de1a8bee68cffca40a1-5979589815618@example'),
        new Segment(739514, 19, '6b8c23e43d4240da812b547babdc0423-6409257710918@example'),
        new Segment(739920, 20, '802bd0dcef134ac690044e0a09fece60-8492061912475@example'),
        new Segment(739634, 21, 'efc4b3966a1f4b7787677e9e9a214727-5444471572012@example'),
        new Segment(739691, 22, '247efca709114fd181bcaef0f487925f-4076317880026@example'),
        new Segment(739638, 23, '665d9fc5edba4faca68ae835b702b4c7-9814601723860@example'),
        new Segment(510541, 24, '962fddf3e07444988731b52aeaa9b2aa-1283919353788@example')
      ]
    }))
  })

  test('test_valid_nzb_with_one_missing_segment', async () => {
    const file = await readFile(join(nzbs, 'valid_nzb_with_one_missing_segment.nzb'))
    const nzb = parse(file.toString())

    deepEqual(nzb.file, new FileMeta({
      poster: 'John <nzb@nowhere.example>',
      datetime: new Date(Date.UTC(2024, 0, 28, 11, 18, 28)),
      subject: '[1/5] - "Big Buck Bunny - S01E01.mkv" yEnc (1/24) 16981056',
      groups: ['alt.binaries.boneless'],
      segments: [
        new Segment(739067, 1, '9cacde4c986547369becbf97003fb2c5-9483514693959@example'),
        new Segment(739549, 2, '70a3a038ce324e618e2751e063d6a036-7285710986748@example'),
        new Segment(739728, 3, 'a209875cefd44440aa91590508b48f5b-4625756912881@example'),
        new Segment(739664, 4, '44057720ed4e45e4bce21d53249d03f8-8250738040266@example'),
        new Segment(739645, 5, 'cfc13d14583c484483aa49ac420bad27-9491395432062@example'),
        new Segment(739538, 6, '5e90857531be401e9d0b632221fe2fb7-9854527985639@example'),
        new Segment(739708, 7, 'c33a2bba79494840a09d750b19d3b287-2550637855678@example'),
        new Segment(739490, 8, '38006019d94f4ecc8f19c389c00f1ebe-7841585708380@example'),
        new Segment(739667, 9, 'b75a2425bef24fd5affb00dc3db789f6-7051027232703@example'),
        new Segment(739540, 10, '79a027e3bfde458ea2bd0db1632fc84e-7270120407913@example'),
        new Segment(739657, 11, 'fb2bd74e1257487a9240ef0cf81765cc-7147741101314@example'),
        new Segment(739647, 12, 'd39ca8be78c34e3fa6f3211f1b397b3a-4725950858191@example'),
        // 13th Segment is missing here
        new Segment(739721, 14, '2f1cec363ed24584b4127af86ac312ad-7204153818612@example'),
        new Segment(739740, 15, '30ff3514896543a8ac91ec80346a5d40-9134304686352@example'),
        new Segment(739538, 16, '1f75cfa20d884b5b972cfd2e9ebef249-8919850122587@example'),
        new Segment(739646, 17, '8e22b0f973de4393a0a30ab094565316-6722799721412@example'),
        new Segment(739610, 18, 'faddf83650cc4de1a8bee68cffca40a1-5979589815618@example'),
        new Segment(739514, 19, '6b8c23e43d4240da812b547babdc0423-6409257710918@example'),
        new Segment(739920, 20, '802bd0dcef134ac690044e0a09fece60-8492061912475@example'),
        new Segment(739634, 21, 'efc4b3966a1f4b7787677e9e9a214727-5444471572012@example'),
        new Segment(739691, 22, '247efca709114fd181bcaef0f487925f-4076317880026@example'),
        new Segment(739638, 23, '665d9fc5edba4faca68ae835b702b4c7-9814601723860@example'),
        new Segment(510541, 24, '962fddf3e07444988731b52aeaa9b2aa-1283919353788@example')
      ]
    }))
  })

  test('test_bad_subject', async () => {
    const file = await readFile(join(nzbs, 'bad_subject.nzb'))
    const nzb = parse(file.toString())

    equal(nzb.files[0]!.name, '')
  })

  test('test_non_standard_meta', async () => {
    const file = await readFile(join(nzbs, 'non_standard_meta.nzb'))
    const nzb = parse(file.toString())

    equal(nzb.meta.title, null)
    deepEqual(nzb.meta.passwords, [])
    deepEqual(nzb.meta.tags, [])
    equal(nzb.meta.category, null)
  })

  test('test_single_rar_nzb', async () => {
    const file = await readFile(join(nzbs, 'one_rar_file.nzb'))
    const nzb = parse(file.toString())

    equal(!!nzb.files.some(({ name }) => name.endsWith('.r01')), true)
  })

  test('test_multi_rar_nzb', async () => {
    const file = await readFile(join(nzbs, 'multi_rar.nzb'))
    const nzb = parse(file.toString())

    equal(!!nzb.files.some(({ name }) => name.endsWith('.r01')), true)
  })
})
