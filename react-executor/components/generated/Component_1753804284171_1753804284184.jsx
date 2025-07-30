import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const OptionsCurveVisualization = () => {
  // Generate data for call option payoff
  const generateCallData = (strikePrice) => {
    const data = [];
    for (let price = 0; price <= 200; price += 5) {
      const payoff = Math.max(price - strikePrice, 0) - 10; // -10 represents premium paid
      data.push({ price, callPayoff: payoff });
    }
    return data;
  };

  // Generate data for put option payoff
  const generatePutData = (strikePrice) => {
    const data = [];
    for (let price = 0; price <= 200; price += 5) {
      const payoff = Math.max(strikePrice - price, 0) - 8; // -8 represents premium paid
      data.push({ price, putPayoff: payoff });
    }
    return data;
  };

  const strikePrice = 100;
  const callData = generateCallData(strikePrice);
  const putData = generatePutData(strikePrice);

  // Combine data for visualization
  const combinedData = callData.map((callPoint, index) => ({
    price: callPoint.price,
    callPayoff: callPoint.callPayoff,
    putPayoff: putData[index].putPayoff
  }));

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">Options Payoff Curves</h2>
      <p className="text-center text-gray-600 mb-6">Visualization of Call and Put Option Payoff at Expiration</p>
      
      <div className="mb-8">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={combinedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="price" 
                label={{ value: 'Stock Price ($)', position: 'insideBottom', offset: -10 }} 
                domain={[0, 200]}
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
                name="Call Option" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="putPayoff" 
                name="Put Option" 
                stroke="#ef4444" 
                strokeWidth={2} 
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey={() => 0} 
                name="Breakeven" 
                stroke="#94a3b8" 
                strokeDasharray="3 3" 
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-bold text-blue-800 mb-2">Call Option</h3>
          <p className="text-sm text-gray-700">
            Strike Price: $100<br />
            Premium Paid: $10<br />
            Breakeven Point: $110<br />
            Profit Potential: Unlimited<br />
            Loss Potential: Limited to premium
          </p>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h3 className="font-bold text-red-800 mb-2">Put Option</h3>
          <p className="text-sm text-gray-700">
            Strike Price: $100<br />
            Premium Paid: $8<br />
            Breakeven Point: $92<br />
            Profit Potential: Substantial<br />
            Loss Potential: Limited to premium
          </p>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-2">Key Insights</h3>
        <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
          <li>The call option has unlimited profit potential as stock price rises above the strike price</li>
          <li>The put option has substantial profit potential as stock price falls below the strike price</li>
          <li>Both options have limited loss (premium paid) if the option expires out-of-the-money</li>
          <li>The breakeven point is where the payoff crosses the zero line</li>
        </ul>
      </div>
    </div>
  );
};

export default OptionsCurveVisualization;