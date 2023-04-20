import { styleFunction } from './olLayerStyles.js';
import { geolocation } from './geolocation.js';
import { LayerViewer } from './olCustomControls.js';
import { handlePopup } from './popups.js';
import { overlay } from './popups.js';
import { editAttrib } from './editFeatureAttributes.js';
import { populateLayerDropdown } from './exportLayers.js';

const view = new ol.View({
    center: [0, 0],
    zoom: 2,
    projection: 'EPSG:4326'
  })

const osmLayer =   new ol.layer.Tile ({
  source: new ol.source.OSM(),
})
osmLayer.set('name', 'OpenStreetMap')

const worldImagery = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 19,
  })
});
worldImagery.set('name', 'Satellite Imagery');
worldImagery.setVisible(false);

const map = new ol.Map({
  layers: [osmLayer, worldImagery],
  target: 'map',
  view: view,
  overlays: [overlay],
  controls: ol.control.defaults.defaults()
});
window.map = map
const layerViewer = new LayerViewer()
map.addControl(layerViewer)
populateLayerDropdown()

geolocation.setProjection(view.getProjection())

map.on('singleclick', handlePopup);
map.on('singleclick', editAttrib)



$.ajax({
  url: '/',
  type: 'GET',
  dataType: 'json',
  success: get_data,
  error: function(xhr, status, error) {
      console.log(error);
  }
});

function get_data(response) {
  //console.log(response)
  let dataList = response;
  
  for (let i = 0; i < dataList.length; i++) {
    let data = dataList[i];

    const vectorSource = new ol.source.Vector({
      features: new ol.format.GeoJSON().readFeatures(data.geojson)
    });
    const vectorLayer = new ol.layer.Vector({
      source: vectorSource,
      style: styleFunction
      });
    vectorLayer.set('name', data.name)

    map.addLayer(vectorLayer)

    limitUserUploads()
  }
}

function limitUserUploads(){
  const layers = map.getLayers().getArray()
  console.log(layers.length)
  if (layers.length == 13){
    const fileBrowserButton = document.getElementById('file-upload')
    const importButton = document.getElementById('import-btn')
    importButton.disabled = true;
    importButton.innerHTML = "Reached Max Layers"
    const button = document.getElementById('my-button');

    if (fileBrowserButton) {
      fileBrowserButton.disabled = true;
    } 
    
  }
}
