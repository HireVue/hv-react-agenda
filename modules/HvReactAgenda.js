var moment    = require('moment');
var React     = require('react/addons');
var PropTypes = React.PropTypes;

var DEFAULT_ITEM = {
  id       : null,
  name     : '',
  classes  : '',
  cellRefs : [],
  firstRef : null,
  lastRef  : null
};

/*
function addDomClass(domNode, className) {
  removeDomClass(domNode, className); // dedupe
  domNode.className += ' ' + className;
}

function removeDomClass(domNode, className) {
  var classNames = domNode.className.replace(new RegExp(' ' + className, 'g'), '');
  domNode.className = classNames;
}
*/

var HvReactAgenda = React.createClass({

  propTypes: {
    locale          : PropTypes.string.isRequired,
    startDate       : PropTypes.instanceOf(Date),
    startAtTime     : PropTypes.number.isRequired,
    rowsPerHour     : PropTypes.oneOf([1,2,3,4]).isRequired,
    numberOfDays    : PropTypes.oneOf([1,2,3,4,5,6,7]).isRequired,
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
      hoveredItemId     : ''
    }
  },

  componentDidMount: function() {
    // move to start time (this only happens once)
    var scrollContainer = this.refs.scrollContainer.getDOMNode();
    var rowToScrollTo   = this.refs["hour-" + this.props.startAtTime].getDOMNode();

    scrollContainer.scrollTop = rowToScrollTo.offsetTop;
  },

  componentWillMount: function() {
    if (this.props.startDate) {
      this.setState({date: moment(this.props.startDate)});
    }

    if (this.props.items) {
      this.setState({items: this.mapItems(this.props.items)});
    }
  },

  componentWillReceiveProps: function() {
    if (this.props.items) {
      this.setState({items: this.mapItems(this.props.items)});
    }
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
        itemsMap[ref] = {
          id       : 'item-' + moment(start).format('YYYYMMDDHHmmss') + '-' + moment(end).format('YYYYMMDDHHmmss'),
          name     : item.name,
          classes  : (itemsMap[ref]) ? (itemsMap[ref].classes + ' ' + item.classes) : (item.classes || ''),
          cellRefs : cellRefs,
          firstRef : cellRefs[0],
          lastRef  : cellRefs[cellRefs.length-1]
        }
      });
    }, this);

    return itemsMap;
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

  getItemOverlayStyle: function(itemId) {
    if (this.state.itemOverlayStyles[itemId]) {
      return this.state.itemOverlayStyles[itemId];
    } else {
      return {
        display: 'none'
      }
    }
  },

  handleMouseEnter: function(cell) {
    if (cell.item.id) {
      this.setState({hoveredItemId: cell.item.id});
    }
      //if (cell.item.cellRefs.length) {
      //  cell.item.itemKeys.forEach(function(key, i) {
      //    var node = this.refs[key].getDOMNode();
      //    addDomClass(node, '--hovered');
      //    if (i === 0) {
      //      addDomClass(node, '--hovered-first');
      //    } else if (i === cell.item.itemKeys.length-1) {
      //      addDomClass(node, '--hovered-last');
      //    }
      //  }, this);
      //}

      /*
      var firstHovered;
      var lastHovered;

      firstHovered = node;
      lastHovered = node;

      var overlayStyles = this.state.itemOverlayStyles;
      overlayStyles[cell.cellKey] = {
        display    : 'block',
        position   : 'absolute',
        width      : firstHovered.offsetWidth,
        textAlign  : 'center',
        height     : 0,
        lineHeight : 0,
        overflow   : 'visible',
        border     : 'none',
        top        : firstHovered.getBoundingClientRect().top + ((lastHovered.getBoundingClientRect().bottom - firstHovered.getBoundingClientRect().top)/2)
      };

      this.setState({itemOverlayStyles: overlayStyles});
      */
  },

  handleMouseLeave: function(cell) {
    this.setState({hoveredItemId: -1});
    /*
    if (cell.item.itemKeys.length) {
      cell.item.itemKeys.forEach(function(key, i) {
        var node = this.refs[key].getDOMNode();
        removeDomClass(node, '--hovered-first');
        removeDomClass(node, '--hovered-last');
        removeDomClass(node, '--hovered');
      }, this);

      var overlayStyles = this.state.itemOverlayStyles;
      overlayStyles[cell.cellKey].display = 'none';

      this.setState({itemOverlayStyles: overlayStyles});
    }
    */
  },

  render: function() {

    var renderHeaderColumns = function(col, i) {
      return (
        <th key={"col-" + i} className="agenda__cell --head">
          {moment(col).format('ddd M\/D')}
        </th>
      );
    };

    var renderBodyRows = function(row, i) {
      if (i % this.props.rowsPerHour === 0) {
        var ref = "hour-" + Math.floor(i/this.props.rowsPerHour);
        return (
          <tr key={"row-" + i} ref={ref} className="agenda__row --hour-start">
            <td className="agenda__cell --time" rowSpan={this.props.rowsPerHour}>{row.format('LT')}</td>
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
        '--hovered'         : (this.state.hoveredItemId === cell.item.id),
        '--hovered-first'   : (this.state.hoveredItemId === cell.item.id) && (cell.item.firstRef === cell.cellRef),
        '--hovered-last'    : (this.state.hoveredItemId === cell.item.id) && (cell.item.lastRef  === cell.cellRef)
      };
      cellClasses[cell.item.classes] = true;

      var classSet = React.addons.classSet(cellClasses);

      return (
        <td
          ref={cell.cellRef}
          key={"cell-" + i}
          onMouseEnter={this.handleMouseEnter.bind(this, cell)}
          onMouseLeave={this.handleMouseLeave.bind(this, cell)}
          className={classSet}
        >
          <div style={this.getItemOverlayStyle(cell.item.id)} className="agenda__item-overlay-title">{cell.item.name}</div>
        </td>
      );
    };

    return (
      <div className="agenda">
        <table>
          <thead>
            <tr>
              <th className="agenda__cell --controls">
                <div className="agenda__prev" onClick={this.prevRange}><span>&laquo;</span></div>
                <div className="agenda__next" onClick={this.nextRange}><span>&raquo;</span></div>
              </th>
              {this.getHeaderColumns().map(renderHeaderColumns)}
            </tr>
          </thead>
          <tbody ref="scrollContainer">
            {this.getBodyRows().map(renderBodyRows, this)}
          </tbody>
        </table>
      </div>
    );
  }

});

module.exports = HvReactAgenda;
