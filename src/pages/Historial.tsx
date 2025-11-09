import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { storage } from '@/utils/storage';
import { DayIntake } from '@/types';
import { ArrowLeft, LogOut } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, LineChart } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

export default function Historial() {
  const { currentProfile, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [history, setHistory] = useState<DayIntake[]>([]);

  useEffect(() => {
    if (!currentProfile) {
      navigate('/login');
      return;
    }

    const data = storage.getHistory(currentProfile.id);
    setHistory(data.reverse());
  }, [currentProfile, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentProfile) return null;

  const chartData = history.map(day => ({
    date: new Date(day.date).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' }),
    calories: day.totalCalories,
    goal: currentProfile.tdee || 0,
  }));

  const gridColor = theme === 'dark' ? 'hsl(260 20% 25%)' : 'hsl(260 20% 90%)';
  const textColor = theme === 'dark' ? 'hsl(0 0% 100%)' : 'hsl(260 20% 15%)';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Historial
              </h1>
              <p className="text-sm text-muted-foreground">Últimos 5 días</p>
            </div>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <Card className="p-6 border-primary/20 shadow-[var(--shadow-card)]">
          <h2 className="text-xl font-bold mb-6">Consumo diario</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" stroke={textColor} />
              <YAxis stroke={textColor} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? 'hsl(260 28% 16%)' : 'hsl(0 0% 100%)',
                  border: `1px solid ${gridColor}`,
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="calories" fill="hsl(265 85% 58%)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="goal" fill="hsl(285 90% 68%)" radius={[8, 8, 0, 0]} opacity={0.3} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 border-primary/20 shadow-[var(--shadow-card)]">
          <h2 className="text-xl font-bold mb-6">Tendencia</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" stroke={textColor} />
              <YAxis stroke={textColor} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? 'hsl(260 28% 16%)' : 'hsl(0 0% 100%)',
                  border: `1px solid ${gridColor}`,
                  borderRadius: '8px',
                }}
              />
              <Line type="monotone" dataKey="calories" stroke="hsl(265 85% 58%)" strokeWidth={3} dot={{ fill: 'hsl(265 85% 58%)', r: 6 }} />
              <Line type="monotone" dataKey="goal" stroke="hsl(285 90% 68%)" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.reverse().map((day) => {
            const date = new Date(day.date);
            const isToday = day.date === new Date().toISOString().split('T')[0];
            const tdee = currentProfile.tdee || 0;
            const diff = day.totalCalories - tdee;
            
            // --- INICIO DE LA MODIFICACIÓN ---
            // Sumamos las cantidades de todos los items del día
            const totalPorciones = day.items.reduce((sum, item) => sum + item.quantity, 0);
            // --- FIN DE LA MODIFICACIÓN ---

            return (
              <Card key={day.date} className="p-4 border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold">
                    {isToday ? 'Hoy' : date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric' })}
                  </h3>
                  {diff > 0 ? (
                    <span className="text-sm text-destructive">+{diff}</span>
                  ) : diff < 0 ? (
                    <span className="text-sm text-muted-foreground">{diff}</span>
                  ) : (
                    <span className="text-sm text-success font-bold">0</span>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary">{day.totalCalories}</span>
                  <span className="text-sm text-muted-foreground">/ {tdee} kcal</span>
                </div>
                
                {/* --- INICIO DE LA MODIFICACIÓN --- */}
                {/* Mostramos el total de porciones en lugar de "alimentos" */}
                <p className="text-xs text-muted-foreground mt-2">
                  {totalPorciones} {totalPorciones === 1 ? 'porción' : 'porciones'}
                </p>
                {/* --- FIN DE LA MODIFICACIÓN --- */}

              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}