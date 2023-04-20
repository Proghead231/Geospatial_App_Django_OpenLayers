import { styleFunction } from './olLayerStyles.js';
import { populateLayerDropdown } from './exportLayers.js';

export class LayerViewer extends ol.control.Control {
    /**
     * @param {Object} [opt_options] Control options.
     */
    constructor(opt_options) {
      const options = opt_options || {};
  
      const button = document.createElement('button');
      button.className = 'btn-layers'
      button.innerHTML = 'Load Layers';
  
      const element = document.createElement('div');
      element.className = 'btn-layers ol-unselectable ol-control';
      element.appendChild(button);
  
      super({
        element: element,
        target: options.target,
      });
  
      button.addEventListener('click', this.handleLayerViewer.bind(this), false);
    }
  
    async handleLayerViewer() {
      const button = this.element.querySelector('button');
      button.innerHTML = 'Loading';
      button.disabled = true;

      let dots = '';
      const interval = setInterval(() => {
        dots = dots.length < 5 ? dots + '.' : '';
        button.innerHTML = `Loading${dots}`;
      }, 500);
      try {
        const response = await $.ajax({
          url: '/',
          type: 'GET',
          dataType: 'json'
        });
        let dataList = response;
        
        for (let i = 0; i < dataList.length; i++) {
          let data = dataList[i];
          let layerExists = map.getLayers().getArray().some(layer => layer.get('name') === data.name);
          if (layerExists) continue;

          const vectorSource = new ol.source.Vector({
            features: new ol.format.GeoJSON().readFeatures(data.geojson)
          });
          const vectorLayer = new ol.layer.Vector({
            source: vectorSource,
            style: styleFunction
          });
          vectorLayer.set('name', data.name);
      
          map.addLayer(vectorLayer);
          populateLayerDropdown()
          limitUserUploads();
        }
      } catch (error) {
        console.log(error);
        button.innerHTML = 'Error Loading';
        button.disabled = false;
      }
      
      function limitUserUploads() {
        const layers = map.getLayers().getArray();
        if (layers.length > 12) {
          const fileBrowserButton = document.getElementById('file-upload');
          const importButton = document.getElementById('import-btn');
          importButton.disabled = true;
          importButton.innerHTML = "Reached Max Layers";
          const button = document.getElementById('my-button');
    
          if (fileBrowserButton) {
            fileBrowserButton.disabled = true;
          } 
        }
      }
      const layersElement = this.element.querySelector('.layers');
      if (layersElement) {
        this.element.removeChild(layersElement)
      }
      const layers = this.getMap().getLayers().getArray();
      const element2 = document.createElement('div');
      element2.className = 'layers ol-control';
      element2.innerHTML = '';
      layers.forEach(function(layer){
    
        const name = layer.get('name');
        
        if (name != 'user_location'){
          const layerDiv = document.createElement('div');
          layerDiv.id = 'label-div'
          // Create checkbox for layer
          const layerCheckbox = document.createElement('input');
          layerCheckbox.type = 'checkbox';
          layerCheckbox.checked = layer.getVisible();
          layerCheckbox.addEventListener('change', function() {
            layer.setVisible(this.checked);
          });
          layerDiv.appendChild(layerCheckbox);
      
          // Create label for layer
          const layerLabel = document.createElement('label');
          layerLabel.innerText = name;
          layerDiv.appendChild(layerLabel);
    
          //Create zoom button
          if (name != 'OpenStreetMap' && name != 'Satellite Imagery'){
            const layerZoomButton = document.createElement('button');
            layerZoomButton.innerText = "\u2316";
            layerZoomButton.addEventListener('click', function(){
              const extent = layer.getSource().getExtent();
              map.getView().fit(extent, {duration: 1000});
            });
            layerZoomButton.style.marginLeft = '10px';
            layerDiv.appendChild(layerZoomButton);
          }
            element2.appendChild(layerDiv);
    
        }
      });
      this.element.appendChild(element2);
      clearInterval(interval);
      button.innerHTML = 'Load Layers';
      button.disabled = false;
    }
    
  }

