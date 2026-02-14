import { TypingPractice } from './components';
import { AudioProvider } from './contexts/AudioContext';
import { ErrorBoundary } from './components/ErrorBoundary';


function App() {
  return <>
    <ErrorBoundary>
      <AudioProvider>
        <div className="min-h-screen flex flex-col">
          <TypingPractice />
        </div>
      </AudioProvider>
    </ErrorBoundary>
    </>
  }

export default App;