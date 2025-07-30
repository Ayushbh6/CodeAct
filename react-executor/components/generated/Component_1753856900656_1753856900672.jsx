import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const OptionsCurve = () => {
  // Generate data for call option payoff curve
  const generateData = () => {
    const strikePrice = 100;
    const premium = 5;
    const data = [];
    
    for (let price = 70; price <= 130; price += 2) {
      // Call option payoff: max(0, underlying - strike) - premium
      const payoff = Math.max(0, price - strikePrice) - premium;
      data.push({ price, payoff });
    }
    return data;
  };

  const data = generateData();

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-center mb-6 text-gray-800">Call Option Payoff Curve</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis 
              dataKey="price" 
              label={{ value: 'Underlying Asset Price', position: 'insideBottom', offset: -5 }} 
            />
            <YAxis 
              label={{ value: 'Profit/Loss', angle: -90, position: 'insideLeft' }} 
            />
            <Tooltip 
              formatter={(value) => [`$${value.toFixed(2)}`, 'Profit/Loss']}
              labelFormatter={(value) => `$${value}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="payoff" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={false}
              name="Payoff"
            />
            
            {/* Strike price reference line */}
            <Line 
              type="monotone" 
              dataKey="strike" 
              stroke="#ef4444" 
              strokeDasharray="5 5"
              dot={false}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-gray-600 text-center">
        <p>Strike Price: $100 | Premium: $5</p>
      </div>
    </div>
  );
};

export default OptionsCurve;