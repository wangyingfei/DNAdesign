function openAdvancedSettings() {
    var advancedSettings = document.getElementById("advancedSettings");
    
    var toggleButton = document.getElementById("toggleAdvancedSettings");
    var buttonIcon = document.getElementById("buttonIcon");

    if (advancedSettings.style.display === "none" || advancedSettings.style.display === "") {
        advancedSettings.style.display = "block";
        toggleButton.textContent = "Hide advanced settings";
        buttonIcon.textContent = "▼"; // Downward facing triangle
    } else {
        advancedSettings.style.display = "none";
        toggleButton.textContent = "Open advanced settings";
        buttonIcon.textContent = "▶"; // Rightward facing triangle
    }


}


// helper Function to parse mutListInput into an array of integers, allow input format of 1-5,8-10, 
function parseMutListInput(mutListInput, inputStringLength, max_count) {
    var mutList = [];

    // Split the input string by comma to handle multiple values
    var mutListValues = mutListInput.split(',');

    // Iterate over each value
    for (var i = 0; i < mutListValues.length; i++) {
        // Trim leading and trailing spaces
        var value = mutListValues[i].trim();

        // Check if the value contains a range (e.g., "1-5")
        if (value.includes('-')) {
            // Split the range by "-" to get the start and end values
            var rangeValues = value.split('-');
            var start = parseInt(rangeValues[0], 10);
            var end = parseInt(rangeValues[1], 10);

            // Add integers within the range to mutList
            for (var j = start; j <= end; j++) {
                mutList.push(j);
            }
        } else {
            // If the value is a single integer, add it to mutList
            var intValue = parseInt(value, 10);
            // Check if intValue is a valid integer
            if (!isNaN(intValue)) {
                mutList.push(intValue);
            } else {
                // Return null if the value is not a valid integer or range
                return null;
            }
        }
    }

    // Check if the largest integer in mutList is greater than inputStringLength //1-index so use inputStringLength as criteria
    if (Math.max(...mutList) > inputStringLength) {
        return null; // Return null if the largest integer is invalid
    }
    // Check if the total count of integers in mutList is greater than 7
    if (mutList.filter(item => typeof item === 'number').length > max_count) {
        return null;
    }

    return mutList;
}



