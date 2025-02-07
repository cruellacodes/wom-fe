import Header from "./components/Header";
import TokenInfoCard from "./components/TokenInfoCard";
import DataSection from "./components/DataSection";
import React from "react";

function App() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <div className="bg-[#010409] min-h-screen text-gray-300">
      {/* Full-width Header */}
      <Header />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* DataSection (Line Chart + Leaderboard) */}
        <DataSection onTokenSelect={() => setIsModalOpen(true)} />

        {/* Token Info Card Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#0A0F0A] p-6 rounded-xl w-96">
              <TokenInfoCard />
              <button
                onClick={() => setIsModalOpen(false)}
                className="mt-4 w-full p-2 bg-green-500 text-black rounded-lg hover:bg-green-400"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;