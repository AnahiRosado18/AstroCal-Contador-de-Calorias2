// Importa hooks de React
import { useState, useEffect } from 'react';
// Importa hooks de React Router
import { useNavigate } from 'react-router-dom';
// Importa el contexto de autenticación
import { useAuth } from '@/contexts/AuthContext';
// Importa componentes de UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThemeToggle } from '@/components/ThemeToggle';
// Importa la función de cálculo de calorías
import { useCaloriesCalculator } from '@/hooks/useCalories';
// Importa librería de notificaciones
import { toast } from 'sonner';
// Importa icono
import { LogOut } from 'lucide-react';

export default function Registro() {
  // --- HOOKS ---
  const { currentProfile, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  // --- ESTADO LOCAL ---
  const [formData, setFormData] = useState({
    sex: currentProfile?.sex || '',
    age: currentProfile?.age || '',
    weightKg: currentProfile?.weightKg || '',
    heightCm: currentProfile?.heightCm || '',
    activity: currentProfile?.activity || '',
  });

  // --- EFECTO SECUNDARIO ---
  useEffect(() => {
    if (!currentProfile) {
      navigate('/login');
    }
  }, [currentProfile, navigate]);

  // --- MANEJADORES DE EVENTOS ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 

    if (!formData.sex || !formData.age || !formData.weightKg || !formData.heightCm || !formData.activity) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    const updates = {
      sex: formData.sex as 'male' | 'female',
      age: Number(formData.age),
      weightKg: Number(formData.weightKg),
      heightCm: Number(formData.heightCm),
      activity: formData.activity,
    };

    const { tdee } = useCaloriesCalculator({ ...currentProfile!, ...updates });
    
    updateProfile({ ...updates, tdee });

    toast.success('¡Perfil actualizado!');
    navigate('/dashboard'); 
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentProfile) return null;

  // --- RENDERIZADO DEL COMPONENTE (JSX) ---

  // --- INICIO DE LA MODIFICACIÓN ---

  // 1. Define la ruta de tu imagen
  const backgroundImageUrl = '/img/arreglo-de-la-piramide-alimenticia-real.jpg';

  return (
    // 2. Contenedor principal: relativo
    <div className="relative min-h-screen">

      {/* 3. Capa de Fondo (z-0): La imagen */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      />
      
      {/* 4. Capa de Contenido (z-20): Todo lo visible */}
      <div className="relative z-20">

        {/* 5. Botones de la esquina */}
        <div className="absolute top-4 right-4 flex gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        {/* 6. Contenedor de Centrado */}
        <div className="min-h-screen flex items-center justify-center p-4">
        
          {/* 7. Tarjeta de Registro (con efecto vidrioso)
             Añadimos 'bg-card/80' y 'backdrop-blur-md'
          */}
          <Card className="w-full max-w-2xl p-8 shadow-[var(--shadow-brand)] border-primary/20 bg-card/80 backdrop-blur-md">
            
            {/* El contenido interno de la tarjeta no cambia */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Completa tu perfil
              </h1>
              <p className="text-muted-foreground mt-2">
                Necesitamos algunos datos para calcular tus calorías diarias
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sex">Sexo</Label>
                  <Select value={formData.sex} onValueChange={(value) => setFormData({ ...formData, sex: value })}>
                    <SelectTrigger id="sex">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Femenino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Edad (años)</Label>
                  <Input
                    id="age"
                    type="number"
                    min="15"
                    max="100"
                    placeholder="25"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    min="30"
                    max="300"
                    step="0.1"
                    placeholder="70"
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Altura (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    min="100"
                    max="250"
                    placeholder="170"
                    value={formData.heightCm}
                    onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activity">Nivel de actividad</Label>
                <Select value={formData.activity} onValueChange={(value) => setFormData({ ...formData, activity: value })}>
                  <SelectTrigger id="activity">
                    <SelectValue placeholder="Selecciona tu nivel de actividad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentario (poco o ningún ejercicio)</SelectItem>
                    <SelectItem value="light">Ligero (ejercicio 1-3 días/semana)</SelectItem>
                    <SelectItem value="moderate">Moderado (ejercicio 3-5 días/semana)</SelectItem>
                    <SelectItem value="active">Activo (ejercicio 6-7 días/semana)</SelectItem>
                    <SelectItem value="very_active">Muy activo (ejercicio intenso diario)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity shadow-[var(--shadow-brand)]"
              >
                Guardar y continuar
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
    // --- FIN DE LA MODIFICACIÓN ---
  );
}