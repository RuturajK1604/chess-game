import React, { useEffect, useState } from "react";
import { Box, Button } from "@mui/material";
import pieceImages from "./pieceImages";

const ChessBoard = () => {
  const [board, setBoard] = useState([]);
  const [isPieceSelected, setIsPieceSelected] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [turn, setTurn] = useState("white"); // NEW: track whose turn it is

  const generateBoard = () => {
    const cols = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const rows = ["1", "2", "3", "4", "5", "6", "7", "8"];
    const newBoard = [];

    const backRank = [
      "rook",
      "knight",
      "bishop",
      "queen",
      "king",
      "bishop",
      "knight",
      "rook",
    ];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const id = cols[c] + rows[r];
        const isWhiteSquare = (r + c) % 2 === 0;
        let value = null;

        if (rows[r] === "1") value = `${backRank[c]}-white`;
        if (rows[r] === "2") value = "pawn-white";
        if (rows[r] === "7") value = "pawn-black";
        if (rows[r] === "8") value = `${backRank[c]}-black`;

        newBoard.push({
          id,
          color: isWhiteSquare ? "white" : "black",
          value,
          isSelected: false,
        });
      }
    }
    return newBoard;
  };

  const calculatePossibleMoves = (sq, board, setBoard) => {
    const cols = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const colIndex = cols.indexOf(sq.id[0]);
    const rowIndex = parseInt(sq.id[1]) - 1;

    const isWhite = sq.value.includes("white");
    const direction = isWhite ? 1 : -1;

    let moves = [];

    // Forward 1 step
    const forwardOne = board.find(
      (c) => c.id === cols[colIndex] + (rowIndex + 1 * direction + 1)
    );
    if (forwardOne && !forwardOne.value) {
      moves.push(forwardOne.id);

      // Forward 2 steps from start
      if ((isWhite && rowIndex === 1) || (!isWhite && rowIndex === 6)) {
        const forwardTwo = board.find(
          (c) => c.id === cols[colIndex] + (rowIndex + 2 * direction + 1)
        );
        if (forwardTwo && !forwardTwo.value) {
          moves.push(forwardTwo.id);
        }
      }
    }

    // Capture diagonals
    [-1, +1].forEach((dc) => {
      const diagCol = colIndex + dc;
      if (diagCol >= 0 && diagCol < 8) {
        const diag = board.find(
          (c) => c.id === cols[diagCol] + (rowIndex + 1 * direction + 1)
        );
        if (
          diag &&
          diag.value &&
          diag.value.includes(isWhite ? "black" : "white")
        ) {
          moves.push(diag.id);
        }
      }
    });

    // Highlight
    setBoard((prevBoard) =>
      prevBoard.map((cell) => ({
        ...cell,
        isHighlighted: moves.includes(cell.id),
      }))
    );

    setPossibleMoves(moves);
  };

  const movePiece = (from, to) => {
    setBoard((prevBoard) =>
      prevBoard.map((cell) => {
        if (cell.id === to.id) {
          return { ...cell, value: from.value };
        }
        if (cell.id === from.id) {
          return { ...cell, value: null };
        }
        return cell;
      })
    );
    // Flip turn after valid move
    setTurn((prev) => (prev === "white" ? "black" : "white"));
  };

  const onSquareClick = (sq) => {
    // Selecting a piece → must belong to current turn
    if (sq.value && !isPieceSelected) {
      const pieceColor = sq.value.includes("white") ? "white" : "black";
      if (pieceColor !== turn) return; // ignore if not this player's turn

      setIsPieceSelected(true);
      calculatePossibleMoves(sq, board, setBoard);
      setSelectedPiece(sq);
      setBoard((prevBoard) =>
        prevBoard.map((cell) =>
          cell.id === sq.id
            ? { ...cell, isSelected: !cell.isSelected }
            : { ...cell, isSelected: false }
        )
      );
      return;
    }

    // Moving → must be a highlighted square
    if (isPieceSelected && possibleMoves.includes(sq.id)) {
      movePiece(selectedPiece, sq);
      setIsPieceSelected(false);
      setSelectedPiece(null);
      setPossibleMoves([]);
      setBoard((prevBoard) =>
        prevBoard.map((cell) => ({ ...cell, isHighlighted: false }))
      );
      return;
    }

    // Invalid click → reset
    if (isPieceSelected && !possibleMoves.includes(sq.id)) {
      // setIsPieceSelected(false);
      // setSelectedPiece(null);
      // setPossibleMoves([]);
      // setBoard((prevBoard) =>
      //   prevBoard.map((cell) => ({ ...cell, isHighlighted: false }))
      // );
      return;
    }
  };

  useEffect(() => {
    setBoard(generateBoard());
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        mt: 2,
      }}
    >
      {/* Chess Board */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 1fr)",
          width: "80vmin",
          height: "80vmin",
          border: "2px solid #333",
        }}
      >
        {board.map((sq) => (
          <Box
            key={sq.id}
            onClick={() => onSquareClick(sq)}
            sx={{
              bgcolor: sq.color === "white" ? "#EEEED2" : "#769656",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              aspectRatio: "1 / 1",
              width: "100%",
              height: "100%",
              position: "relative",
            }}
          >
            {sq.value && (
              <img
                src={pieceImages[sq.value]}
                alt={sq.value}
                style={{
                  width: "80%",
                  height: "80%",
                  objectFit: "contain",
                  opacity: sq.isSelected ? 0.7 : 1,
                }}
              />
            )}
            {sq.isHighlighted && (
              <Box
                sx={{
                  width: "50%",
                  height: "50%",
                  borderRadius: "50%",
                  bgcolor: "rgba(255, 2, 2, 0.3)",
                  position: "absolute",
                }}
              />
            )}
          </Box>
        ))}
      </Box>

      {/* Buttons + Turn */}
      <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
        <Button variant="contained" color="primary">
          Undo
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setBoard(generateBoard());
            setIsPieceSelected(false);
            setSelectedPiece(null);
            setPossibleMoves([]);
            setTurn("white"); // reset turn
          }}
        >
          New Game
        </Button>
      </Box>

      <Box sx={{ mt: 2, fontSize: "1.2rem", fontWeight: "bold" }}>
        Turn: {turn.charAt(0).toUpperCase() + turn.slice(1)}
      </Box>
    </Box>
  );
};

export default ChessBoard;
