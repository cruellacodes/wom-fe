/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React from "react"
import Header from "../components/Header"
import Footer from "../components/Footer"

const About = () => {
  return (
    <div className="bg-black min-h-screen text-gray-200 font-sans">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-20">
        <section className="grid md:grid-cols-2 gap-16 mb-24">
          <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl font-semibold text-white">Why WOM?</h1>
            <p className="text-sm md:text-base leading-relaxed text-gray-400">
              Crypto moves fast — but sentiment signals are scattered, noisy, and easy to miss. Social feeds are overwhelmed with bots, shills, and recycled hype. By the time you notice, the opportunity’s already gone.
            </p>
            <p className="text-sm md:text-base leading-relaxed text-gray-400">
              WOM is an AI-powered layer for surfacing real-time market sentiment. Using a custom-trained language model and live tweet data, WOM extracts high-signal insights from crypto Twitter and gives each token a sentiment score you can act on.
            </p>
          </div>

          <div className="bg-[#111] p-6 md:p-8 rounded-2xl border border-[#222]">
            <h2 className="text-xl font-medium text-green-300 mb-4">What WOM Measures</h2>
            <ul className="list-disc list-inside space-y-3 text-sm text-gray-300">
              <li>Detects and indexes newly created Solana tokens</li>
              <li>Fetches tweets asynchronously on a rotating schedule</li>
              <li>Filters out low-quality content and spam</li>
              <li>Applies a custom AI model trained on crypto-native language</li>
              <li>Generates a unified <strong>WOM Score</strong> per token</li>
            </ul>
          </div>
        </section>

        <section className="mb-24">
          <h2 className="text-2xl font-semibold text-white mb-12 text-center">Reading the Dashboard</h2>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <DashboardCard title="Radar" desc="Top 3 tokens by tweet volume in the past 6 hours — see what’s getting sudden traction." />
            <DashboardCard title="Podium" desc="Most tweeted tokens of the day — pure volume, no sentiment." />
            <DashboardCard title="Sentiment Radar" desc="Top 5 tokens by average sentiment. High WOM Score = loved by the crowd." />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <DashboardCard title="Search" desc="Search any token address and we’ll instantly analyze its latest tweet sentiment." full />
            <DashboardCard title="Tweet Scatter" desc="Every tweet, plotted by time and sentiment score. Get the full mood." />
            <DashboardCard title="Token Card" desc="Snapshot of WOM Score, liquidity, volume, and price delta." />
            <DashboardCard title="Leaderboard" desc="Sortable table of all tokens by WOM Score, tweet count, and more." />
            <DashboardCard title="Sentiment Chart" desc="Sentiment over time stacked by tweet WOM score. Spot mood shifts early." link="https://github.com/cruellacodes/wom-fe/blob/main/src/docs/BoxPlotDoc.md" />
          </div>
        </section>

        <div className="text-center mt-16">
          <a href="/" className="text-green-400 text-sm hover:underline">
            ← Back to dashboard
          </a>
        </div>
      </main>

      <Footer />
    </div>
  )
}

const DashboardCard = ({ title, desc, full, link }) => (
  <div className={`bg-[#111] p-5 md:p-6 rounded-xl border border-neutral-800 ${full ? 'md:col-span-2' : ''}`}>
    <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
    <p className="text-sm text-gray-400">{desc}</p>
    {link && (
      <p className="mt-2 text-xs">
        <a
          href={link}
          className="text-green-300 hover:text-green-100 underline"
          target="_blank"
          rel="noreferrer"
        >
          Read more →
        </a>
      </p>
    )}
  </div>
);

export default About;
