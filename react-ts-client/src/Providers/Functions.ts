/* eslint-disable @typescript-eslint/no-unused-vars */
export const sanitiseConfigName = (configName: string) => {

  // If config name too long, adjusting to fit in CMS

    if(configName.length > 25){
        configName = configName.slice(0,25)
        configName += "..."
    }
    return configName
}

export const signOutUser = () => {
  // to sign out a user
    fetch('http://localhost:4000/logout', { credentials: 'include' })
    .catch((err) => console.error(err));
}

export function formatDate(dateString: string): string {

  // FORMAT DATE FOR CMS

    const date = new Date(dateString);
    const options:any = {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    };
    const formattedDate = date.toLocaleDateString('en-UK', options);
    return formattedDate;
  }

export const getLoginResult = (params:string) => {    

  // Parse login result

    const paramsURL = new URLSearchParams(params);
    const obj = Object.fromEntries(paramsURL.entries());
    if(!obj["success"]){
        return null;
    };
    
    if(obj["success"] === "0"){
        return obj
    }
    else if(obj["success"] === "1"){
        return "Login Failed"
    }
    else{
        return "Please use an Ashokan email"
    }
}


// Old functions to test out visualizer
// Sets random colors to each led strip of 15 leds.
function generateHexArray(): string[] {
    const colors: string[] = [];
    const distinctColors = 84;
    const blocks = 1260 / distinctColors;
  
    for (let i = 0; i < distinctColors; i++) {
      const color = getRandomColor();
      for (let j = 0; j < blocks; j++) {
        colors.push(color);
      }
    }
  
    return colors;
  }
  
  function getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  
  // moving red line config generator
  function generateArrays(numVals: number = 1260, numReds: number = 50): {[key: number]: string[]} {
    let data: {[key: number]: string[]} = {};
  
    for (let i = 0; i < numVals - numReds + 1; i++) {
        let array: string[] = Array(i).fill('#ccc').concat(Array(numReds).fill('#f00')).concat(Array(numVals - numReds - i).fill('#ccc'));
        data[i + 1] = array;
    }
    console.log(data)
    return data;
  }