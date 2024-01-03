import { describe, it } from 'node:test'
import assert from 'node:assert'
import { degToDmsRational, dmsRationalToDeg } from '../lib/helper'

describe('helper', () => {
  it('test "degToDmsRational" -- 1', () => {
    const rationalArray = degToDmsRational(180.0)
    assert.deepStrictEqual(rationalArray, [[180, 1], [0, 1], [0, 100]])
  })

  it('test "degToDmsRational" -- 2', () => {
    const rationalArray = degToDmsRational(30.303)
    assert.deepStrictEqual(rationalArray, [[30, 1], [18, 1], [1080, 100]])
  })

  it('test "dmsRationalToDeg" -- 1', () => {
    const deg = dmsRationalToDeg([[180, 1], [0, 1], [0, 100]], 'N')
    assert.strictEqual(deg, 180.0)
  })

  it('test "dmsRationalToDeg" -- 2', () => {
    const deg = dmsRationalToDeg([[30, 1], [18, 1], [1080, 100]], 'N')
    assert.strictEqual(deg, 30.303)
  })

  it('test "dmsRationalToDeg" -- 3', () => {
    const deg = dmsRationalToDeg([[30, 1], [18, 1], [1080, 100]], 'S')
    assert.strictEqual(deg, -30.303)
  })
})
