
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface HealthChartProps {
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

const HealthChart: React.FC<HealthChartProps> = ({ macros }) => {
  const data = [
    { name: 'Protein', value: macros.protein * 4, color: '#10b981' },
    { name: 'Carbs', value: macros.carbs * 4, color: '#0ea5e9' },
    { name: 'Fat', value: macros.fat * 9, color: '#f59e0b' },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`${value} kcal`, 'Calories']}
          />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HealthChart;
