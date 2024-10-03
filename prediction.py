import numpy as np
import pandas as pd
from io import BytesIO
from itertools import product
import matplotlib
import matplotlib.pyplot as plt
import seaborn as sns
sns.set()
import Pyro4
import scipy
from Levenshtein import distance
import io
import base64

# get shape query table from deepdnashape
fDeepDNAshape_predictor = Pyro4.Proxy("PYRONAME:deepdnashape.db")

# sequencing encoding for base distance calculation
flattened_hbond_major_encode = {
	'A': [0,0,0,1,0,0,1,0,0,0,0,1,0,1,0,0],
	'C': [1,0,0,0,0,0,1,0,0,0,0,1,0,0,0,1],
	'G': [0,0,0,1,0,0,0,1,0,0,1,0,1,0,0,0],
	'T': [0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,1],
	'N': [0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25],
	'a': [0,0,0,1,0,0,1,0,0,0,0,1,0,1,0,0],
	'c': [1,0,0,0,0,0,1,0,0,0,0,1,0,0,0,1],
	't': [0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,1],
	'n': [0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25],
	# methylation    
	'M': [0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,1],
	'g': [0,0,0,1,0,0,0,1,0,0,1,0,0,1,0,0]
	}
flattened_hbond_minor_encode = {
	'A': [0,0,0,1,1,0,0,0,0,0,0,1],
	'C': [0,0,0,1,0,0,1,0,0,0,0,1],
	'G': [0,0,0,1,0,0,1,0,0,0,0,1],
	'T': [0,0,0,1,1,0,0,0,0,0,0,1],
	'N': [0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25],
	'a': [0,0,0,1,1,0,0,0,0,0,0,1],
	'c': [0,0,0,1,0,0,1,0,0,0,0,1],
	't': [0,0,0,1,1,0,0,0,0,0,0,1],
	'n': [0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25],
	# methylation
	'M': [0,0,0,1,0,0,1,0,0,0,0,1],
	'g': [0,0,0,1,0,0,1,0,0,0,0,1]
	}

def physchemEncode_flattened(sequence):
	# encode into (50 x 16, 50 * 12) dimentional tuple np array - flattened physchem encoding, for major and minor grove respectively 
	# - used for LSTM-like models
	encoded_array_major = []
	encoded_array_minor = []
	for char in sequence:
		encoded_array_major.append(flattened_hbond_major_encode[char]) 
		encoded_array_minor.append(flattened_hbond_minor_encode[char])
	encoded_array_major = np.array(encoded_array_major)
	encoded_array_minor = np.array(encoded_array_minor)
	return encoded_array_major, encoded_array_minor

def reverse_complement(sequence):
    complement = {'A': 'T', 'C': 'G', 'G': 'C', 'T': 'A'}
    reverse_sequence = sequence[::-1]
    reverse_complement_sequence = ''.join(complement[base] for base in reverse_sequence)
    return reverse_complement_sequence



# shape and base distance calculation
def cal_base_distance(seq1,seq2,metric):
    # use_positions should be either "all", or a list of 0-indexed integers, corresponding to the positions that are used to calculate distance
    ### NOTE: for base distance, this only applies to phsychem distance. Levenshetein distance will still be calculated using the whole string.
    ### TODO: should I delete levenshtein then??
    M1, m1 = physchemEncode_flattened(seq1)
    M2, m2 = physchemEncode_flattened(seq2)
    if metric == 'physchem':
        base_distance = np.sum(np.absolute(M1-M2)) + np.sum(np.absolute(m1-m2))
        # obsolete: if use_posisions
        # base_distance = np.sum(np.absolute(M1[use_positions]-M2[use_positions])) + np.sum(np.absolute(m1[use_positions]-m2[use_positions]))
    elif metric =='levenshtein':
        base_distance = distance(seq1, seq2) # distance function from the Levenshtein package
    return base_distance

