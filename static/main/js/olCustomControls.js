export class LayerViewer extends ol.control.Control {
    /**
     * @param {Object} [opt_options] Control options.
     */
    constructor(opt_options) {
      const options = opt_options || {};
  
      const button = document.createElement('button');
      button.className = 'btn-layers'
      button.innerHTML = 'View Layers';
  
      const element = document.createElement('div');
      element.className = 'btn-layers ol-unselectable ol-control';
      element.appendChild(button);
  
      super({
        element: element,
        target: options.target,
      });
  
      button.addEventListener('click', this.handleLayerViewer.bind(this), false);
    }
  
    handleLayerViewer() {
        const layers = this.getMap().getLayers().getArray();
        const element2 = document.createElement('div');
        element2.className = 'layers ol-control';
      
        layers.forEach(function(layer){

          const name = layer.get('name');
          
          if (name != 'user_location'){
            const layerDiv = document.createElement('div');
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
        while (this.element.firstChild) {
          this.element.removeChild(this.element.firstChild);
        }
        this.element.appendChild(element2);
      }
  }

