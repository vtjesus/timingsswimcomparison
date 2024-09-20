"use client"

import { useState, useMemo } from 'react'
import { ChevronDown, Download } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { TooltipProps } from 'recharts';

const nationalRecords = {
  male: {
    '18-24': {
      long: {
        '50m freestyle': '22.68',
        '100m freestyle': '50.03',
        '200m freestyle': '1:49.55',
        '400m freestyle': '3:54.31',
        '800m freestyle': '8:12.53',
        '1500m freestyle': '15:44.97',
      },
      short: {
        '50m freestyle': '22.24',
        '100m freestyle': '48.99',
        '200m freestyle': '1:47.57',
        '400m freestyle': '3:50.33',
        '800m freestyle': '8:04.48',
        '1500m freestyle': '15:28.02',
      },
    },
    '25-29': {
      long: {
        '50m freestyle': '22.89',
        '100m freestyle': '50.53',
        '200m freestyle': '1:51.04',
        '400m freestyle': '3:57.85',
        '800m freestyle': '8:19.78',
        '1500m freestyle': '15:59.87',
      },
      short: {
        '50m freestyle': '22.46',
        '100m freestyle': '49.48',
        '200m freestyle': '1:49.05',
        '400m freestyle': '3:53.84',
        '800m freestyle': '8:11.53',
        '1500m freestyle': '15:43.58',
      },
    },
  },
  female: {
    '18-24': {
      long: {
        '50m freestyle': '25.27',
        '100m freestyle': '55.03',
        '200m freestyle': '2:00.55',
        '400m freestyle': '4:15.31',
        '800m freestyle': '8:45.53',
        '1500m freestyle': '16:44.97',
      },
      short: {
        '50m freestyle': '24.74',
        '100m freestyle': '53.99',
        '200m freestyle': '1:58.57',
        '400m freestyle': '4:11.33',
        '800m freestyle': '8:37.48',
        '1500m freestyle': '16:28.02',
      },
    },
    '25-29': {
      long: {
        '50m freestyle': '25.52',
        '100m freestyle': '55.58',
        '200m freestyle': '2:02.06',
        '400m freestyle': '4:18.96',
        '800m freestyle': '8:52.99',
        '1500m freestyle': '17:00.42',
      },
      short: {
        '50m freestyle': '24.99',
        '100m freestyle': '54.53',
        '200m freestyle': '2:00.06',
        '400m freestyle': '4:14.95',
        '800m freestyle': '8:44.91',
        '1500m freestyle': '16:43.41',
      },
    },
  },
}

interface Comparison {
  userTime: number;
  recordTime: number;
  difference: number;
}

const chartConfig = {
  views: {
    label: "Time",
  },
  time: {
    label: "Time",
    color: "hsl(210, 70%, 60%)", // Pleasing blue color
  },
} satisfies ChartConfig

function secondsToMinutes(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = (seconds % 60).toFixed(2);
  return `${minutes}:${remainingSeconds.padStart(5, '0')}`;
}

// Add this custom tooltip component for the bar graph
const CustomBarTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const timeInSeconds = payload[0].value as number;
    const formattedTime = secondsToMinutes(timeInSeconds);
    return (
      <div className="custom-tooltip bg-white p-2 border border-gray-300 rounded shadow">
        <p className="label">{`${label}`}</p>
        <p className="time">{`Time: ${formattedTime}`}</p>
      </div>
    );
  }

  return null;
};

