import socket
import json

def start_server():
    host = "localhost"
    port = 9999

    server_socket = socket.socket()  
    server_socket.bind((host, port)) 

    server_socket.listen(2)
    conn, address = server_socket.accept()  

    print("Connection from: " + str(address))
    fullData = ""
    while True:
        data = conn.recv(1024)
        if not data:
            break

        fullData += data.decode()

    fullData = json.loads(fullData)
    fullData = fullData["file"]
    fullData = json.loads(fullData)
    
    with open('output.json', 'w') as f:
        json.dump(fullData, f)

    print("Data written to 'output.json'")

    # code to close connection

if __name__ == '__main__':
    start_server()
