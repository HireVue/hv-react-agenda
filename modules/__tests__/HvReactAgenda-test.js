var assert        = require('assert');
var React         = require('react/addons');
var TestUtils     = React.addons.TestUtils;
var HvReactAgenda = require('../HvReactAgenda');

function createAgenda(props) {
  props                   = props                   || {};
  props.locale            = props.locale            || 'en';
  props.startDate         = props.startDate         || new Date(2015, 1, 1);
  props.startAtTime       = props.startAtTime       || 8;
  props.rowsPerHour       = props.rowsPerHour       || 4;
  props.numberOfDays      = props.numberOfDays      || 5;
  props.disablePast       = props.disablePast       || false;
  props.items             = props.items             || null;
  props.onItemSelect      = props.onItemSelect      || null;
  props.onDateRangeChange = props.onDateRangeChange || null;

  return (
    <HvReactAgenda
      locale={props.locale}
      startDate={props.startDate}
      startAtTime={props.startAtTime}
      rowsPerHour={props.rowsPerHour}
      numberOfDays={props.numberOfDays}
      disablePast={props.disablePast}
      items={props.items}
      onItemSelect={props.onItemSelect}
      onDateRangeChange={props.onDateRangeChange}
    />
  );
}

describe('HvReactAgenda', function() {

  describe('interaction', function() {

    it('should go to the next timespan when next button clicked', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda());
      TestUtils.Simulate.click(agenda.getDOMNode().getElementsByClassName('agenda__next')[0]);
      var colLabel = agenda.getDOMNode().getElementsByClassName('agenda__cell --head')[0].innerHTML;
      assert.equal(colLabel, "Fri 2/6");
      done();
    });

    it('should go to the previous timespan when the previous button clicked', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda());
      TestUtils.Simulate.click(agenda.getDOMNode().getElementsByClassName('agenda__prev')[0]);
      var colLabel = agenda.getDOMNode().getElementsByClassName('agenda__cell --head')[0].innerHTML;
      assert.equal(colLabel, "Tue 1/27");
      done();
    });

    it('should handle change of date range', function(done) {
      var startDate, endDate;
      var props = {
        startDate: new Date(2014, 1, 1),
        onDateRangeChange: function(newStartDate, newEndDate) {
          startDate = newStartDate;
          endDate   = newEndDate;
        }
      };
      var agenda = TestUtils.renderIntoDocument(createAgenda(props));
      TestUtils.Simulate.click(agenda.getDOMNode().getElementsByClassName('agenda__next')[0]);
      assert.equal(startDate.getTime(), (new Date(2014, 1, 6)).getTime());
      assert.equal(endDate.getTime(), (new Date(2014, 1, 10)).getTime());
      TestUtils.Simulate.click(agenda.getDOMNode().getElementsByClassName('agenda__prev')[0]);
      assert.equal(startDate.getTime(), (new Date(2014, 1, 1)).getTime());
      assert.equal(endDate.getTime(), (new Date(2014, 1, 5)).getTime());
      done();
    });

  });

   describe('props', function() {

    it('should default to english header', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda());
      var colLabel = agenda.getDOMNode().getElementsByClassName('agenda__cell --head')[0].innerHTML;
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
      var colLabel = agenda.getDOMNode().getElementsByClassName('agenda__cell --head')[0].innerHTML;
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
      var colLabel = agenda.getDOMNode().getElementsByClassName('agenda__cell --head')[0].innerHTML;
      assert.equal(colLabel, "Sun 2/1");
      done();
    });

    it('should allow 1 rows per hour', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda({rowsPerHour: 1}));
      var minuteCells = agenda.getDOMNode().getElementsByClassName('agenda__cell');
      assert.equal(minuteCells.length, 150);
      done();
    });

    it('should allow 2 rows per hour', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda({rowsPerHour: 2}));
      var minuteCells = agenda.getDOMNode().getElementsByClassName('agenda__cell');
      assert.equal(minuteCells.length, 270);
      done();
    });

    it('should allow 3 rows per hour', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda({rowsPerHour: 3}));
      var minuteCells = agenda.getDOMNode().getElementsByClassName('agenda__cell');
      assert.equal(minuteCells.length, 390);
      done();
    });

    it('should allow 4 rows per hour', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda({rowsPerHour: 4}));
      var minuteCells = agenda.getDOMNode().getElementsByClassName('agenda__cell');
      assert.equal(minuteCells.length, 510);
      done();
    });

    it('should allow 1 day', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda({numberOfDays: 1}));
      var headerCells = agenda.getDOMNode().getElementsByClassName('agenda__cell --head');
      assert.equal(headerCells.length, 1);
      done();
    });

    it('should allow 2 days', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda({numberOfDays: 2}));
      var headerCells = agenda.getDOMNode().getElementsByClassName('agenda__cell --head');
      assert.equal(headerCells.length, 2);
      done();
    });

    it('should allow 3 day', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda({numberOfDays: 3}));
      var headerCells = agenda.getDOMNode().getElementsByClassName('agenda__cell --head');
      assert.equal(headerCells.length, 3);
      done();
    });

    it('should allow 4 day', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda({numberOfDays: 4}));
      var headerCells = agenda.getDOMNode().getElementsByClassName('agenda__cell --head');
      assert.equal(headerCells.length, 4);
      done();
    });

    it('should allow 5 day', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda({numberOfDays: 5}));
      var headerCells = agenda.getDOMNode().getElementsByClassName('agenda__cell --head');
      assert.equal(headerCells.length, 5);
      done();
    });

    it('should allow 6 day', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda({numberOfDays: 6}));
      var headerCells = agenda.getDOMNode().getElementsByClassName('agenda__cell --head');
      assert.equal(headerCells.length, 6);
      done();
    });

    it('should allow 7 day', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda({numberOfDays: 7}));
      var headerCells = agenda.getDOMNode().getElementsByClassName('agenda__cell --head');
      assert.equal(headerCells.length, 7);
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
      TestUtils.Simulate.click(agenda.getDOMNode().getElementsByClassName('agenda__cell')[196]);
      assert.equal(result.name, item.name);
      assert.equal(result.classes, item.classes);
      assert.equal(result.extra, item.extra);
      assert.equal(result.startDateTime, item.startDateTime);
      assert.equal(result.endDateTime, item.endDateTime);
      done();
    });

    it('should show today if set to past date while past is disabled', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda({startDate: new Date()}));
      var todayLabel = agenda.getDOMNode().getElementsByClassName('agenda__cell --head')[0].innerHTML;

      var props = {
        startDate   : new Date(2014, 0, 1),
        disablePast : true
      };
      var newAgenda  = TestUtils.renderIntoDocument(createAgenda(props));
      var afterLabel = newAgenda.getDOMNode().getElementsByClassName('agenda__cell --head')[0].innerHTML;
      assert.equal(todayLabel, afterLabel);
      done();
    });

    it('should prevent from going to the past if the past is disabled', function(done) {
      var agenda = TestUtils.renderIntoDocument(createAgenda({startDate: new Date()}));
      var todayLabel = agenda.getDOMNode().getElementsByClassName('agenda__cell --head')[0].innerHTML;

      var props = {
        startDate   : new Date(),
        disablePast : true
      };
      var newAgenda  = TestUtils.renderIntoDocument(createAgenda(props));
      TestUtils.Simulate.click(newAgenda.getDOMNode().getElementsByClassName('agenda__prev')[0]);
      TestUtils.Simulate.click(newAgenda.getDOMNode().getElementsByClassName('agenda__prev')[0]);
      TestUtils.Simulate.click(newAgenda.getDOMNode().getElementsByClassName('agenda__prev')[0]);
      TestUtils.Simulate.click(newAgenda.getDOMNode().getElementsByClassName('agenda__prev')[0]);
      var afterLabel = newAgenda.getDOMNode().getElementsByClassName('agenda__cell --head')[0].innerHTML;
      assert.equal(todayLabel, afterLabel);
      done();
    });

  });

});
