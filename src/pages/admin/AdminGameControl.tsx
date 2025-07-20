import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Settings, Target, Clock, Zap, Play, Square, AlertCircle, CheckCircle } from 'lucide-react';

export function AdminGameControl() {
  const [fixedResult, setFixedResult] = useState('');
  const [isFixingEnabled, setIsFixingEnabled] = useState(false);
  const [gameDuration, setGameDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const [currentGame, setCurrentGame] = useState<any>(null);
  const [gameStats, setGameStats] = useState({
    activePlayers: 0,
    totalBets: 0,
    gamesToday: 0,
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchCurrentGame();
    fetchGameStats();
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const fetchCurrentGame = async () => {
    try {
      const response = await api.getCurrentGame();
      setCurrentGame(response.game);
    } catch (error) {
      console.error('Error fetching current game:', error);
    }
  };

  const fetchGameStats = async () => {
    try {
      // Mock stats for now - implement when backend has these endpoints
      setGameStats({
        activePlayers: 0,
        totalBets: 0,
        gamesToday: 0,
      });
    } catch (error) {
      console.error('Error fetching game stats:', error);
    }
  };

  const handleFixResult = async () => {
    if (!currentGame || !fixedResult) {
      showMessage('error', 'Please select a number and ensure there is an active game');
      return;
    }

    setLoading(true);
    try {
      await api.fixGameResult(currentGame._id, parseInt(fixedResult));
      showMessage('success', `Game #${currentGame.gameNumber} result fixed to ${fixedResult}`);
      await fetchCurrentGame();
      setFixedResult('');
      setIsFixingEnabled(false);
    } catch (error: any) {
      console.error('Error fixing result:', error);
      showMessage('error', 'Error fixing result: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDuration = async () => {
    setLoading(true);
    try {
      await api.updateAdminSettings({ gameDuration });
      showMessage('success', `Game duration updated to ${gameDuration} seconds`);
    } catch (error: any) {
      console.error('Error updating duration:', error);
      showMessage('error', 'Error updating duration: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForceEndGame = async () => {
    if (!currentGame) {
      showMessage('error', 'No active game to end');
      return;
    }

    setLoading(true);
    try {
      await api.endGame(currentGame._id);
      showMessage('success', `Game #${currentGame.gameNumber} ended successfully`);
      await fetchCurrentGame();
      await fetchGameStats();
    } catch (error: any) {
      console.error('Error ending game:', error);
      showMessage('error', 'Error ending game: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartNewGame = async () => {
    setLoading(true);
    try {
      const response = await api.createGame();
      showMessage('success', `New game created successfully!`);
      await fetchCurrentGame();
    } catch (error: any) {
      console.error('Error creating new game:', error);
      showMessage('error', 'Error creating new game: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Game Control</h1>
            <p className="text-[#b1bad3]">Manage game settings and results</p>
          </div>
        </div>
        <button
          onClick={() => {
            fetchCurrentGame();
            fetchGameStats();
          }}
          className="bg-[#00d4aa] hover:bg-[#00c49a] text-[#0f212e] font-bold py-2 px-4 rounded-lg transition-all"
        >
          Refresh
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-[#00d4aa]/20 border-[#00d4aa]/30 text-[#00d4aa]'
            : 'bg-red-500/20 border-red-500/30 text-red-300'
        }`}>
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Current Game Status */}
      {currentGame ? (
        <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Current Game Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#0f212e] border border-[#2f4553] rounded-xl p-4">
              <p className="text-[#b1bad3] text-sm">Game Number</p>
              <p className="text-2xl font-bold text-white">#{currentGame.game_number}</p>
            </div>
            <div className="bg-[#0f212e] border border-[#2f4553] rounded-xl p-4">
              <p className="text-[#b1bad3] text-sm">Status</p>
              <p className={`text-lg font-bold ${
                currentGame.status === 'waiting' ? 'text-yellow-400' :
                currentGame.status === 'betting' ? 'text-[#00d4aa]' :
                'text-blue-400'
              }`}>
                {currentGame.status.toUpperCase()}
              </p>
            </div>
            <div className="bg-[#0f212e] border border-[#2f4553] rounded-xl p-4">
              <p className="text-[#b1bad3] text-sm">Fixed Result</p>
              <p className="text-lg font-bold text-white">
                {currentGame.isFixed && currentGame.fixedResult !== null ? currentGame.fixedResult : 'Random'}
              </p>
            </div>
            <div className="bg-[#0f212e] border border-[#2f4553] rounded-xl p-4">
              <p className="text-[#b1bad3] text-sm">Start Time</p>
              <p className="text-sm text-white">
                {new Date(currentGame.startTime).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-6 text-center">
          <AlertCircle className="h-12 w-12 text-[#b1bad3] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Active Game</h2>
          <p className="text-[#b1bad3]">Create a new game to start managing</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Game Result Fixer */}
        <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <Target className="h-5 w-5 text-red-400" />
            <span>Fix Next Game Result</span>
          </h2>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[#b1bad3]">Enable result fixing</span>
              <button
                onClick={() => setIsFixingEnabled(!isFixingEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isFixingEnabled ? 'bg-red-500' : 'bg-[#2f4553]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isFixingEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {isFixingEnabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#b1bad3] mb-2">
                    Fixed Result (0-9)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="9"
                    value={fixedResult}
                    onChange={(e) => setFixedResult(e.target.value)}
                    placeholder="Enter number 0-9"
                    className="w-full p-4 bg-[#0f212e] border border-[#2f4553] rounded-xl text-white placeholder-[#b1bad3] focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-center text-2xl font-bold"
                  />
                </div>

                {fixedResult && (
                  <div className="bg-[#0f212e] border border-[#2f4553] rounded-xl p-4">
                    <h3 className="text-white font-medium mb-3">Result Preview:</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-[#b1bad3] text-sm mb-1">Number</p>
                        <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center text-white font-bold ${
                          parseInt(fixedResult) === 0 ? 'bg-green-500' : 
                          parseInt(fixedResult) % 2 === 0 ? 'bg-red-500' : 'bg-green-500'
                        }`}>
                          {fixedResult}
                        </div>
                      </div>
                      <div>
                        <p className="text-[#b1bad3] text-sm mb-1">Color</p>
                        <p className="text-white font-medium">
                          {parseInt(fixedResult) === 0 ? 'GREEN' : 
                           parseInt(fixedResult) % 2 === 0 ? 'RED' : 'GREEN'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#b1bad3] text-sm mb-1">Size</p>
                        <p className="text-white font-medium">
                          {parseInt(fixedResult) >= 5 ? 'BIG' : 'SMALL'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleFixResult}
                  disabled={!fixedResult || loading || !currentGame}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 disabled:from-[#2f4553] disabled:to-[#2f4553] text-white disabled:text-[#b1bad3] font-bold py-3 px-4 rounded-xl transition-all disabled:cursor-not-allowed"
                >
                  {loading ? 'Applying...' : 'Fix Next Game Result'}
                </button>
              </>
            )}

            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-300 text-sm">
                <strong>Warning:</strong> Use this feature responsibly. Fixed results will only apply to the current game.
              </p>
            </div>
          </div>
        </div>

        {/* Game Settings */}
        <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-400" />
            <span>Game Settings</span>
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#b1bad3] mb-2">
                Game Duration (seconds)
              </label>
              <input
                type="number"
                min="30"
                max="300"
                value={gameDuration}
                onChange={(e) => setGameDuration(parseInt(e.target.value))}
                className="w-full p-4 bg-[#0f212e] border border-[#2f4553] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-[#b1bad3] text-sm mt-1">
                Current: {Math.floor(gameDuration / 60)}:{(gameDuration % 60).toString().padStart(2, '0')}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[30, 60, 120].map((duration) => (
                <button
                  key={duration}
                  onClick={() => setGameDuration(duration)}
                  className="px-4 py-3 bg-[#2f4553] hover:bg-[#3a5664] text-white rounded-lg transition-all font-medium"
                >
                  {duration}s
                </button>
              ))}
            </div>

            <button
              onClick={handleUpdateDuration}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 disabled:from-[#2f4553] disabled:to-[#2f4553] text-white disabled:text-[#b1bad3] font-bold py-3 px-4 rounded-xl transition-all disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Game Duration'}
            </button>

            {/* Game Statistics */}
            <div className="bg-[#0f212e] border border-[#2f4553] rounded-xl p-4">
              <h3 className="text-white font-medium mb-3">Current Game Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#b1bad3]">Active Players:</span>
                  <span className="text-white">{gameStats.activePlayers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#b1bad3]">Total Bets:</span>
                  <span className="text-white">${gameStats.totalBets.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#b1bad3]">Games Today:</span>
                  <span className="text-white">{gameStats.gamesToday}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={handleForceEndGame}
          disabled={!currentGame || currentGame.status === 'completed' || loading}
          className="bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] hover:from-[#00c49a] hover:to-[#00a4c8] disabled:from-[#2f4553] disabled:to-[#2f4553] text-[#0f212e] disabled:text-[#b1bad3] font-bold py-4 px-6 rounded-xl transition-all text-center transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed flex flex-col items-center space-y-2"
        >
          <Square className="h-5 w-5" />
          <span>Force End Current Game</span>
        </button>
        <button 
          onClick={handleStartNewGame}
          disabled={loading}
          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 disabled:from-[#2f4553] disabled:to-[#2f4553] text-white disabled:text-[#b1bad3] font-bold py-4 px-6 rounded-xl transition-all text-center transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed flex flex-col items-center space-y-2"
        >
          <Play className="h-5 w-5" />
          <span>Start New Game</span>
        </button>
        <button 
          onClick={() => {
            setIsFixingEnabled(false);
            setFixedResult('');
            setGameDuration(60);
            showMessage('success', 'All settings reset to default');
          }}
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white font-bold py-4 px-6 rounded-xl transition-all text-center transform hover:scale-105 flex flex-col items-center space-y-2"
        >
          <Settings className="h-5 w-5" />
          <span>Reset All Settings</span>
        </button>
      </div>
    </div>
  );
}