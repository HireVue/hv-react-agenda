var React         = require('react');
var HvReactAgenda = require('hv-react-agenda');

var now = new Date(2015, 5, 24);
var itemClasses = [
  {
    itemName      : 'Snorlax, I choose you!',
    startDateTime : new Date(now.getFullYear(), now.getMonth(), now.getDate()-7, 8, 24),
    endDateTime   : new Date(now.getFullYear(), now.getMonth(), now.getDate()-7, 8, 49),
    classNames    : 'snorlax'
  },
  {
    itemName      : '\'Puff, I choose you!',
    startDateTime : new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 12, 56),
    endDateTime   : new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 20, 14),
    classNames    : 'jigglypuff'
  },
  {
    itemName      : 'Select this time',
    startDateTime : new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 16, 56),
    endDateTime   : new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 20, 14),
    classNames    : 'outline'
  },
  {
    itemName      : 'Pikachu, I choose you!',
    startDateTime : new Date(now.getFullYear(), now.getMonth(), now.getDate()+3, 9, 35),
    endDateTime   : new Date(now.getFullYear(), now.getMonth(), now.getDate()+3, 11, 49),
    classNames    : 'pikachu'
  },
  {
    itemName      : 'Charizard, I choose you!',
    startDateTime : new Date(now.getFullYear(), now.getMonth(), now.getDate()+7, 9, 14),
    endDateTime   : new Date(now.getFullYear(), now.getMonth(), now.getDate()+7, 17),
    classNames    : 'charizard'
  }
];

var App = React.createClass({

  render: function() {
    return (
      <div>
        <HvReactAgenda startDate={now} startAtTime={7} itemClasses={itemClasses} />
      </div>
    )
  }

});

React.render(<App />, document.getElementsByTagName('body')[0]);
