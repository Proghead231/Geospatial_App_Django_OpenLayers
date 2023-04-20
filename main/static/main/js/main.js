
import { geolocation } from './geolocation.js';
import { LayerViewer } from './olCustomControls.js';
import { handlePopup } from './popups.js';
import { overlay } from './popups.js';
import { editAttrib } from './editFeatureAttributes.js';
import { measureLength } from './measure.js';

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


geolocation.setProjection(view.getProjection())

map.on('singleclick', handlePopup);
map.on('singleclick', editAttrib)

document.addEventListener("DOMContentLoaded", function() {
  measureLength()
});