def cal_shape_distance(seq1,seq2,shape_name,metric,use_positions):
    # use_positions should be either "all", or a list of 0-indexed integers, corresponding to the positions that are used to calculate distance
    ### NOTE: for shape distance, should handle inter-bp and intra-bp features separately. 
    ### for intra-bp, it is using the pos itself, 
    ### for inter-bp, it is using pos and pos+1 shape features.
    ### - TODO: but what if neighboring pos are selected???? - will calculate twice?

    ## if use query table method:
    # shape1 = shape_table.loc[seq1][shape_name]
    # shape2 = shape_table.loc[seq2][shape_name]
    
    ## if use fDeepDNAshap method:
    shape1 = fDeepDNAshape_predictor.predictSeq(seq = seq1, feature = shape_name, layer = 4)
    shape2 = fDeepDNAshape_predictor.predictSeq(seq = seq2, feature = shape_name, layer = 4)
    
    if use_positions == 'all':
        if metric == 'euclidean':
            shape_distance = np.linalg.norm(np.round(shape1,decimals=3) - np.round(shape2,decimals=3))
        elif metric =='pearson':
            #shape_distance = scipy.stats.pearsonr(np.array(shape1), np.array(shape2))
            shape_distance = np.corrcoef(np.array(shape1), np.array(shape2))[0,1]
    else:
        # subset out only the positions used to calculate shape distance
        ### TODO: consider intra/inter bp separately
        shape1_for_distance = [shape1[i] for i in use_positions]
        shape2_for_distance = [shape2[i] for i in use_positions]
        if metric == 'euclidean':
            shape_distance = np.linalg.norm(np.round(shape1_for_distance,decimals=3) - np.round(shape2_for_distance,decimals=3))
        elif metric =='pearson':
            #shape_distance = scipy.stats.pearsonr(np.array(shape1_for_distance), np.array(shape1_for_distance))
            shape_distance = np.corrcoef(np.array(shape1_for_distance), np.array(shape2_for_distance))[0,1]
    return shape_distance


# shape and base distance calculation, using only certain positions!


def generate_kmers(length):
    nucleotides = ['A', 'C', 'G', 'T']
    permutations = [''.join(p) for p in product(nucleotides, repeat=length)]
    return permutations


# helper function to get index of the nth top mutation candidate (n pairs)
# high in base dist and low in shape dist, or low in base dist and high in base dist
# WHEN USING EUCLIDEAN DISTANCE FOR SHAPE DISTANCE.
# WHEN USING PEARSON DISTANCE, NEED TO FIX THIS
def find_index(base, shape, n):
    # find the nth largest base value, within this column, find min val of shape:
    nth_largest_value = sorted(set(base), reverse=True)[n]
    nth_largest_indexes = [i for i, val in enumerate(base) if val == nth_largest_value]
    nth_max_base_min_shape_index = min(nth_largest_indexes, key=lambda i: shape[i])
    
    # Find the min value of base(THAT IS NOT ZERO), within min, find the index that gives max val of shape
    nth_smallest_value = sorted(set(base), reverse=False)[n]
    # nth_smallest_value = sorted(set([val for val in base if val != 0]), reverse=False)[n]
    nth_smallest_indexes = [i for i, val in enumerate(base) if val == nth_smallest_value]
    nth_min_base_max_shape_index = max(nth_smallest_indexes, key=lambda i: shape[i])
    
    return nth_max_base_min_shape_index, nth_min_base_max_shape_index


# point mutation design: user input sequence and list of mutation positions
# output distance plot and mark cadidates in red scatter
## TODO: options: allow # candidates, and allow options: if list of mut_pos MUST be changed

def generate_mutated_strings(WTseq, mutation_positions):
# a recursive function to generate all possible mutation combinations
    def generate_combinations(prefix, index):
        if index == len(mutation_positions):
            mutated_strings.append(prefix)
            return
        for letter in ['A', 'C', 'G', 'T']:
            new_prefix = prefix[:mutation_positions[index]] + letter + prefix[mutation_positions[index]+1:]
            generate_combinations(new_prefix, index + 1)

    # Initialize list to store mutated strings
    mutated_strings = []

    # Generate combinations starting with empty string
    generate_combinations(WTseq, 0)

    return mutated_strings 



