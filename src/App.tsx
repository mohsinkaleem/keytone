import { TypingPractice } from './components';
import { AudioProvider } from './contexts/AudioContext';
import { UniverseProvider } from './contexts/UniverseContext';
import { ErrorBoundary } from './components/ErrorBoundary';


function App() {
  return <>
    <ErrorBoundary>
      <AudioProvider>
        <UniverseProvider>
          <div className="min-h-screen flex flex-col">
            <TypingPractice />
          </div>
        </UniverseProvider>
      </AudioProvider>
    </ErrorBoundary>
    </>
  }

export default App;