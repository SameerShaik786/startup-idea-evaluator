"use client";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
    PieChart,
    Pie,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    AreaChart,
    Area,
    LineChart,
    Line,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export const CustomBarChart = ({ data, xKey, yKey, color = "#8884d8" }) => (
    <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey={xKey} stroke="#ccc" tick={{ fill: "#ccc" }} />
            <YAxis stroke="#ccc" tick={{ fill: "#ccc" }} />
            <Tooltip
                contentStyle={{ backgroundColor: "#333", border: "none" }}
                itemStyle={{ color: "#fff" }}
            />
            <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
    </ResponsiveContainer>
);

export const CustomPieChart = ({ data, nameKey, valueKey }) => (
    <ResponsiveContainer width="100%" height={300}>
        <PieChart>
            <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey={valueKey}
                nameKey={nameKey}
                label
            >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
            <Tooltip
                contentStyle={{ backgroundColor: "#333", border: "none" }}
                itemStyle={{ color: "#fff" }}
            />
        </PieChart>
    </ResponsiveContainer>
);

export const CustomRadarChart = ({ data, metrics }) => (
    <ResponsiveContainer width="100%" height={300}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#444" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "#ccc" }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#444" />
            <Radar
                name="Score"
                dataKey="A"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
            />
            <Tooltip
                contentStyle={{ backgroundColor: "#333", border: "none" }}
                itemStyle={{ color: "#fff" }}
            />
        </RadarChart>
    </ResponsiveContainer>
);

export const CustomLineChart = ({ data, xKey, yKey, color = "#82ca9d" }) => (
    <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey={xKey} stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip
                contentStyle={{ backgroundColor: "#333", border: "none" }}
                itemStyle={{ color: "#fff" }}
            />
            <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} />
        </LineChart>
    </ResponsiveContainer>
);

export const ScoreGauge = ({ score }) => {
    const getColor = (s) => {
        if (s >= 80) return "#22c55e"; // green-500
        if (s >= 60) return "#eab308"; // yellow-500
        return "#ef4444"; // red-500
    };

    return (
        <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#333"
                    strokeWidth="10"
                />
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={getColor(score)}
                    strokeWidth="10"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * score) / 100}
                    transform="rotate(-90 50 50)"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-bold text-white">{Math.round(score)}</span>
                <span className="text-xs text-gray-400">/ 100</span>
            </div>
        </div>
    );
};
