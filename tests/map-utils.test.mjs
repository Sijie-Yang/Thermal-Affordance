import test from 'node:test'
import assert from 'node:assert/strict'
import { colorScale, percentileRank, percentile, readExplorerState } from '../src/data/map-utils.mjs'

test('absolute colors do not depend on the selected city distribution', () => {
  assert.deepEqual(colorScale([0, 1], 'absolute'), colorScale([4, 5], 'absolute'))
})

test('local scales have valid interpolation stops with ties, constant and empty data', () => {
  for (const scores of [[2, 2, 2], [1, 1, 1, 2, 2], [0, 1, 2, 3, 4, 5], []]) {
    const ramp = colorScale(scores, 'within-city')
    assert.ok(ramp.stops.every(([value], i) => i === 0 || value > ramp.stops[i - 1][0]))
    assert.ok(!ramp.gradient.includes('NaN'))
  }
  assert.equal(colorScale([2, 2], 'within-city').paint, '#f0f0f0')
})

test('percentiles interpolate and tied ranks include all equal scores', () => {
  assert.equal(percentile([1, 2, 3, 4], 0.5), 2.5)
  assert.equal(percentileRank([1, 2, 2, 4], 2), 75)
  assert.equal(percentileRank([1, 2, 2, 4], 0), 0)
  assert.equal(percentileRank([1, 2, 2, 4], 5), 100)
  assert.equal(percentileRank([], 2), 0)
})

test('shared views round-trip recognized options and safely reject invalid values', () => {
  const cities = [{ id: 'singapore' }, { id: 'tokyo' }]
  const selection = { city: 'tokyo', layer: 'hex', scale: 'within-city' }
  assert.deepEqual(readExplorerState('?' + new URLSearchParams(selection), cities), selection)
  assert.deepEqual(readExplorerState('?city=unknown&layer=unknown&scale=unknown', cities), {
    city: 'singapore', layer: 'points', scale: 'absolute',
  })
})
