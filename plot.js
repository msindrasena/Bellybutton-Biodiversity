function init() {
  var selector = d3.select("#selDataset");
  d3.json("samples.json").then((data) => {
    console.log(data);
    var sampleNames = data.names;
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });
  })
}

init();
optionChanged(940);

function optionChanged(newSample) {
  buildMetadata(newSample);
  buildCharts(newSample);
}

function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    var PANEL = d3.select("#sample-metadata");

    // demographic information    
    PANEL.html("");
    PANEL.append("h6").text('ID: '+ result.id);
    PANEL.append("h6").text('ETHNICITY: ' + result.ethnicity);
    PANEL.append("h6").text('GENDER: '+ result.gender);
    PANEL.append("h6").text('AGE: ' + result.age);
    PANEL.append("h6").text('LOCATION: ' + result.location);
    PANEL.append("h6").text('BBTYPE: ' + result.bbtype);
    PANEL.append("h6").text('WFREQ: ' + result.wfreq);
  });
}

function buildCharts(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    var samples = data.samples;
    var sampleArray = samples.filter(sampleObj => sampleObj.id == sample);
    var sampleValue = sampleArray[0];

    sampleValue.sample_values.sort(function(a, b) {
      return parseFloat(b) - parseFloat(a);
    });


// Belly Button Washing Frequency
    var gaugedata = [{
      domain: { x: [0, 1], y: [0, 1] },
      type: "indicator",
      mode: "gauge+number",
      value: result.wfreq,
      delta: { reference: 380 },
      title: { text: "<b>Belly Button Washing Frequency</b><br>Scrubs per Week", font: { size: 15 } },
      gauge: {
        axis: { range: [null, 9] },
        bar: { color: "blue" },
        steps: [
          { range: [0, .5], color: "red" },
          { range: [.5, 2.5], color: "orange" },
          { range: [2.5, 4.5], color: "yellow" },
          { range: [4.5, 6.5], color: "green" },
          { range: [6.5, 8.5], color: "lightblue" },
          { range: [8.5, 10], color: "purple"}
        ],
      }
    }]

    var layout = { width: 450, height: 300, margin: { t: 0, b: 0 } };
    Plotly.newPlot('gauge', gaugedata, layout);

    
    // Bubble Graph
    var samples = [
      {
        x: sampleValue.otu_ids,
        y: sampleValue.sample_values,
        text: 'otu_labels',
        mode: 'markers', 
        marker: { color: 'otu_ids',
        size: sampleValue.sample_values}
      }];
    var plot = {showlegend: true, height: 600, width: 1200};
    Plotly.newPlot('bubble', samples, plot);

    // Bar Graph
    var barData = {
      type: 'bar',
      x: sampleValue.sample_values.slice(0,10).reverse(),
      y: sampleValue.otu_ids.map(id=> `OTU ${id}`).slice(0,10).reverse(),
      text: sampleValue.otu_labels.slice(0,10).reverse(),
      marker:{colorscale: 'Jet',
      color: sampleValue.sample_values.slice(0,10).reverse()},
      orientation: 'h',
      opactiy: 0.8
    };

    var layout = {
      title: 'Top 10 Bacterial Species'
    };

    Plotly.newPlot('bar', [barData], layout);

  });
}
