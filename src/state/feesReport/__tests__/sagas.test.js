import { put, call } from 'redux-saga/effects'
import { cloneableGenerator } from 'redux-saga/utils'

import { frameworkCheck } from 'state/ui/saga'

import { fetchFeesReport, getFeesReport } from '../saga'
import actions from '../actions'

describe('Fees report saga', () => {
  const generator = cloneableGenerator(fetchFeesReport)(actions.fetchFeesReport())

  it('framework check', () => {
    const result = generator.next().value
    expect(result).toEqual(call(frameworkCheck))
  })

  describe('fails framework check', () => {
    let clone

    beforeAll(() => {
      clone = generator.clone()
    })

    it('updates data', () => {
      const result = clone.next(false).value
      expect(result).toEqual(put(actions.updateFeesReport([])))
    })

    it('performs no further work', () => {
      const result = clone.next().done
      expect(result).toBe(true)
    })
  })

  it('sets params from the payload', () => {
    const result = generator.next(true).value
    expect(result).toEqual(put(actions.setParams({})))
  })

  it('calls the API', () => {
    const result = generator.next().value
    expect(result).toEqual(call(getFeesReport, {}))
  })

  describe('request returns error', () => {
    let clone

    beforeAll(() => {
      clone = generator.clone()
      clone.next({ error: {} }) // skips data update
    })

    it('raises failed action', () => {
      const result = clone.next().value
      expect(result).toEqual(put(actions.fetchFail({
        id: 'status.fail',
        topic: 'feesreport.title',
        detail: JSON.stringify({}),
      })))
    })
  })

  describe('request throws error', () => {
    let clone

    beforeAll(() => {
      clone = generator.clone()
    })

    it('raises failed action', () => {
      const result = clone.throw({}).value
      expect(result).toEqual(put(actions.fetchFail({
        id: 'status.request.error',
        topic: 'feesreport.title',
        detail: JSON.stringify({}),
      })))
    })

    it('performs no further work', () => {
      const result = clone.next().done
      expect(result).toBe(true)
    })
  })

  it('updates data', () => {
    const result = generator.next({ result: [], error: false }).value
    expect(result).toEqual(put(actions.updateFeesReport([])))
  })
})
