import { Toaster } from 'react-hot-toast';
import CanvasEditor from './components/Canvas/CanvasEditor';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <CanvasEditor />
    </>
  );
}

export default App;