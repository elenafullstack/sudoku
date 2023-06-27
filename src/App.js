import styles from "./styles/App.module.css";
import React, { useState, useRef, useMemo } from "react";

//move cells from already created sudoku
function removeCells(grid, numCells) {
  // Make a copy of the grid to modify
  let partialGrid = grid.map((row) => [...row]);

  // Get a list of all the cell positions
  let positions = [];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      positions.push([row, col]);
    }
  }

  // Shuffle the positions list to select cells randomly
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  // Remove the specified number of cells from the partial grid
  for (let i = 0; i < numCells; i++) {
    let [row, col] = positions[i];
    partialGrid[row][col] = null;
  }

  return partialGrid;
}
//sudoku filling algorithm from zero

function fillSudoku(sudoku, row, col) {
  if (col === 9) {
    col = 0;
    row++;
  }

  if (row === 9) {
    return true;
  }

  /*if (sudoku[row][col] !== null) {
    return fillSudoku(sudoku, row, col + 1);
  }*/

  let possibleValues = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  for (let i = 0; i < possibleValues.length; i++) {
    let value = possibleValues[i];
    if (isValid(sudoku, row, col, value)) {
      sudoku[row][col] = value;
      if (fillSudoku(sudoku, row, col + 1)) {
        return true;
      }
      sudoku[row][col] = null;
    }
  }

  return false;
}

//checking if the number is valid or not in the sudoku

function isValid(sudoku, row, col, value) {
  for (let i = 0; i < 9; i++) {
    if (sudoku[row][i] === value || sudoku[i][col] === value) {
      return false;
    }
  }
  let rowCorner = Math.floor(row / 3) * 3;
  let colCorner = Math.floor(col / 3) * 3;
  for (let i = rowCorner; i < rowCorner + 3; i++) {
    for (let j = colCorner; j < colCorner + 3; j++) {
      if (sudoku[i][j] === value) {
        return false;
      }
    }
  }
  return true;
}

//shuffle algorithm that is in the order of trying values

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function compare(sudoku, correct) {
  for (let i = 0; i < sudoku.length; i++) {
    for (let j = 0; j < sudoku[i].length; j++) {
      if (sudoku[i][j] != correct[i][j]) return false;
    }
  }
  return true;
}

function generateSudoku() {
  let sudoku = new Array(9).fill(null).map(() => new Array(9).fill(null));
  fillSudoku(sudoku, 0, 0);
  return sudoku;
}

const Square = (props) => {
  if (props.element !== null) {
    return (
      <td>
        <input
          type="number"
          defaultValue={props.element}
          readOnly
          disabled
        ></input>
      </td>
    );
  } else {
    return (
      <td>
        <input type="number" onChange={props.function}></input>
      </td>
    );
  }
};

const Sudokurow = (props) => {
  return (
    <tr>
      {props.row.map((element, elementIndex) => (
        <Square
          key={elementIndex}
          element={element}
          function={props.function}
        />
      ))}
    </tr>
  );
};

const App = () => {
  const sudokuArray = useRef(generateSudoku());
  console.log(sudokuArray.current);

  const callTimeout = (timeout) => {
    return timeout;
  };

  const [partialSudoku, setPartialSudoku] = useState(
    removeCells(sudokuArray.current, 15)
  );
  const [checkedSudoku, setCheckedSudoku] = useState([...partialSudoku]);
  const [message, setMessage] = useState("");
  const [newTimeout, setNewTimeout] = useState("");
  const updateValue = (rowIndex, colIndex, newValue) => {
    setCheckedSudoku((checkedSudoku) => {
      return checkedSudoku.map((row, i) => {
        if (i === rowIndex) {
          return row.map((val, j) => {
            if (j === colIndex) {
              return newValue;
            }
            return val;
          });
        }
        return row;
      });
    });
    console.log(checkedSudoku);
  };

  function fillPartialSudoku(sudoku, partialSudoku, row, col) {
    if (col === 9) {
      col = 0;
      row++;
    }

    if (row === 9) {
      return true;
    }

    if (sudoku[row][col] == partialSudoku[row][col]) {
      return fillPartialSudoku(sudoku, partialSudoku, row, col + 1);
    }

    let possibleValues = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    for (let i = 0; i < possibleValues.length; i++) {
      let value = possibleValues[i];
      if (isValid(partialSudoku, row, col, value)) {
        partialSudoku[row][col] = value;
        setTimeout(updateValue(row, col, value), 2000);

        if (fillPartialSudoku(sudoku, partialSudoku, row, col + 1)) {
          return true;
        }
        partialSudoku[row][col] = null;
      }
    }

    // for (let i = 0; i < possibleValues.length; i++) {
    //   let value = possibleValues[i];
    //   if (isValid(partialSudoku, row, col, value)) {
    //     // Delayed execution of each iteration
    //     setTimeout(() => {
    //       partialSudoku[row][col] = value;
    //       updateValue(row, col, value);

    //       if (fillPartialSudoku(sudoku, partialSudoku, row, col + 1)) {
    //         return true;
    //       }
    //       partialSudoku[row][col] = null;
    //     }, 500); // Delay each iteration by 500 milliseconds
    //   }
    // }

    // return false;
  }

  function checkSolution(sudoku, correct) {
    if (compare(sudoku, correct)) {
      setNewTimeout(clearTimeout(newTimeout));
      setMessage("sudoku has been solved correctly. congratz.");
      setNewTimeout(
        setTimeout(() => {
          setMessage(null);
        }, 5000)
      );
      callTimeout(newTimeout);
    } else {
      setNewTimeout(clearTimeout(newTimeout));
      setMessage("sudoku is not correct. Please try again");
      setNewTimeout(
        setTimeout(() => {
          setMessage(null);
        }, 5000)
      );
      callTimeout(newTimeout);
    }
  }

  const handleInput = (event) => {
    var input = event.target; // get reference to the input element that triggered the event
    var row = input.parentNode.parentNode.rowIndex; // get row index of the clicked input
    var col = input.parentNode.cellIndex; // get column index of the clicked input
    console.log("Row: " + row + ", Column: " + col);
    console.log(parseInt(input.value));
    input.value.trim().length > 0
      ? updateValue(row, col, parseInt(input.value))
      : updateValue(row, col, parseInt(null));
  };

  /*let partialCopy = partialSudoku.map(row => [...row]);
  fillPartialSudoku(sudokuArray,partialCopy,0,0)
  console.log(partialCopy)
  console.log(sudokuArray)*/

  return (
    <>
      <section className={styles.container1}>
        <div className={styles.container}>
          <table className={styles.sudoku}>
            <tbody>
              {partialSudoku.map((row, rowIndex) => (
                <Sudokurow key={rowIndex} row={row} function={handleInput} />
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.solution}>
          <button
            onClick={() => checkSolution(checkedSudoku, sudokuArray.current)}
          >
            Send your solution
          </button>

          <button
            onClick={() =>
              fillPartialSudoku(sudokuArray.current, checkedSudoku, 0, 0)
            }
          >
            Show solution
          </button>
          <h1>{message}</h1>
        </div>
      </section>
    </>
  );
};

export default App;
