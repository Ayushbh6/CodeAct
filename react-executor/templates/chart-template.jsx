// Chart Template - Professional Data Visualizations
// Component Type: chart
// Libraries: Recharts, Framer Motion, Lucide React

const ChartTemplate = () => {
  const [mounted, setMounted] = React.useState(false);
  const [data, setData] = React.useState([
    { name: 'Jan', value: 400, category: 'A' },
    { name: 'Feb', value: 300, category: 'B' },
    { name: 'Mar', value: 600, category: 'A' },
    { name: 'Apr', value: 800, category: 'B' },
    { name: 'May', value: 500, category: 'A' },
    { name: 'Jun', value: 700, category: 'B' }
  ]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-lg border border-gray-100"
    >
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <TrendingUp className="text-blue-600" />
          Chart Title
        </h2>
        <p className="text-gray-600">Chart description and context</p>
      </div>

      {/* Chart Container */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl"
      >
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              stroke="#64748b"
              fontSize={12}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Interactive Controls (Optional) */}
      <div className="grid md:grid-cols-3 gap-4">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="p-4 bg-gray-50 rounded-xl border text-center"
        >
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {data.reduce((sum, item) => sum + item.value, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Value</div>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="p-4 bg-gray-50 rounded-xl border text-center"
        >
          <div className="text-2xl font-bold text-green-600 mb-1">
            {Math.round(data.reduce((sum, item) => sum + item.value, 0) / data.length)}
          </div>
          <div className="text-sm text-gray-600">Average</div>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="p-4 bg-gray-50 rounded-xl border text-center"
        >
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {Math.max(...data.map(item => item.value))}
          </div>
          <div className="text-sm text-gray-600">Peak Value</div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Required imports for this template
const requiredImports = `
import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
`;

// Template metadata
const templateInfo = {
  name: 'Chart Template',
  type: 'chart',
  description: 'Professional data visualization template with interactive elements',
  libraries: ['recharts', 'framer-motion', 'lucide-react'],
  chartTypes: ['LineChart', 'BarChart', 'PieChart', 'AreaChart', 'ScatterChart'],
  features: ['responsive', 'animated', 'interactive', 'professional-styling']
};
