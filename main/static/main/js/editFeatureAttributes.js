function editAttrib(e) {
    const pixel = e.pixel;
    const feature = map.forEachFeatureAtPixel(pixel, function (feature, layer) {
    const layers = map.getLayers().getArray();
    if (feature.get('createdBy') === 'measure' || (layer && !layers.includes(layer))) {
        return null; // exclude the feature
    }
        return feature;
    });

    //Create a editable table for the selected feature using its attributes
    if (feature) {
        const properties = feature.getProperties();
        const propNames = Object.keys(properties);

        let tableHtml = `<div id="table-wrapper"><button class="btn btn-secondary" id="close-btn">Close</button><table class="table" id="attrib-table"><thead><tr><th scope="col">Property</th><th scope="col">Value</th></tr></thead><tbody>`;

            
        propNames.forEach(function (propName) {
        if (propName != "geometry") {
        const propValue = properties[propName];
        tableHtml +=
        '<tr><td>' +
        propName +
        '</td>' +
        '<td contenteditable="true" data-propname="' +
        propName +
        '">' +
        propValue +
        "</td>" +
        "</tr>";
        }
        });
        tableHtml += "</tbody></table>";

        const featAttribDiv = document.getElementById("feat-attr");
        featAttribDiv.innerHTML = "<p>Edit attributes by clicking on values</p>";
        featAttribDiv.innerHTML += tableHtml;

    // Add click event listener for close button
    const closeBtn = document.getElementById("close-btn");
    closeBtn.addEventListener("click", function() {
        featAttribDiv.innerHTML = "";
    });

    const tableCells = document.querySelectorAll("#attrib-table td[contenteditable]");
    tableCells.forEach(function (cell) {
        console.log("for loop")
        cell.addEventListener("blur", function (event) {
            console.log("event listener triggered")
            const propName = event.target.dataset.propname;
            const propValue = event.target.innerText;

            feature.set(propName, propValue);
        });
    });
}
}

export {
    editAttrib
}
