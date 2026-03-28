export default function ResultScreen({ result, onPlayAgain }) {
  const isWin = result.winner === 'You';

  return (
    <div className="result-screen">
      <h2 className={isWin ? 'win' : 'lose'}>
        {isWin ? 'Victory!' : 'Defeat...'}
      </h2>
      <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
        {isWin ? 'You defeated your opponent!' : 'Your opponent was stronger this time.'}
      </p>

      <div className="result-stats">
        <p>Turns taken: <strong>{result.turns}</strong></p>
        <p>Your Pokemon remaining: <strong>{result.playerRemaining}</strong></p>
        <p>Opponent Pokemon remaining: <strong>{result.opponentRemaining}</strong></p>
      </div>

      <button className="play-again-btn" onClick={onPlayAgain}>
        Play Again
      </button>
    </div>
  );
}
