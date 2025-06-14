// eslint-disable-next-line no-unused-vars
import React from "react";
import Logo from "../assets/logo.webp";

const AppLoader = () => {
  return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center font-mono text-[#14f195]">
      <img
        src={Logo}
        alt="Logo"
        className="w-20 h-20 rounded-full animate-heartbeat"
      />


      <div className="flex items-center mt-4">
        <h1 className="typewriter text-lg sm:text-xl tracking-wide">
          Booting Word Of Mouth AI...
        </h1>
      </div>
    </div>
  );
};

export default AppLoader;
