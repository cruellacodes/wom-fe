// eslint-disable-next-line no-unused-vars
import React from "react"
import Header from "../components/Header"
import Footer from "../components/Footer"

const About = () => {
  return (
    <div className="bg-[#010409] min-h-screen text-gray-300">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-16">
        <section className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h1 className="text-4xl font-bold mb-6 text-green-300">Why WOM?</h1>
            <p className="mb-4">
              You wake up, and yet again, the token everyone was raving about 6 hours ago has already pumped. Whether you’re in
              NYC, Berlin, or Bali, it always feels like you’re in the wrong time zone.
            </p>
            <p className="mb-4">
              The alpha chats are a mess. Everyone’s aping betas. You try to keep up by hopping into Twitter
               but it’s just spam, bots, and engagement farming. You hesitate, skip the play, and it rips.
            </p>
            <p className="mb-4 font-semibold">
              WOM exists to answer one simple question: <br />
              <span className="italic">&quot;What is the market really saying about this token right now?&quot;</span>
            </p>
          </div>
          <div className="bg-green-800/10 p-6 rounded-xl border border-green-900 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-green-200">What WOM Measures</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>We pull freshly created tokens</li>
              <li>We fetch tweets in parallel using a round-robin job queue</li>
              <li>We remove spam and bot shills</li>
              <li>We analyze tone using AI language models trained on crypto talk</li>
              <li>We aggregate sentiment into a single <strong>WOM Score</strong></li>
            </ul>
          </div>
        </section>

        <section className="mb-24">
            <h2 className="text-3xl font-bold text-slate-100 mb-12 text-center">How to Read the Dashboard</h2>

            {/* Trio Chart Highlights */}
            <div className="grid md:grid-cols-3 gap-6 mb-16">
                <div className="bg-[#111318] p-5 rounded-xl shadow border border-neutral-800">
                <h3 className="text-lg font-semibold text-slate-200 mb-2">RadarChart</h3>
                <p className="text-sm text-slate-400">
                    Top 3 tokens by tweet volume in the last 6 hours. Great for spotting sudden attention spikes.
                </p>
                </div>

                <div className="bg-[#111318] p-5 rounded-xl shadow border border-neutral-800">
                <h3 className="text-lg font-semibold text-slate-200 mb-2">Podium</h3>
                <p className="text-sm text-slate-400">
                    The 3 most tweeted tokens of the day. Pure volume, no sentiment. Think: trending tokens.
                </p>
                </div>

                <div className="bg-[#111318] p-5 rounded-xl shadow border border-neutral-800">
                <h3 className="text-lg font-semibold text-slate-200 mb-2">PolarChart</h3>
                <p className="text-sm text-slate-400">
                    Visualizes the top 5 tokens ranked by sentiment (WOM Score). These aren’t just popular - they’re beloved.
                </p>
                </div>
            </div>

            {/* Tools & Components */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#111318] p-5 rounded-xl shadow border border-neutral-800 md:col-span-2">
                <h3 className="text-lg font-semibold text-slate-200 mb-2">SearchBar</h3>
                <p className="text-sm text-slate-400">
                    Want sentiment analysis for a token not listed? Just drop the token address and we’ll analyze the latest tweets instantly.
                </p>
                </div>

                <div className="bg-[#111318] p-5 rounded-xl shadow border border-neutral-800">
                <h3 className="text-lg font-semibold text-slate-200 mb-2">TweetScatterChart</h3>
                <p className="text-sm text-slate-400">
                    A breakdown of individual tweets. See how sentiment is distributed per token. Super helpful for spotting mixed reactions.
                </p>
                </div>

                <div className="bg-[#111318] p-5 rounded-xl shadow border border-neutral-800">
                <h3 className="text-lg font-semibold text-slate-200 mb-2">TokenInfoCard</h3>
                <p className="text-sm text-slate-400">
                    Your instant snapshot: WOM Score, volume, liquidity, price delta, Dex link — all in one neat card.
                </p>
                </div>

                <div className="bg-[#111318] p-5 rounded-xl shadow border border-neutral-800">
                <h3 className="text-lg font-semibold text-slate-200 mb-2">Leaderboard</h3>
                <p className="text-sm text-slate-400">
                    Interactive table of all tokens. Sort by WOM Score, tweet count, market cap, and more. Click any row to explore.
                </p>
                </div>

                <div className="bg-[#111318] p-5 rounded-xl shadow border border-neutral-800">
                <h3 className="text-lg font-semibold text-slate-200 mb-2">BubbleChart</h3>
                <p className="text-sm text-slate-400">
                    Each bubble = a tweet. X: time, Y: sentiment score, size: follower count. Use it to watch how hype builds (or dies).
                </p>
                </div>
            </div>
        </section>



        <div className="text-center mt-16">
          <a href="/" className="text-green-400 text-lg">
            ← Back to dashboard
          </a>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default About
