import CanvasEditor from './components/Canvas/CanvasEditor';
import useKeyboard from './hooks/useKeyboard'; // ← ADDED

function App() {
  useKeyboard(); // ← ADDED - Activates keyboard shortcuts

  return (
    <div className="App">
      <CanvasEditor />
    </div>
  );
}

export default App;