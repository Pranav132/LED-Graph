import json

def generate_json(num_groups, total_values, group_size):
    # Create a dictionary to store the data
    data = {}
    
    # Generate arrays for each key
    for i in range(1, num_groups + 1):
        # Initialize all values to '#111111'
        values = ['#111111'] * total_values
        
        # Determine the start index for the red segment in this array
        red_start = (i - 1) * group_size
        
        # Set the values for the red segment
        flag = True
        for j in range(red_start, red_start + group_size):
            if j < total_values:
                if flag:
                    values[j] = '#FF0000'
                    flag = False
                else:
                    values[j] = '#CCCCCC'
        
        # Add the array to the dictionary with the current key as a string
        data[str(i)] = values
    
    return data

# Parameters: 84 groups, 1260 values per group, 15 values in red per group
json_data = generate_json(30, 450, 15)

# Convert to JSON format
json_output = json.dumps(json_data, indent=2)

# Optionally write to a file
with open('canvas.json', 'w') as file:
    file.write(json_output)
