'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface DHTData {
  temperature: number;
  humidity: number;
  created_at: string;
}

interface SensorStats {
  avgTemp: number;
  minTemp: number;
  maxTemp: number;
  avgHumidity: number;
  minHumidity: number;
  maxHumidity: number;
  lastUpdate: string;
  totalReadings: number;
}

export default function MonitoringDashboard() {
  const [dhtData, setDhtData] = useState<DHTData[]>([]);
  const [stats, setStats] = useState<SensorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | 'all'>('1h');

  useEffect(() => {
    console.log('🔧 Inicjalizacja monitoring dashboard...');
    
    fetchDHTData();

    // Real-time subscription
    const channel = supabase
      .channel('dht-monitoring')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'DHT_sensor' },
        (payload) => {
          console.log('📊 Nowy odczyt DHT22:', payload);
          fetchDHTData();
        }
      )
      .subscribe();

    return () => {
      console.log('🧹 Cleanup monitoring');
      supabase.removeChannel(channel);
    };
  }, [timeRange]);

  const fetchDHTData = async () => {
    try {
      setLoading(true);

      // Określ zakres czasowy
      let timeFilter = new Date();
      switch (timeRange) {
        case '1h':
          timeFilter.setHours(timeFilter.getHours() - 1);
          break;
        case '6h':
          timeFilter.setHours(timeFilter.getHours() - 6);
          break;
        case '24h':
          timeFilter.setHours(timeFilter.getHours() - 24);
          break;
        case 'all':
          timeFilter = new Date(0); // Od początku
          break;
      }

      const { data, error } = await supabase
        .from('DHT_sensor')
        .select('temperature, humidity, created_at')
        .gte('created_at', timeFilter.toISOString())
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      const dhtArray = data || [];
      setDhtData(dhtArray);

      // Oblicz statystyki
      if (dhtArray.length > 0) {
        const temps = dhtArray.map(d => d.temperature);
        const humidities = dhtArray.map(d => d.humidity);

        setStats({
          avgTemp: temps.reduce((a, b) => a + b, 0) / temps.length,
          minTemp: Math.min(...temps),
          maxTemp: Math.max(...temps),
          avgHumidity: humidities.reduce((a, b) => a + b, 0) / humidities.length,
          minHumidity: Math.min(...humidities),
          maxHumidity: Math.max(...humidities),
          lastUpdate: dhtArray[dhtArray.length - 1].created_at,
          totalReadings: dhtArray.length
        });
      }

      console.log(`✅ Załadowano ${dhtArray.length} pomiarów dla zakresu: ${timeRange}`);
    } catch (err: any) {
      console.error('❌ Błąd pobierania DHT22:', err);
    } finally {
      setLoading(false);
    }
  };

  // Przygotuj dane dla wykresów
  const chartData = dhtData.map(d => ({
    time: new Date(d.created_at).toLocaleTimeString('pl-PL', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    }),
    temperatura: parseFloat(d.temperature.toFixed(1)),
    wilgotność: parseFloat(d.humidity.toFixed(1)),
    timestamp: new Date(d.created_at).getTime()
  }));

  const latestDHT = dhtData[dhtData.length - 1];

  // Alerty
  const tempAlert = latestDHT && (latestDHT.temperature > 30 || latestDHT.temperature < 15);
  const humidityAlert = latestDHT && (latestDHT.humidity > 70 || latestDHT.humidity < 30);

  if (loading && dhtData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie danych sensorów...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📊 Environmental Monitoring
          </h1>
          <p className="text-gray-600">
            DHT22 Sensor • Real-time Temperature & Humidity
          </p>
        </div>

        {/* Alerty */}
        {(tempAlert || humidityAlert) && (
          <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-bold text-yellow-800">Ostrzeżenie!</h3>
                <p className="text-yellow-700 text-sm">
                  {tempAlert && `Temperatura poza zakresem (${latestDHT.temperature.toFixed(1)}°C). `}
                  {humidityAlert && `Wilgotność poza zakresem (${latestDHT.humidity.toFixed(1)}%). `}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Time Range Selector */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Zakres czasowy:</h3>
          <div className="flex gap-3 flex-wrap">
            {[
              { value: '1h', label: 'Ostatnia godzina' },
              { value: '6h', label: 'Ostatnie 6h' },
              { value: '24h', label: 'Ostatnie 24h' },
              { value: 'all', label: 'Wszystko' }
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value as any)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  timeRange === range.value
                    ? 'bg-indigo-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Current Values - Large Cards */}
        {latestDHT && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Temperature Card */}
            <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-xl shadow-lg p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium uppercase tracking-wide">Temperatura</p>
                  <p className="text-6xl font-bold my-4">{latestDHT.temperature.toFixed(1)}°C</p>
                  <div className="space-y-1 text-sm text-white/70">
                    <p>Ostatni odczyt: {new Date(latestDHT.created_at).toLocaleString('pl-PL')}</p>
                    {stats && (
                      <>
                        <p>Min: {stats.minTemp.toFixed(1)}°C • Max: {stats.maxTemp.toFixed(1)}°C</p>
                        <p>Średnia: {stats.avgTemp.toFixed(1)}°C</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="bg-white/20 p-6 rounded-full">
                  <span className="text-6xl">🌡️</span>
                </div>
              </div>
            </div>

            {/* Humidity Card */}
            <div className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl shadow-lg p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium uppercase tracking-wide">Wilgotność</p>
                  <p className="text-6xl font-bold my-4">{latestDHT.humidity.toFixed(1)}%</p>
                  <div className="space-y-1 text-sm text-white/70">
                    <p>Ostatni odczyt: {new Date(latestDHT.created_at).toLocaleString('pl-PL')}</p>
                    {stats && (
                      <>
                        <p>Min: {stats.minHumidity.toFixed(1)}% • Max: {stats.maxHumidity.toFixed(1)}%</p>
                        <p>Średnia: {stats.avgHumidity.toFixed(1)}%</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="bg-white/20 p-6 rounded-full">
                  <span className="text-6xl">💧</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-gray-600 text-sm">Pomiarów</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.totalReadings}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-gray-600 text-sm">Zakres temp.</p>
              <p className="text-2xl font-bold text-orange-600">
                {(stats.maxTemp - stats.minTemp).toFixed(1)}°C
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-gray-600 text-sm">Zakres wilg.</p>
              <p className="text-2xl font-bold text-blue-600">
                {(stats.maxHumidity - stats.minHumidity).toFixed(1)}%
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-gray-600 text-sm">Status</p>
              <p className="text-2xl">🟢</p>
              <p className="text-xs text-green-600 font-semibold">Active</p>
            </div>
          </div>
        )}

        {/* Charts */}
        {chartData.length > 0 ? (
          <div className="space-y-8">
            {/* Combined Chart */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">📈 Temperatura i Wilgotność</h3>
                <p className="text-sm text-gray-600 mt-1">Wykres zbiorczy w czasie</p>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      yAxisId="left"
                      label={{ value: 'Temperatura (°C)', angle: -90, position: 'insideLeft' }}
                      domain={['dataMin - 2', 'dataMax + 2']}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      label={{ value: 'Wilgotność (%)', angle: 90, position: 'insideRight' }}
                      domain={['dataMin - 5', 'dataMax + 5']}
                    />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="temperatura" 
                      stroke="#f97316" 
                      strokeWidth={3}
                      dot={{ r: 3 }}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="wilgotność" 
                      stroke="#06b6d4" 
                      strokeWidth={3}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Temperature Area Chart */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">🌡️ Temperatura</h3>
                <p className="text-sm text-gray-600 mt-1">Zakres: {stats?.minTemp.toFixed(1)}°C - {stats?.maxTemp.toFixed(1)}°C</p>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                    <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="temperatura" 
                      stroke="#f97316" 
                      fillOpacity={1} 
                      fill="url(#colorTemp)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Humidity Area Chart */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">💧 Wilgotność</h3>
                <p className="text-sm text-gray-600 mt-1">Zakres: {stats?.minHumidity.toFixed(1)}% - {stats?.maxHumidity.toFixed(1)}%</p>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                    <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="wilgotność" 
                      stroke="#06b6d4" 
                      fillOpacity={1} 
                      fill="url(#colorHumidity)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <span className="text-6xl mb-4 block">📊</span>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Brak danych</h3>
            <p className="text-gray-600">
              Nie znaleziono pomiarów dla wybranego zakresu czasowego.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>💾 Supabase Real-time • DHT22 Sensor • {chartData.length} odczytów</p>
        </div>
      </div>
    </div>
  );
}