const empty = "X";
const possibleNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
let board = [
  ["X","X","X", "X","X","X", "X","X","X"],
  ["X","1","2", "X","3","4", "5","6","7"],
  ["X","3","4", "5","X","6", "1","8","2"],

  ["X","X","1", "X","5","8", "2","X","6"],
  ["X","X","8", "6","X","X", "X","X","1"],
  ["X","2","X", "X","X","7", "X","5","X"],

  ["X","X","3", "7","X","5", "X","2","8"],
  ["X","8","X", "X","6","X", "7","X","X"],
  ["2","X","7", "X","8","3", "6","1","5"]
];

function getEmptySpaces(board) {
  let emptySpaces = [];

  for(let i = 0; i < board.length; i++) {
    for(let j = 0; j < board.length; j++) {
      if(board[i][j] === empty) {
        emptySpaces.push({row: i, col: j})
      }
    }
  }

  return emptySpaces;
}

function checkCol(board, number, colNumber) {
  let col = board.map(d => d[colNumber]);
  return col.some(item => item === number);
}
function checkRow(board, number, rowNumber) {
  return board[rowNumber].some(item => item === number)
}
function checkSquare(board, number, rowNumber, colNumber) {
  let startRow = Math.floor(rowNumber / 3) * 3;
  let startCol = Math.floor(colNumber / 3) * 3;

  for(let i = startRow; i < (startRow + 3); i++) {
    for(let j = startCol; j < (startCol + 3); j++) {
      if(board[i][j] === number) {
        return true;
      }
    }
  }

  return false;
}

function fillSudoku() {
  let emptySpaces = getEmptySpaces(board);

  emptySpaces.forEach((emptySpace, i) => {
    const { row, col } = emptySpace;

    possibleNumbers.forEach((number, index) => {

      if(
        !checkCol(board, number, col) &&
        !checkRow(board, number, row, col) && 
        !checkSquare(board, number, row, col)
        ) {
          board[row][col] = number;

          fillSudoku();
        }

    })
  })
};

fillSudoku();
console.log(board)

