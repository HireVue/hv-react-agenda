var moment    = require('moment');
var React     = require('react/addons');
var PropTypes = React.PropTypes;
var _         = require('underscore');

var DEFAULT_ITEM = {
  name     : '',
  classes  : '',
  cellRefs : []
};

React.initializeTouchEvents(true);

function mapItems(itemsArray, rowsPerHour) {
  var itemsMap = {};

  itemsArray = itemsArray.sort(function(a, b) {
    return a.startDateTime - b.startDateTime;
  });

  itemsArray.forEach(function(item) {
    var interval      = (60/rowsPerHour);
    var offsetMinutes = item.startDateTime.getMinutes() % interval;
    var start         = moment(item.startDateTime).subtract(offsetMinutes, "minutes").toDate();
    var end           = item.endDateTime;
    var duration      = moment.duration(moment(end).diff(moment(start)));
    var rows          = Math.ceil(duration.asHours()/(interval/60));

    var cellRefs = [];
    for (var i = 0; i < rows; i++) {
      var ref = moment(start).add(i*interval, 'minutes').format('YYYY-MM-DDTHH:mm:ss');
      cellRefs.push(ref);
    }

    cellRefs.forEach(function(ref) {
      var newItem = _.omit(item, 'classes');
      newItem.classes  = (itemsMap[ref]) ? (itemsMap[ref].classes + ' ' + item.classes) : (item.classes || '');
      newItem.cellRefs = cellRefs;
      itemsMap[ref] = newItem;
    });
  }, this);

  return itemsMap;
}

