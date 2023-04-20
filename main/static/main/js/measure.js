export function measureLength(){
// get a reference to the "length" dropdown item
const lengthItem = document.querySelector('#length');

// add an event listener to the "length" dropdown item
lengthItem.addEventListener('click', function() {

  // create a new instance of the OpenLayers Measure interaction
  var measure = new ol.interaction.Draw({
    type: 'LineString',
    source: new ol.source.Vector({}),
  });
  
  measure.on('drawend', function(event) {
    var geometry = event.feature.getGeometry().clone().transform('EPSG:4326', 'EPSG:3857');
    var length = geometry.getLength();
    console.log('Length: ' + length / 1000 + ' kilometers');
    event.feature.setProperties({
      createdBy: 'measure'
    });
  });


  // add the Measure interaction to the OpenLayers map
  map.addInteraction(measure);
});
}
