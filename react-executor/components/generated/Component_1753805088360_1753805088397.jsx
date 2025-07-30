import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const OptionsCurveVisualization = () => {
  const [strikePrice, setStrikePrice] = useState(100);
  const [premium, setPremium] = useState(5);
  
  // Generate data for call option payoff
  const generateCallData = () => {
    const data = [];
    for (let price = 60; price <= 140; price += 2) {
      const payoff = Math.max(0, price - strikePrice) - premium;
      data.push({ price, callPayoff: payoff });
    }
    return data;
  };

  // Generate data for put option payoff
  const generatePutData = () => {
    const data = [];
    for (let price = 60; price <= 140; price += 2) {
      const payoff = Math.max(0, strikePrice - price) - premium;
      data.push({ price, putPayoff: payoff });
    }
    return data;
  };

  // Generate combined data
  const generateCombinedData = () => {
    const data = [];
    for (let price = 60; price <= 140; price += 2) {
      const callPayoff = Math.max(0, price - strikePrice) - premium;
      const putPayoff = Math.max(0, strikePrice - price) - premium;
      data.push({ 
        price, 
        callPayoff, 
        putPayoff,
        profit: callPayoff + putPayoff
      });
    }
    return data;
  };

  const callData = generateCallData();
  const putData = generatePutData();
  const combinedData = generateCombinedData();

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Options Payoff Visualization</h1>
      <p className="text-center text-gray-600 mb-8">Interactive visualization of call and put option payoffs</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Parameters</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Strike Price: ${strikePrice}
              </label>
              <input 
                type="range" 
                min="80" 
                max="120" 
                value={strikePrice} 
                onChange={(e) => setStrikePrice(Number(e.target.value))}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Premium: ${premium}
              </label>
              <input 
                type="range" 
                min="1" 
                max="15" 
                value={premium} 
                onChange={(e) => setPremium(Number(e.target.value))}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Key Information</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              <span><strong>Call Option</strong>: Right to buy at strike price</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <span><strong>Put Option</strong>: Right to sell at strike price</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Premium is paid upfront to enter the option</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-500 mr-2">•</span>
              <span>Maximum loss for buyer is premium paid</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Call Option Payoff</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={callData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="price" 
                label={{ value: 'Stock Price ($)', position: 'insideBottomRight', offset: -10 }} 
              />
              <YAxis 
                label={{ value: 'Profit/Loss ($)', angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip 
                formatter={(value) => [`$${value.toFixed(2)}`, 'Payoff']}
                labelFormatter={(value) => `Stock Price: $${value}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="callPayoff" 
                stroke="#10B981" 
                strokeWidth={2} 
                dot={false} 
                activeDot={{ r: 8 }} 
                name="Call Payoff"
              />
              <Line 
                type="monotone" 
                dataKey={() => 0} 
                stroke="#94A3B8" 
                strokeDasharray="3 3" 
                dot={false} 
                name="Breakeven"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Put Option Payoff</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={putData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="price" 
                label={{ value: 'Stock Price ($)', position: 'insideBottomRight', offset: -10 }} 
              />
              <YAxis 
                label={{ value: 'Profit/Loss ($)', angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip 
                formatter={(value) => [`$${value.toFixed(2)}`, 'Payoff']}
                labelFormatter={(value) => `Stock Price: $${value}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="putPayoff" 
                stroke="#EF4444" 
                strokeWidth={2} 
                dot={false} 
                activeDot={{ r: 8 }} 
                name="Put Payoff"
              />
              <Line 
                type="monotone" 
                dataKey={() => 0} 
                stroke="#94A3B8" 
                strokeDasharray="3 3" 
                dot={false} 
                name="Breakeven"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Combined Payoff (Long Straddle)</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={combinedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="price" 
                label={{ value: 'Stock Price ($)', position: 'insideBottomRight', offset: -10 }} 
              />
              <YAxis 
                label={{ value: 'Profit/Loss ($)', angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip 
                formatter={(value) => [`$${value.toFixed(2)}`, 'Payoff']}
                labelFormatter={(value) => `Stock Price: $${value}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="callPayoff" 
                stroke="#10B981" 
                strokeWidth={2} 
                dot={false} 
                activeDot={{ r: 8 }} 
                name="Call Payoff"
              />
              <Line 
                type="monotone" 
                dataKey="putPayoff" 
                stroke="#EF4444" 
                strokeWidth={2} 
                dot={false} 
                activeDot={{ r: 8 }} 
                name="Put Payoff"
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#8B5CF6" 
                strokeWidth={3} 
                dot={false} 
                activeDot={{ r: 8 }} 
                name="Total Profit"
              />
              <Line 
                type="monotone" 
                dataKey={() => -2 * premium} 
                stroke="#94A3B8" 
                strokeDasharray="3 3" 
                dot={false} 
                name="Max Loss"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h3 className="font-bold text-yellow-800 mb-2">Key Insights</h3>
        <ul className="text-yellow-700 space-y-1">
          <li>• Call options have unlimited profit potential as stock price rises</li>
          <li>• Put options have limited profit potential as stock price falls to zero</li>
          <li>• Maximum loss for option buyers is the premium paid</li>
          <li>• A straddle strategy (buying both call and put) profits from volatility in either direction</li>
        </ul>
      </div>
    </div>
  );
};

export default OptionsCurveVisualization;