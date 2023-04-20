const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

const overlay = new ol.Overlay({
    element: container,
    autopan: {
        animation: {
            duration: 250,
        },
    },
});

/**
 * Add a click handler to hide the popup.
 * @return {boolean} Don't follow the href.
 */
closer.onclick = function () {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};


const selectStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: '#eeeeee',
    }),
    stroke: new ol.style.Stroke({
        color: 'rgba(255, 255, 255, 0.7)',
        width: 2,
    }),
});

let selected = null;
function handlePopup(e){

    if(selected !== null){
        selected.setStyle(undefined);
        selected = null;
    }
    map.forEachFeatureAtPixel(e.pixel, function(f){
        selected = f;
        selectStyle.getFill().setColor(f.get('COLOR') || '#eeeeee');
        f.setStyle(selectStyle);
        return true;
    });
    if (selected){
        let coordinates;
        if (selected.getGeometry().getType() == 'Point'){
            coordinates = selected.getGeometry().getCoordinates();
        } else {
            coordinates = ol.extent.getCenter(selected.getGeometry().getExtent());
        }
        const lon = coordinates[0];
        const lat = coordinates[1];

        const coordFormatted = '<code style="color:black;font-weight:bold;">' + (lon.toFixed(5)).toString() + ", " + (lat.toFixed(5)).toString() + '</code>';

        const properties = selected.values_;
        let contentHTML = '<ul>';
        for (const key in properties) {
        if (properties.hasOwnProperty(key) && key != 'geometry') {
            contentHTML += '<li style="font-size: 13.6px;"><strong>' +  key + ':</strong> ' + properties[key] + '</li>';
        }
        }
        contentHTML += '<li>' + coordFormatted + '</li></ul>';
        content.innerHTML = contentHTML;
        overlay.setPosition(coordinates);
    } else {
        overlay.setPosition(undefined);
        content.innerHTML = '';
    }
};

export { handlePopup, overlay }