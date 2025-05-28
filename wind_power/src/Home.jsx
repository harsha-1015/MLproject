import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-gray-900 text-white">

      {/* Navbar */}
      <header className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center shadow-lg">
        <h1 className="text-3xl font-extrabold tracking-wide text-green-400">
          Wind Power Predictor
        </h1>
        <nav className="space-x-8 text-lg">
          <Link to="/" className="hover:text-green-400 transition">
            Home
          </Link>
          <Link to="/calculate" className="hover:text-green-400 transition">
            Calculate
          </Link>
        </nav>
      </header>

      {/* Content Section */}
      <main className="px-6 py-12 max-w-5xl mx-auto text-center space-y-12">

        {/* Green Energy Section */}
        <section>
          <h2 className="text-4xl font-bold mb-4 text-green-400">
            Green Energy — Powering the Future
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            Green energy refers to energy that is produced from natural resources like sunlight, wind, rain, tides, and geothermal heat — all of which are renewable and environmentally friendly.  
            Unlike fossil fuels, green energy does not emit harmful greenhouse gases or pollutants into the atmosphere.  
            It helps reduce our dependence on finite resources such as coal and oil, preserving the environment for future generations.  
            The adoption of green energy supports sustainable development, providing cleaner air and improving public health.  
            Many countries are investing in green energy infrastructure to fight climate change and meet energy demands responsibly.  
            Solar power, hydropower, biomass, and wind energy are the leading forms of green energy driving this revolution.  
            The future of our planet relies heavily on how fast we transition to clean, renewable energy sources like these.
          </p>
        </section>

        {/* Wind Power Section */}
        <section>
          <h2 className="text-4xl font-bold mb-4 text-green-400">
            Wind Power — Harnessing Nature's Force
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            Wind power is one of the fastest-growing sources of renewable energy in the world today.  
            It captures the kinetic energy from moving air using wind turbines and converts it into electricity.  
            Wind energy is abundant, clean, and completely free of carbon emissions during operation.  
            Installing windmills in optimal locations can generate significant amounts of power, making it a cost-effective energy solution.  
            Modern wind farms can be installed both onshore and offshore, with offshore wind turbines capturing stronger and more consistent winds.  
            Wind energy reduces environmental impacts like air and water pollution, conserves water, and helps fight global warming.  
            By integrating advanced technology, wind power prediction models and location optimization techniques help maximize efficiency and sustainability.
          </p>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 p-4 text-center" id="about">
        <p>&copy; 2025 Wind Power Predictor — Empowering Renewable Energy Solutions</p>
      </footer>
    </div>
  );
}

export default Home;
