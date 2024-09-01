import json

arr = ["#fff" for i in range(1260)]
# arr[169] = "#f00"
# for i in range(30):
#         arr[i] = "#f00" 

data = {1: arr}

with open('config-gen/config.json', 'w') as f:
        json.dump(data, f)