function submitInput() {
    // Hide the submit button
    document.getElementById("submitButton").style.display = "none";
    // Show loading spinner
    document.getElementById("loadingSpinner").style.display = "block";

    
    // Get the input value from the text box
    var inputString = document.getElementById("inputString").value;
    // Regular expression to match valid characters (A, C, G, T)
    var validCharactersRegex = /^[ACGT]+$/;

    // Check if the inputString contains only valid characters
    if (!validCharactersRegex.test(inputString)) {
        // Show a note to the user indicating invalid input
        alert("Invalid WT sequence input. Please input a sequence that consists of A, C, G, T only.");
        // Hide loading spinner
        document.getElementById("loadingSpinner").style.display = "none";
        // Show the submit button again
        document.getElementById("submitButton").style.display = "block";
        return; // Exit the function early
    }


    // Get the user input for mutList
    var mutListInput = document.getElementById("mutList").value.trim();
    var mutList = [];
    
    // deleted this part: generate random 3 numbers if input is empty
    //// Generate mutList if it's empty
    //if (mutListInput === '') {
    //    // Generate mutList based on inputString length
    //    var inputLength = inputString.length;
    //    if (inputLength >= 3) {
    //        // Generate an array of integers from 0 to inputLength - 1
    //        var allIndices = Array.from({ length: inputLength }, (_, i) => i);
    //        // Shuffle the array (Fisher-Yates shuffle algorithm)
    //        for (let i = allIndices.length - 1; i > 0; i--) {
    //            const j = Math.floor(Math.random() * (i + 1));
    //            [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
    //        }
    //        // Select the first 3 elements of the shuffled array
    //        mutList = allIndices.slice(0, 3);
    //        // Sort ascending
    //        mutList.sort((a, b) => a - b);
    //    } else {
    //        // Generate mutList as 0, 1, ..., inputLength - 1
    //        mutList = Array.from({ length: inputLength }, (_, i) => i);
    //        // Sort ascending
    //        mutList.sort((a, b) => a - b);
    //    }
    //    // Update mutListInput to be the generated mutList
    //    document.getElementById("mutList").value = mutList.join(',');
    //} else {
        
    // Parse the mutListInput to extract the list of integers
    mutList = parseMutListInput(mutListInput, inputString.length, 7);
    // Handle invalid mutList input
    if (mutList === null) {
        // Show a note to the user indicating invalid input
        alert("Invalid input for mutation position. Please enter a valid list of integers or ranges (e.g., 1,2,4,5 1-2,4,5 or 1-2,4-5), the maximum value should <= WT sequence length, total count of mutation positions should be less than 7");
        // Hide loading spinner
        document.getElementById("loadingSpinner").style.display = "none";
        // Show the submit button again
        document.getElementById("submitButton").style.display = "block";
        return; // Exit the function early
    } else {
    // Update mutListInput to be the parsed mutList
    document.getElementById("mutList").value = mutList.join(',');
    }
    //}



    // Get the user input for shape focal points
    //var distPosListInput = document.getElementById("distPosList").value.trim(); 
    // Check if the input is not empty, then split and map to numbers; otherwise, return null
    //var distPosList = distPosListInput ? distPosListInput.split(',').map(Number) : null; 

    // Get the user input for shape focal points, and parse user input
    var distPosListInput = document.getElementById("distPosList").value.trim();
    var distPosList;

    if (distPosListInput === '') {
        distPosList = null;
    } else {
        // Parse the distPosListInput to extract the list of integers
        distPosList = parseMutListInput(distPosListInput, inputString.length, inputString.length);
        // Handle invalid distPosList input
        if (distPosList === null) {
            // Show a note to the user indicating invalid input
            alert("Invalid input for shape focal positions. Please enter a valid list of integers or ranges (e.g., 1,2,4,5 1-2,4,5 or 1-2,4-5), the maximum value should be <= WT sequence length-1, total count of positions should be less than the input sequence length");
            // Hide loading spinner
            document.getElementById("loadingSpinner").style.display = "none";
            // Show the submit button again
            document.getElementById("submitButton").style.display = "block";
            return; // Exit the function early
        } else {
            // Update distPosListInput to be the parsed distPosList
            document.getElementById("distPosList").value = distPosList.join(',');
        }
    }


    var shapeName = document.getElementById("shapeName").value;

    var shapeMetric = document.getElementById("shapeMetric").value;
    var shapeNorm = document.getElementById("shapeNormCheckBox").checked;

    var baseMetric = document.getElementById("baseMetric").value;
    var rcZeroBaseDist = document.getElementById("rcZeroBaseDistCheckBox").checked;
    var baseNorm = document.getElementById("baseNormCheckBox").checked;

    
    // Send a POST request to the server with the input string
    
    axios.post(predict_Url, { //the "predictUrl" is generated dynamically in point_mutation.html, as a const
        string: inputString,
        mutList: mutList,

        distPosList: distPosList,

        shapeName: shapeName,

        shapeMetric: shapeMetric,
        shapeNorm: shapeNorm,

        baseMetric: baseMetric,
        rcZeroBaseDist: rcZeroBaseDist,
        baseNorm: baseNorm
    })
        // If the request is successful, update the plot container with the response data
        .then(function (response) {

            var x = response.data.x;
            var y = response.data.y;
            var seq = response.data.seq;
            
            var data = [
            {
                x: x,
                y: y,
                text: seq,
                mode: 'markers',
                marker: {size:8},
                type: 'scatter'
            }];
            var layout = {
                title: 'Base and Shape distance between WT and mutation candidate',
                xaxis: {
                    title: 'base distance'
                },
                yaxis: {
                    title: 'shape distance'
                },
                annotations: [
                    {
                        text: 'click on a point to show shape profile comparision',
                        showarrow: false,
                        xref: 'paper',
                        yref: 'paper',
                        x: 0,
                        y: 1.08,
                        xanchor: 'left',
                        yanchor: 'top',
                        font: {
                            size: 12,
                            color: '#0000FF'
                        }
                    }
                ],

                clickmode: 'event+select'  // Enable click events on scatter points};   
            };

            // Add "Download CSV" button to the mode bar
            var downloadCSVButton = {
                name: 'downloadCSV',
                title: 'Download CSV',
                icon: Plotly.Icons.disk,
                click: function() {
                    var csvContent = "data:text/csv;charset=utf-8," + "x,y,seq\n";
                    data[0].x.forEach(function(xVal, i) {
                        var row = [xVal, data[0].y[i], data[0].text[i]].join(",");
                        csvContent += row + "\n";
                    });
                    var encodedURI = encodeURI(csvContent);
                    var link = document.createElement("a");
                    link.setAttribute("href", encodedURI);
                    link.setAttribute("download", "base_shape_distance_scatter.csv");
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            };
            // Add the button to the mode bar
            var config = {
                modeBarButtonsToAdd: [downloadCSVButton]
            };

            // Dynamically set the title using shapeName variable
            //layout.title = `Plot for ${shapeName}`;

            Plotly.newPlot('plot', data, layout, config);

            // Hide loading spinner
            document.getElementById("loadingSpinner").style.display = "none";
            // Show the submit button again
            document.getElementById("submitButton").style.display = "block";



            
            // TODO: ENABLE click on scatter and show shape profile - single click and multiple click while pressing on Ctrl
        
            // Add Event listener for click events on scatter points
            document.getElementById('plot').on('plotly_click', function(data){
                var pointIndex = data.points[0].pointIndex; // Get index of the clicked point
                var clickedSeq = seq[pointIndex]; // Get the corresponding 'seq' value for single click
                //plotCandidate(inputString, clickedSeq, shapeName);
                plotCandidate_adv(inputString, clickedSeq, shapeName, mutList, distPosList);
                plotCandidate_baseReadout(inputString, clickedSeq)
            });

        })
        // If an error occurs, log the error to the console
        .catch(function (error) {
            console.error(error);

            // Hide loading spinner
            document.getElementById("loadingSpinner").style.display = "none";
            // Show the submit button again
            document.getElementById("submitButton").style.display = "block";
        });


}






// OBSOLETE: old basic function to call plot_candidate function and update the second plot
function plotCandidate(inputString, clickedSeq, shapeName) {
    axios.post('/plot_candidate', {
        string: inputString,
        clickedSeq: clickedSeq,
        shapeName: shapeName,
    })
        .then(function (response) {

            var pos = response.data.pos;
            var WT_shape = response.data.WT_shape;
            var WT_name = response.data.WT_name;
            var Mut_shape = response.data.Mut_shape;
            var Mut_name = response.data.Mut_name;

            var trace1 = {
                x: pos,
                y: WT_shape,
                mode: 'lines+markers',
                type: 'scatter',
                name: 'WT',
                text: WT_name,
                marker: { size: 12 }
            };

            var trace2 = {
                x: pos,
                y: Mut_shape,
                mode: 'lines+markers',
                type: 'scatter',
                name: 'Mut',
                text: Mut_name,
                marker: { size: 12 }
            };

            
            var data = [ trace1, trace2 ];

            // Determine the unit based on the shapeName
            var yAxisUnit = '';
            if (shapeName === 'MGW' || shapeName === 'Shear' || shapeName === 'Stretch' || shapeName === 'Stagger' || shapeName === 'Shift' || shapeName === 'Slide' || shapeName === 'Rise') {
                yAxisUnit = ' [&#8491;]'; // Angstrom symbol (Å)
            } else if (shapeName === 'EP' ) {
                yAxisUnit = ' [kT/e]'; 
            } else if (shapeName === 'Buckle' || shapeName === 'ProT' || shapeName === 'Opening' || shapeName === 'Roll' || shapeName === 'Twist' || shapeName === 'Tilt' || shapeName === 'Roll' || shapeName === 'HelT') {
                yAxisUnit = ' [&deg;]'; // Degree symbol (°)
            }

            var layout = {
                title: 'Shape profile: WT vs Selected Mut candidate',
                showlegend: true,
                xaxis: {
                    title: 'position'
                },
                yaxis: {
                    title: `${shapeName}${yAxisUnit}`
                },
            };


            // Add "Download CSV" button to the mode bar
            var downloadCSVButton = {
                name: 'downloadCSV',
                title: 'Download CSV',
                icon: Plotly.Icons.disk,
                click: function(gd) {
                    var csvContent = "data:text/csv;charset=utf-8," + "pos,WT_name,WT_shape,Mut_name,Mut_shape\n";
                    for (var i = 0; i < pos.length; i++) {
                        var row = [pos[i], WT_name[i], WT_shape[i], Mut_name[i], Mut_shape[i]].join(",");
                        csvContent += row + "\n";
                    }
                    var encodedURI = encodeURI(csvContent);
                    var link = document.createElement("a");
                    link.setAttribute("href", encodedURI);
                    link.setAttribute("download", shapeName + ".csv"); // Set file name dynamically
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            };

            // Add the button to the mode bar
            var config = {
                modeBarButtonsToAdd: [downloadCSVButton]
            };

            Plotly.newPlot('plot_candidate', data, layout, config);
        })
        .catch(function (error) {
            console.error(error);
        });

}


// CURRENT function for making the second plot after user click
function plotCandidate_adv(inputString, clickedSeq, shapeName, mutList, distPosList) {
    axios.post(plot_candidate_Url, {
        string: inputString,
        clickedSeq: clickedSeq,
        shapeName: shapeName,
        mutList: mutList,
        distPosList: distPosList,
    })
        .then(function (response) {

            console.log('Response data:', response.data);
        
            var pos = response.data.pos;
            console.log('Pos:', pos);
            console.log('MutList:', mutList);
            console.log('distPosList:', distPosList);

            var pos = response.data.pos;
            var WT_shape = response.data.WT_shape;
            var WT_name = response.data.WT_name;
            var Mut_shape = response.data.Mut_shape;
            var Mut_name = response.data.Mut_name;

            var WT_trace = {
                x: pos,
                y: WT_shape,
                mode: 'lines+markers',
                type: 'scatter',
                name: 'WT sequence',
                text: WT_name,
                marker: { size: 12 }
            };


            // for trace2, add red scatters for the Mut positions according to user input
            var Mut_trace = {
                x: pos,
                y: Mut_shape,
                mode: 'lines+markers',
                type: 'scatter',
                name: 'Mut sequence',
                text: Mut_name,
                marker: { size: 12 }
            };
            var scatterData = {
                x: [],
                y: [],
                mode: 'markers',
                type: 'scatter',
                name: 'mutPosition',
                text: [],
                marker: { size: 15, color: 'red', symbol: 'star' },
                hoverinfo: 'none'
            };
            mutList.forEach(function(mutPos) {
                var index = pos.indexOf(mutPos);
                if (index !== -1) {
                    scatterData.x.push(mutPos);
                    scatterData.y.push(Mut_shape[index]);
                    scatterData.text.push(Mut_name[index]);
                }
            });

            
            // add shaded box indicating positions used to calculate shape - distPosList
            var shapes = [];
            if (distPosList !== null) {
                distPosList.forEach(function(distPos) {
                    // Add shaded box shapes
                    shapes.push({
                        type: 'rect',
                        xref: 'x',
                        yref: 'paper',
                        x0: distPos - 0.5,
                        y0: 0,
                        x1: distPos + 0.5,
                        y1: 1,
                        fillcolor: 'rgba(128,128,128,0.3)',
                        line: {width: 0}
                    });
                });
            }
            // add dummyTrace to show greybox in legend
            var dummyTrace = {
                x: [null], // Add null values to prevent any actual data from being plotted
                y: [null],
                mode: 'markers', // Use markers to display in the legend
                type: 'scatter',
                name: 'shapeFocalPosition', // Label for the legend
                marker: { size: 15, color: 'grey', symbol: 'square' },
                showlegend: true, // Ensure it appears in the legend
                hoverinfo: 'none'
            };

            var data = [ WT_trace, Mut_trace, scatterData, dummyTrace ];

            // Determine the unit based on the shapeName
            var yAxisUnit = '';
            if (shapeName === 'MGW' || shapeName === 'Shear' || shapeName === 'Stretch' || shapeName === 'Stagger' || shapeName === 'Shift' || shapeName === 'Slide' || shapeName === 'Rise') {
                yAxisUnit = ' [&#8491;]'; // Angstrom symbol (Å)
            } else if (shapeName === 'EP' ) {
                yAxisUnit = ' [kT/e]'; 
            } else if (shapeName === 'Buckle' || shapeName === 'ProT' || shapeName === 'Opening' || shapeName === 'Roll' || shapeName === 'Twist' || shapeName === 'Tilt' || shapeName === 'Roll' || shapeName === 'HelT') {
                yAxisUnit = ' [&deg;]'; // Degree symbol (°)
            }

            var layout = {
                title: 'Shape profile: WT vs Selected Mut candidate',
                showlegend: true,
                legend: {
                    x: 0,
                    y: -0.3, // Adjust this value to position the legend below the plot
                    orientation: 'h' // Set orientation to horizontal
                },
                xaxis: {
                    title: 'position',
                    tick0: 1, // Starting value for ticks
                    dtick: 1 , // Step size between ticks
                    //showgrid: true, // Show grid lines
                    //gridwidth: 1, // Optionally set the width of the grid lines
                },
                yaxis: {
                    title: `${shapeName}${yAxisUnit}`
                },
                shapes: shapes,
            };


            // Add "Download CSV" button to the mode bar
            var downloadCSVButton = {
                name: 'downloadCSV',
                title: 'Download CSV',
                icon: Plotly.Icons.disk,
                click: function(gd) {
                    var csvContent = "data:text/csv;charset=utf-8," + "pos,WT_name,WT_shape,Mut_name,Mut_shape\n";
                    for (var i = 0; i < pos.length; i++) {
                        var row = [pos[i], WT_name[i], WT_shape[i], Mut_name[i], Mut_shape[i]].join(",");
                        csvContent += row + "\n";
                    }
                    var encodedURI = encodeURI(csvContent);
                    var link = document.createElement("a");
                    link.setAttribute("href", encodedURI);
                    link.setAttribute("download", shapeName + ".csv"); // Set file name dynamically
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            };

            // Add the button to the mode bar
            var config = {
                modeBarButtonsToAdd: [downloadCSVButton]
            };

            Plotly.newPlot('plot_candidate', data, layout, config);
        })
        .catch(function (error) {
            console.error(error);
        });

}


// DOING: plot base readout
function plotCandidate_baseReadout(inputString, clickedSeq) {
    axios.post(plot_candidate_baseReadout_Url, {
        string: inputString,
        clickedSeq: clickedSeq,
    })
        .then(function (response) {

            console.log('Response data:', response.data);
        
            var pos = response.data.pos;
            console.log('Pos:', pos);

            var pos = response.data.pos;
            var WT_name = response.data.WT_name;
            var Mut_name = response.data.Mut_name;
            var z_WT_major = response.data.z_WT_major;
            var z_WT_minor = response.data.z_WT_minor;
            var z_Mut_major = response.data.z_Mut_major;
            var z_Mut_minor = response.data.z_Mut_minor;

            var numCols = z_WT_major[0].length;
            var container = document.getElementById('plot_candidate_baseReadout_WT');
            var containerWidth = container.clientWidth;

            var aspectRatio_major = 4 / numCols;
            var aspectRatio_minor = 3 / numCols;


            var data_WT = 
                [
                    {
                        type: 'heatmap',
                        z: z_WT_major,
                        showscale: false,
                        colorscale: [
                            [0, 'red'],
                            [0.333, 'navy'],
                            [0.666, 'yellow'],
                            [1, 'grey'],
                        ],
                        zmin: 0,
                        zmax: 1,
                        xgap: containerWidth/(numCols*50),
                        ygap: containerWidth/(numCols*50),
                    }, 
                    {
                        type: 'heatmap',
                        z: z_WT_minor,
                        xaxis: 'x2',
                        yaxis: 'y2',
                        showscale: false,
                        colorscale: [
                            [0, 'red'],
                            [0.333, 'navy'],
                            [0.666, 'yellow'],
                            [1, 'grey'],
                        ],
                        zmin: 0,
                        zmax: 1,
                        xgap: containerWidth/(numCols*50),
                        ygap: containerWidth/(numCols*50),
                    }
                ];

            var data_Mut =
                [
                    {
                        type: 'heatmap',
                        z: z_Mut_major,
                        showscale: false,
                        colorscale: [
                            [0, 'red'],
                            [0.333, 'navy'],
                            [0.666, 'yellow'],
                            [1, 'grey'],
                        ],
                        zmin: 0,
                        zmax: 1,
                        xgap: containerWidth/(numCols*50),
                        ygap: containerWidth/(numCols*50),
                    }, 
                    {
                        type: 'heatmap',
                        z: z_Mut_minor,
                        xaxis: 'x2',
                        yaxis: 'y2',
                        showscale: false,
                        colorscale: [
                            [0, 'red'],
                            [0.333, 'navy'],
                            [0.666, 'yellow'],
                            [1, 'grey'],
                        ],
                        zmin: 0,
                        zmax: 1,
                        xgap: containerWidth/(numCols*50),
                        ygap: containerWidth/(numCols*50),
                    }
                ];
            
            var layout_WT = 
                {
                    grid: {
                            rows: 2, columns: 1, 
                            pattern: 'independent',
                            ygap: 50
                        },

                    title: {
                        text: 'base readout profile: WT',
                        x: 0.5, // Center the title
                        xanchor: 'center',
                        yanchor: 'top',
                        y: 1,
                        pad: {b: 30} // Padding to separate the title from the plot
                        },

                    xaxis1: {anchor: 'y1', showgrid: false, 
                        tickvals: pos, ticktext: WT_name},
                    yaxis1: {domain: [0.48, 1], anchor: 'x1', showgrid: false, tickvals: [0,1,2,3], 
                        ticktext: ['pos1', 'pos2','pos3','pos4'], title: 'Major Groove'},
                    
                    xaxis2: {anchor: 'y2', showgrid: false, 
                        tickvals: pos, ticktext: WT_name, title: 'WT sequence'},
                    yaxis2: {domain: [0, 0.39], anchor: 'x2', showgrid: false, 
                        tickvals: [0,1,2], ticktext: ['pos1', 'pos2','pos3'], title: 'Minor Groove'},

                    width: containerWidth,
                    height: containerWidth * (aspectRatio_major + aspectRatio_minor),
                    autosize: true,
                    margin: {
                        l: containerWidth * 0.2,  
                        r: containerWidth * 0.2,  
                        b: containerWidth * 0.05,  
                        t: containerWidth * 0.05, 
                        pad: 0
                        },

                };

            var layout_Mut = 
                {
                    grid: {
                            rows: 2, columns: 1, 
                            pattern: 'independent',
                            ygap: 50
                        },

                    title: {
                        text: 'base readout profile: Mut',
                        x: 0.5, // Center the title
                        xanchor: 'center',
                        yanchor: 'top',
                        y: 1,
                        pad: {b: 30} // Padding to separate the title from the plot
                        },
                    
                    xaxis1: {anchor: 'y1', showgrid: false, 
                        tickvals: pos, ticktext: Mut_name},
                    yaxis1: {domain: [0.48,1], anchor: 'x1', showgrid: false, 
                        tickvals: [0,1,2,3], ticktext: ['pos1', 'pos2','pos3','pos4'], title: 'Major Groove'},
                    
                    xaxis2: {anchor: 'y2', showgrid: false, 
                        tickvals: pos, ticktext: Mut_name, title: 'Mut sequence'},
                    yaxis2: {domain: [0,0.39], anchor: 'x2', showgrid: false, 
                        tickvals: [0,1,2], ticktext: ['pos1', 'pos2','pos3'], title: 'Minor Groove'},

                    width: containerWidth,
                    height: containerWidth * (aspectRatio_major + aspectRatio_minor),
                    autosize: true,
                    margin: {
                        l: containerWidth * 0.2,  
                        r: containerWidth * 0.2,  
                        b: containerWidth * 0.05,  
                        t: containerWidth * 0.05, 
                        pad: 0
                        },

                };

            Plotly.newPlot('plot_candidate_baseReadout_Mut', data_Mut, layout_Mut);
            Plotly.newPlot('plot_candidate_baseReadout_WT', data_WT, layout_WT);

        })
        
        .catch(function (error) {
            console.error(error);
        });


}



// TODO: not currenlty in use, multiclick and display shape profile for multiple mut sequences 
function plotMultipleCandidate(inputString, selectedPoints, shapeName) {
    // Initialize an array to store traces for selected points
    var selectedTraces = [];

    // Make a POST request to fetch data for the input string
    axios.post('/plot_candidate', {
        string: inputString,
        shapeName: shapeName
    })
    .then(function (response) {
        var pos = response.data.pos;
        var WT_shape = response.data.WT_shape;
        var WT_name = response.data.WT_name;

        // Create trace for inputString
        var traceInputString = {
            x: pos,
            y: WT_shape,
            mode: 'lines+markers',
            type: 'scatter',
            name: 'WT (Input)',
            text: WT_name,
            marker: { size: 12 }
        };

        selectedTraces.push(traceInputString);

        // Make a POST request for each selected point to fetch data
        var requests = selectedPoints.map(function(pointIndex) {
            return axios.post('/plot_candidate', {
                string: inputString,
                clickedSeq: pointIndex,
                shapeName: shapeName
            });
        });

        // Resolve all requests concurrently
        axios.all(requests)
        .then(function (responses) {
            responses.forEach(function (response, index) {
                var pos = response.data.pos;
                var Mut_shape = response.data.Mut_shape;
                var Mut_name = response.data.Mut_name;

                // Create trace for each selected point
                var traceSelectedPoint = {
                    x: pos,
                    y: Mut_shape,
                    mode: 'lines+markers',
                    type: 'scatter',
                    name: 'Mutated (' + selectedPoints[index] + ')',
                    text: Mut_name,
                    marker: { size: 12 }
                };

                selectedTraces.push(traceSelectedPoint);
            });

            // Plot the data with Plotly
            var layout = {
                title: 'Comparison of Mutated Sequences with Input',
                xaxis: {
                    title: 'Position'
                },
                yaxis: {
                    title: shapeName
                }
            };
            Plotly.newPlot('plot', selectedTraces, layout);
        })
        .catch(function (error) {
            console.error(error);
        });
    })
    .catch(function (error) {
        console.error(error);
    });
}