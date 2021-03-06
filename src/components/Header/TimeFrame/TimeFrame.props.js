import PropTypes from 'prop-types'

export const propTypes = {
  start: PropTypes.number,
  end: PropTypes.number,
  timezone: PropTypes.string.isRequired,
}

export const defaultProps = {
  start: 0,
  end: 0,
}
