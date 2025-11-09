import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useTheme } from '@/contexts/ThemeContext';

interface ProgressRingProps {
  current: number;
  goal: number;
}

export function ProgressRing({ current, goal }: ProgressRingProps) {
  const { theme } = useTheme();
  const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  
  const isOverGoal = current > goal;
  const isUnderGoal = current < goal;
  const isExactGoal = current === goal && goal > 0;

  const remaining = Math.abs(goal - current);
  
  return (
    <div className="relative w-full max-w-xs mx-auto">
      <CircularProgressbar
        value={percentage}
        text=""
        styles={buildStyles({
          // --- INICIO DE LA CORRECCIÓN ---
          // Lógica de tres estados para el color
          pathColor: isOverGoal 
            ? 'hsl(0 85% 60%)'     // Rojo (Destructive)
            : isExactGoal 
              ? 'hsl(145 70% 45%)' // Verde (Success)
              : 'hsl(265 85% 58%)',  // Morado (Primary)
          // --- FIN DE LA CORRECCIÓN ---
          trailColor: theme === 'dark' ? 'hsl(260 20% 25%)' : 'hsl(260 10% 96%)',
          pathTransitionDuration: 0.5,
        })}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {current}
          </div>
          <div className="text-sm text-muted-foreground">de {goal} kcal</div>
          
          {isUnderGoal && (
            <div className="text-xs text-muted-foreground mt-1">
              Faltan {remaining} kcal
            </div>
          )}
          
          {isOverGoal && (
            <div className="text-xs text-destructive mt-1">
              +{remaining} kcal
            </div>
          )}

          {isExactGoal && (
             <div className="text-xs text-success font-bold mt-1">
              ¡Meta alcanzada!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}