export default function Page() {
  const [gender, setGender] = useState<string>('')
  const [age, setAge] = useState<string>('')
  const [course, setCourse] = useState<string>('')
  const [event, setEvent] = useState<string>('')
  const [userTime, setUserTime] = useState<string>('')
  const [comparison, setComparison] = useState<Comparison | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const nationalRecord = nationalRecords[gender]?.[age]?.[course]?.[event]
    if (nationalRecord) {
      const userSeconds = timeToSeconds(userTime)
      const recordSeconds = timeToSeconds(nationalRecord)
      setComparison({
        userTime: userSeconds,
        recordTime: recordSeconds,
        difference: userSeconds - recordSeconds
      })
    } else {
      alert('No record found for the selected criteria')
    }
  }

  const timeToSeconds = (time: string): number => {
    const parts = time.split(':').map(Number)
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2]
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1]
    } else {
      return parts[0]
    }
  }

  const secondsToTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = (seconds % 60).toFixed(2)
    return [
      hours > 0 ? hours.toString().padStart(2, '0') : null,
      minutes.toString().padStart(2, '0'),
      secs.padStart(5, '0')
    ].filter(Boolean).join(':')
  }

  const downloadGraph = () => {
    console.log('Downloading graph...')
  }

  const lineChartData = useMemo(() => {
    if (comparison) {
      const currentDate = new Date()
      const data = []
      
      for (let i = 0; i <= 12; i++) {
        const date = addMonths(currentDate, i)
        const timeInSeconds = i === 0 ? comparison.userTime : 
                   i === 12 ? comparison.recordTime :
                   comparison.userTime - (i / 12) * (comparison.userTime - comparison.recordTime)
        
        data.push({
          date: formatDate(date),
          time: timeInSeconds,
          formattedTime: secondsToMinutes(timeInSeconds)
        })
      }
      
      return data
    }
    return []
  }, [comparison])

  function formatDate(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
  }

  function addMonths(date: Date, months: number): Date {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
  }

  // Add this custom tooltip component
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const timeInSeconds = payload[0].value as number;
      const formattedTime = secondsToMinutes(timeInSeconds);
      return (
        <div className="custom-tooltip bg-white p-2 border border-gray-300 rounded shadow">
          <p className="label">{`Date: ${label}`}</p>
          <p className="time">{`Time: ${formattedTime}`}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white min-h-screen flex items-center justify-center">
      <div className="w-full bg-white shadow-none rounded-none p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Swimming Time Comparison</h1>
        
        <div className="bg-white shadow-sm rounded-lg p-4 mb-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Select onValueChange={(value) => setGender(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => setAge(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select age group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="18-24">18-24</SelectItem>
                  <SelectItem value="25-29">25-29</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => setCourse(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="long">Long Course</SelectItem>
                  <SelectItem value="short">Short Course</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => setEvent(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50m freestyle">50m Freestyle</SelectItem>
                  <SelectItem value="100m freestyle">100m Freestyle</SelectItem>
                  <SelectItem value="200m freestyle">200m Freestyle</SelectItem>
                  <SelectItem value="400m freestyle">400m Freestyle</SelectItem>
                  <SelectItem value="800m freestyle">800m Freestyle</SelectItem>
                  <SelectItem value="1500m freestyle">1500m Freestyle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end space-x-2">
              <div className="flex-grow">
                <label htmlFor="userTime" className="block text-sm font-medium mb-1">
                  Your Time (mm:ss.ms)
                </label>
                <Input
                  type="text"
                  id="userTime"
                  value={userTime}
                  onChange={(e) => setUserTime(e.target.value)}
                  placeholder="e.g., 1:23.45"
                  required
                />
              </div>
              <Button type="submit">Compare</Button>
            </div>
          </form>
        </div>

        {comparison && (
          <div className="bg-white shadow-sm rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Your Time</p>
                <p className="text-lg font-semibold">{secondsToTime(comparison.userTime)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">National Record</p>
                <p className="text-lg font-semibold">{secondsToTime(comparison.recordTime)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Difference</p>
                <Badge variant={comparison.difference > 0 ? "destructive" : "success"}>
                  {`${Math.abs(comparison.difference).toFixed(2)}s ${comparison.difference > 0 ? 'slower' : 'faster'}`}
                </Badge>
              </div>
            </div>

            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Your Time', time: comparison.userTime },
                    { name: 'National Record', time: comparison.recordTime },
                  ]}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(value) => secondsToMinutes(value)} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="time" fill="hsl(210, 70%, 60%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <Card>
              <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                  <CardTitle>Progress Towards National Record</CardTitle>
                  <CardDescription>
                    Your current time vs. the national record
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="px-2 sm:p-6">
                <ChartContainer
                  config={chartConfig}
                  className="aspect-auto h-[250px] w-full"
                >
                  <LineChart
                    accessibilityLayer
                    data={lineChartData}
                    margin={{
                      left: 12,
                      right: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      interval="preserveStartEnd"
                      angle={-45}
                      textAnchor="end"
                      height={70}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      tickFormatter={(value) => secondsToMinutes(value)}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      dataKey="time"
                      type="monotone"
                      stroke="hsl(210, 70%, 60%)"
                      strokeWidth={2}
                      dot={true}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Button onClick={downloadGraph} className="w-full mt-4">
              <Download className="w-4 h-4 mr-2" />
              Download Graph
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}