################################
# the html setup
################################
# plot_html = generate_plot(input_string, input_list, shape_name, rc_zero_base_dist)
def generate_plot(WTseq, mutation_positions, shape_name, shape_metric, shape_normalize, base_metric, RC_zero_base_dist, base_normalize, cal_dist_use_positions='all'):
    '''
        function to calculate base distances and shape distances of all possible mutations
        output: 
            base_dists, shape_dists, allMutations(sequences)
        input: 
            WTseq
            mutation_positions: 
                all possible mutations will be considered for these positions, 
                should be list of indexes, comma separated, 0-indexed
                ### TDO0: change the single input bug
            cal_dist_use_positions: 
                default = 'all' positions in WTseq
                positions from which the distance should be calculated. Used for cases such as mutate flank but care only about core, or vice versa, 
                should be list of indexes, comma separated, 0-indexed
                NOTE!: for constrains/specifics of how the subsetting is done, check cal_base_distance(), and cal_shape_distance().
            shape_name
            shape_metric: 
                euclidean/pearson
            shape_normalize:
                default: False
                if True: when using euclidean: normalize shape distances to 0-1
                *pearson does not care about this, always -1 to 1
            base_metric: 
                physchem/levenstein
            RC_zero_base_dist: 
                (rare case but) RC to WT can happen to be a possible mutation candidate for some WTseq+mutation_posisions combination, 
                allow choice to consider base dist=0
            base_normalize:
                default: False
                if True: normalize all base dists to 0-1
    '''
    if (len(mutation_positions) > 7):
        return null


    allMutations = generate_mutated_strings(WTseq, mutation_positions)
    # allMutations.remove(WTseq)
    # save WTseq in the list, to allow easy normalization
    
    base_dists = []
    shape_dists = []
    
    for Mut in allMutations:
        shape_d = cal_shape_distance(WTseq,Mut,shape_name,shape_metric,cal_dist_use_positions)
        if RC_zero_base_dist:
            Mut_RC = reverse_complement(Mut)
            base_d = min(cal_base_distance(WTseq,Mut,base_metric),cal_base_distance(WTseq,Mut_RC,base_metric))
        else:
            base_d = cal_base_distance(WTseq,Mut,base_metric)
        base_dists.append(base_d)
        shape_dists.append(shape_d)

    if (shape_metric == 'euclidean') & shape_normalize:
        min_shape = min(shape_dists)
        max_shape = max(shape_dists)
        shape_dists = [(s-min_shape)/max_shape for s in shape_dists]

    if base_normalize:
        min_base = min(base_dists)
        max_base = max(base_dists)
        base_dists = [(b-min_base)/max_base for b in base_dists]

    #print(cal_dist_use_positions) 
    return base_dists,shape_dists,allMutations


### plot a line plot of the WT vs Mut of choice
def plot_selected_mut(WT,Mut,shape_name):        
    WT_shape = fDeepDNAshape_predictor.predictSeq(seq = WT, feature = shape_name, layer = 4)
    Mut_shape = fDeepDNAshape_predictor.predictSeq(seq = Mut, feature = shape_name, layer = 4)
    pos = [i for i in range(len(WT))]
    
    # name = ['WT']*len(WT) + ['Mut']*len(Mut)
    #df = pd.DataFrame({
    #    'shape' : WT_shape + Mut_shape,
    #    'pos' : pos + pos,
    #    'name' : name
    #})

    WT_name = [WT[i] for i in range(len(WT))]
    Mut_name = [Mut[i] for i in range(len(Mut))]

    return WT_shape, WT_name, Mut_shape, Mut_name, pos


### helper functions for plotting base readout plots
# Color mapping
color_mapping = {
    (0, 0, 0, 1): 0,
    (0, 0, 1, 0): 0.333,
    (0, 1, 0, 0): 0.666,
    (1, 0, 0, 0): 1,
    # (0.25, 0.25, 0.25, 0.25): 1  # white For 'N' character
}
# Convert encoded vectors to colors （in color coding）
def vector_to_color(vector, length):
    colors = []
    for i in range(0, length, 4):
        colors.append(color_mapping.get(tuple(vector[i:i+4]), 'grey'))
    return colors

# Encode colors from their vectors
def encode_to_heatmap(input_string):
    major_colors = []
    minor_colors = []

    for char in input_string:
        major_encode = flattened_hbond_major_encode.get(char, [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
        minor_encode = flattened_hbond_minor_encode.get(char, [0,0,0,0,0,0,0,0,0,0,0,0])

        major_colors.append(vector_to_color(major_encode, 16))
        minor_colors.append(vector_to_color(minor_encode, 12))
    
    # Convert major and minor colors to Plotly-compatible format
    major_colors_transposed = [list(row) for row in zip(*major_colors)]
    minor_colors_transposed = [list(row) for row in zip(*minor_colors)]

    return major_colors_transposed, minor_colors_transposed


### plot the base readout comparision of the WT vs Mut of choice
def plot_selected_mut_baseReadout(WT,Mut):

    # get the 4 heatmap numerical values from function generate visualization, 4 list of lists
    z_WT_major, z_WT_minor = encode_to_heatmap(WT)
    z_Mut_major, z_Mut_minor = encode_to_heatmap(Mut)

    pos = [i for i in range(len(WT))]
    WT_name = [WT[i] for i in range(len(WT))]
    Mut_name = [Mut[i] for i in range(len(Mut))]

    return WT_name, Mut_name, pos, z_WT_major, z_WT_minor, z_Mut_major, z_Mut_minor