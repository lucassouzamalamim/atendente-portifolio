import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatWindow } from './components/ChatWindow';

function App() {
  const [inputAction, setInputAction] = useState<string | null>(null);

  const handleAction = (action: string) => {
    setInputAction(action);
  };

  const clearAction = () => {
    setInputAction(null);
  }

  return (
    <div className="bg-void-950 text-slate-200 font-sans h-screen overflow-hidden selection:bg-nebula-cyan selection:text-void-950 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-void-800 via-void-950 to-void-950 -z-20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-nebula-purple/20 via-transparent to-transparent -z-10"></div>
      <div className="stars-container">
        <div className="stars"></div>
        <div className="stars2"></div>
      </div>

      <div className="flex h-full relative z-10">
        <Sidebar onAction={handleAction} />

        <main className="flex-1 flex flex-col relative">
          <Header />
          <ChatWindow inputAction={inputAction} onActionConsumed={clearAction} />
        </main>
      </div>
    </div>
  );
}

export default App;
