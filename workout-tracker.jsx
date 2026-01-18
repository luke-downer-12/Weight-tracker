import React, { useState, useEffect } from 'react';
import { Plus, Trash2, TrendingUp, Calendar, Dumbbell } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function WorkoutTracker() {
  const [workouts, setWorkouts] = useState([]);
  const [currentExercise, setCurrentExercise] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [currentReps, setCurrentReps] = useState('');
  const [currentSets, setCurrentSets] = useState('');
  const [selectedExercise, setSelectedExercise] = useState('all');
  const [view, setView] = useState('log'); // 'log' or 'chart'
  const [motto, setMotto] = useState('BRICK BY BRICK');
  const [isEditingMotto, setIsEditingMotto] = useState(false);
  const [tempMotto, setTempMotto] = useState('');

  // Load workouts from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('workoutData');
    if (saved) {
      setWorkouts(JSON.parse(saved));
    }
    
    const savedMotto = localStorage.getItem('workoutMotto');
    if (savedMotto) {
      setMotto(savedMotto);
    }
  }, []);

  // Save workouts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('workoutData', JSON.stringify(workouts));
  }, [workouts]);

  const saveMotto = () => {
    const newMotto = tempMotto.trim() || 'BRICK BY BRICK';
    setMotto(newMotto);
    localStorage.setItem('workoutMotto', newMotto);
    setIsEditingMotto(false);
    setTempMotto('');
  };

  const startEditingMotto = () => {
    setTempMotto(motto);
    setIsEditingMotto(true);
  };

  const addWorkout = () => {
    if (!currentExercise || !currentWeight || !currentReps || !currentSets) {
      alert('Please fill in all fields');
      return;
    }

    const newWorkout = {
      id: Date.now(),
      exercise: currentExercise.trim(),
      weight: currentWeight.trim(),
      reps: currentReps.trim(),
      sets: currentSets.trim(),
      date: new Date().toISOString(),
      displayDate: new Date().toLocaleDateString()
    };

    setWorkouts([newWorkout, ...workouts]);
    
    // Clear form
    setCurrentExercise('');
    setCurrentWeight('');
    setCurrentReps('');
    setCurrentSets('');
  };

  const deleteWorkout = (id) => {
    setWorkouts(workouts.filter(w => w.id !== id));
  };

  const getUniqueExercises = () => {
    const exercises = [...new Set(workouts.map(w => w.exercise))];
    return exercises.sort();
  };

  const getFilteredWorkouts = () => {
    if (selectedExercise === 'all') return workouts;
    return workouts.filter(w => w.exercise === selectedExercise);
  };

  const getChartData = () => {
    const filtered = getFilteredWorkouts();
    // Group by date and exercise, taking the max weight for that day
    const grouped = {};
    
    filtered.forEach(workout => {
      const key = `${workout.displayDate}-${workout.exercise}`;
      const workoutWeight = parseFloat(String(workout.weight).split('-')[0]) || 0;
      const existingWeight = grouped[key] ? parseFloat(String(grouped[key].weight).split('-')[0]) || 0 : 0;
      
      if (!grouped[key] || existingWeight < workoutWeight) {
        grouped[key] = { ...workout, weight: workoutWeight };
      }
    });

    return Object.values(grouped)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-10); // Last 10 entries for readability
  };

  const getTotalVolume = (workout) => {
    // Try to parse numeric values, handle ranges by taking first number
    const weight = parseFloat(String(workout.weight).split('-')[0]) || 0;
    const reps = parseFloat(String(workout.reps).split('-')[0]) || 0;
    const sets = parseFloat(String(workout.sets).split('-')[0]) || 0;
    return weight * reps * sets;
  };

  const getStats = () => {
    const filtered = getFilteredWorkouts();
    if (filtered.length === 0) return null;

    const weights = filtered.map(w => parseFloat(String(w.weight).split('-')[0]) || 0);
    const maxWeight = Math.max(...weights);
    const totalVolume = filtered.reduce((sum, w) => sum + getTotalVolume(w), 0);
    const avgWeight = weights.reduce((sum, w) => sum + w, 0) / filtered.length;

    return {
      maxWeight: maxWeight.toFixed(0),
      totalVolume: totalVolume.toFixed(0),
      avgWeight: avgWeight.toFixed(1),
      totalWorkouts: filtered.length
    };
  };

  const stats = getStats();
  const uniqueExercises = getUniqueExercises();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Dumbbell className="w-10 h-10 text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Workout Tracker
            </h1>
          </div>
          <p className="text-slate-400">Track your lifts, build your strength</p>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6 bg-slate-800/50 p-1 rounded-lg w-fit mx-auto">
          <button
            onClick={() => setView('log')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              view === 'log'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Workout Log
          </button>
          <button
            onClick={() => setView('chart')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              view === 'chart'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Progress Chart
          </button>
        </div>

        {view === 'log' ? (
          <>
            {/* Add Workout Form */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 mb-6 shadow-2xl border border-slate-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Log Workout
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input
                  type="text"
                  placeholder="Exercise (e.g., Bench Press)"
                  value={currentExercise}
                  onChange={(e) => setCurrentExercise(e.target.value)}
                  className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  list="exercise-list"
                />
                <datalist id="exercise-list">
                  {uniqueExercises.map(ex => (
                    <option key={ex} value={ex} />
                  ))}
                </datalist>
                <input
                  type="text"
                  placeholder="Weight (lbs)"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Reps"
                  value={currentReps}
                  onChange={(e) => setCurrentReps(e.target.value)}
                  className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Sets"
                  value={currentSets}
                  onChange={(e) => setCurrentSets(e.target.value)}
                  className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addWorkout}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6 py-2 font-medium transition-colors shadow-lg hover:shadow-xl"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Stats Overview */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
                  <div className="text-slate-400 text-sm mb-1">Max Weight</div>
                  <div className="text-2xl font-bold text-blue-400">{stats.maxWeight} lbs</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
                  <div className="text-slate-400 text-sm mb-1">Total Volume</div>
                  <div className="text-2xl font-bold text-purple-400">{stats.totalVolume} lbs</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
                  <div className="text-slate-400 text-sm mb-1">Avg Weight</div>
                  <div className="text-2xl font-bold text-green-400">{stats.avgWeight} lbs</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
                  <div className="text-slate-400 text-sm mb-1">Total Sets</div>
                  <div className="text-2xl font-bold text-orange-400">{stats.totalWorkouts}</div>
                </div>
              </div>
            )}

            {/* Filter */}
            <div className="mb-4">
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Exercises</option>
                {uniqueExercises.map(ex => (
                  <option key={ex} value={ex}>{ex}</option>
                ))}
              </select>
            </div>

            {/* Workout History */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl shadow-2xl border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Exercise
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Weight
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Reps
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Sets
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Volume
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {getFilteredWorkouts().length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                          No workouts logged yet. Start tracking your lifts above!
                        </td>
                      </tr>
                    ) : (
                      getFilteredWorkouts().map((workout) => (
                        <tr key={workout.id} className="hover:bg-slate-700/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                            {workout.displayDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium">
                            {workout.exercise}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-blue-400 font-semibold">
                            {workout.weight} lbs
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                            {workout.reps}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                            {workout.sets}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-purple-400 font-semibold">
                            {getTotalVolume(workout).toFixed(0)} lbs
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => deleteWorkout(workout.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Chart View */}
            <div className="mb-4">
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Exercises</option>
                {uniqueExercises.map(ex => (
                  <option key={ex} value={ex}>{ex}</option>
                ))}
              </select>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 shadow-2xl border border-slate-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Weight Progress
              </h2>
              {getChartData().length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  No data to display. Log some workouts first!
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis 
                      dataKey="displayDate" 
                      stroke="#94a3b8"
                      tick={{ fill: '#94a3b8' }}
                    />
                    <YAxis 
                      stroke="#94a3b8"
                      tick={{ fill: '#94a3b8' }}
                      label={{ value: 'Weight (lbs)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', r: 5 }}
                      activeDot={{ r: 7 }}
                      name="Weight (lbs)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </>
        )}

        {/* Motto Section */}
        <div className="mt-8 text-center pb-8">
          {!isEditingMotto ? (
            <div className="flex flex-col items-center gap-3">
              <div className="text-3xl font-bold tracking-wider text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text">
                {motto}
              </div>
              <button
                onClick={startEditingMotto}
                className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
              >
                Edit Motto
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <input
                type="text"
                value={tempMotto}
                onChange={(e) => setTempMotto(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && saveMotto()}
                placeholder="Enter your motto"
                className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-md"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={saveMotto}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-1 text-sm font-medium transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditingMotto(false);
                    setTempMotto('');
                  }}
                  className="bg-slate-600 hover:bg-slate-500 text-white rounded-lg px-4 py-1 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
