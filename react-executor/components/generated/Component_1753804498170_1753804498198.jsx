import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const OptionsCurve = () => {
  const [strikePrice, setStrikePrice] = useState(100);
  const [premium, setPremium] = useState(5);
  
  // Generate data for call option payoff
  const generateCallData = () => {
    const data = [];
    for (let price = 0; price <= 200; price += 5) {
      const payoff = Math.max(price - strikePrice, 0) - premium;
      const intrinsicValue = Math.max(price - strikePrice, 0);
      data.push({ price, callPayoff: payoff, callIntrinsic: intrinsicValue });
    }
    return data;
  };
  
  // Generate data for put option payoff
  const generatePutData = () => {
    const data = [];
    for (let price = 0; price <= 200; price += 5) {
      const payoff = Math.max(strikePrice - price, 0) - premium;
      const intrinsicValue = Math.max(strikePrice - price, 0);
      data.push({ price, putPayoff: payoff, putIntrinsic: intrinsicValue });
    }
    return data;
  };
  
  const callData = generateCallData();
  const putData = generatePutData();
  
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Options Payoff Curves</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-center text-blue-700">Call Option</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={callData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="price" 
                  label={{ value: 'Stock Price at Expiration', position: 'insideBottom', offset: -5 }} 
                />
                <YAxis 
                  label={{ value: 'Profit/Loss', angle: -90, position: 'insideLeft' }} 
                />
                <Tooltip 
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Value']}
                  labelFormatter={(value) => `Stock Price: $${value}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="callPayoff" 
                  name="Call Payoff" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  dot={false} 
                />
                <Line 
                  type="monotone" 
                  dataKey="callIntrinsic" 
                  name="Intrinsic Value" 
                  stroke="#1d4ed8" 
                  strokeDasharray="3 3" 
                  dot={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-center text-red-700">Put Option</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={putData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="price" 
                  label={{ value: 'Stock Price at Expiration', position: 'insideBottom', offset: -5 }} 
                />
                <YAxis 
                  label={{ value: 'Profit/Loss', angle: -90, position: 'insideLeft' }} 
                />
                <Tooltip 
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Value']}
                  labelFormatter={(value) => `Stock Price: $${value}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="putPayoff" 
                  name="Put Payoff" 
                  stroke="#ef4444" 
                  strokeWidth={2} 
                  dot={false} 
                />
                <Line 
                  type="monotone" 
                  dataKey="putIntrinsic" 
                  name="Intrinsic Value" 
                  stroke="#b91c1c" 
                  strokeDasharray="3 3" 
                  dot={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-100 p-6 rounded-lg mb-6">
        <h3 className="text-xl font-semibold mb-4 text-center text-gray-700">Interactive Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-medium text-gray-700">Strike Price: ${strikePrice}</label>
            <input 
              type="range" 
              min="50" 
              max="150" 
              step="5" 
              value={strikePrice} 
              onChange={(e) => setStrikePrice(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-700">Premium: ${premium}</label>
            <input 
              type="range" 
              min="0" 
              max="20" 
              step="0.5" 
              value={premium} 
              onChange={(e) => setPremium(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h3 className="text-lg font-semibold mb-2 text-yellow-800">Key Insights</h3>
        <ul className="list-disc pl-5 space-y-1 text-yellow-700">
          <li>Call options have unlimited profit potential as stock price rises above strike price</li>
          <li>Put options have limited profit potential as stock price falls to zero</li>
          <li>The premium paid is the maximum loss for both call and put buyers</li>
          <li>Maximum profit occurs when the option expires in-the-money</li>
        </ul>
      </div>
    </div>
  );
};

export default OptionsCurve;