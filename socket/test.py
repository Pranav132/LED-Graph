import json
import serial
import time

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

data = {
    "1": ["#FF5733", "#DAF7A6", "#C70039", "#900C3F", "#FFC300"],
    "2": ["#581845", "#900C3F", "#C70039", "#FF5733", "#DAF7A6"],
    "3": ["#C70039", "#FF5733", "#900C3F", "#DAF7A6", "#FFC300"]
}

ser = serial.Serial('/dev/tty.usbserial-0001', 9600)  # Update this to your ESP's serial port

for key, hex_values in data.items():
    rgb_values = [hex_to_rgb(h) for h in hex_values]
    rgb_string = ','.join(f"{r},{g},{b}" for r, g, b in rgb_values)
    ser.write((rgb_string + '\n').encode())
    print("sent")
    time.sleep(5)  # Delay for 5 seconds before sending the next set
