import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import React from "react";

const chartData = [
  { name: "Jan", value: 30 },
  { name: "Feb", value: 35 },
  { name: "Mar", value: 32 },
  { name: "Apr", value: 50 },
  { name: "May", value: 40 },
  { name: "Jun", value: 45 },
];

const tableData = [
  { product: "Watermelon Gummies", id: "FF005", market: "Russia", type: "Poppins", status: "Open", decision: "Approved", reviewer: "Eddie Lobanovskiy", channel: "Distributor", effective: "July 2021", end: "N/A" },
  { product: "Blueberry Tablets", id: "401823", market: "USA", type: "No Type", status: "Closed", decision: "Approved", reviewer: "Violet Beauregarde", channel: "Wholesaler", effective: "June 2021", end: "N/A" },
  { product: "Pineapple Capsules", id: "E7D321", market: "Algeria", type: "No Type", status: "Closed", decision: "N/A", reviewer: "Lloyd Christmas", channel: "Wholesaler", effective: "June 2021", end: "N/A" },
  { product: "Pomegranate Softgels", id: "CA2845", market: "Saudi Arabia", type: "Codec", status: "Open", decision: "N/A", reviewer: "Julian Casablancas", channel: "Distributor", effective: "June 2021", end: "N/A" },
];

const StatusBadge = ({ status }) => {
  const statusColors = {
    Open: "bg-blue-500 shadow-blue-500/50",
    Closed: "bg-red-500 shadow-red-500/50",
    Approved: "bg-green-500 shadow-green-500/50",
  };

  return (
    <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold text-white shadow-md ${statusColors[status] || "bg-gray-600 shadow-gray-500/50"} `}>
      <span className="w-2 h-2 rounded-full bg-white opacity-80"></span>
      {status}
    </span>
  );
};

const DataSection = () => {
  return (
    <div className="relative p-8 rounded-xl bg-gradient-to-br from-[#0A0A0F] via-[#12141B] to-[#1E1E24] shadow-[0_0_50px_rgba(255,255,255,0.1)] text-gray-300 font-['Inter','IBM Plex Sans',sans-serif]">
      {/* Floating Effect Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-800/10 via-blue-600/10 to-cyan-500/5 opacity-30 blur-lg pointer-events-none"></div>

      {/* Chart Section */}
      <div className="relative mb-10">
        <h2 className="text-lg font-bold text-white tracking-wide text-center pb-6">Performance Overview</h2>
        <div className="p-6 rounded-xl bg-opacity-90 bg-gradient-to-b from-[#101217] via-[#161820] to-[#1A1C26] shadow-xl backdrop-blur-lg">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <XAxis dataKey="name" stroke="#A0A0A0" tick={{ fill: "#A0A0A0" }} />
              <YAxis stroke="#A0A0A0" tick={{ fill: "#A0A0A0" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A1A1F",
                  borderRadius: "8px",
                  boxShadow: "0 4px 20px rgba(147, 51, 234, 0.3)",
                  color: "#FFFFFF",
                  backdropFilter: "blur(10px)",
                }}
              />
              <Line type="monotone" dataKey="value" stroke="#9333EA" strokeWidth={3} dot={{ fill: "#9333EA", r: 5 }} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="value" stroke="#22D3EE" strokeWidth={3} dot={{ fill: "#22D3EE", r: 5 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table Section */}
      <div className="relative">
        <h2 className="text-lg font-bold text-white tracking-wide text-center pb-6">Market Insights</h2>
        <div className="rounded-xl bg-opacity-90 bg-gradient-to-b from-[#101217] via-[#161820] to-[#1A1C26] shadow-xl backdrop-blur-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            {/* Table Head */}
            <thead className="bg-opacity-50 bg-[#161820]">
              <tr>
                {["Product", "ID", "Market", "Type", "Status", "Decision", "Reviewer", "Channel", "Effective Date", "End Date"].map((head, index) => (
                  <th key={index} className="p-4 text-sm font-medium text-gray-400">{head}</th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index} className={`hover:bg-opacity-50 hover:bg-[#22222A] transition-all duration-300 ${index % 2 === 0 ? "bg-[#161820]" : "bg-[#1A1C26]"}`}>
                  <td className="p-4 text-sm text-gray-100">{row.product}</td>
                  <td className="p-4 text-sm text-gray-300">{row.id}</td>
                  <td className="p-4 text-sm text-blue-400 font-semibold">{row.market}</td>
                  <td className={`p-4 text-sm font-medium ${row.type === "No Type" ? "text-red-400" : "text-gray-300"}`}>
                    {row.type}
                  </td>
                  <td className="p-4 text-sm"><StatusBadge status={row.status} /></td>
                  <td className={`p-4 text-sm ${row.decision === "Approved" ? "text-green-400" : "text-gray-300"}`}>
                    {row.decision !== "N/A" && <StatusBadge status={row.decision} />}
                  </td>
                  <td className="p-4 text-sm text-gray-300">{row.reviewer}</td>
                  <td className="p-4 text-sm text-gray-300">{row.channel}</td>
                  <td className="p-4 text-sm text-gray-300">{row.effective}</td>
                  <td className="p-4 text-sm text-gray-300">{row.end}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataSection;
