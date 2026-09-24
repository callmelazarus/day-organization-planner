import { DayPlanner } from './clock/DayPlanner';
import { PomodoroTimer } from './clock/PomodoroTimer';
import './App.css';

function App() {
  return (
    <div className="app">
      <h1>Day Planner</h1>
      <PomodoroTimer />
      <DayPlanner />
    </div>
  );
}

export default App;
