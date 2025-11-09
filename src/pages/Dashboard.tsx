import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FoodCard } from '@/components/FoodCard';
import { IntakeList } from '@/components/IntakeList';
import { ProgressRing } from '@/components/ProgressRing';
import { MEXICAN_FOODS, FOOD_CATEGORIES } from '@/data/foods';
import { storage } from '@/utils/storage';
import { Food, IntakeItem } from '@/types';
import { LogOut, Search, RotateCcw, Download, Calendar, Flame } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Dashboard() {
  const { currentProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [calorieFilterMin, setCalorieFilterMin] = useState('');
  const [calorieFilterMax, setCalorieFilterMax] = useState('');
  const [todayIntake, setTodayIntake] = useState<IntakeItem[]>([]);
  const todayDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!currentProfile) {
      navigate('/login');
      return;
    }
    if (!currentProfile.tdee) {
      navigate('/registro');
      return;
    }
    const intake = storage.getDayIntake(currentProfile.id, todayDate);
    setTodayIntake(intake.items);
  }, [currentProfile, navigate, todayDate]);

  const filteredFoods = useMemo(() => {
    const minCalories = parseInt(calorieFilterMin, 10);
    const maxCalories = parseInt(calorieFilterMax, 10);

    return MEXICAN_FOODS.filter(food => {
      const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Todas' || food.category === selectedCategory;
      const foodCalories = food.calories; 
      const matchesMin = isNaN(minCalories) || minCalories <= 0 || foodCalories >= minCalories;
      const matchesMax = isNaN(maxCalories) || maxCalories <= 0 || foodCalories <= maxCalories;
      return matchesSearch && matchesCategory && matchesMin && matchesMax;
    });
  }, [searchQuery, selectedCategory, calorieFilterMin, calorieFilterMax]);

  const totalCalories = useMemo(() => {
    return todayIntake.reduce((sum, item) => sum + (item.calories * item.quantity), 0);
  }, [todayIntake]);

  const prevTotalCaloriesRef = useRef<number>();

  useEffect(() => {
    const tdee = currentProfile?.tdee || 0;
    if (prevTotalCaloriesRef.current === undefined) {
      prevTotalCaloriesRef.current = totalCalories;
      return;
    }
    if (totalCalories === tdee && prevTotalCaloriesRef.current !== tdee) {
      toast.success("¡Felicidades! ¡Alcanzaste tu meta exacta!", {
        duration: 5000,
        icon: '🎉',
      });
    }
    prevTotalCaloriesRef.current = totalCalories;
  }, [totalCalories, currentProfile]);

  const updateAndSaveIntake = (updatedIntake: IntakeItem[]) => {
    const newTotalCalories = updatedIntake.reduce((sum, item) => sum + (item.calories * item.quantity), 0);
    setTodayIntake(updatedIntake);
    storage.saveDayIntake(currentProfile!.id, {
      date: todayDate,
      items: updatedIntake,
      totalCalories: newTotalCalories,
    });
  };

  const handleIncrease = (foodId: string) => {
    const updated = todayIntake.map(item =>
      item.foodId === foodId ? { ...item, quantity: item.quantity + 1 } : item
    );
    updateAndSaveIntake(updated);
  };

  const handleDecrease = (foodId: string) => {
    const itemToDecrease = todayIntake.find(item => item.foodId === foodId);
    let updated = [];
    if (itemToDecrease && itemToDecrease.quantity === 1) {
      updated = todayIntake.filter(item => item.foodId !== foodId);
      toast.success(`${itemToDecrease.foodName} eliminado`);
    } else {
      updated = todayIntake.map(item =>
        item.foodId === foodId ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item
      );
    }
    updateAndSaveIntake(updated);
  };

  const handleAddFood = (food: Food) => {
    const existingItem = todayIntake.find(item => item.foodId === food.id);
    if (existingItem) {
      handleIncrease(food.id);
      toast.success(`${food.name} (+1 porción)`);
    } else {
      const newItem: IntakeItem = {
        foodId: food.id,
        foodName: food.name,
        calories: food.calories,
        serving: food.serving,
        quantity: 1,
        timestamp: new Date().toISOString(),
      };
      updateAndSaveIntake([...todayIntake, newItem]);
      toast.success(`${food.name} agregado (${food.calories} kcal)`);
    }
  };
  
  const handleReset = () => {
    updateAndSaveIntake([]);
    toast.success('Día reiniciado');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tdee = currentProfile?.tdee || 0;
    doc.setFontSize(20);
    doc.text('Reporte Diario de Calorías', 20, 20);
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 20, 35);
    doc.text(`Usuario: ${currentProfile?.name}`, 20, 45);
    doc.text(`Meta diaria: ${tdee} kcal`, 20, 55);
    doc.text(`Consumido: ${totalCalories} kcal`, 20, 65);
    doc.text(`Diferencia: ${totalCalories - tdee} kcal`, 20, 75);
    doc.text('Alimentos consumidos:', 20, 90);
    let y = 100;
    todayIntake.forEach((item, i) => {
      const totalCalories = item.calories * item.quantity;
      doc.text(`${i + 1}. ${item.foodName} (x${item.quantity}) - ${item.serving} - ${totalCalories} kcal`, 25, y);
      y += 10;
    });
    doc.save(`reporte-${todayDate}.pdf`);
    toast.success('PDF exportado');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentProfile) return null;

  const tdee = currentProfile.tdee || 0;
  const remaining = tdee - totalCalories;

  const backgroundImageUrl = '/img/arreglo-de-la-piramide-alimenticia-real.jpg';

  return (
    <div className="relative min-h-screen">

      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      />
      
      <div 
        className="absolute inset-0 z-10 bg-gradient-to-br from-primary/70 to-secondary/50" 
      />

      <div className="relative z-20 min-h-screen">
        
        <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-30">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-2">
            <div className="flex-shrink min-w-0">
              <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent truncate">
                Hola, {currentProfile.name}
              </h1>
              <p className="text-sm text-muted-foreground truncate">
                {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex flex-shrink-0 gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigate('/historial')} className="rounded-full">
                <Calendar className="h-5 w-5" />
              </Button>
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              
              <Card className="p-6 border-primary/20 shadow-[var(--shadow-card)] bg-card/80 backdrop-blur-sm">
                <h2 className="text-xl font-bold mb-4">Tu progreso hoy</h2>
                <div className="mb-6">
                  <ProgressRing current={totalCalories} goal={tdee} />
                </div>
                
                {remaining > 0 ? (
                  <p className="text-center text-sm text-muted-foreground">
                    Vas excelente. Te faltan <span className="font-bold text-primary">{remaining} kcal</span> para tu meta.
                  </p>
                ) : remaining < 0 ? (
                  <p className="text-center text-sm text-destructive">
                    Te pasaste por <span className="font-bold">{Math.abs(remaining)} kcal</span>. Mañana será mejor 🙂
                  </p>
                ) : (
                  <p className="text-center text-sm text-success font-bold">
                    ¡Felicidades! Has alcanzado tu meta exacta de {tdee} kcal.
                  </p>
                )}
              </Card>

              <Card className="p-6 border-primary/20 shadow-[var(--shadow-card)] bg-card/80 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Alimentos de hoy</h2>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleReset}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleExportPDF}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <IntakeList 
                  items={todayIntake} 
                  onDecrease={handleDecrease} 
                  onIncrease={handleIncrease} 
                />
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              
              <Card className="p-6 border-primary/20 shadow-[var(--shadow-card)] bg-card/80 backdrop-blur-sm">
                <h2 className="text-xl font-bold mb-4">Buscar alimentos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {FOOD_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-2">
                    <div className="relative flex-1">
                      <Flame className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="Cal. Mín."
                        value={calorieFilterMin}
                        onChange={(e) => setCalorieFilterMin(e.target.value)}
                        className="pl-10"
                        min="0"
                      />
                    </div>
                    <div className="relative flex-1">
                      <Flame className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="Cal. Máx."
                        value={calorieFilterMax}
                        onChange={(e) => setCalorieFilterMax(e.target.value)}
                        className="pl-10"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* --- INICIO DE LA CORRECCIÓN --- */}
              {/* 1. Mantenemos la altura fija 'h-[600px]' para activar el scroll. */}
              <ScrollArea className="h-[725px] w-full">
                {filteredFoods.length > 0 ? (
                  // 2. Añadimos 'pb-4' (padding-bottom) al 'div' interno.
                  <div className="grid sm:grid-cols-2 gap-4 pr-4 pb-4">
                    {filteredFoods.map(food => (
                      <FoodCard key={food.id} food={food} onAdd={handleAddFood} />
                    ))}
                  </div>
                ) : (
                  // 3. Añadimos 'mr-4' y 'mb-4' para que el padding coincida.
                  <Card className="p-8 text-center border-dashed border-2 border-primary/20 bg-card/80 backdrop-blur-sm mr-4 mb-4">
                    <p className="text-muted-foreground">
                      No se encontraron alimentos. Intenta con otra búsqueda o filtro.
                    </p>
                  </Card>
                )}
              </ScrollArea>
              {/* --- FIN DE LA CORRECCIÓN --- */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}