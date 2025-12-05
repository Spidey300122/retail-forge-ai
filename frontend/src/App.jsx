import { Toaster } from 'react-hot-toast';
import CanvasEditor from './components/Canvas/CanvasEditor';
import ErrorBoundary from './components/UI/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Toaster position="top-right" />
      <CanvasEditor />
    </ErrorBoundary>
  );
}

export default App;