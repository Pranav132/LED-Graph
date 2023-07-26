import React from 'react';
import { IndividualLED } from './IndividualLED';

interface GridProps {
  rows: number;
  columns: number;
  leds: { row: number, column: number, color: string, rotate: boolean}[];
}

const LEDGrid: React.FC<GridProps> = ({ rows, columns, leds }) => {

  // Grid to display all leds
  // Each led has a position in the grid

  const gridStyle = {
    display: "grid",
    gridTemplateRows: `repeat(${rows},3.5px)`, // 4.5px is the height of an individual LED. making it smaller so when it is rotated, there is no gap
    gridTemplateColumns: `repeat(${columns}, 3.5px)`, // 4.5px is the width of an individual LED
  };

  return (
    <div style={gridStyle}>
      {leds.map((item, index) => <IndividualLED key={index} color={item.color} row={item.row} column={item.column} rotate={item.rotate} />
      )}
    </div>
  );
};

export default LEDGrid;
