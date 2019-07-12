'use strict'
// API Dependencies
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const superagent = require('superagent')
// Globals
const PORT = process.env.PORT || 3000;

// Make the server
const app = express();
app.use(cors());

// Location Route
app.get('/location', searchToLatLng);
// Weather Route
app.get('/weather', getWeatherRoute);
//Event Route
app.get('/events', getEventRoute);

app.use('*', (request, response) => response.send('you got to the wrong place'));

//==================Location Route=================================
function Location(query, result) {
  this.search_query = query,
  //console.log(result.body);
  this.formatted_query = result.body.results[0].formatted_address,

  this.latitude = result.body.results[0].geometry.location.lat,
  this.longitude = result.body.results[0].geometry.location.lng;
}

function searchToLatLng(request,response) {
  const locationName = request.query.data
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${locationName}&key=${process.env.GEOCODE_API_KEY}`;
  superagent.get(url).then(result => {
    let location = new Location(locationName, result);
    response.send(location);
    // response.send(new Location(locationName, result));
    // console.log(location);
  }).catch(e =>{
    console.error(e);
    response.status(500).send('Status 500, not functional.');
  });
}

//===========Weather Route======================================
function Weather(weatherData) {
  this.forecast = weatherData.summary;
  let time  = new Date(weatherData.time*1000).toDateString();
  this.time = time;
}

function getWeatherRoute(request,response) {
  const weatherData = request.query.data;
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${weatherData.latitude},${weatherData.longitude}`;
  superagent.get(url).then(result => {
    let daysWeather = result.body.daily.data.map((el )=> {
      return new Weather(el)
    });
    response.send(daysWeather);
  }).catch(e =>{
    console.error(e);
    response.status(500).send('Status 500, not functional.');
  })
}

//============Eventbrite=================
//Event constructor
function Event (event) {
  this.link = event.url,
  this.name = event.name.text,
  this.event_brite = new Date(event.start.local).toDateString(),
  this.summary = event.summary;
}

//Route function
function getEventRoute(request, response) {
  const eventData = request.query.data;

  const url = `https://www.eventbriteapi.com/v3/events/search/?location.longitude=${eventData.longitude}&location.latitude=${eventData.latitude}&expand=venue&token=${process.env.EVENTBRITE_API_KEY}`;

  superagent.get(url).then(result => {
    let eventSummery = result.body.events.map((event) => {
      return new Event(event);
    });
    response.send(eventSummery);
    console.log(eventSummery);
  }).catch(e =>{
    console.error(e);
    response.status(500).send('Status 500, not functional.');

  });
}
//================Start the server============================
app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