var HvReactAgenda = React.createClass({

  propTypes: {
    locale             : PropTypes.string.isRequired,
    startDate          : PropTypes.instanceOf(Date),
    startAtTime        : PropTypes.number.isRequired,
    rowsPerHour        : PropTypes.oneOf([1,2,3,4]).isRequired,
    numberOfDays       : PropTypes.oneOf([1,2,3,4,5,6,7]).isRequired,
    items              : PropTypes.arrayOf(PropTypes.shape({
      name             : PropTypes.string,
      startDateTime    : PropTypes.instanceOf(Date).isRequired,
      endDateTime      : PropTypes.instanceOf(Date).isRequired,
      classes          : PropTypes.string
    })),
    onItemSelect       : PropTypes.func,
    onDateRangeChange  : PropTypes.func,
    minDate            : PropTypes.instanceOf(Date),
    maxDate            : PropTypes.instanceOf(Date),
    disableMouseEvents : PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      locale            : 'en',
      startAtTime       : 8,
      rowsPerHour       : 4,
      numberOfDays      : 5,
      items             : [],
      onItemSelect      : function(){},
      onDateRangeChange : function(){}
    }
  },

  getInitialState: function() {
    return {
      date              : moment(),
      items             : {},
      itemOverlayStyles : {},
      highlightedCells  : [],
      focusedCell       : null
    }
  },

  /********************/
  /*  Life Cycle      */
  /********************/
  componentWillMount: function() {
      this.handleBeforeUpdate(this.props);
  },

  componentWillUnmount: function() {
  },

  componentWillReceiveProps: function(props) {
      this.handleBeforeUpdate(props);
  },

  componentDidMount: function() {
    // move to start time (this only happens once)
    var scrollContainer = this.refs.agendaScrollContainer.getDOMNode();
    var rowToScrollTo   = this.refs["hour-" + this.props.startAtTime].getDOMNode();
    scrollContainer.scrollTop = rowToScrollTo.offsetTop;

    this.handleUpdate(this.props, this.getInitialState());
  },

  componentDidUpdate: function(prevProps, prevState) {
      this.handleUpdate(prevProps, prevState);
  },

  /********************/
  /*  Item Renderers  */
  /********************/
  getHeaderColumns: function() {
    var cols = [];
    for (var i = 0; i < this.state.numberOfDays; i++) {
      cols.push(moment(this.state.date).add(i, 'days').toDate());
    }
    return cols;
  },

  getBodyRows: function() {
    var rows = [];
    var interval = (60/this.props.rowsPerHour);
    for (var i = 0; i < 24*this.props.rowsPerHour; i++) {
      rows.push(moment(this.state.date).startOf('day').add(Math.floor(i*interval), 'minutes'));
    }
    return rows;
  },

  getMinuteCells: function(rowMoment) {
    var cells = [];
    for (var i = 0; i < this.state.numberOfDays; i++) {
      var cellRef = moment(rowMoment).add(i, 'days').format('YYYY-MM-DDTHH:mm:ss');
      cells.push({
        cellRef: cellRef,
        item: this.state.items[cellRef] || DEFAULT_ITEM
      });
    }
    return cells;
  },

  getItemOverlayStyle: function(cellRef) {
    if (this.state.focusedCell === cellRef && _.contains(this.state.highlightedCells, cellRef)) {
      var firstCell   = this.refs[_.first(this.state.highlightedCells)].getDOMNode();
      var lastCell    = this.refs[_.last(this.state.highlightedCells)].getDOMNode();

      var firstCellY  = firstCell.offsetTop - firstCell.scrollTop + firstCell.clientTop;
      var lastCellY   = lastCell.offsetTop - lastCell.scrollTop + lastCell.clientTop;

      return {
        display: 'block',
        zIndex: 1,
        position: 'absolute',
        width: firstCell.offsetWidth,
        textAlign: 'center',
        top: firstCell.offsetTop + ((lastCellY-firstCellY)/2)
      };
    } else {
      return {
        display: 'none'
      };
    }
  },

  /********************/
  /*  Event Handlers  */
  /********************/
  handleBeforeUpdate: function(props) {
    if (props.hasOwnProperty('startDate') && props.startDate !== this.state.date.toDate()) {
      this.setState({
        date: moment(props.startDate)
      });
    }

    if (props.hasOwnProperty('items')) {
      this.setState({
        items: mapItems(props.items, props.rowsPerHour)
      });
    }

    if (props.hasOwnProperty('numberOfDays') && props.numberOfDays !== this.state.numberOfDays) {
      this.setState({
        numberOfDays: props.numberOfDays
      });
    }

    if (props.hasOwnProperty('minDate') && (!this.state.hasOwnProperty('minDate') || props.minDate !== this.state.minDate.toDate())) {
      this.setState({
        minDate: moment(props.minDate)
      });
    }

    if (props.hasOwnProperty('maxDate') && (!this.state.hasOwnProperty('maxDate') || props.maxDate !== this.state.maxDate.toDate())) {
      this.setState({
        maxDate: moment(props.maxDate)
      });
    }
  },

  handleUpdate: function(prevProps, prevState) {
  },

  handleOnNextButtonClick: function() {
    var nextStartDate = moment(this.state.date).add(this.state.numberOfDays, 'days');
    if (this.state.hasOwnProperty('maxDate')) {
      nextStartDate = moment.min(nextStartDate, this.state.maxDate);
    }

    var newStart = nextStartDate;
    var newEnd   = moment(newStart).add(this.state.numberOfDays-1, 'days');

    if (nextStartDate !== this.state.date) {
      this.setState({date: nextStartDate});
    }

    if (this.props.onDateRangeChange) {
      this.props.onDateRangeChange(
        newStart.toDate(),
        newEnd.toDate()
      );
    }
  },

  handleOnPrevButtonClick: function() {
    var prevStartDate = moment(this.state.date).subtract(this.state.numberOfDays, 'days');
    if (this.state.hasOwnProperty('minDate')) {
      prevStartDate = moment.max(prevStartDate, this.state.minDate);
    }

    var newStart = prevStartDate;
    var newEnd   = moment(newStart).add(this.state.numberOfDays-1, 'days');

    if (prevStartDate !== this.state.date) {
      this.setState({date: prevStartDate});
    }

    if (this.props.onDateRangeChange) {
      this.props.onDateRangeChange(
        newStart.toDate(),
        newEnd.toDate()
      );
    }
  },

  handleMouseEnter: function(cell) {
    if (cell.item && !this.props.disableMouseEvents) {
      this.setState({focusedCell: cell.cellRef});
      this.setState({highlightedCells: cell.item.cellRefs});
    }
  },

  handleMouseLeave: function(cell) {
    this.setState({focusedCell: null});
    this.setState({highlightedCells: []});
  },

  handleMouseClick: function(cell) {
    if (this.props.onItemSelect && cell.item.startDateTime && !this.props.disableMouseEvents) {
      this.props.onItemSelect(_.omit(cell.item, 'cellRefs'));
    }
  },

  render: function() {

    var renderHeaderColumns = function(col, i) {
      var headerLabel = moment(col);
      headerLabel.locale(this.props.locale);
      return (
        <th ref={"column-" + (i+1)} key={"col-" + i} className="agenda__cell --head">
          {headerLabel.format('ddd M\/D')}
        </th>
      );
    };

    var renderBodyRows = function(row, i) {
      if (i % this.props.rowsPerHour === 0) {
        var ref = "hour-" + Math.floor(i/this.props.rowsPerHour);
        var timeLabel = moment(row);
        timeLabel.locale(this.props.locale);
        return (
          <tr key={"row-" + i} ref={ref} className="agenda__row --hour-start">
            <td className="agenda__cell --time" rowSpan={this.props.rowsPerHour}>{timeLabel.format('LT')}</td>
            {this.getMinuteCells(row).map(renderMinuteCells, this)}
          </tr>
        );
      } else {
        return (
          <tr key={"row-" + i}>
            {this.getMinuteCells(row).map(renderMinuteCells, this)}
          </tr>
        );
      }
    };

    var renderMinuteCells = function(cell, i) {
      var cellClasses = {
        'agenda__cell'      : true,
        '--hovered'         : _.contains(this.state.highlightedCells, cell.cellRef),
        '--hovered-first'   : _.contains(this.state.highlightedCells, cell.cellRef) && (_.first(this.state.highlightedCells) === cell.cellRef),
        '--hovered-last'    : _.contains(this.state.highlightedCells, cell.cellRef) && (_.last(this.state.highlightedCells)  === cell.cellRef)
      };
      cellClasses[cell.item.classes] = true;

      var classSet = React.addons.classSet(cellClasses);

      return (
        <td
          ref={cell.cellRef}
          key={"cell-" + i}
          onMouseEnter={this.handleMouseEnter.bind(this, cell)}
          onTouchStart={this.handleMouseEnter.bind(this, cell)}
          onMouseLeave={this.handleMouseLeave.bind(this, cell)}
          onClick={this.handleMouseClick.bind(this, cell)}
          onTouchEnd={this.handleMouseClick.bind(this, cell)}
          className={classSet}
        >
          <div
            style={this.getItemOverlayStyle(cell.cellRef)}
            className="agenda__item-overlay-title">
              {cell.item.name}
          </div>
        </td>
      );
    };

    var disablePrev = function(state) {
      if (!state.hasOwnProperty('minDate')) {
        return false;
      }

      return state.date.toDate().getTime() === state.minDate.toDate().getTime();
    };

    var disableNext = function(state) {
      if (!state.hasOwnProperty('maxDate')) {
        return false;
      }

      return state.date.toDate().getTime() === state.maxDate.toDate().getTime();
    };

    return (
      <div className="agenda">
        <div className="agenda__table --header">
          <table>
            <thead>
              <tr>
                <th ref="column-0" className="agenda__cell --controls">
                  <div className={"agenda__prev" + (disablePrev(this.state) ? " --disabled" : "")} onClick={this.handleOnPrevButtonClick}><span>&laquo;</span></div>
                  <div className={"agenda__next" + (disableNext(this.state) ? " --disabled" : "")} onClick={this.handleOnNextButtonClick}><span>&raquo;</span></div>
                </th>
                {this.getHeaderColumns().map(renderHeaderColumns, this)}
              </tr>
            </thead>
          </table>
        </div>
        <div ref="agendaScrollContainer" className="agenda__table --body" style={{position:'relative'}}>
          <table>
            <tbody>
              {this.getBodyRows().map(renderBodyRows, this)}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

});

module.exports = HvReactAgenda;
