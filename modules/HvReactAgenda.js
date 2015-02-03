var moment    = require('moment');
var React     = require('react/addons');
var PropTypes = React.PropTypes;
var _         = require('lodash');

var DEFAULT_ITEM = {
  name     : '',
  classes  : '',
  cellRefs : []
};

var HvReactAgenda = React.createClass({

  propTypes: {
    locale          : PropTypes.string.isRequired,
    startDate       : PropTypes.instanceOf(Date),
    startAtTime     : PropTypes.number.isRequired,
    rowsPerHour     : PropTypes.oneOf([1,2,3,4]).isRequired,
    numberOfDays    : PropTypes.oneOf([1,2,3,4,5,6,7]).isRequired,
    fixedHeader     : PropTypes.bool,
    items           : PropTypes.arrayOf(PropTypes.shape({
      name          : PropTypes.string,
      startDateTime : PropTypes.instanceOf(Date).isRequired,
      endDateTime   : PropTypes.instanceOf(Date).isRequired,
      classes       : PropTypes.string
    })),
    onItemSelect    : PropTypes.func
  },

  getDefaultProps: function() {
    return {
      locale       : 'en',
      startAtTime  : 8,
      rowsPerHour  : 4,
      numberOfDays : 5
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

  componentWillMount: function() {
    if (this.props.startDate) {
      this.setState({date: moment(this.props.startDate)});
    }

    if (this.props.items) {
      this.setState({items: this.mapItems(this.props.items)});
    }
  },

  componentDidMount: function() {
    // move to start time (this only happens once)
    var scrollContainer = this.refs.agendaContainer.getDOMNode();
    var rowToScrollTo   = this.refs["hour-" + this.props.startAtTime].getDOMNode();

    var headerHeight = this.refs['column-spec-0'].getDOMNode().offsetHeight;
    this.setState({headerHeight: headerHeight});
    scrollContainer.scrollTop = rowToScrollTo.offsetTop - headerHeight;

    if (window.addEventListener) {
      window.addEventListener("resize", this.buildFixedHeader);
      window.addEventListener("scroll", this.updateAgendaPosition);
    } else {
      window.attachEvent("resize", this.buildFixedHeader);
      window.attachEvent("scroll", this.updateAgendaPosition);
    }

    this.buildFixedHeader();
  },

  componentWillUnmount: function() {
    if (window.removeEventListener) {
      window.removeEventListener("resize", this.buildFixedHeader);
      window.removeEventListener("scroll", this.updateAgendaPosition);
    } else {
      window.deattachEvent("resize", this.buildFixedHeader);
      window.deattachEvent("scroll", this.updateAgendaPosition);
    }
  },

  componentWillReceiveProps: function() {
    if (this.props.items) {
      this.setState({items: this.mapItems(this.props.items)});
    }
  },

  updateAgendaPosition: function() {
    var node = this.refs.agendaContainer.getDOMNode();
    this.setState({agendaPosition: node.getBoundingClientRect()});
  },

  nextRange: function() {
    this.setState({date: this.state.date.add(this.props.numberOfDays, 'days')});
  },

  prevRange: function() {
    this.setState({date: this.state.date.subtract(this.props.numberOfDays, 'days')});
  },

  mapItems: function(itemsArray) {
    var itemsMap = {};
    itemsArray.forEach(function(item) {
      var interval      = (60/this.props.rowsPerHour);
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
  },

  buildFixedHeader: function() {
    for (var i = 0; i < this.props.numberOfDays+1; i++) {
      var spec = this.refs['column-spec-'+i].getDOMNode();
      var node = this.refs['column-'+i].getDOMNode();

      node.style.width = spec.offsetWidth + "px";
    }
  },

  getHeaderColumns: function() {
    var cols = [];
    for (var i = 0; i < this.props.numberOfDays; i++) {
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
    for (var i = 0; i < this.props.numberOfDays; i++) {
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
        top: firstCellY + ((lastCellY-firstCellY)/2)
      };
    } else {
      return {
        display: 'none'
      };
    }
  },

  getHeaderStyle: function() {
    var headerStyles = {
      position: this.props.fixedHeader ? 'fixed' : 'absolute',
      zIndex: 2
    };

    if (this.state.agendaPosition) {
      headerStyles.top  = this.state.agendaPosition.top;
    } else {
      headerStyles.marginTop = this.state.headerHeight * -1;
    }

    return headerStyles;
  },

  handleMouseEnter: function(cell) {
    if (cell.item) {
      this.setState({focusedCell: cell.cellRef});
      this.setState({highlightedCells: cell.item.cellRefs});
    }
  },

  handleMouseLeave: function(cell) {
    this.setState({focusedCell: null});
    this.setState({highlightedCells: []});
  },

  handleMouseClick: function(cell) {
    if (this.props.onItemSelect && cell.item.startDateTime) {
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

    var renderHeaderSpecColumns = function(col, i) {
      var classSet = React.addons.classSet({
        'agenda__cell' : true,
        '--controls'   : (i === 0),
        '--head'       : (i !== 0)
      });
      return (
        <th ref={"column-spec-" + i} key={"col-spec-" + i} className={classSet}></th>
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
          onMouseLeave={this.handleMouseLeave.bind(this, cell)}
          onClick={this.handleMouseClick.bind(this, cell)}
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

    return (
      <div ref="agendaContainer" className="agenda">
        <table className="agenda__table">
          <thead className="agenda__header">
            <tr>
              {_.range(this.props.numberOfDays+1).map(renderHeaderSpecColumns)}
            </tr>
            <tr style={this.getHeaderStyle()}>
              <th ref="column-0" className="agenda__cell --controls">
                <div className="agenda__prev" onClick={this.prevRange}><span>&laquo;</span></div>
                <div className="agenda__next" onClick={this.nextRange}><span>&raquo;</span></div>
              </th>
              {this.getHeaderColumns().map(renderHeaderColumns, this)}
            </tr>
          </thead>
          <tbody className="agenda__body">
            {this.getBodyRows().map(renderBodyRows, this)}
          </tbody>
        </table>
      </div>
    );
  }

});

module.exports = HvReactAgenda;
