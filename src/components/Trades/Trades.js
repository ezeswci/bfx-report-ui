import React, { Fragment, PureComponent } from 'react'
import { injectIntl } from 'react-intl'
import {
  Card,
  Elevation,
} from '@blueprintjs/core'
import {
  Cell,
  TruncatedFormat,
} from '@blueprintjs/table'

import Pagination from 'components/Pagination'
import TimeRange from 'components/TimeRange'
import DataTable from 'ui/DataTable'
import ExportButton from 'ui/ExportButton'
import Loading from 'ui/Loading'
import NoData from 'ui/NoData'
import PairSelector from 'ui/PairSelector'
import RefreshButton from 'ui/RefreshButton'
import queryConstants from 'state/query/constants'
import {
  checkFetch,
  formatTime,
  getCurrentEntries,
} from 'state/utils'

import { propTypes, defaultProps } from './Trades.props'

const COLUMN_WIDTHS = [85, 80, 125, 125, 125, 150]
const LIMIT = queryConstants.DEFAULT_TRADES_QUERY_LIMIT
const PAGE_SIZE = queryConstants.DEFAULT_TRADES_PAGE_SIZE
const TYPE = queryConstants.MENU_TRADES
const ALL = 'ALL'
const WILD_CARD = ['', ALL]

class Trades extends PureComponent {
  constructor(props) {
    super(props)
    this.handlers = {}
    this.handleClick = this.handleClick.bind(this)
    this.fetchPrev = this.fetchPrev.bind(this)
    this.fetchNext = this.fetchNext.bind(this)
  }

  componentDidMount() {
    const { loading, fetchTrades } = this.props
    if (loading) {
      fetchTrades()
    }
  }

  componentDidUpdate(prevProps) {
    checkFetch(prevProps, this.props, TYPE)
  }

  handleClick(pair) {
    if (!this.handlers[pair]) {
      this.handlers[pair] = () => {
        // eslint-disable-next-line react/destructuring-assignment
        this.props.setTargetPair(pair === ALL ? '' : pair)
      }
    }
    return this.handlers[pair]
  }

  fetchPrev() {
    // eslint-disable-next-line react/destructuring-assignment
    this.props.fetchPrevTrades()
  }

  fetchNext() {
    // eslint-disable-next-line react/destructuring-assignment
    this.props.fetchNextTrades()
  }

  render() {
    const {
      existingPairs,
      offset,
      pageOffset,
      pageLoading,
      pairs,
      entries,
      handleClickExport,
      intl,
      jumpPage,
      loading,
      refresh,
      targetPair,
      timezone,
    } = this.props
    const filteredData = getCurrentEntries(entries, offset, LIMIT, pageOffset, PAGE_SIZE)
    const pairList = pairs ? [ALL, ...pairs] : [ALL, ...existingPairs]
    const currentPair = targetPair || ALL
    const numRows = filteredData.length

    const idCellRenderer = (rowIndex) => {
      const { id } = filteredData[rowIndex]
      return (
        <Cell tooltip={id}>
          {id}
        </Cell>
      )
    }

    const pairCellRenderer = (rowIndex) => {
      const { pair } = filteredData[rowIndex]
      return (
        <Cell tooltip={pair}>
          {pair}
        </Cell>
      )
    }

    const amountCellRenderer = (rowIndex) => {
      const { execAmount } = filteredData[rowIndex]
      return (
        <Cell
          className='bitfinex-text-align-right'
          tooltip={execAmount}
        >
          {execAmount}
        </Cell>
      )
    }

    const priceCellRenderer = (rowIndex) => {
      const { execPrice } = filteredData[rowIndex]
      return (
        <Cell
          className='bitfinex-text-align-right'
          tooltip={execPrice}
        >
          {execPrice}
        </Cell>
      )
    }

    const feeCellRenderer = (rowIndex) => {
      const { fee, feeCurrency } = filteredData[rowIndex]
      const tooltip = `${fee} ${feeCurrency}`
      return (
        <Cell
          className='bitfinex-text-align-right'
          tooltip={tooltip}
        >
          {fee}
          &nbsp;
          <span className='bitfinex-show-soft'>
            {feeCurrency}
          </span>
        </Cell>
      )
    }

    const mtsCellRenderer = (rowIndex) => {
      const mtsCreate = formatTime(filteredData[rowIndex].mtsCreate, timezone)
      return (
        <Cell tooltip={mtsCreate}>
          <TruncatedFormat>
            {mtsCreate}
          </TruncatedFormat>
        </Cell>
      )
    }

    const renderPagination = (
      <Pagination
        type={TYPE}
        dataLen={entries.length}
        loading={pageLoading}
        offset={offset}
        jumpPage={jumpPage}
        prevClick={this.fetchPrev}
        nextClick={this.fetchNext}
        pageOffset={pageOffset}
      />
    )

    const renderPairSelector = (
      <Fragment>
        &nbsp;
        <PairSelector
          currentPair={currentPair}
          existingPairs={existingPairs}
          onPairSelect={this.handleClick}
          pairList={pairList}
          pairs={pairs}
          wildCard={WILD_CARD}
        />
      </Fragment>
    )

    const tableColums = [
      {
        id: 'id',
        name: 'column.id',
        renderer: idCellRenderer,
        tooltip: rowIndex => filteredData[rowIndex].id,
      },
      {
        id: 'pair',
        name: 'trades.column.pair',
        renderer: pairCellRenderer,
        tooltip: rowIndex => filteredData[rowIndex].pair,
      },
      {
        id: 'amount',
        name: 'trades.column.amount',
        renderer: amountCellRenderer,
        tooltip: rowIndex => filteredData[rowIndex].amount,
      },
      {
        id: 'price',
        name: 'trades.column.price',
        renderer: priceCellRenderer,
        tooltip: rowIndex => filteredData[rowIndex].price,
      },
      {
        id: 'fee',
        name: 'trades.column.fee',
        renderer: feeCellRenderer,
        tooltip: rowIndex => {
          const { fee, feeCurrency } = filteredData[rowIndex]
          return `${fee} ${feeCurrency}`
        },
      },
      {
        id: 'mts',
        name: 'trades.column.time',
        renderer: mtsCellRenderer,
        tooltip: rowIndex => formatTime(filteredData[rowIndex].mtsCreate, timezone),
      },
    ]

    let showContent
    if (loading) {
      showContent = (
        <Loading title='trades.title' />
      )
    } else if (numRows === 0) {
      showContent = (
        <Fragment>
          <h4>
            {intl.formatMessage({ id: 'trades.title' })}
            &nbsp;
            <TimeRange />
            {renderPairSelector}
          </h4>
          <NoData />
        </Fragment>
      )
    } else {
      showContent = (
        <Fragment>
          <h4>
            {intl.formatMessage({ id: 'trades.title' })}
            &nbsp;
            <TimeRange />
            {renderPairSelector}
            &nbsp;
            <ExportButton handleClickExport={handleClickExport} />
            &nbsp;
            <RefreshButton handleClickRefresh={refresh} />
          </h4>
          {renderPagination}
          <DataTable
            numRows={numRows}
            columnWidths={COLUMN_WIDTHS}
            tableColums={tableColums}
          />
          {renderPagination}
        </Fragment>
      )
    }

    return (
      <Card interactive elevation={Elevation.ZERO} className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
        {showContent}
      </Card>
    )
  }
}

Trades.propTypes = propTypes
Trades.defaultProps = defaultProps

export default injectIntl(Trades)
