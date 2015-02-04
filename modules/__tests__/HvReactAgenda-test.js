var assert        = require('assert');
var React         = require('react/addons');
var TestUtils     = React.addons.TestUtils;
var HvReactAgenda = require('../HvReactAgenda');

function createAgenda(props) {
  props              = props              || {};
  props.locale       = props.locale       || 'en';
  props.startDate    = props.startDate    || new Date(2015, 1, 1);
  props.startAtTime  = props.startAtTime  || 8;
  props.rowsPerHour  = props.rowsPerHour  || 4;
  props.numberOfDays = props.numberOfDays || 5;
  props.fixedHeader  = props.fixedHeader  || null;
  props.items        = props.items        || null;
  props.onItemSelect = props.onItemSelect || null;

  return (
    <HvReactAgenda
      locale={props.locale}
      startDate={props.startDate}
      startAtTime={props.startAtTime}
      rowsPerHour={props.rowsPerHour}
      numberOfDays={props.numberOfDays}
      fixedHeader={props.fixedHeader}
      items={props.items}
      onItemSelect={props.onItemSelect}
    />
  );
}

describe('HvReactAgenda', function() {

  describe('interaction', function() {

    it('should go to the next timespan when next button clicked', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda());
      TestUtils.Simulate.click(agenda.getDOMNode().getElementsByClassName('agenda__next')[0]);
      var colLabel = agenda.getDOMNode().getElementsByClassName('agenda__table --head')[0].childNodes[1].childNodes[1].innerHTML;
      assert.equal(colLabel, "Fri 2/6");
      done();
    });

    it('should go to the previous timespan when the previous button clicked', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda());
      TestUtils.Simulate.click(agenda.getDOMNode().getElementsByClassName('agenda__prev')[0]);
      var colLabel = agenda.getDOMNode().getElementsByClassName('agenda__header')[0].childNodes[1].childNodes[1].innerHTML;
      assert.equal(colLabel, "Tue 1/27");
      done();
    });

  });

   describe('props', function() {

    it('should default to english header', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda());
      var colLabel = agenda.getDOMNode().getElementsByClassName('agenda__header')[0].childNodes[1].childNodes[1].innerHTML;
      assert.equal(colLabel, "Sun 2/1");
      done();
    });

    it('should default to english times', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda());
      var colLabel = agenda.getDOMNode().getElementsByClassName('agenda__cell --time')[0].innerHTML;
      assert.equal(colLabel, "12:00 AM");
      done();
    });

    it('should localize header when given a locale', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda({locale: 'de'}));
      var colLabel = agenda.getDOMNode().getElementsByClassName('agenda__header')[0].childNodes[1].childNodes[1].innerHTML;
      assert.equal(colLabel, "So. 2/1");
      done();
    });

    it('should localize times when given a locale', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda({locale: 'fr'}));
      var colLabel = agenda.getDOMNode().getElementsByClassName('agenda__cell --time')[0].innerHTML;
      assert.equal(colLabel, "00:00");
      done();
    });

    it('should allow for explicit setting of start date', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda({currentDate: new Date(2014, 6, 1)}));
      var colLabel = agenda.getDOMNode().getElementsByClassName('agenda__header')[0].childNodes[1].childNodes[1].innerHTML;
      assert.equal(colLabel, "Sun 2/1");
      done();
    });

    it('should allow 1 rows per hour', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda({rowsPerHour: 1}));
      var minuteCells = agenda.getDOMNode().getElementsByClassName('agenda__cell');
      assert.equal(minuteCells.length, 156);
      done();
    });

    it('should allow 2 rows per hour', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda({rowsPerHour: 2}));
      var minuteCells = agenda.getDOMNode().getElementsByClassName('agenda__cell');
      assert.equal(minuteCells.length, 276);
      done();
    });

    it('should allow 3 rows per hour', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda({rowsPerHour: 3}));
      var minuteCells = agenda.getDOMNode().getElementsByClassName('agenda__cell');
      assert.equal(minuteCells.length, 396);
      done();
    });

    it('should allow 4 rows per hour', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda({rowsPerHour: 4}));
      var minuteCells = agenda.getDOMNode().getElementsByClassName('agenda__cell');
      assert.equal(minuteCells.length, 516);
      done();
    });

    it('should allow 1 day', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda({numberOfDays: 1}));
      var headerCells = agenda.getDOMNode().getElementsByClassName('agenda__cell --head');
      assert.equal(headerCells.length, 2); // spec and real
      done();
    });

    it('should allow 2 days', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda({numberOfDays: 2}));
      var headerCells = agenda.getDOMNode().getElementsByClassName('agenda__cell --head');
      assert.equal(headerCells.length, 4); // spec and real
      done();
    });

    it('should allow 3 day', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda({numberOfDays: 3}));
      var headerCells = agenda.getDOMNode().getElementsByClassName('agenda__cell --head');
      assert.equal(headerCells.length, 6); // spec and real
      done();
    });

    it('should allow 4 day', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda({numberOfDays: 4}));
      var headerCells = agenda.getDOMNode().getElementsByClassName('agenda__cell --head');
      assert.equal(headerCells.length, 8); // spec and real
      done();
    });

    it('should allow 5 day', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda({numberOfDays: 5}));
      var headerCells = agenda.getDOMNode().getElementsByClassName('agenda__cell --head');
      assert.equal(headerCells.length, 10); // spec and real
      done();
    });

    it('should allow 6 day', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda({numberOfDays: 6}));
      var headerCells = agenda.getDOMNode().getElementsByClassName('agenda__cell --head');
      assert.equal(headerCells.length, 12); // spec and real
      done();
    });

    it('should allow 7 day', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda({numberOfDays: 7}));
      var headerCells = agenda.getDOMNode().getElementsByClassName('agenda__cell --head');
      assert.equal(headerCells.length, 14); // spec and real
      done();
    });

    it('should support having a fixed header', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda({fixedHeader: true}));
      var headerStyle = agenda.getDOMNode().getElementsByClassName('agenda__header')[0].childNodes[1].style.position;
      assert.equal(headerStyle, 'fixed');
      done();
    });

    it('should support displaying various items', function(done) {
      var props = {
        startDate: new Date(2014, 1, 1),
        items: [
          {
            name: "Squirtle",
            startDateTime: new Date(2014, 1, 1, 8),
            endDateTime: new Date(2014, 1, 1, 12),
            classes: 'squirtle'
          },
          {
            name: "Blastoise",
            startDateTime: new Date(2014, 1, 2, 9),
            endDateTime: new Date(2014, 1, 2, 17),
            classes: 'blastoise'
          },
          {
            name: "Warturtle",
            startDateTime: new Date(2014, 1, 6, 3),
            endDateTime: new Date(2014, 1, 6, 8),
            classes: 'warturtle'
          },
        ]
      };
      var agenda = TestUtils.renderIntoDocument(createAgenda(props));

      var case1 = agenda.getDOMNode().getElementsByClassName('squirtle');
      assert.equal(case1.length, 16);

      var case2 = agenda.getDOMNode().getElementsByClassName('blastoise');
      assert.equal(case2.length, 32);

      // not in current timespan, so shouldn't be found
      var case3 = agenda.getDOMNode().getElementsByClassName('warturtle');
      assert.equal(case3.length, 0);

      // make sure it's found where it's supposed to be
      TestUtils.Simulate.click(agenda.getDOMNode().getElementsByClassName('agenda__next')[0]);
      var case4 = agenda.getDOMNode().getElementsByClassName('warturtle');
      assert.equal(case4.length, 20);
      done();
    });

    it('should handle clicks', function(done) {
      var result;
      var item = {
        name: "Squirtle",
        startDateTime: new Date(2014, 1, 1, 8),
        endDateTime: new Date(2014, 1, 1, 12),
        classes: 'squirtle',
        extra: "data"
      };
      var props = {
        startDate: new Date(2014, 1, 1),
        items: [item],
        onItemSelect: function(item) {
          result = item;
        }
      };
      var agenda = TestUtils.renderIntoDocument(createAgenda(props));
      TestUtils.Simulate.click(agenda.getDOMNode().getElementsByClassName('agenda__cell')[202]);
      assert.equal(result.name, item.name);
      assert.equal(result.classes, item.classes);
      assert.equal(result.extra, item.extra);
      assert.equal(result.startDateTime, item.startDateTime);
      assert.equal(result.endDateTime, item.endDateTime);
      done();
    });

  });

});
