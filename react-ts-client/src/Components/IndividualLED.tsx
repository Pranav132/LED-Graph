interface LEDProps {
    color: string;
    row?: number;
    column?: number;
    rotate?: boolean;
  }

// Component to emulate each led.
// Can be rotated or straight
// has color value, and position to represent position in grid
  
  export const IndividualLED: React.FC<LEDProps> = ({ color, row, column, rotate }) => {
    const ledStyle:any = {
      backgroundColor: color,
      gridRow: row,
      gridColumn: column,
      width: '4.5px',
      height: '4.5px',
    };

    if(rotate){
      ledStyle.transform= 'rotate(45deg)'
    }
    else{
      // unrotated leds are shown above rotated ones to cover spaces where nodes are not displayed
      ledStyle.zIndex = 2;
    }
  
    return <div style={ledStyle}></div>;
  };
  