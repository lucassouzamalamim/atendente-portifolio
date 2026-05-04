import { Header } from './components/Header';
import { ChatWindow } from './components/ChatWindow';

function App() {
  return (
    <div className="relative h-screen overflow-hidden bg-[#07111e] text-white selection:bg-cyan-300 selection:text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(20,184,166,0.26),transparent_34%),linear-gradient(180deg,#07323a_0%,#07111e_42%,#050b14_100%)]" />

      <main className="relative z-10 flex h-full flex-col">
        <Header />
        <ChatWindow inputAction={null} onActionConsumed={() => undefined} />
      </main>
    </div>
  );
}

export default App;
