var React         = require('react');
var HvReactAgenda = require('hv-react-agenda');

var now = new Date((new Date()).getFullYear(), 5, 21);
var items = [
  {
    name          : 'Snorlax, I choose you!',
    startDateTime : new Date(now.getFullYear(), now.getMonth(), now.getDate()-7, 8, 24),
    endDateTime   : new Date(now.getFullYear(), now.getMonth(), now.getDate()-7, 8, 49),
    classes       : 'snorlax'
  },
  {
    name          : '\'Puff, I choose you!',
    startDateTime : new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 12, 56),
    endDateTime   : new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 20, 14),
    classes       : 'jigglypuff'
  },
  {
    name          : 'Select this time',
    startDateTime : new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 14, 06),
    endDateTime   : new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 16, 56),
    classes       : 'outline'
  },
  {
    name          : 'Select this time',
    startDateTime : new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 16, 06),
    endDateTime   : new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 18, 56),
    classes       : 'outline red',
    extra         : {
      other: 'data'
    }
  },
  {
    name          : 'Pikachu, I choose you! Gotta catch them all Pokemon!',
    startDateTime : new Date(now.getFullYear(), now.getMonth(), now.getDate()+3, 9, 35),
    endDateTime   : new Date(now.getFullYear(), now.getMonth(), now.getDate()+3, 11, 49),
    classes       : 'pikachu'
  },
  {
    name          : 'Charizard, I choose you!',
    startDateTime : new Date(now.getFullYear(), now.getMonth(), now.getDate()+7, 9, 14),
    endDateTime   : new Date(now.getFullYear(), now.getMonth(), now.getDate()+7, 17),
    classes       : 'charizard'
  }
];

var App = React.createClass({

  handleItemSelection: function(item) {
    console.log("you selected:", item);
  },

  handleDateRangeChange: function(startDate, endDate) {
    console.log("new date range:", startDate, endDate);
  },

  render: function() {
    return (
      <div>
        <HvReactAgenda minDate={now} maxDate={new Date(now.getFullYear(), now.getMonth()+3)} disablePrevButton={true} startDate={now} startAtTime={7} items={items} fixedHeader={true} onItemSelect={this.handleItemSelection} onDateRangeChange={this.handleDateRangeChange} />
      </div>
    )
  }

});

React.render(<App />, document.getElementsByTagName('body')[0]);
