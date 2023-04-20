function populateLayerDropdown(){
    setTimeout(() => {
        //Populate the dropdown
        const dropdown = document.querySelector('#layer-dropdown');
        let layers = map.getLayers().getArray();

        let layerNames = [];
        layers.forEach(function(layer) {
            const name = layer.get('name');
            layerNames.push(name);
        });
        layerNames.forEach(layerName => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.innerText = layerName;
            a.href = "#";
            li.appendChild(a);
            dropdown.appendChild(li);


            //Download Selected layer
            a.addEventListener('click', () => createKML(layerName));


        });
    }, 3000);
}

function createKML(layerName) {
    // Get the selected layer
    const selectedLayer = map.getLayers().getArray().find(layer => layer.get('name') === layerName);
    // Convert the layer to a KML file
    const format = new ol.format.KML();
    const features = selectedLayer.getSource().getFeatures();
    const kmlBlob = new Blob([format.writeFeatures(features)], { type: 'application/vnd.google-earth.kml+xml' });
  
    // Create a download button for the KML file
    const downloadButton = document.createElement('button');
    downloadButton.innerText = 'Download ' + layerName + ' KML';
    downloadButton.addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(kmlBlob);
      a.download = layerName + '.kml';
      a.click();
    });
  
    // Append the download button to the layer-dropdown-div div
    const dropdownDiv = document.getElementById('layer-dropdown-div');
    dropdownDiv.appendChild(downloadButton);
  }

export {
    populateLayerDropdown
}