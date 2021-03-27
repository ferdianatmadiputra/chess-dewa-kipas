import React, { Component } from "react";
import Chessboard from "chessboardjsx";

import StockFish from "../integrations/Stockfish.js";

let boardWidth = 0;

function calcBoardWidth(data) {
  // console.log(data);
  if (data.screenWidth < 576) {
    boardWidth = 280;
  } else if (data.screenWidth < 992) {
    boardWidth = 550;
  } else {
    boardWidth = 610;
  }
}

class VSBot extends Component {
  render() {
    return (
      <div style={boardsContainer}>
        <StockFish>
          {({ position, onDrop, resetGame }) => (
            <div>
              <Chessboard
                id="stockfish"
                position={position}
                // width={550}
                width={boardWidth}
                // calcWidth={(data) => console.log(data, "ini calcwidth")}
                calcWidth={(data) => calcBoardWidth(data)}
                onDrop={onDrop}
                boardStyle={boardStyle}
                orientation="white"
              />
              <button
                class="btn btn-outline-dark"
                style={{
                  borderColor: "#999999",
                  marginTop: "5px",
                  color: "#999999",
                }}
                onClick={() => resetGame()}
              >
                Reset
              </button>
              {/* <p className="text-light">{JSON.stringify(game, null, 2)}</p> */}
              {/* {console.log(game, "<<<<< TESTING")} */}
            </div>
          )}
        </StockFish>
      </div>
    );
  }
}

export default VSBot;

const boardsContainer = {
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
};
const boardStyle = {
  borderRadius: "5px",
  boxShadow: `0 5px 15px rgba(0, 0, 0, 0.5)`,
};
