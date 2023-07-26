import LEDGrid from "../Components/LEDGrid";
import { useState, useEffect, useContext } from "react";
import AuthContext from '../Providers/Auth';
import { Spinner, useToast } from "@chakra-ui/react";


// Screen to view all user configurations.

// The physical structure is recreated using a CSS Grid, and each led is simulated by an individual component. 
// This component is a box that can be colored and rotated
// A user passes a configuration in and the visualizer checks the config every 100ms and updates the color of all the leds.

// CREATING HEXAGON AT BOTTOM LEFT
// HAS ALL 6 SIDES
const computePosition = (pixelNumber:number, colors: string[]) => {
  let leds: { row: number, column: number, color: string, rotate: boolean }[] = []

  // OUTER HEXAGON
  for(var i = 0; i < 15; i++){
    var item = {
      row: i+61,
      column: 30 - i,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: 76+i,
      column: 15 - i,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: 91+i,
      column: 1,
      color: colors[pixelNumber],
      rotate: false
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: 106+i,
      column: 1,
      color: colors[pixelNumber],
      rotate: false
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: i+121,
      column: i+1,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: i+136,
      column: i+16,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: 119-i,
      column: 60,
      color: colors[pixelNumber],
      rotate: false
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: 104-i,
      column: 60,
      color: colors[pixelNumber],
      rotate: false
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: 149-i,
      column: i+31,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: 134-i,
      column: i+46,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: 89-i,
      column: 59-i,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: 75-i,
      column: 45-i,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }

  for(i = 0; i < 15; i++){
    item = {
      row: 76+i,
      column: 16,
      color: colors[pixelNumber],
      rotate: false
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: 91+i,
      column: 16-i,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: 106+i,
      column:i+1,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: 121+i,
      column: 16,
      color: colors[pixelNumber],
      rotate: false
    }
    leds.push(item)
    pixelNumber++;
  }

  for(i = 0; i < 15; i++){
    item = {
      row: 76+i,
      column: 45,
      color: colors[pixelNumber],
      rotate: false
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: 91+i,
      column: 45+i,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: 106+i,
      column:59-i,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: 121+i,
      column: 45,
      color: colors[pixelNumber],
      rotate: false
    }
    leds.push(item)
    pixelNumber++;
  }

  for(i = 0; i < 15; i++){
    item = {
      row: 76+i,
      column: 45-i,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: 76+i,
      column:i+16,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }

  for(i = 0; i < 15; i++){
    item = {
      row: 121+i,
      column: 30-i,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: 120+i,
      column:i+31,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }

  for(i = 0; i < 30; i++){
      item = {
        row: 91+i,
        column:31,
        color: colors[pixelNumber],
        rotate: false
      }
      leds.push(item)
      pixelNumber++;
  }

  for(i = 0; i < 30; i++){
    item={
      row:91+i,
      column:16+i,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }

  for(i = 0; i < 30; i++){
    item={
      row: 91+i,
      column: 45-i,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }
  return leds
}

// HEXAGON AT BOTTOM RIGHT
// 5 SIDES
const computePosition2 = (pixelNumber:number, colors:string[]) => {
  let leds: { row: number, column: number, color: string, rotate: boolean }[] = []
  
  // OUTER HEXAGON
  for(var i = 0; i < 30; i++){
    var item = {
      row: i+61,
      column: 90 - i,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 30; i++){
    item = {
      row: i+121,
      column: i+61,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  } 
  for(i = 0; i < 30; i++){
    item = {
      row: 119-i,
      column: 120,
      color: colors[pixelNumber],
      rotate: false
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 30; i++){
    item = {
      row: 149-i,
      column: i+91,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 30; i++){
    item = {
      row: 90-i,
      column: 120-i,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }
  // END OUTER HEXAGON


  for(i = 0; i < 15; i++){
    item = {
      row: 76+i,
      column: 76,
      color: colors[pixelNumber],
      rotate: false
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: 91+i,
      column: 76-i,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: 106+i,
      column:i+61,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: 121+i,
      column: 76,
      color: colors[pixelNumber],
      rotate: false
    }
    leds.push(item)
    pixelNumber++;
  }

  for(i = 0; i < 15; i++){
    item = {
      row: 76+i,
      column: 105,
      color: colors[pixelNumber],
      rotate: false
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: 91+i,
      column: 105+i,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: 106+i,
      column:119-i,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: 121+i,
      column: 105,
      color: colors[pixelNumber],
      rotate: false
    }
    leds.push(item)
    pixelNumber++;
  }

  for(i = 0; i < 15; i++){
    item = {
      row: 76+i,
      column: 105-i,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: 76+i,
      column:i+76,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }

  for(i = 0; i < 15; i++){
    item = {
      row: 121+i,
      column: 90-i,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: 120+i,
      column:i+91,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }

  for(i = 0; i < 30; i++){
      item = {
        row: 91+i,
        column:91,
        color: colors[pixelNumber],
        rotate: false
      }
      leds.push(item)
      pixelNumber++;
  }

  for(i = 0; i < 30; i++){
    item={
      row:91+i,
      column:76+i,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }

  for(i = 0; i < 30; i++){
    item={
      row: 91+i,
      column: 105-i,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }
  return leds
}

// HEXAGON AT TOP CENTER
// 4 SIDES
const computePosition3 = (pixelNumber:number, colors: string[]) => {
  let leds: { row: number, column: number, color: string, rotate: boolean }[] = []

  // OUTER HEXAGON
  for(var i = 0; i < 30; i++){
    var item = {
      row: i+1,
      column: 60 - i,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 30; i++){
    item = {
      row: 31+i,
      column: 30,
      color: colors[pixelNumber],
      rotate: false
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 30; i++){
    item = {
      row: 60-i,
      column: 91,
      color: colors[pixelNumber],
      rotate: false
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 30; i++){
    item = {
      row: 30-i,
      column: 90-i,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }
  // END Outer Hexagon

  for(i = 0; i < 15; i++){
    item = {
      row: 16+i,
      column: 46,
      color: colors[pixelNumber],
      rotate: false
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: 31+i,
      column: 46-i,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: 46+i,
      column:i+31,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: 61+i,
      column: 45,
      color: colors[pixelNumber],
      rotate: false
    }
    leds.push(item)
    pixelNumber++;
  }

  for(i = 0; i < 15; i++){
    item = {
      row: 16+i,
      column: 75,
      color: colors[pixelNumber],
      rotate: false
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: 31+i,
      column: 76+i,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: 46+i,
      column:90-i,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: 61+i,
      column: 76,
      color: colors[pixelNumber],
      rotate: false
    }
    leds.push(item)
    pixelNumber++;
  }

  for(i = 0; i < 15; i++){
    item = {
      row: 16+i,
      column: 75-i,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: 16+i,
      column:i+46,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }

  for(i = 0; i < 15; i++){
    item = {
      row: 61+i,
      column: 60-i,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 15; i++){
    item = {
      row: 60+i,
      column:i+61,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }

  for(i = 0; i < 30; i++){
      item = {
        row: 31+i,
        column:61,
        color: colors[pixelNumber],
        rotate: false
      }
      leds.push(item)
      pixelNumber++;
  }
  for(i = 0; i < 30; i++){
    item={
      row:31+i,
      column:46+i,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }
  for(i = 0; i < 30; i++){
    item={
      row: 31+i,
      column: 75-i,
      color: colors[pixelNumber],
      rotate: true
    }
    leds.push(item)
    pixelNumber++;
  }
  return leds
}


export const FullLED = () => {

  // set color array at 100ms intervals
  const [colors, setColors] = useState<string[]>([]);

  // loading while getting config from backend
  const [loading, setLoading] = useState(false);

  // entire config will be loaded here
  const [config, setConfig] = useState<any>(null);

  // current array being checked in config
  const [i, setI] = useState<number>(1);

  // last array key, so animation can be looped
  const [lastKey, setLastKey] = useState<any>(null);
  const toast = useToast();

  // getting positions of all leds. They are given values 0,450 and 870 as colors at indexes 0-449 in the array represent the colors of the led of the bottom left hexagon, and so on and so forth
  var leds = computePosition(0, colors)
  leds.push(...computePosition2(450, colors))
  leds.push(...computePosition3(870, colors))

  // GETTING CONFIG from backend
  const fetchConfig = () => {
    setLoading(true)
    // config id is stored in local storage, if user changes this value and does not have authorization to access the config at changed ID, will throw error
    fetch("http://localhost:4000/config/" + authCtx.currentConfigID + "/",{
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
        },
    })
    .then((response) => 
        response.json()
        .then((data) => ({
            data: data,
            status: response.status,
        }))
        .then((res) => {
            setLoading(false)
            if(res.status === 200) {
                if(res.data.length !== 0){
                  // setting config
                  setConfig(res.data)
                  // sorting keys to get last key for looping animation
                  const sortedKeys = Object.keys(res.data)
                  .map(key => parseInt(key))
                  .sort((a, b) => a - b);
                  // last key for looping animation
                  const lastKey = sortedKeys[sortedKeys.length - 1];
                  setLastKey(lastKey);

                  // TODO: Change this 
                  // Currently sending config through socket when loading this page
                  // Hits a backend route called transfer that sends the config through socket
                  fetch("http://localhost:4000/transfer/" + authCtx.currentConfigID + "/",{
                      method: 'GET',
                      headers: {
                          "Content-Type": "application/json",
                      },
                  })
                }
                else{
                    setConfig(null)
                }
            }
            else{
              toast({
                title: "No Configuration found.",
                position: "top",
                status: "error",
                duration: 3000,
              });
                console.log("Error")
            }
        }))
}

  useEffect(() => {
    fetchConfig();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    
    // running through config to update state
    if(config){
      const intervalId = setInterval(() => {
        // getting colors of all leds at every 100th millisecond
        const newColors = config[i]
        setColors(newColors);

        // looping
        if(i === lastKey){
          setI(1);
        }
        else{
          setI(i+1);
        }
    }, 100);

    return () => {
      clearInterval(intervalId);
    };
    }
  });

  const authCtx = useContext(AuthContext);

  return (
    <>
     {loading ? (
      // if loading
      <Spinner />
     ) : (
      <div style={{overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', padding:'10vh 0', background: 'black'}}>
        {/* rendering the leds in the grid */}
      <LEDGrid
        rows={150}
        columns={119}
        leds={leds}
      />
    </div>
     )}
    </>
  );
};
