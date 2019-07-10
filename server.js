'use strict'
// API Dependencies
require('dotenv').config();

const express = require('express');
const cors = require('cors');
//New Commit
// Globals
const PORT = process.env.PORT || 3000;

// Make the server
const app = express();
app.use(cors());

// Location Route
app.get('/location', (request, response) => {
  // console.log(request.query.data);
  try {
    const locationData = searchToLatLng(request.query.data);
    response.send(locationData);
  }
  catch (e) {
    response.status(500).send('Status 500, not functional.');
  }
});

// Weather Route
app.get('/weather', (request, response) => {
  try {
    const weatherData = getWeatherRoute(request.query.data);
    response.send(weatherData);
  }
  catch (e) {
    response.status(500).send('Status 500, not functional.');
  }
});
app.get('/',(request,response) =>{
  try{
    response.send('server live');
  }catch(e){
    response.status(500).send('Status 500, not functional.');
  }
});
app.use('*',(request,response)=>{
  response.send('you got to the wrong place')
})

function Location(name, formatted, lat, lng) {
  this.search_query = name;
  this.formatted_query = formatted;
  this.latitude = lat;
  this.longitude = lng;
}


function searchToLatLng(locationName) {
  const geoData = require('./data/geo.json');
  let location = new Location(
    locationName,
    geoData.results[0].formatted_address,
    geoData.results[0].geometry.location.lat,
    geoData.results[0].geometry.location.lng
  );
  return location;
}

function Weather(weatherData) {
  this.forecast = weatherData.summary;
  let weatherTime = weatherData.time * 1000;
  this.time = new Date(weatherTime).toDateString();
}

function getWeatherRoute(locationName) {
  const weatherData = require('./data/darksky.json');

  return weatherData.daily.data.map((el )=>
    new Weather(el)
  )
}


// Start the server.
app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
