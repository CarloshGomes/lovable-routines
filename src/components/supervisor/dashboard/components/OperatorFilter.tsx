import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserProfile } from '@/types/auth';

interface OperatorFilterProps {
    userProfiles: Record<string, UserProfile>;
    selectedOperators: string[];
    setSelectedOperators: React.Dispatch<React.SetStateAction<string[]>>;
}

export const OperatorFilter = ({ userProfiles, selectedOperators, setSelectedOperators }: OperatorFilterProps) => {
    return (
        <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Filtrar Operadores:</label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="justify-between min-w-[200px]">
                        {selectedOperators.length === 0
                            ? "Todos os operadores"
                            : `${selectedOperators.length} selecionado(s)`}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Buscar operador..." />
                        <CommandList>
                            <CommandEmpty>Nenhum operador encontrado.</CommandEmpty>
                            <CommandGroup>
                                <CommandItem
                                    onSelect={() => setSelectedOperators([])}
                                    className="cursor-pointer"
                                >
                                    <div className={cn(
                                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                        selectedOperators.length === 0 ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                    )}>
                                        <Check className={cn("h-4 w-4")} />
                                    </div>
                                    <span>Todos</span>
                                </CommandItem>
                                {Object.entries(userProfiles).map(([username, profile]) => {
                                    const isSelected = selectedOperators.includes(username);
                                    return (
                                        <CommandItem
                                            key={username}
                                            onSelect={() => {
                                                if (isSelected) {
                                                    setSelectedOperators(prev => prev.filter(u => u !== username));
                                                } else {
                                                    setSelectedOperators(prev => [...prev, username]);
                                                }
                                            }}
                                            className="cursor-pointer"
                                        >
                                            <div className={cn(
                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                            )}>
                                                <Check className={cn("h-4 w-4")} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span>{profile.name}</span>
                                                <span className="text-xs text-muted-foreground">({profile.role})</span>
                                            </div>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {selectedOperators.length > 0 && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedOperators([])}
                    className="text-muted-foreground hover:text-foreground"
                >
                    Limpar Filtros
                </Button>
            )}
        </div>
    );
};
