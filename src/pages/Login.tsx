// Importa el hook 'useState' de React para manejar el estado del formulario
import { useState } from 'react';
// Importa el hook 'useNavigate' para redirigir al usuario
import { useNavigate } from 'react-router-dom';
// Importa el hook de autenticación personalizado
import { useAuth } from '@/contexts/AuthContext';
// Importa componentes de UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/ThemeToggle';
// Importa iconos
import { Lock, User } from 'lucide-react';
// Importa la librería de notificaciones
import { toast } from 'sonner';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    
    if (!username.trim() || !password.trim()) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true); 

    try {
      const loginSuccess = await login(username, password);
      
      if (loginSuccess) {
        toast.success(`¡Bienvenido de nuevo, ${username}!`);
        navigate('/registro'); 
        return;
      }

      const registerSuccess = await register(username, password);
      
      if (registerSuccess) {
        toast.success(`¡Cuenta creada! Bienvenido, ${username}`);
        navigate('/registro');
      } else {
        toast.error('Nombre o contraseña incorrectos');
      }
    } catch (error) {
      toast.error('Error al procesar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  const backgroundImageUrl = '/img/arreglo-de-la-piramide-alimenticia-real.jpg';
  const logoUrl = '/img/logo.png';

  return (
    <div className="relative min-h-screen">

      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      />
      
      <div className="relative z-20">

        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-8 shadow-[var(--shadow-brand)] border-primary/20 bg-card/80 backdrop-blur-md">
            
            <div className="text-center mb-8">
              
              <img 
                src={logoUrl} 
                alt="AstroCal Logo" 
                className="w-24 h-auto mx-auto mb-4" 
              />
              
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                AstroCal
              </h1>              
              <h2 className=" font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Contador de Calorías
              </h2>

              <p className="text-muted-foreground mt-2">
                Ingresar usuario o crear usuario
              </p>

            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de usuario</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Tu nombre"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity shadow-[var(--shadow-brand)]"
                disabled={isLoading}
              >
                {isLoading ? 'Procesando...' : 'Entrar o crear cuenta'}
              </Button>
            </form>

            {/* --- INICIO DE LA MODIFICACIÓN --- */}
            {/* Aquí volvemos a añadir el texto de ayuda que estaba antes,
              pero ahora queda perfecto debajo del botón.
            */}
            <p className="text-xs text-muted-foreground text-center mt-6">
              Si el usuario no existe, se creará automáticamente
            </p>
            {/* --- FIN DE LA MODIFICACIÓN --- */}
          </Card>
        </div>
      </div>
    </div>
  );
}