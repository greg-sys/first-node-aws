const Joi = require('joi'); // Joi is capitalized b/c class is returned
const express = require('express');
const cors = require('cors');
const app = express();
const router = express.Router();

var swisseph = require('swisseph');
var assert = require('assert');
const { response } = require('express');

app.use(express.json()); // enable parsing of JSON objects -- example of middleware
app.use(cors()); // enable Cross-Origin Resource Sharing

const courses = [
    { id: 1, name: 'course1'},
    { id: 2, name: 'course2'},
    { id: 3, name: 'course3'}
];
/*
const planetaryPositions = [
        {
        sun: 5,
        moon: 10,
        mars: 6,
        mercury: 6,
        jupiter: 3,
        venus: 6,
        saturn: 4,
        rahu: 5,
        ketu: 4,
        uranus: 6
    }
]; 
*/

var planetaryPositions = [
{
    sun: 1,
    moon: 2,
    mars: 3,
    mercury: 4,
    jupiter: 5,
    venus: 6,
    saturn: 7,
    rahu: 8,
    ketu: 9,
    uranus: 10
}]; 

router.get('/', (req, res) => {
    res.send('Hello World');
});

router.get('/planets', (req, res) => {
    res.json(planetaryPositions);
});

router.get('/date', (req, res) => {
    var date = {year: 2015, month: 1, day: 1, hour: 0};
    var julday = swisseph.swe_julday(date.year, date.month, date.day, date.hour, swisseph.SE_GREG_CAL);
    res.json(julday);
});

router.get('/siderealPlanets', (req, res) => {
    // path to ephemeris data
    swisseph.swe_set_ephe_path (__dirname + '/../ephe');
    // set ayanamsa to standard Lahiri
    swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);
    var flag = swisseph.SEFLG_SIDEREAL | swisseph.SEFLG_SPEED; // use sidereal position, high precision
    var date = {year: 1978, month: 10, day: 14, hour: 2};
    // var responseString = "";
    const planetaryFlags = {"sun": swisseph.SE_SUN, "moon": swisseph.SE_MOON, "mars": swisseph.SE_MARS, "mercury": swisseph.SE_MERCURY, "jupiter": swisseph.SE_JUPITER, "venus": swisseph.SE_VENUS, "saturn": swisseph.SE_SATURN, "uranus": swisseph.SE_URANUS, "rahu": swisseph.SE_TRUE_NODE, "ketu": swisseph.SE_TRUE_NODE}; 
    // responseString += ('Test date:' + JSON.stringify(date));
    // Julian day
    swisseph.swe_julday (date.year, date.month, date.day, date.hour, swisseph.SE_GREG_CAL, function (julday_ut) {
        //nresponseString += ('Julian UT day for date:' + julday_ut);
        localPlanetaryPositions = planetaryPositions[0];
        for (const planet in localPlanetaryPositions) {
            // calculate planetary positions
            swisseph.swe_calc_ut (julday_ut, planetaryFlags[planet], flag, function (body) {
                assert (!body.error, body.error);
                // assuming parseInt returns only integer part without rounding
                // responseString += ('Planet ' + planet + " longitude: " + JSON.stringify(parseInt((body.longitude / 30))));
                if (planet === "ketu") { // place ketu 180 degrees apart from rahu
                    body.longitude += 180;
                    if (body.longitude > 360) { // wrap around circle if necessary
                        body.longitude -= 360;
                    }
                }
                localPlanetaryPositions[planet] = parseInt((body.longitude / 30)); // should assign position to planet
            });
        }
    });
    // four lines below from StackOverflow to allow CORS
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Credentials', true)
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    res.json(localPlanetaryPositions);
});

router.get('/test', (req, res) => {
    // Test date
    var date = {year: 2012, month: 1, day: 1, hour: 0};
    var responseString = "";
    responseString += ('Test date:' + JSON.stringify(date));

    var flag = swisseph.SEFLG_SPEED;

    // path to ephemeris data
    swisseph.swe_set_ephe_path (__dirname + '/../ephe');

    // Julian day
    swisseph.swe_julday (date.year, date.month, date.day, date.hour, swisseph.SE_GREG_CAL, function (julday_ut) {
        assert.equal (julday_ut, 2455927.5);
        responseString += ('Julian UT day for date:'+ julday_ut);

        // Sun position
        swisseph.swe_calc_ut (julday_ut, swisseph.SE_SUN, flag, function (body) {
            assert (!body.error, body.error);
            responseString += ('Sun position:'+ JSON.stringify(body));
        });

        // Moon position
        swisseph.swe_calc_ut (julday_ut, swisseph.SE_MOON, flag, function (body) {
            assert (!body.error, body.error);
            responseString += ('Moon position:'+ JSON.stringify(body));
        });
        // Mercury position
        swisseph.swe_calc_ut (julday_ut, swisseph.SE_MERCURY, flag, function (body) {
            assert (!body.error, body.error);
            responseString += ('Mercury position:'+ JSON.stringify(body));
        });
        // Mars position
        swisseph.swe_calc_ut (julday_ut, swisseph.SE_MARS, flag, function (body) {
            assert (!body.error, body.error);
            responseString += ('Mars position:'+ JSON.stringify(body));
        });
    });
    res.send(responseString);
});

module.exports = router;