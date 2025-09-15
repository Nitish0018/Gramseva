
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';

type Granularity = 'date' | 'month' | 'year';

interface PriceChartProps {
  // Flexible data shape: any objects that contain the xKey and a numeric price
  data: Array<Record<string, any>>;
  xKey: Granularity; // which key to use on x-axis: 'date' | 'month' | 'year'
  yKey?: string; // defaults to 'price'
  title?: string;
}

const currencyFmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const dateTickFmt = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  // Show day and month for better readability: "10 Sep"
  return `${d.getDate()} ${d.toLocaleString('en-US', { month: 'short' })}`;
};

const monthTickFmt = (value: string) => value; // already short month labels
const yearTickFmt = (value: string | number) => String(value);

const PriceChart: React.FC<PriceChartProps> = ({ data, xKey, yKey = 'price', title }) => {
  const xTickFormatter = xKey === 'date' ? dateTickFmt : xKey === 'month' ? monthTickFmt : yearTickFmt;
  const yDomain: [any, any] = ['dataMin - 100', 'dataMax + 100'];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 10, right: 20, left: 0, bottom: xKey === 'date' ? 50 : 10 }}
      >
        <defs>
          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#22c55e" stopOpacity={0.2} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey={xKey} 
          tickFormatter={xTickFormatter} 
          tickMargin={8}
          interval={xKey === 'date' ? 'preserveStartEnd' : 0}
          angle={xKey === 'date' ? -45 : 0}
          textAnchor={xKey === 'date' ? 'end' : 'middle'}
          height={xKey === 'date' ? 60 : 30}
        />
        <YAxis domain={yDomain} tickFormatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} width={70} />
        <Tooltip 
          formatter={(value: number) => `${currencyFmt(Number(value))}/Qtl`} 
          labelFormatter={(label: string) => {
            if (xKey === 'date') {
              const d = new Date(label);
              return Number.isNaN(d.getTime()) ? label : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            }
            return label;
          }}
        />
        <Legend />
        <Line type="monotone" dataKey={yKey} stroke="#16a34a" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PriceChart;
