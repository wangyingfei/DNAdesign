from flask import Flask, render_template, request, jsonify
from prediction import generate_plot
from prediction import plot_selected_mut
from prediction import plot_selected_mut_baseReadout

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/manual')
def manual():
    return render_template('manual.html')

@app.route('/point_mutation')
def point_mutation():
    return render_template('point_mutation.html')


@app.route('/predict', methods=['POST'])
def predict():
    # !! User input is 1-indexed, change the list into 0-indexed here, before calling functions from prediction.py
    
    input_string = request.json['string']
    input_list = request.json['mutList']
    input_list = [a - 1 for a in input_list]

    # Get the value of distPosList from the request.json dictionary,
    # and if it's not provided, set it to 'all' as the default value
    cal_dist_use_positions = request.json.get('distPosList')
    if cal_dist_use_positions is None:
        cal_dist_use_positions = 'all'
    else:
        cal_dist_use_positions = [p - 1 for p in cal_dist_use_positions]
    
    shape_name = request.json['shapeName']
    
    shape_metric = request.json['shapeMetric']
    shape_normalize = request.json['shapeNorm']
    
    base_metric = request.json['baseMetric']
    rc_zero_base_dist = request.json['rcZeroBaseDist']
    base_normalize = request.json['baseNorm']

    # Convert the checkbox value to a boolean
    rc_zero_base_dist = bool(rc_zero_base_dist)
    shape_normalize = bool(shape_normalize)
    base_normalize = bool(base_normalize)

    # Generate the plot using the input data
    base_dists, shape_dists, allMutations = generate_plot(input_string, input_list,
        shape_name, shape_metric, shape_normalize, base_metric, rc_zero_base_dist, base_normalize, cal_dist_use_positions)
    
    x = [float(val) for val in base_dists]
    y = [float(val) for val in shape_dists]
    seq = [str(val) for val in allMutations]

    # Return the x and y coordinates as JSON data, for front end to plot it
    return jsonify({'x': x, 'y': y, 'seq':seq})


@app.route('/plot_candidate', methods=['POST'])
def plot_candidate():
    input_string = request.json['string']
    clicked_seq = request.json['clickedSeq']
    shape_name = request.json['shapeName']

    # Call the plot_candidate function from prediction.py
    WT_shape, WT_name, Mut_shape, Mut_name, pos = plot_selected_mut(input_string, clicked_seq, shape_name)

    # change displayed x-axis to be 1-indexed
    pos = [int(val)+1 for val in pos]
    WT_shape = [float(val) for val in WT_shape]
    WT_name = [str(val) for val in WT_name]
    Mut_shape = [float(val) for val in Mut_shape]
    Mut_name = [str(val) for val in Mut_name]

    # Return the data as JSON
    return jsonify({'pos': pos, 'WT_shape': WT_shape, 'WT_name': WT_name, 'Mut_shape': Mut_shape, 'Mut_name': Mut_name})

# plot base readout plots
@app.route('/plot_candidate_baseReadout', methods=['POST'])
def plot_candidate_baseReadout():
    input_string = request.json['string']
    clicked_seq = request.json['clickedSeq']

    # Call the plot_candidate function from prediction.py
    WT_name, Mut_name, pos, z_WT_major, z_WT_minor, z_Mut_major, z_Mut_minor = plot_selected_mut_baseReadout(input_string, clicked_seq)

    WT_name = [str(val) for val in WT_name]
    Mut_name = [str(val) for val in Mut_name]
    pos = [int(val) for val in pos]
    z_WT_major = [arr for arr in z_WT_major]
    z_WT_minor = [arr for arr in z_WT_minor]
    z_Mut_major = [arr for arr in z_Mut_major]
    z_Mut_minor = [arr for arr in z_Mut_minor]

    # Return the data as JSON
    return jsonify({'pos': pos, 'WT_name': WT_name, 'Mut_name': Mut_name, 
        'z_WT_major': z_WT_major, 'z_WT_minor': z_WT_minor, 'z_Mut_major': z_Mut_major, 'z_Mut_minor': z_Mut_minor})


if __name__ == '__main__':
    app.run(debug=True)
