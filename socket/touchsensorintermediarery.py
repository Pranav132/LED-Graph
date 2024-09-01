import websocket
import time
import threading
from websocket_server import WebsocketServer
import requests

# Variables to store the last time an input was processed and the selected algorithm
last_input_time = 0
algorithm = ""
dijkstra_inputs = []
dijkstra_input_count = 0

mapping = {
    "1": {"node":0},
    "12": {"node":1},
    "16": {"node":2},
    "17": {"node":3},
    "3": {"node":4},
    "8": {"node":5},
    "5": {"node":6},
    "13": {"node":7},
    "18": {"node":8},
    "2": {"node":9},
    "7": {"node":10},
    "9": {"node":11},
    "11": {"node":12},
    "14": {"node":13},
    "15": {"node":14},
    "4": {"node":15},
    "0": {"node":16},
    "6": {"node":17},
    "10": {"node":18}
}


def on_message(ws, message):
    global last_input_time, dijkstra_input_count, dijkstra_inputs
    current_time = time.time()
    if current_time - last_input_time >= 2:  # Throttle to one message every two seconds
        last_input_time = current_time
        print("Received from Arduino:", message)

        # Extracting the sensor number from the message
        sensor_number = message.split(': ')[1] if ': ' in message else message
        print(sensor_number)
        if str(sensor_number) == "13" or str(sensor_number) == '2' or str(sensor_number) == '9' or str(sensor_number) == '0':
            print("in")
            pass
        else:
            # Map the sensor number to a node using the mapping dictionary
            if sensor_number in mapping:
                node = mapping[sensor_number]['node']
                print(f"Mapping sensor {sensor_number} to node {node}")
                
                if algorithm == "Dijkstra's":
                    dijkstra_inputs.append(node)
                    print(dijkstra_inputs)
                    dijkstra_input_count += 1
                    
                    # Check if two inputs have been received
                    if dijkstra_input_count == 2:
                        # Process the inputs together
                        process_input(dijkstra_inputs)
                        # Reset for next inputs
                        dijkstra_inputs = []
                        dijkstra_input_count = 0
                else:
                    process_input(node)
            else:
                print(f"Sensor number {sensor_number} not found in mapping.")


# Start connection to Arduino
def start_arduino_websocket():
    ws = websocket.WebSocketApp("ws://10.42.200.108:81",
                                on_message=on_message)
    ws.run_forever()

# Websocket server to communicate with React frontend
def on_message_from_frontend(client, server, message):
    global algorithm
    algorithm = message
    print("Algorithm set to:", algorithm)

# Start the websocket server
def start_frontend_websocket():
    server = WebsocketServer(port=8555, host='0.0.0.0')
    server.set_fn_message_received(on_message_from_frontend)
    server.run_forever()

# Function to process input and query an API
def process_input(input_data):
    if algorithm and algorithm != "":
        if algorithm == "Kruskal's":
            url = "http://localhost:4000/kruskal/"
            response = requests.get(url)
        elif algorithm == "Dijkstra's":
            url = f"http://localhost:4000/dijkstra/{input_data[0]}/{input_data[1]}"
            response = requests.get(url)
        else:
            url = f"http://localhost:4000/{algorithm}/{input_data}"
            response = requests.get(url)
        # print("API Response:", response.text)
    else:
        print("No Algorithm")


# Run Arduino websocket in a separate thread
threading.Thread(target=start_arduino_websocket).start()

# Run frontend websocket server in another thread
threading.Thread(target=start_frontend_websocket).start()
