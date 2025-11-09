import { Food } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface FoodCardProps {
  food: Food;
  onAdd: (food: Food) => void;
}

export function FoodCard({ food, onAdd }: FoodCardProps) {
  
  // --- INICIO DE LA CORRECCIÓN ---
  // Cambiamos 'p-4' a 'p-3' para hacer la tarjeta más compacta
  return (
    <Card className="p-3 hover:shadow-[var(--shadow-card)] transition-shadow border-primary/10">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{food.name}</h3>
          <p className="text-sm text-muted-foreground">{food.category}</p>
          {/* Cambiamos 'mt-2' a 'mt-1' y 'text-2xl' a 'text-xl' */}
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold text-primary">{food.calories}</span>
            <span className="text-sm text-muted-foreground">kcal</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Porción: {food.serving}
          </p>
        </div>
  {/* --- FIN DE LA CORRECCIÓN --- */}
        <Button
          size="icon"
          onClick={() => onAdd(food)}
          className="shrink-0 rounded-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-[var(--shadow-brand)]"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}