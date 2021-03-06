import {
  call,
  fork,
  put,
  select,
  takeLatest,
} from 'redux-saga/effects'
import { delay } from 'redux-saga'
import _includes from 'lodash/includes'

import authTypes from 'state/auth/constants'
import { makeFetchCall } from 'state/utils'
import { updateErrorStatus, updateStatus } from 'state/status/actions'

import types from './constants'
import actions from './actions'
import {
  getSyncMode,
  getSyncProgress,
} from './selectors'
import syncConfigSaga, { getSyncConf } from './saga.config'

const fetchSyncProgress = () => makeFetchCall('getSyncProgress')
const logout = () => makeFetchCall('signOut')
const enableSyncMode = () => makeFetchCall('enableSyncMode')
const disableSyncMode = () => makeFetchCall('disableSyncMode')
const updateSyncErrorStatus = msg => updateErrorStatus({
  id: 'status.request.error',
  topic: 'sync.title',
  detail: msg,
})

function* startSyncing() {
  const { result, error } = yield call(enableSyncMode)
  if (result) {
    yield put(actions.setSyncPref({
      syncMode: types.MODE_SYNCING,
      progress: 0,
    }))
    yield put(updateStatus({ id: 'sync.start' }))
  }
  if (error) {
    yield put(updateSyncErrorStatus('during enableSyncMode'))
  }
}

function* stopSyncing() {
  yield delay(300)
  const { result, error } = yield call(disableSyncMode)
  if (result) {
    yield put(actions.setSyncMode(types.MODE_ONLINE))
    yield put(updateStatus({ id: 'sync.stop-sync' }))
  }
  if (error) {
    yield put(updateSyncErrorStatus('during disableSyncMode'))
  }
}

export function* isSynced() {
  const syncMode = yield select(getSyncMode)
  const syncProgress = yield select(getSyncProgress)

  return (syncMode === types.MODE_OFFLINE && syncProgress === 100)
}

function* forceQueryFromDb() {
  yield put(actions.setSyncMode(types.MODE_OFFLINE))
  yield put(updateStatus({ id: 'sync.go-offline' }))
}

function* syncLogout() {
  yield delay(300)
  const { result, error } = yield call(logout)
  if (result) {
    const syncMode = yield select(getSyncMode)
    if (syncMode !== types.MODE_ONLINE) {
      yield put(actions.setSyncMode(types.MODE_ONLINE))
      yield put(updateStatus({ id: 'sync.logout' }))
    }
  }
  if (error) {
    yield put(updateSyncErrorStatus('during logout'))
  }
}

function* initSync() {
  const { result: syncProgress } = yield call(fetchSyncProgress)

  const isSyncing = Number.isInteger(syncProgress) && syncProgress !== 100
  if (isSyncing) {
    yield put(actions.setSyncPref({
      syncMode: types.MODE_SYNCING,
      progress: syncProgress,
    }))
  } else {
    yield call(startSyncing)
  }

  yield call(getSyncConf)
}

function* progressUpdate({ payload }) {
  const { result } = payload
  const progress = Number.isInteger(result)
    ? result
    : 0

  yield put(actions.setSyncProgress(progress))
}

function* requestsRedirectUpdate({ payload }) {
  const { result } = payload

  if (result) {
    const syncProgress = yield select(getSyncProgress)
    const isSyncing = Number.isInteger(syncProgress) && syncProgress !== 100
    if (isSyncing) {
      yield put(actions.setSyncMode(types.MODE_SYNCING))
    } else {
      yield put(actions.setSyncMode(types.MODE_ONLINE))
    }
  } else {
    yield put(actions.forceQueryFromDb())
  }
}

function* updateSyncStatus() {
  const syncMode = yield select(getSyncMode)
  const { result: syncProgress, error: progressError } = yield call(fetchSyncProgress)

  switch (typeof syncProgress) {
    case 'number':
      if (syncProgress !== 100 && syncMode !== types.MODE_SYNCING) {
        yield put(actions.setSyncMode(types.MODE_SYNCING))
      }
      if (syncProgress === 100 && syncMode !== types.MODE_OFFLINE) {
        yield put(actions.setSyncMode(types.MODE_OFFLINE))
      }
      break
    case 'boolean':
      if (syncMode !== types.MODE_ONLINE) {
        yield put(actions.setSyncMode(types.MODE_ONLINE))
      }
      break
    case 'string':
    default: {
      if (syncProgress === 'SYNCHRONIZATION_HAS_NOT_STARTED_YET'
        || _includes(syncProgress, 'ServerAvailabilityError')) {
        return
      }

      yield put(updateSyncErrorStatus(syncProgress))
      yield put(actions.stopSyncing())
    }
  }

  if (progressError) {
    yield put(updateSyncErrorStatus('during fetchSyncProgress'))
  }
}

export default function* syncSaga() {
  yield takeLatest(types.START_SYNCING, startSyncing)
  yield takeLatest(types.STOP_SYNCING, stopSyncing)
  yield takeLatest(types.FORCE_OFFLINE, forceQueryFromDb)
  yield takeLatest(authTypes.AUTH_SUCCESS, initSync)
  yield takeLatest(types.WS_PROGRESS_UPDATE, progressUpdate)
  yield takeLatest(types.WS_REQUESTS_REDIRECT, requestsRedirectUpdate)
  yield takeLatest(types.UPDATE_STATUS, updateSyncStatus)
  yield takeLatest(authTypes.LOGOUT, syncLogout)
  yield fork(syncConfigSaga)
}
