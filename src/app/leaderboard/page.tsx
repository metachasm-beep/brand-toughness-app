'use client';

import { useEffect, useState } from 'react';

interface LeaderboardItem {
  rank: number;
  domain: string;
  brand: string;
  score: number;
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard/global')
      .then((res) => res.json())
      .then((res) => {
        setData(res.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">
        Global Brand Authority Leaderboard
      </h1>

      {loading ? (
        <div className="text-gray-500">Loading leaderboard...</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-black/40">
              <tr>
                <th className="text-left px-4 py-3">Rank</th>
                <th className="text-left px-4 py-3">Website</th>
                <th className="text-left px-4 py-3">Brand</th>
                <th className="text-left px-4 py-3">Score</th>
              </tr>
            </thead>

            <tbody>
              {data.map((row) => (
                <tr
                  key={row.rank}
                  className="border-t border-gray-800 hover:bg-black/30"
                >
                  <td className="px-4 py-3 font-medium">{row.rank}</td>

                  <td className="px-4 py-3">
                    <a
                      href={`https://${row.domain}`}
                      target="_blank"
                      className="text-blue-400 hover:underline"
                    >
                      {row.domain}
                    </a>
                  </td>

                  <td className="px-4 py-3">{row.brand}</td>

                  <td className="px-4 py-3 font-semibold">
                    {row.score.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
