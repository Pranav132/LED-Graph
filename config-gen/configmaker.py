import json

def flatten(l):
    return [item for sublist in l for item in sublist]

config = {}

for i in range(1,11):
    arr = ["#faa", "#f88", "#f66", "#f44", "#f22", "#f00"]
    j = i-1
    testarr = [["#000"] * j]
    testarr.append(arr)
    testarr.append(["#000"] * (15 - j - len(arr)))
    testarr = flatten(testarr)
    testarr2 = testarr[::-1]
    config[i] = flatten([["#000"] * 360])
    newarr = []
    for l in range(3):
       newarr.append(testarr2)
       newarr.append(testarr)
    newarr = flatten(newarr)
    for k in newarr:
         config[i].append(k)
    for f in range(330):
         config[i].append("#000")
    for k in newarr:
         config[i].append(k)
    for f in range(300):
         config[i].append("#000")
    for k in newarr:
         config[i].append(k)


for i in range(11,21):
    arr = ["#faa", "#f88", "#f66", "#f44", "#f22", "#f00"]
    j = i-11
    testarr = [["#000"] * j]
    testarr.append(arr)
    testarr.append(["#000"] * (15 - j - len(arr)))
   
   
    notrev = flatten(testarr)
    rev = notrev[::-1]
    
    
    
    config[i] = flatten([["#000"] * 180])
    newarr = []
    for l in range(4):
       newarr.append(rev)
       newarr.append(notrev)
    for l in range(2):
        newarr.append(rev)
    for l in range(2):
        newarr.append(notrev)
    newarr = flatten(newarr)
    for k in newarr:
         config[i].append(k)
    for f in range(240):
         config[i].append("#000")
    for k in newarr:
         config[i].append(k)
    for f in range(210):
         config[i].append("#000")
    for k in newarr:
         config[i].append(k)
    for f in range(180):
         config[i].append("#000")


with open('config.json', 'w') as f:
        json.dump(config, f)

print("Data written to 'config.json'")