import json

def generate_json(n):
    result = {}
    for i in range(1, n + 1):
        array = ["#111"] * n
        array[i-1] = "#F00"
        result[str(i)] = array
    return result

# Generate the JSON for n=1260
config = generate_json(1260)


with open('config.json', 'w') as f:
        json.dump(config, f)

print("Data written to 'config.json'")