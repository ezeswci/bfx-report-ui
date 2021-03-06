import React from 'react'

import Status from 'components/Status'
import DateRangePicker from 'ui/DateRangePicker'
import PlatformLogo from 'ui/PlatformLogo'
import timeRangeTypes from 'state/timeRange/constants'
import config from 'config'

import TimeFrame from './TimeFrame'
import TimeFrameShortcut from './TimeFrameShortcut'
import Export from './Export'
import SyncMode from './SyncMode'
import AccountMenu from './AccountMenu'
import TopNavigation from './TopNavigation'

const Header = () => {
  const HOME_URL = config.isElectronApp ? '/' : config.HOME_URL

  return (
    <div className='header'>
      <div className='header-brand'>
        <a href={HOME_URL} className='header-brand-logo'>
          <PlatformLogo />
        </a>
      </div>
      <div className='header-timeframe'>
        <TimeFrame />
        <DateRangePicker className='date-range-picker-popover--dialog' controlledFromRedux />
      </div>
      <TimeFrameShortcut
        title='timeframe.2w'
        type={timeRangeTypes.LAST_2WEEKS}
      />
      <TimeFrameShortcut
        title='timeframe.past_month'
        type={timeRangeTypes.PAST_MONTH}
      />
      <Export />
      <SyncMode />
      <Status />
      <AccountMenu />

      <TopNavigation />
    </div>
  )
}

export default Header
