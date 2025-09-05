import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {} from "@mui/material";

import pieceImages from "./pieceImages";

const ChessBoard = () => {
  const [board, setBoard] = useState([]);
  const [isPieceSelected, setIsPieceSelected] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [turn, setTurn] = useState("white");
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [lastMove, setLastMove] = useState(null);

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

  const getPossibleMovesForCheck = (sq, board) => {
    // Similar to your calculatePossibleMoves,
    // but stripped down: no highlighting, no setState.
    const piece = sq.value.split("-")[0];
    const cols = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const colIndex = cols.indexOf(sq.id[0]);
    const rowIndex = parseInt(sq.id[1]) - 1;

    const isWhite = sq.value.includes("white");
    let moves = [];

    switch (piece) {
      case "pawn": {
        const direction = isWhite ? 1 : -1;
        const forwardRow = rowIndex + direction;

        // Captures only (for check detection)
        [-1, +1].forEach((dc) => {
          const diagCol = colIndex + dc;
          if (diagCol >= 0 && diagCol < 8) {
            const diag = board.find(
              (c) => c.id === cols[diagCol] + (forwardRow + 1)
            );
            if (diag) moves.push(diag.id);
          }
        });
        break;
      }

      case "rook": {
        const directions = [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ];
        for (const [dr, dc] of directions) {
          let r = rowIndex + dr;
          let c = colIndex + dc;
          while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            const targetId = cols[c] + (r + 1);
            moves.push(targetId);
            const target = board.find((cell) => cell.id === targetId);
            if (target.value) break;
            r += dr;
            c += dc;
          }
        }
        break;
      }

      case "bishop": {
        const directions = [
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ];
        for (const [dr, dc] of directions) {
          let r = rowIndex + dr;
          let c = colIndex + dc;
          while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            const targetId = cols[c] + (r + 1);
            moves.push(targetId);
            const target = board.find((cell) => cell.id === targetId);
            if (target.value) break;
            r += dr;
            c += dc;
          }
        }
        break;
      }

      case "queen": {
        const directions = [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ];
        for (const [dr, dc] of directions) {
          let r = rowIndex + dr;
          let c = colIndex + dc;
          while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            const targetId = cols[c] + (r + 1);
            moves.push(targetId);
            const target = board.find((cell) => cell.id === targetId);
            if (target.value) break;
            r += dr;
            c += dc;
          }
        }
        break;
      }

      case "knight": {
        const knightMoves = [
          [2, 1],
          [2, -1],
          [-2, 1],
          [-2, -1],
          [1, 2],
          [1, -2],
          [-1, 2],
          [-1, -2],
        ];
        knightMoves.forEach(([dr, dc]) => {
          const r = rowIndex + dr;
          const c = colIndex + dc;
          if (r >= 0 && r < 8 && c >= 0 && c < 8) {
            moves.push(cols[c] + (r + 1));
          }
        });
        break;
      }

      case "king": {
        const directions = [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ];
        directions.forEach(([dr, dc]) => {
          const r = rowIndex + dr;
          const c = colIndex + dc;
          if (r >= 0 && r < 8 && c >= 0 && c < 8) {
            moves.push(cols[c] + (r + 1));
          }
        });
        break;
      }

      default:
        break;
    }
    return moves;
  };

  const isKingInCheck = (board, color) => {
    // 1. Find the king
    const king = board.find((cell) => cell.value === `king-${color}`);
    if (!king) return { inCheck: false, attackers: [] };

    // 2. Collect opponent moves and attackers
    const opponentColor = color === "white" ? "black" : "white";
    let attackers = [];

    board.forEach((cell) => {
      if (cell.value && cell.value.includes(opponentColor)) {
        const moves = getPossibleMovesForCheck(cell, board);
        if (moves.includes(king.id)) {
          attackers.push(cell.id); // this piece attacks king
        }
      }
    });

    return { inCheck: attackers.length > 0, attackers };
  };

  const calculatePossibleMoves = (sq, board, setBoard) => {
    const piece = sq.value.split("-")[0];
    const cols = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const colIndex = cols.indexOf(sq.id[0]);
    const rowIndex = parseInt(sq.id[1]) - 1;

    const isWhite = sq.value.includes("white");
    let moves = [];

    switch (piece) {
      case "pawn": {
        const direction = isWhite ? 1 : -1; // white moves up, black moves down
        const forwardRow = rowIndex + direction;
        const forwardOne = board.find(
          (c) => c.id === cols[colIndex] + (forwardRow + 1)
        );

        // Forward 1
        if (forwardOne && !forwardOne.value) {
          moves.push(forwardOne.id);

          // Forward 2 from starting rank
          if ((isWhite && rowIndex === 1) || (!isWhite && rowIndex === 6)) {
            const forwardTwo = board.find(
              (c) => c.id === cols[colIndex] + (forwardRow + direction + 1)
            );
            if (forwardTwo && !forwardTwo.value) {
              moves.push(forwardTwo.id);
            }
          }
        }

        // Captures
        [-1, +1].forEach((dc) => {
          const diagCol = colIndex + dc;
          if (diagCol >= 0 && diagCol < 8) {
            const diag = board.find(
              (c) => c.id === cols[diagCol] + (forwardRow + 1)
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
        break;
      }

      case "rook":
        {
          const directions = [
            [1, 0], // down
            [-1, 0], // up
            [0, 1], // right
            [0, -1], // left
          ];

          for (const [dr, dc] of directions) {
            let r = rowIndex + dr;
            let c = colIndex + dc;

            while (r >= 0 && r < 8 && c >= 0 && c < 8) {
              const cellId = cols[c] + (r + 1);
              const target = board.find((cell) => cell.id === cellId);

              if (target) {
                if (!target.value) {
                  moves.push(target.id);
                } else {
                  if (target.value.includes(isWhite ? "black" : "white")) {
                    moves.push(target.id);
                  }
                  break;
                }
              }
              r += dr;
              c += dc;
            }
          }
        }
        break;

      case "knight":
        {
          const knightMoves = [
            [2, 1],
            [2, -1],
            [-2, 1],
            [-2, -1],
            [1, 2],
            [1, -2],
            [-1, 2],
            [-1, -2],
          ];

          knightMoves.forEach(([dr, dc]) => {
            const r = rowIndex + dr;
            const c = colIndex + dc;

            if (r >= 0 && r < 8 && c >= 0 && c < 8) {
              const cellId = cols[c] + (r + 1);
              const target = board.find((cell) => cell.id === cellId);

              if (target) {
                if (!target.value) {
                  // empty square
                  moves.push(target.id);
                } else if (target.value.includes(isWhite ? "black" : "white")) {
                  // opponent piece
                  moves.push(target.id);
                }
              }
            }
          });
        }
        break;

      case "bishop":
        {
          const directions = [
            [1, 1], // down-right
            [1, -1], // down-left
            [-1, 1], // up-right
            [-1, -1], // up-left
          ];

          for (const [dr, dc] of directions) {
            let r = rowIndex + dr;
            let c = colIndex + dc;

            while (r >= 0 && r < 8 && c >= 0 && c < 8) {
              const cellId = cols[c] + (r + 1);
              const target = board.find(function (cell) {
                return cell.id === cellId;
              });

              if (!target.value) {
                moves.push(target.id);
              } else {
                if (target.value.includes(isWhite ? "black" : "white")) {
                  moves.push(target.id);
                }
                break;
              }

              r += dr;
              c += dc;
            }
          }
        }
        break;

      case "king":
        {
          const directions = [
            [1, 0], // down
            [-1, 0], // up
            [0, 1], // right
            [0, -1], // left
            [1, 1], // down-right
            [1, -1], // down-left
            [-1, 1], // up-right
            [-1, -1], // up-left
          ];

          directions.forEach(([dr, dc]) => {
            const r = rowIndex + dr;
            const c = colIndex + dc;

            if (r >= 0 && r < 8 && c >= 0 && c < 8) {
              const target = board.find(
                (cell) => cell.id === cols[c] + (r + 1)
              );

              if (!target.value) {
                // empty square → valid move
                moves.push(target.id);
              } else if (target.value.includes(isWhite ? "black" : "white")) {
                // opponent piece → capture
                moves.push(target.id);
              }
            }
          });
        }
        break;

      case "queen":
        {
          const directions = [
            [1, 0], // down
            [-1, 0], // up
            [0, 1], // right
            [0, -1], // left
            [1, 1], // down-right
            [1, -1], // down-left
            [-1, 1], // up-right
            [-1, -1], // up-left
          ];

          // ...existing code...
          // ...existing code...
          for (const [dr, dc] of directions) {
            let r = rowIndex + dr;
            let c = colIndex + dc;

            while (r >= 0 && r < 8 && c >= 0 && c < 8) {
              const cellId = cols[c] + (r + 1);
              const target = board.find(function (cell) {
                return cell.id === cellId;
              });

              if (!target.value) {
                moves.push(target.id);
              } else {
                if (target.value.includes(isWhite ? "black" : "white")) {
                  moves.push(target.id);
                }
                break;
              }

              r += dr;
              c += dc;
            }
          }
          // ...existing code...
          // ...existing code...
        }
        break;

      default:
        setPossibleMoves(null);
    }
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
    let capturedPiece = to.value;

    const myColor = turn;
    const opponentColor = turn === "white" ? "black" : "white";
    setLastMove({
      board: [...board],
      turn: turn,
    });

    // Build next board
    const nextBoard = board.map((cell) => {
      if (cell.id === to.id) return { ...cell, value: from.value };
      if (cell.id === from.id) return { ...cell, value: null };
      return cell;
    });

    // Check both kings
    const { inCheck: myKingInCheck, attackers: myAttackers } = isKingInCheck(
      nextBoard,
      myColor
    );
    const { inCheck: oppKingInCheck, attackers: oppAttackers } = isKingInCheck(
      nextBoard,
      opponentColor
    );

    // ✅ If captured piece is a king → game over
    if (capturedPiece && capturedPiece.includes("king")) {
      setBoard(nextBoard);
      setGameOver(true);
      setWinner(turn);
      return;
    }

    // ✅ Update board with highlighting
    const finalBoard = nextBoard.map((cell) => {
      // highlight my king if it's in check
      if (cell.value === `king-${myColor}`) {
        return { ...cell, isInCheck: myKingInCheck };
      }
      // highlight opponent king if it's in check
      if (cell.value === `king-${opponentColor}`) {
        return { ...cell, isInCheck: oppKingInCheck };
      }
      // mark attackers
      if (myAttackers.includes(cell.id) || oppAttackers.includes(cell.id)) {
        return { ...cell, isAttacker: true };
      }
      return { ...cell, isInCheck: false, isAttacker: false };
    });

    setBoard(finalBoard);
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
        prevBoard.map((cell) => ({
          ...cell,
          isHighlighted: false,
          isSelected: false,
        }))
      );
      return;
    }

    // Invalid click → reset
    if (isPieceSelected && !possibleMoves.includes(sq.id)) {
      setIsPieceSelected(false);
      setSelectedPiece(null);
      setPossibleMoves([]);
      setBoard((prevBoard) =>
        prevBoard.map((cell) => ({
          ...cell,
          isHighlighted: false,
          isSelected: false,
        }))
      );
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
      <Dialog open={gameOver} onClose={() => {}}>
        <DialogTitle>Game Over, lets Start new game.</DialogTitle>
        <DialogContent>
          {winner ? `${winner.toUpperCase()} wins!` : "Game ended."}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setBoard(generateBoard());
              setIsPieceSelected(false);
              setSelectedPiece(null);
              setPossibleMoves([]);
              setTurn("white");
              setGameOver(false);
              setWinner(null);
              setLastMove(null);
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

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
              bgcolor: sq.isInCheck
                ? "red"
                : sq.isAttacker
                ? "orange"
                : sq.color === "white"
                ? "#EEEED2"
                : "#769656",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              aspectRatio: "1 / 1",
              width: "100%",
              height: "100%",
              position: "relative",
              border: "none",
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
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            if (lastMove) {
              setBoard(lastMove.board);
              setTurn(lastMove.turn);
              setLastMove(null); // allow only one undo
            } else {
              alert("You can undo one move only");
            }
          }}
        >
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
        <Button variant="contained" color="primary">
          {`Turn: ${turn.charAt(0).toUpperCase() + turn.slice(1)}`}
        </Button>
      </Box>
    </Box>
  );
};

export default ChessBoard;
