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


function searchToLatLng(request,response) {
  const locationName = request.query.data
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${locationName}&key=${process.env.GEOCODE_API_KEY}`;
  // const geoData = require('./data/geo.json');
  superagent.get(url).then(result => {
    let location = new Location(
      locationName,
      result.body.results[0].formatted_address,
      result.body.results[0].geometry.location.lat,
      result.body.results[0].geometry.location.lng
    );
    response.send(location);
    console.log(location);
  }).catch(e =>{
    console.error(e);
    response.status(500).send('Status 500, not functional.');
  })
}

function Weather(weatherData) {
  this.forecast = weatherData.summary;
  let weatherTime = weatherData.time * 1000;
  this.time = new Date(weatherTime).toDateString();
}

function getWeatherRoute(request,response) {
  // eslint-disable-next-line no-unused-vars
  const locationName = request.query.data
  console.log(request.query);
  const url = process.env.WEATHER_API_KEY;
  superagent.get(url).then(result => {
    let daysWeather = result.body.daily.data.map((el )=>
      new Weather(el)
    )
    response.send(daysWeather)
    console.log(daysWeather);
  })
}


// Start the server.
app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
