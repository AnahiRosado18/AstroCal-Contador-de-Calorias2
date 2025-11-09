import { ScrollArea } from '@/components/ui/scroll-area';
import { IntakeItem } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus } from 'lucide-react';

interface IntakeListProps {
  items: IntakeItem[];
  onDecrease: (foodId: string) => void;
  onIncrease: (foodId: string) => void;
}

export function IntakeList({ items, onDecrease, onIncrease }: IntakeListProps) {

  if (items.length === 0) {
    return (
      <Card className="p-8 text-center border-dashed border-2 border-primary/20">
        <p className="text-muted-foreground">
          Aún no has agregado alimentos. Busca y agrega para comenzar a registrar.
        </p>
      </Card>
    );
  }

  // --- INICIO DE LA CORRECCIÓN ---
  // 1. Mantenemos la altura fija 'h-[300px]' para activar el scroll.
  return (
    <ScrollArea className="h-[300px] w-full">
      {/* 2. Añadimos 'pb-4' (padding-bottom) al 'div' interno. 
         Esto crea el espacio al final para que la última tarjeta no se corte.
      */}
      <div className="space-y-2 pr-4 pb-4">
  {/* --- FIN DE LA CORRECCIÓN --- */}
        {items.map((item) => {
          const totalCalories = item.calories * item.quantity;
          
          return (
            <Card key={item.foodId} className="p-3 flex items-center justify-between border-primary/10">
              <div className="flex-1 min-w-0"> 
                <h4 className="font-semibold text-foreground truncate">{item.foodName}</h4>
                <p className="text-xs text-muted-foreground"> {/* Texto más pequeño */}
                  {item.serving} (x{item.quantity}) • {totalCalories} kcal
                </p>
              </div>

              <div className="flex items-center gap-1"> {/* Gap más pequeño */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onDecrease(item.foodId)}
                  // Botones más pequeños
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                >
                  {item.quantity === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                </Button>

                <span className="font-bold w-4 text-center text-sm">{item.quantity}</span>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onIncrease(item.foodId)}
                  // Botones más pequeños
                  className="text-primary hover:text-primary hover:bg-primary/10 h-8 w-8"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
}