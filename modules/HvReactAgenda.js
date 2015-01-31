var moment    = require('moment');
var React     = require('react');
var PropTypes = React.PropTypes;

var DEFAULT_ITEM = {
  itemKeys    : [],
  itemClasses : ''
};

function addDomClass(domNode, className) {
  removeDomClass(domNode, className); // dedupe
  domNode.className += ' ' + className;
}

function removeDomClass(domNode, className) {
  var classNames = domNode.className.replace(new RegExp(' ' + className, 'g'), '');
  domNode.className = classNames;
}

var HvReactAgenda = React.createClass({

  propTypes: {
    locale          : PropTypes.string.isRequired,
    startDate       : PropTypes.instanceOf(Date),
    startAtTime     : PropTypes.number.isRequired,
    rowsPerHour     : PropTypes.oneOf([1,2,3,4]).isRequired,
    numberOfDays    : PropTypes.oneOf([1,2,3,4,5,6,7]).isRequired,
    itemClasses     : PropTypes.arrayOf(PropTypes.shape({
      startDateTime : PropTypes.instanceOf(Date),
      endDateTime   : PropTypes.instanceOf(Date),
      classNames    : PropTypes.string
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
      date: moment(),
      itemClasses: {}
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

    if (this.props.itemClasses) {
      this.setState({itemClasses: this.mapItemClasses(this.props.itemClasses)});
    }
  },

  componentWillReceiveProps: function() {
    if (this.props.itemClasses) {
      this.setState({itemClasses: this.mapItemClasses(this.props.itemClasses)});
    }
  },

  nextRange: function() {
    this.setState({date: this.state.date.add(this.props.numberOfDays, 'days')});
  },

  prevRange: function() {
    this.setState({date: this.state.date.subtract(this.props.numberOfDays, 'days')});
  },

  mapItemClasses: function(itemClassesArray) {
    var itemClassesMap = {};
    itemClassesArray.forEach(function(itemClass) {
      var interval = (60/this.props.rowsPerHour);
      var offsetMinutes = itemClass.startDateTime.getMinutes() % interval;
      var start = moment(itemClass.startDateTime).subtract(offsetMinutes, "minutes").toDate();
      var end   = itemClass.endDateTime;
      var d     = moment.duration(moment(end).diff(moment(start)));
      var rows  = Math.ceil(d.asHours()/(interval/60));

      var itemKeys = [];
      for (var i = 0; i < rows; i++) {
        var key = moment(start).add(i*interval, 'minutes').format('YYYY-MM-DDTHH:mm:ss');
        itemKeys.push(key);
      }

      itemKeys.forEach(function(key) {
        itemClassesMap[key] = {
          itemKeys    : itemKeys,
          itemClasses : (itemClassesMap[key]) ? (itemClassesMap[key].itemClasses + ' ' + itemClass.classNames) : (itemClass.classNames || '')
        }
      });
    }, this);
    return itemClassesMap;
  },

  getHeaderColumns: function() {
    var cols = [];
    for (var i = 0; i < this.props.numberOfDays; i++) {
      cols.push(moment(this.state.date).add(i, 'days'));
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
      var cellKey = moment(rowMoment).add(i, 'days').format('YYYY-MM-DDTHH:mm:ss');
      cells.push({
        dayIndex: i,
        cellKey: cellKey,
        item: this.state.itemClasses[cellKey] || DEFAULT_ITEM
      });
    }
    return cells;
  },

  handleMouseOver: function(cell) {
    if (cell.item.itemKeys.length) {
      var firstHovered;
      var lastHovered;

      cell.item.itemKeys.forEach(function(key, i) {
        var node = this.refs[key].getDOMNode();
        addDomClass(node, '--hovered');
        if (i === 0) {
          firstHovered = node;
          addDomClass(node, '--hovered-first');
        } else if (i === cell.item.itemKeys.length-1) {
          lastHovered = node;
          addDomClass(node, '--hovered-last');
        }
      }, this);
    }
  },

  handleMouseOut: function(cell) {
    if (cell.item.itemKeys.length) {
      cell.item.itemKeys.forEach(function(key, i) {
        var node = this.refs[key].getDOMNode();
        removeDomClass(node, '--hovered-first');
        removeDomClass(node, '--hovered-last');
        removeDomClass(node, '--hovered');
      }, this);
    }
  },

  render: function() {

    var renderHeaderColumns = function(col, i) {
      return (
        <th className="agenda__cell --head">
          {col.format('ddd M\/D')}
          <div>{col.format('ddd M\/D')}</div>
        </th>
      );
    };

    var renderBodyRows = function(row, i) {
      if (i % this.props.rowsPerHour === 0) {
        var ref = "hour-" + Math.floor(i/this.props.rowsPerHour);
        return (
          <tr ref={ref} className="agenda__row --hour-start">
            <td className="agenda__cell --time" rowSpan={this.props.rowsPerHour}>{row.format('LT')}</td>
            {this.getMinuteCells(row).map(renderMinuteCells, this)}
          </tr>
        );
      } else {
        return (
          <tr>
            {this.getMinuteCells(row).map(renderMinuteCells, this)}
          </tr>
        );
      }
    };

    var renderMinuteCells = function(cell, i) {
      return (
        <td
          ref={cell.cellKey}
          onMouseOver={this.handleMouseOver.bind(this, cell)}
          onMouseOut={this.handleMouseOut.bind(this, cell)}
          className={"agenda__cell " + cell.item.itemClasses}
        ></td>
      );
    };

    return (
      <div className="agenda">
        <div ref="scrollContainer" className="agenda__frame">
          <table>
            <thead>
              <tr>
                <th className="agenda__cell --controls">
                  <div className="agenda__prev" onClick={this.prevRange}></div>
                  <div className="agenda__next" onClick={this.nextRange}></div>
                </th>
                {this.getHeaderColumns().map(renderHeaderColumns)}
              </tr>
            </thead>
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
