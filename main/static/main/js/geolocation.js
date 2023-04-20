// Geolocation
//Geolocation
function el(id){
    return document.getElementById(id);
}

//Geolocation
var geolocation = new ol.Geolocation({
    trackingOption: {
        enableHighAccuracy: true,
    },

});

geolocation.on('change', function(){
    el('accuracy').innerText = geolocation.getAccuracy() + ' [m]';
    el('altitude').innerText = geolocation.getAltitude() + ' [m]';
    el('altitudeAccuracy').innerText = geolocation.getAltitudeAccuracy() + ' [m]';
    el('heading').innerText = geolocation.getHeading() + ' [rad]';
    el('speed').innerText = geolocation.getSpeed() + ' [m/s]';
});

var accuracyFeature = new ol.Feature();
geolocation.on('change:accuracyGeometry', function () {
  accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
});

var positionFeature = new ol.Feature();
positionFeature.setStyle(
  new ol.style.Style({
    image: new ol.style.Circle({
      radius: 6,
      fill: new ol.style.Fill({
        color: '#3399CC',
      }),
      stroke: new ol.style.Stroke({
        color: '#fff',
        width: 2,
      }),
    }),
  })
);

geolocation.on('change:position', function () {
  var coordinates = geolocation.getPosition();
  positionFeature.setGeometry(coordinates ? new ol.geom.Point(coordinates) : null);
});


el('track').addEventListener('change', function () {
  if (this.checked){
    geolocation.setTracking(true);
    user_location.setVisible(true)
    console.log(user_location)
    map.addLayer(user_location)
  }
  else {
    geolocation.setTracking(false);
    // Hide the existing VectorLayer
    user_location.setVisible(false);
    positionFeature.setGeometry(null);
    accuracyFeature.setGeometry(null);
  }
  
});

var user_location = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: [accuracyFeature, positionFeature],
    }),
  });
user_location.set('name', 'user_location')



const recenterButton = document.getElementById("recenter")
recenterButton.addEventListener('click', handleRecenter)

function handleRecenter() {
  let userLocationLayerExists = false;
  const layers = map.getLayers().getArray();
  layers.forEach(function(layer){
    if (layer.get('name') == 'user_location'){
      userLocationLayerExists = true;
    }
    else {
      userLocationLayerExists = false;
      }
  });
  if (userLocationLayerExists == true) {
    map.getView().fit(user_location.getSource().getExtent(), {duration: 1000})
  } else {
    alert("Turn tracking on first.")
  }
}

export {
    user_location,
    geolocation
  }